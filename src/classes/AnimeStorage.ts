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
    static SAVED_THUMBNAILS: Set<number>;
}

function getSavedThumbnails(): Set<number> {
    if (!fs.existsSync(ThumbnailManager.SAVED_THUMBNAILS_PATH))
        fs.mkdirSync(ThumbnailManager.SAVED_THUMBNAILS_PATH);
    const thumbnails = new Set<number>(fs.readdirSync(ThumbnailManager.SAVED_THUMBNAILS_PATH)
        .map((fileName: string) => Number(fileName)).filter((num: number) => !isNaN(num)));
    for (const thumbnail of thumbnails) {
        const fileName = path.join(ThumbnailManager.SAVED_THUMBNAILS_PATH, thumbnail.toString()),
            stats = fs.statSync(fileName);
        if (stats && stats.size <= 453) {
            fs.unlinkSync(fileName);
            thumbnails.delete(thumbnail);
        }
    }
    return thumbnails;
}

if (!ThumbnailManager.SAVED_THUMBNAILS)
    ThumbnailManager.SAVED_THUMBNAILS = getSavedThumbnails();

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
    },
    _whenHasInternetStorageKey = "laterWhenIHaveInternet",
    updateInMalWhenHasInternet = (anime: AnimeEntry, updateParams: object) => {
        if (anime.malId) {
            const currentThingsToUpdate: Record<string, object> = storageObject.get(_whenHasInternetStorageKey) || {},
                updateObj: any = currentThingsToUpdate[anime.malId.toString()] || {};
            Object.entries(updateParams).forEach(([key, value]) => {
                updateObj[key] = value;
            });
            currentThingsToUpdate[anime.malId.toString()] = updateObj;
            storageObject.set(_whenHasInternetStorageKey, currentThingsToUpdate);
        }
    },
    lastHasInternetState = false;
(window as any).animeStorage = _ANIMES;
(window as any).storage = storageObject;
setInterval(() => {
    if (needsUpdating) {
        let copy: { [key: number]: [Date, AnimeEntry] } = {};
        _ANIMES.forEach(([date, anime], animeId) => {
            const jsonedAnime = anime.readyForJSON();
            for (let key in jsonedAnime)
                if (jsonedAnime[key] === undefined || jsonedAnime[key] === null || jsonedAnime[key].length === 0)
                    delete jsonedAnime[key];
            copy[animeId] = [date, jsonedAnime];
        });
        storageObject.set(_storageKey, Object.values(copy));
        needsUpdating = false;
    }
    if (lastHasInternetState === false && navigator.onLine) {
        let argsToUpdate: Record<string, object> = storageObject.get(_whenHasInternetStorageKey) || {},
            MALUtils = require("../utils/MAL").default;
        Promise.all(Object.entries(argsToUpdate).map(
            ([animeId, updateObj]: any) => MALUtils.updateAnime(new AnimeEntry({ malId: Number(animeId) }), updateObj)
        )).then(ok => {
            if (ok.every(ok => ok)) {
                storageObject.set(_whenHasInternetStorageKey, {});
                if (ok.length)
                    (window as any).displayToast({
                        title: "Yay! You have your internet back!",
                        body: "Finished updating all your offline progress with MAL :)"
                    });
            }
            else
                setTimeout(() => {
                    lastHasInternetState = false;
                }, 10000);
        });
    }
    lastHasInternetState = navigator.onLine;
}, 1000);
((storageObject.get(_storageKey) || []) as any[]).forEach(([date, anime]) => {
    (anime as any).sync = false;
    _ANIMES.set(Number(anime.malId), [new Date(date), new AnimeEntry(anime as any)]);
});

export { sync, get, size, ThumbnailManager, updateInMalWhenHasInternet };

