import AnimeEntry from "./AnimeEntry";

let storageObject = window.require("electron-json-config"),
    _storageKey = "anime-storage",
    STORAGE_TTL_IN_SECONDS = 86400,
    _ANIMES: Map<number, [Date, AnimeEntry]> = new Map(),
    cleanDate = new Date(),
    cleanOld = () => {
        if (cleanDate < new Date()) return;
        cleanDate = _TTL_DATE(10);
        _ANIMES.forEach(([date, anime]) => {
            if (date < new Date())
                _removeFromStorage(anime as any);
        });
    },
    sync = (anime: AnimeEntry): AnimeEntry => {
        cleanOld();
        if (!anime) return new AnimeEntry({ sync: false });
        let current = get(anime);
        if (!current) {
            if (anime.malId)
                _addToStorage(anime as any);
            return anime;
        }
        current.synonyms.forEach(ele => anime.synonyms.add(ele));
        Object.entries(anime).forEach(([key, value]) => {
            if (value)
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
    _removeFromStorage = (anime: AnimeEntry & { malId: number }) => {
        _ANIMES.delete(anime.malId);
        needsUpdating = true;
    };
(window as any).animeStorage = _ANIMES;
setInterval(() => {
    if (needsUpdating) {
        let copy: { [key: number]: [Date, AnimeEntry] } = {};
        _ANIMES.forEach(([date, anime], animeId) => {
            copy[animeId] = [date, anime.readyForJSON()];
        });
        storageObject.set(_storageKey, copy);
        needsUpdating = false;
    }
}, 1000);
((Object.entries(storageObject.get(_storageKey) || {})) as any[]).forEach(([animeId, [date, anime]]) => {
    (anime as any).sync = false;
    _ANIMES.set(Number(animeId), [new Date(date), new AnimeEntry(anime as any)]);
});

export { storageObject, sync, get, size };

