import AnimeEntry from "./AnimeEntry";

const storageObject = window.require("electron-json-config"),
    fs = window.require("fs"),
    path = window.require("path"),
    electron = window.require("electron");
class ThumbnailManager {
    static SAVED_THUMBNAILS_STATE_STORAGE_KEY = "saved-thumbnail-state";
    static SAVED_THUMBNAILS_STATE = storageObject.get(ThumbnailManager.SAVED_THUMBNAILS_STATE_STORAGE_KEY) || false;
    static setThumbnailStorageState(activated: boolean) {
        ThumbnailManager.SAVED_THUMBNAILS_STATE = activated;
        storageObject.set(ThumbnailManager.SAVED_THUMBNAILS_STATE_STORAGE_KEY, activated);
    }

    static SAVED_THUMBNAILS_STORAGE_KEY = "saved-thumbnail-storage";
    static SAVED_THUMBNAILS_PATH = path.join((electron.app || electron.remote.app).getPath("cache"), "/thumbnail-image-storage/");
    static SAVED_THUMBNAILS = new Set<number>(storageObject.get(ThumbnailManager.SAVED_THUMBNAILS_STORAGE_KEY) || []);
    static setThumbnailStorage(thumbnailStorage: Set<number> = ThumbnailManager.SAVED_THUMBNAILS) {
        ThumbnailManager.SAVED_THUMBNAILS = thumbnailStorage;
        storageObject.set(ThumbnailManager.SAVED_THUMBNAILS_STORAGE_KEY, [...thumbnailStorage]);
    }
}
if (!fs.existsSync(ThumbnailManager.SAVED_THUMBNAILS_PATH))
    fs.mkdirSync(ThumbnailManager.SAVED_THUMBNAILS_PATH);

let _storageKey = "anime-storage",
    STORAGE_TTL_IN_SECONDS = 86400,
    _ANIMES: Map<number, [Date, AnimeEntry]> = new Map(),
    cleanDate = new Date(),
    cleanOld = () => {
        if (cleanDate < new Date()) return;
        cleanDate = _TTL_DATE(10);
        _ANIMES.forEach(([date, anime]) => {
            if (date < new Date())
                _clearUpdatableData(anime as any);
        });
    },
    sync = (anime: AnimeEntry, forceSynonyms: boolean = false): AnimeEntry => {
        cleanOld();
        if (!anime) return new AnimeEntry({});
        let current = get(anime);
        if (!current) {
            if (anime.malId)
                _addToStorage(anime as any);
            return anime;
        }
        if (!forceSynonyms)
            current.synonyms.forEach(ele => anime.synonyms.add(ele));
        Object.keys(anime).forEach(key => {
            let value = anime[key as keyof AnimeEntry];
            if (!(!value && typeof value !== "number") && current![key as keyof AnimeEntry] !== value)
                (current as any)[key] = value;
        });
        _addToStorage(current as any);
        return current;
    },
    get = (anime: AnimeEntry | string): AnimeEntry | undefined => {
        cleanOld();
        if (typeof anime === "string")
            anime = new AnimeEntry({ sync: false, name: anime });
        if (anime.malId)
            return (_ANIMES.get(anime.malId) || [])[1];
        if (anime.name) {
            for (let storedAnime of _ANIMES.values())
                if (storedAnime[1].synonyms.has(anime.name))
                    return storedAnime[1];
        }
    },
    size = () => {
        cleanOld();
        return _ANIMES.size;
    },
    _TTL_DATE = (seconds: number) => {
        let date = new Date();
        date.setSeconds(date.getSeconds() + seconds);
        return date;
    },
    needsUpdating = true,
    _addToStorage = (anime: AnimeEntry & { malId: number }) => {
        _ANIMES.set(anime.malId, [_TTL_DATE(STORAGE_TTL_IN_SECONDS), anime]);
        needsUpdating = true;
    },
    _clearUpdatableData = (anime: AnimeEntry & { malId: number }) => {
        _ANIMES.set(anime.malId, [_TTL_DATE(STORAGE_TTL_IN_SECONDS), anime]);
    };
(window as any).animeStorage = _ANIMES;
setInterval(() => {
    if (needsUpdating) {
        let copy: { [key: number]: [Date, AnimeEntry] } = {};
        _ANIMES.forEach(([date, anime], animeId) => {
            copy[animeId] = [date, anime.readyForJSON()];
        });
        storageObject.set(_storageKey, Object.values(copy));
        needsUpdating = false;
    }
}, 1000);
((storageObject.get(_storageKey) || []) as any[]).forEach(([date, anime]) => {
    (anime as any).sync = false;
    _ANIMES.set(Number(anime.malId), [new Date(date), new AnimeEntry(anime as any)]);
});

export { sync, get, size, ThumbnailManager };

