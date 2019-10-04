import { Torrent } from "webtorrent";
import Consts from "../consts";

const webtorrent = window.require("webtorrent"),
    path = window.require("path"),
    fs = window.require("fs").promises;

enum ListenerTypes {
    addedTorrent,
    removedTorrent,
    updatedTorrent
}

class Listener {
    constructor({ type, func }: { type: ListenerTypes, func: Function }) {
        this.type = type;
        this.func = func;
    }
    type: ListenerTypes;
    func: Function;
}

export default class TorrentManager {
    private static client = new webtorrent();
    static add(magnetURL: string, name: string) {
        let returnedTorrent = this.client.add(magnetURL, (torrent: Torrent) => {
            torrent.on('done', () => {
                let files = [...torrent.files];
                torrent.destroy(() => {
                    files.forEach((file: any) => {
                        let absolutePath = path.join(torrent.path, file.path),
                            extension = path.extname(file.path),
                            newAbsolutePath = path.join(Consts.DOWNLOADS_FOLDER, path.posix.parse(name).name + extension);
                        fs.rename(absolutePath, newAbsolutePath);
                        Consts.SAVED_TORRENTS.delete(returnedTorrent);
                        Consts.setSavedTorrents(Consts.SAVED_TORRENTS);
                        (window as any).setAppState({});
                    });
                });
            });
            (window as any).setAppState({});
        });
        (returnedTorrent as any).torrentName = name;
        if (Consts.SAVED_TORRENTS) {
            Consts.SAVED_TORRENTS.add(returnedTorrent);
            Consts.setSavedTorrents(Consts.SAVED_TORRENTS);
        }
        return returnedTorrent;
    }
    static getAll() {
        return Array.from(Consts.SAVED_TORRENTS);
    }
    static remove(torrent: Torrent) {
        torrent.destroy();
        fs.unlink(path.join(torrent.path, torrent.name));
        Consts.SAVED_TORRENTS.delete(torrent);
        Consts.setSavedTorrents(Consts.SAVED_TORRENTS);
    }
    static pause(torrent: Torrent) {
        torrent.pause();
        torrent.destroy();
    }
    static resume(torrent: Torrent) {
        Consts.SAVED_TORRENTS.delete(torrent);
        Consts.setSavedTorrents(Consts.SAVED_TORRENTS);
        this.add(torrent.magnetURI, (torrent as any).torrentName);
    }

    private static listeners: Listener[] = [];
    static addEventListener(type: ListenerTypes, listenerFunc: Function) {
        let listener = new Listener({
            type,
            func: listenerFunc
        });
        TorrentManager.listeners.push(listener);
    };
    private static currentTorrentState = new Set<Torrent>();
    static changeInterval = setInterval(() => {
        let added = Array.from(Consts.SAVED_TORRENTS).filter(ele => !TorrentManager.currentTorrentState.has(ele)),
            removed = Array.from(TorrentManager.currentTorrentState).filter(ele => !Consts.SAVED_TORRENTS.has(ele));
        added.forEach(torrent => {
            TorrentManager.dispatchEvent(torrent, ListenerTypes.addedTorrent);
        });
        removed.forEach(torrent => {
            TorrentManager.dispatchEvent(torrent, ListenerTypes.removedTorrent);
        });
        Consts.SAVED_TORRENTS.forEach(torrent => {
            let importantProperties = [''],
                current = Array.from(TorrentManager.currentTorrentState).find(ele => ele.magnetURI === torrent.magnetURI),
                updatedProps = importantProperties.filter(property => {
                    return (torrent as any)[property] !== (current as any)[property]
                });
            if (updatedProps.length)
                TorrentManager.dispatchEvent([torrent, updatedProps], ListenerTypes.updatedTorrent);
        })
        TorrentManager.currentTorrentState = new Set(Consts.SAVED_TORRENTS);
    }, 100);
    private static dispatchEvent(data: any, type: ListenerTypes) {
        TorrentManager.listeners.forEach(listener => {
            if (listener.type === type)
                listener.func(data);
        });
    }
    static Listener = ListenerTypes;
}