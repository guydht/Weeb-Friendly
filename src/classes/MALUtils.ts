import mal from "jikants";
import { Seasons } from "jikants/dist/src/interfaces/season/Season";
import { AnimeListTypes } from "jikants/dist/src/interfaces/user/AnimeList";
import Consts from "../consts";
import AnimeEntry from "./AnimeEntry";
import User, { AnimeList } from "./User";
import { getCurrentSeason, stringCompare, stringRelativeSimilarity } from "./utils";

export enum MALStatuses {
    Watching = 1,
    Completed = 2,
    "On-Hold" = 3,
    Dropped = 4,
    "Plan To Watch" = 6
};
const AnimeStorage = {
    STORAGE_TTL_IN_SECONDS: 3600,
    _ANIMES: new Map<number, [Date, AnimeEntry]>(),
    similarNames: new Map<string, AnimeEntry>(),
    cleanDate: new Date(),
    cleanOld() {
        if (AnimeStorage.cleanDate < new Date()) return;
        AnimeStorage.cleanDate = AnimeStorage._TTL_DATE(10);
        AnimeStorage._ANIMES.forEach(([date], key) => {
            if (date < new Date())
                AnimeStorage._ANIMES.delete(key)
        });
    },
    sync(anime: AnimeEntry): AnimeEntry {
        AnimeStorage.cleanOld();
        if (!anime) return new AnimeEntry({ sync: false });
        let current = AnimeStorage.get(anime);
        if (!current) {
            AnimeStorage._ANIMES.set(anime.malId!, [AnimeStorage._TTL_DATE(AnimeStorage.STORAGE_TTL_IN_SECONDS), anime]);
            return anime;
        }
        let newEntries = { ...anime },
            newCurrent: any = new AnimeEntry({});
        Object.entries(current).concat(Object.entries(newEntries)).forEach(([key, value]) => {
            if (value)
                (newCurrent as any)[key] = value;
        });
        AnimeStorage._ANIMES.set(anime.malId!, [AnimeStorage._TTL_DATE(AnimeStorage.STORAGE_TTL_IN_SECONDS), newCurrent]);
        return newCurrent;
    },
    get(anime: AnimeEntry): AnimeEntry | undefined {
        AnimeStorage.cleanOld();
        if (anime.malId)
            return (AnimeStorage._ANIMES.get(anime.malId) || [])[1];
        if (anime.name) {
            let alreadySimilar = AnimeStorage.similarNames.get(anime.name!);
            if (alreadySimilar) {
                return alreadySimilar;
            }
            let mostSimilar: { similarity: number, anime?: AnimeEntry } = { similarity: 0 };
            for (let storedAnime of AnimeStorage._ANIMES.values()) {
                let similarity = stringRelativeSimilarity(anime.name!.toLowerCase(), storedAnime[1].name!.toLowerCase());
                if (similarity > mostSimilar.similarity && similarity > 0.8) {
                    mostSimilar = {
                        similarity,
                        anime: storedAnime[1]
                    };
                }
            };
            if (mostSimilar.anime) {
                AnimeStorage.similarNames.set(anime.name, mostSimilar.anime!);
                return mostSimilar.anime;
            }
            AnimeStorage.similarNames.set(anime.name, anime);
        }
    },
    get size() {
        AnimeStorage.cleanOld();
        return AnimeStorage._ANIMES.size;
    },
    _TTL_DATE(seconds: number) {
        let date = new Date();
        date.setSeconds(date.getSeconds() + seconds);
        return date;
    }
}

export default class MALUtils {
    static MAX_ANIMES_PER_PAGE = 300;
    static MINIMUM_ANIMENAME_SIMILARITY = 0.7;

