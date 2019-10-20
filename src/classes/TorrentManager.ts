import { Torrent } from "webtorrent";
import { walkDir } from "../utils/general";
import Consts from "./Consts";

const path = window.require("path"),
    webtorrent = window.require("webtorrent"),
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
    static add({ magnetURL, name }: { magnetURL: string; name: string; }) {
        let returnedTorrent = this.client.add(magnetURL, (torrent: Torrent) => {
            torrent.on('done', () => {
                let files = [...torrent.files];
                torrent.destroy(() => {
                    files.forEach((file: any) => {
                        let absolutePath = path.join(torrent.path, file.path),
                            extension = path.extname(file.path),
                            newAbsolutePath = path.join(Consts.DOWNLOADS_FOLDER, name + extension);
                        fs.rename(absolutePath, newAbsolutePath);
                        Consts.removeFromSavedTorrents(returnedTorrent);
                        Consts.DOWNLOADED_ITEMS = walkDir(Consts.DOWNLOADS_FOLDER);
                        (window as any).reloadPage();
                    });
                });
            });
            (window as any).reloadPage();
        });
        (returnedTorrent as any).torrentName = name;
        if (Consts.SAVED_TORRENTS)
            Consts.addToSavedTorrents(returnedTorrent);
        return returnedTorrent;
    }
    static getAll() {
        return Array.from(Consts.SAVED_TORRENTS);
    }
    static remove(torrent: Torrent) {
        let pathName = path.join(torrent.path, torrent.name);
        torrent.destroy();
        fs.unlink(pathName);
        Consts.DOWNLOADED_ITEMS = walkDir(Consts.DOWNLOADS_FOLDER);
        Consts.removeFromSavedTorrents(torrent);
    }
    static pause(torrent: Torrent) {
        torrent.pause();
        torrent.destroy();
    }
    static resume(torrent: Torrent) {
        Consts.removeFromSavedTorrents(torrent);
        this.add({ magnetURL: torrent.magnetURI, name: (torrent as any).torrentName });
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
            let importantProperties = ['received', 'ready', '_peersLength', 'done', 'paused', 'destroyed'],
                current = Array.from(TorrentManager.currentTorrentState).find(ele => ele.magnetURI === torrent.magnetURI) || {},
                updatedProps = importantProperties.filter(property => {
                    return (torrent as any)[property] !== (current as any)[property]
                });
            if (updatedProps.length)
                TorrentManager.dispatchEvent([torrent, updatedProps], ListenerTypes.updatedTorrent);
        })
        TorrentManager.currentTorrentState = new Set([...Consts.SAVED_TORRENTS].map(ele => Object.assign({}, ele)));
    }, 500);
    private static dispatchEvent(data: any, type: ListenerTypes) {
        TorrentManager.listeners.forEach(listener => {
            if (listener.type === type)
                listener.func(data);
        });
    }
    static Listener = ListenerTypes;
}
(window as any).TorrentManager = TorrentManager;