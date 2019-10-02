import { Torrent } from 'webtorrent';
import TorrentManager from './classes/TorrentManager';
import User, { AnimeList } from './classes/User';
import { hasInternet } from './classes/utils';
let storage = window.require("electron-json-config");

const ANIMELIST_VAlIDITY_TIMEOUT_IN_HOURS = 24;
export default class Consts {
    static HORRIBLE_SUBS_URL = "";

    static WANTS_TO_LOGIN_TO_MAL_STORAGE_KEY = "wants to login";
    static WANTS_TO_LOGIN_TO_MAL = storage.get(Consts.WANTS_TO_LOGIN_TO_MAL_STORAGE_KEY) !== "false";

    static setWantsToLogin(val: boolean) {
        Consts.WANTS_TO_LOGIN_TO_MAL = val;
        storage.set(Consts.WANTS_TO_LOGIN_TO_MAL_STORAGE_KEY, String(val));
    }

    static MAL_USER_STORAGE_KEY = "mal_user";
    static MAL_USER: User = getUserFromStorage();

    static setMALUser(val: User) {
        Consts.MAL_USER = val;
        storage.set(Consts.MAL_USER_STORAGE_KEY, val.readyForJson());
    }

    static CSRF_TOKEN_STORAGE_KEY = "csrf-storage";
    static CSRF_TOKEN = storage.get(Consts.CSRF_TOKEN_STORAGE_KEY) || "";
    static setCsrfToken(val: string) {
        this.CSRF_TOKEN = val;
        storage.set(this.CSRF_TOKEN_STORAGE_KEY, val);
    }

    static MAL_LOGIN_URL = "https://myanimelist.net/login.php";

    static DEFAULT_THEME = "Dark";
    static THEMES = [
        "Dark",
        "Light",
        "Grey",
        "Spacelab",
        "Dark Blue",
        "Sketchy"
    ];

    static THEME_STORAGE_KEY = "theme";
    static CURRENT_THEME = storage.get(Consts.THEME_STORAGE_KEY) || Consts.DEFAULT_THEME;

    static setCurrentTheme(val: string) {
        Consts.CURRENT_THEME = val;
        storage.set(Consts.THEME_STORAGE_KEY, val);
    }

    static DOWNLOADS_FOLDER_STORAGE_KEY = "downloads folder";
    static DOWNLOADS_FOLDER = storage.get(Consts.DOWNLOADS_FOLDER_STORAGE_KEY) || "";
    static setDownloadsFolder(val: string) {
        Consts.DOWNLOADS_FOLDER = val;
        storage.set(Consts.DOWNLOADS_FOLDER_STORAGE_KEY, val);
    }

    static WATCH_PLAYER_SIZE_STORAGE_KEY = "player_size";
    static WATCH_PLAYER_SIZE = storage.get(Consts.WATCH_PLAYER_SIZE_STORAGE_KEY) || {};
    static setWatchPlayerSize(size: object) {
        Consts.WATCH_PLAYER_SIZE = size;
        storage.set(Consts.WATCH_PLAYER_SIZE_STORAGE_KEY, size);
    }

    static SAVED_TORRENTS_STORAGE_KEY = "saved_torrents";
    static SAVED_TORRENTS = new Set<Torrent>((storage.get(Consts.SAVED_TORRENTS_STORAGE_KEY) || []).map(
        (ele: Torrent) => TorrentManager.add(ele.magnetURI, (ele as any).torrentName)
    ));
    static setSavedTorrents(torrents: Set<Torrent>) {
        Consts.SAVED_TORRENTS = torrents;
        setImmediate(() => {
            storage.set(Consts.SAVED_TORRENTS_STORAGE_KEY, Array.from(torrents).map(torrent => {
                return { torrentName: (torrent as any).torrentName, magnetURI: torrent.magnetURI }
            }));
        });
    }

    static FILE_URL_PROTOCOL = "file://";
}
function getUserFromStorage(): User {
    let storageData = storage.get(Consts.MAL_USER_STORAGE_KEY, {}),
        user = User.fromJson(storageData),
        fetchedDate: Date | null = storageData.animeList ? new Date(storageData.animeList.fetchedDate) : null;
    Object.defineProperty(user.animeList, "fetchedDate", { value: fetchedDate });
    if (fetchedDate) {
        fetchedDate.setHours(fetchedDate.getHours() + ANIMELIST_VAlIDITY_TIMEOUT_IN_HOURS);
        hasInternet().then(ok => {
            if (ok && fetchedDate && fetchedDate < new Date())
                user.animeList = new AnimeList({});
        });
    }
    console.log(user);
    return user;
}