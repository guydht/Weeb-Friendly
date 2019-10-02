import { Torrent } from "webtorrent";
import Consts from "../consts";

const webtorrent = window.require("webtorrent"),
    path = window.require("path"),
    fs = window.require("fs").promises;

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
}