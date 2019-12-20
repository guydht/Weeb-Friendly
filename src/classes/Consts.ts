import { Torrent } from 'webtorrent';
import CustomMiddleClick from '../jsHelpers/CustomMiddleClick';
import { waitFor } from '../jsHelpers/jifa';
import { walkDir } from '../utils/general';
import { Sources } from '../utils/torrents';
import DownloadedItem from './DownloadedItem';
import TorrentManager from './TorrentManager';
import User from './User';

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
        Consts.DOWNLOADED_ITEMS = walkDir(val).filter(ele => ele.absolutePath.endsWith(".mkv") || ele.absolutePath.endsWith(".mp4"));
    }

    static QUALITY_PREFERENCE_STORAGE_KEY = "quality-storage";
    static DEFAULT_QUALITY_PREFERENCE = [1080, 720, 480, 360];
    static QUALITY_PREFERENCE: number[] = storage.get(Consts.QUALITY_PREFERENCE_STORAGE_KEY) || Consts.DEFAULT_QUALITY_PREFERENCE;
    static setQualityPreference(qualityArr: number[]) {
        Consts.QUALITY_PREFERENCE = qualityArr;
        storage.set(Consts.QUALITY_PREFERENCE_STORAGE_KEY, qualityArr);
    }

    static SOURCE_PREFERENCE_STORAGE_KEY = "default-source";
    static DEFAULT_SOURCE_PREFERENCE: Sources[] = [Sources.HorribleSubs, Sources.EraiRaws, Sources.Ohys];
    static SOURCE_PREFERENCE: Sources[] = (storage.get(Consts.SOURCE_PREFERENCE_STORAGE_KEY) || Consts.DEFAULT_SOURCE_PREFERENCE).map(Number);
    static get SOURCE_REFERENCE_KEYS(): string[] {
        return Consts.SOURCE_PREFERENCE.map(ele => Object.keys(Sources).find(source => (Sources as any)[source] === ele)!);
    }
    static get SOURCE_PREFERENCE_ENTRIES(): [string, Sources][] {
        return Consts.SOURCE_PREFERENCE.map(ele => Object.entries(Sources).find(source => (Sources as any)[source[0]] === ele) as any);
    }
    static setSourcesPreference(sources: Sources[]) {
        Consts.SOURCE_PREFERENCE = sources.map(Number);
        storage.set(Consts.SOURCE_PREFERENCE_STORAGE_KEY, sources.map(Number));
    }

    static WATCH_PLAYER_SIZE_STORAGE_KEY = "player_size";
    static WATCH_PLAYER_SIZE = storage.get(Consts.WATCH_PLAYER_SIZE_STORAGE_KEY) || { height: 200, width: 400, top: 0, left: 0 };
    static setWatchPlayerSize(size: object) {
        Consts.WATCH_PLAYER_SIZE = size;
        storage.set(Consts.WATCH_PLAYER_SIZE_STORAGE_KEY, size);
    }

    static SAVED_TORRENTS_STORAGE_KEY = "saved_torrents";
    static SAVED_TORRENTS = new Set<Torrent>((storage.get(Consts.SAVED_TORRENTS_STORAGE_KEY) || []).filter((ele: any) => ele.magnetURI && ele.torrentName)
        .map((ele: Torrent) => TorrentManager.add({ magnetURL: ele.magnetURI, name: (ele as any).torrentName })));
    static addToSavedTorrents(torrent: Torrent) {
        Consts.SAVED_TORRENTS.add(torrent);
        waitFor(() => torrent.magnetURI, () => {
            storage.set(Consts.SAVED_TORRENTS_STORAGE_KEY, Array.from(Consts.SAVED_TORRENTS).map(torrent => {
                return { torrentName: (torrent as any).torrentName, magnetURI: torrent.magnetURI }
            }));
        });
    }

    static MIDDLE_CLICK_STORAGE_KEY = "middle-click";
    static MIDDLE_CLICK = storage.get(Consts.MIDDLE_CLICK_STORAGE_KEY) || false;
    static setMiddleClick(activated: boolean) {
        Consts.MIDDLE_CLICK = activated;
        CustomMiddleClick[activated ? "enable" : "disable"]();
        storage.set(Consts.MIDDLE_CLICK_STORAGE_KEY, activated);
    }

    static DOWNLOADED_ITEMS: DownloadedItem[] = walkDir(Consts.DOWNLOADS_FOLDER).filter(ele => ele.absolutePath.endsWith(".mkv") || ele.absolutePath.endsWith(".mp4"));
    static DOWNLOADED_ITEMS_FILTER: string = localStorage.getItem("downloadedItemsFilter") || "";
    static setDownloadedItemsFilter(filter: string) {
        this.DOWNLOADED_ITEMS_FILTER = filter;
        localStorage.setItem("downloadedItemsFilter", filter);
    }
    static get FILTERED_DOWNLOADED_ITEMS() {
        let filterString = this.DOWNLOADED_ITEMS_FILTER.toLowerCase(),
            reverseSearch = filterString[0] === "!";
        if (reverseSearch)
            filterString = filterString.slice(1);
        if (reverseSearch)
            return this.DOWNLOADED_ITEMS.filter(ele => {
                return !ele.absolutePath.toLowerCase().includes(filterString);
            });
        return this.DOWNLOADED_ITEMS.filter(ele => {
            return ele.absolutePath.toLowerCase().includes(filterString);
        });
    }

    static removeFromSavedTorrents(torrent: Torrent) {
        Consts.SAVED_TORRENTS.delete(torrent);
        storage.set(Consts.SAVED_TORRENTS_STORAGE_KEY, Array.from(Consts.SAVED_TORRENTS).map(torrent => {
            return { torrentName: (torrent as any).torrentName, magnetURI: torrent.magnetURI }
        }));
    }
    static FILE_URL_PROTOCOL = "file://";
}
Consts.setMiddleClick(Consts.MIDDLE_CLICK);
function getUserFromStorage(): User {
    let storageData = storage.get(Consts.MAL_USER_STORAGE_KEY, {}),
        user = User.fromJson(storageData),
        fetchedDate: Date | null = storageData.animeList ? new Date(storageData.animeList.fetchedDate) : null;
    Object.defineProperty(user.animeList, "fetchedDate", { value: fetchedDate });
    if (fetchedDate) {
        fetchedDate.setHours(fetchedDate.getHours() + ANIMELIST_VAlIDITY_TIMEOUT_IN_HOURS);
    }
    return user;
}
(window as any).Consts = Consts;