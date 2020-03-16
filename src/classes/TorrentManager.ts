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
    static MAX_NUMBER_OF_SIMULTANIOUS_TORRENTS = 3;
    static waitingForDownload: { name: string, magnetURI: string }[] = [];
    private static client = new webtorrent();
    static add({ magnetURL }: { magnetURL: string; }) {
        if (Consts.SAVED_TORRENTS && Consts.SAVED_TORRENTS.some(torrent => torrent.magnetURI === magnetURL)) return;
        let returnedTorrent: any;
        if (this.client.torrents.length < TorrentManager.MAX_NUMBER_OF_SIMULTANIOUS_TORRENTS)
            returnedTorrent = this.client.add(magnetURL, {
                path: Consts.DOWNLOADS_FOLDER
            }, (torrent: Torrent) => {
                torrent.on('done', () => {
                    let files = [...torrent.files];
                    torrent.destroy(() => {
                        files.forEach((file: any) => {
                            const absolutePath = path.join(torrent.path, file.path),
                                newAbsolutePath = path.join(Consts.DOWNLOADS_FOLDER, file.path);
                            if (newAbsolutePath !== absolutePath)
                                fs.rename(absolutePath, newAbsolutePath);
                            Consts.removeFromSavedTorrents(returnedTorrent);
                            Consts.reloadDownloads()
                            if (TorrentManager.waitingForDownload.length) {
                                TorrentManager.add({
                                    magnetURL: TorrentManager.waitingForDownload.pop()?.magnetURI ?? ''
                                });
                            }
                            (window as any).reloadPage();
                        });
                    });
                });
                (window as any).reloadPage();
            });
        else {
            returnedTorrent = {
                magnetURI: magnetURL,
                name: decodeURIComponent(magnetURL.split("&").find(ele => ele.startsWith("dn="))?.substring(3) ?? 'Unknown').replace(/\+/g, ' ')
            };
            TorrentManager.waitingForDownload.push(returnedTorrent);
        }
        if (Consts.SAVED_TORRENTS)
            Consts.addToSavedTorrents(returnedTorrent);
        return returnedTorrent;
    }
    static getAll() {
        return Consts.SAVED_TORRENTS;
    }
    static remove(torrent: Torrent) {
        if (torrent.files){
            torrent.files.forEach(file => {
                let pathName = path.join(torrent.path, file.path);
                fs.unlink(pathName);
            });
            Consts.reloadDownloads();
        }
        if (typeof torrent.destroy === "function")
            torrent.destroy();
        Consts.removeFromSavedTorrents(torrent);
        const indexInWaiting = TorrentManager.waitingForDownload.findIndex(waiting => waiting.magnetURI === torrent.magnetURI);
        if(indexInWaiting !== -1)
            TorrentManager.waitingForDownload.splice(indexInWaiting, 1);
    }
    static pause(torrent: Torrent) {
        torrent.pause();
        torrent.destroy();
    }
    static resume(torrent: Torrent) {
        Consts.removeFromSavedTorrents(torrent);
        this.add({ magnetURL: torrent.magnetURI });
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
            removed = Array.from(TorrentManager.currentTorrentState).filter(ele => !Consts.SAVED_TORRENTS.includes(ele));
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
        if (TorrentManager.waitingForDownload.length &&
            TorrentManager.client.torrents.length < TorrentManager.MAX_NUMBER_OF_SIMULTANIOUS_TORRENTS) {
            const torrentToDownload = TorrentManager.waitingForDownload.pop();
            Consts.removeFromSavedTorrents(torrentToDownload as any);
            TorrentManager.add({
                magnetURL: torrentToDownload?.magnetURI ?? ''
            });
        }
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