    static async searchAnime(searchString: string): Promise<AnimeEntry[]> {
        let data = (await mal.Search.search(searchString, "anime"));
        if (!data) return [];
        let parsedData = data.results.sort((a, b) => {
            return stringCompare(searchString.toLowerCase(), a.title.toLowerCase()) -
                stringCompare(searchString.toLowerCase(), b.title.toLowerCase());
        }).map(result => {
            let fromData = new AnimeEntry({});
            fromData.malId = result.mal_id;
            fromData.totalEpisodes = result.episodes;
            fromData.imageURL = result.image_url;
            fromData.myMalRating = result.rated as any;
            fromData.score = result.score;
            fromData.startDate = new Date(result.start_date);
            fromData.endDate = new Date(result.end_date as any);
            fromData.synopsis = result.synopsis;
            fromData.name = result.title;
            fromData.malUrl = result.url;
            return fromData.sync();
        });
        return parsedData;
    }
    static async topAnime(page = 1): Promise<AnimeEntry[]> {
        let data = (await mal.Top.items("anime", page));
        if (!data) return [];
        return data.top.map(ele => {
            let fromData = new AnimeEntry({});
            fromData.malUrl = ele.url;
            fromData.endDate = new Date(ele.end_date as any);
            fromData.startDate = new Date(ele.start_date as any);
            fromData.score = ele.score;
            fromData.imageURL = ele.image_url;
            fromData.malId = ele.mal_id;
            fromData.name = ele.title;
            return AnimeStorage.sync(fromData);
        });
    }
    static async getCurrentSeasonalAnime() {
        return this.seasonalAnime(new Date().getFullYear(), getCurrentSeason() as Seasons);
    }
    static async seasonalAnime(year: number, season: Seasons): Promise<AnimeEntry[]> {
        let data = (await mal.Season.anime(year, season));
        if (!data) return [];
        return data.anime.map(result => {
            let fromData = new AnimeEntry({});
            fromData.malId = result.mal_id;
            fromData.totalEpisodes = result.episodes as any;
            fromData.startDate = new Date(result.airing_start as any);
            fromData.genres = result.genres as any;
            fromData.imageURL = result.image_url;
            fromData.score = result.score as any;
            fromData.synopsis = result.synopsis;
            fromData.name = result.title;
            fromData.malUrl = result.url;
            return fromData.sync();
        });
    }
    static async getUserAnimeList(user: User, listType: AnimeListTypes = "all", page = 1): Promise<AnimeList> {
        let data = (await mal.User.animeList(user.username, listType, page));
        if (!data) return user.animeList;
        user.animeList[listType] = data.anime.reduce((map: any, result) => {
            map[result.mal_id] = new AnimeEntry({
                malId: result.mal_id,
                totalEpisodes: result.total_episodes,
                startDate: new Date(result.start_date),
                endDate: new Date(result.end_date!),
                userStartDate: new Date(result.watch_start_date!),
                userEndDate: new Date(result.watch_end_date!),
                myMalRating: result.score as any,
                myMalStatus: MALStatuses[result.watching_status] as any,
                myWatchedEpisodes: result.watched_episodes,
                imageURL: result.image_url,
                malUrl: result.url,
                name: result.title,
            });
            return map;
        }, {});
        if (data.anime.length === this.MAX_ANIMES_PER_PAGE)
            await this.getUserAnimeList(user, listType, page + 1);

        Object.defineProperty(user.animeList, "fetchedDate", { value: new Date(), writable: true, configurable: true });
        return user.animeList;
    }
    static async getAnimeInfo(anime: AnimeEntry) {
        let data = (await mal.Anime.byId(anime.malId!))!;
        anime.score = data.score;
        anime.name = data.title;
        anime.startDate = data.aired.from;
        anime.endDate = data.aired.to;
        anime.synonyms = new Set([...anime.synonyms, data.title, data.title_english, data.title_japanese, ...data.title_synonyms]);
        anime.synonyms.delete(null as any);
        anime.synopsis = data.synopsis;
        anime.malUrl = data.url;
        anime.totalEpisodes = data.episodes;
        return data;
    }
    static UPDATE_ANIME_URL = "https://myanimelist.net/ownlist/anime/edit.json";
    static async updateAnime(anime: AnimeEntry, { episodes, status, score }: { episodes: number, status: MALStatuses, score: number }): Promise<boolean> {
        let request = await fetch(this.UPDATE_ANIME_URL, {
            method: "POST",
            body: JSON.stringify({
                anime_id: anime.malId!,
                status: status,
                score: score,
                num_watched_episodes: episodes,
                csrf_token: Consts.CSRF_TOKEN
            })
        });
        console.log(request);
        return request.ok;
    }
    static syncAnime = AnimeStorage.sync;
    static getAnime = AnimeStorage.get;
    static get storageSize() { return AnimeStorage.size; };
}
