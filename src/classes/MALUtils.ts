import mal from "jikants";
import { Seasons } from "jikants/dist/src/interfaces/season/Season";
import { AnimeListTypes } from "jikants/dist/src/interfaces/user/AnimeList";
import AnimeEntry from "./AnimeEntry";
import User, { AnimeList } from "./User";


function getCurrentSeason(): Seasons {
    let month = new Date().getMonth();
    switch (month) {
        case 12:
        case 1:
        case 2:
            return 'winter';
        case 3:
        case 4:
        case 5:
            return 'spring';
        case 6:
        case 7:
        case 8:
            return 'summer';
    }
    return "fall";
}

const AnimeStorage = {
    STORAGE_TTL_IN_SECONDS: 3600,
    _ANIMES: new Map<number, [Date, AnimeEntry]>(),
    cleanOld() {
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
            AnimeStorage._ANIMES.set(anime.malId!, [AnimeStorage._TTL_DATE(), anime]);
            return anime;
        }
        let newEntries = { ...anime },
            newCurrent: any = new AnimeEntry({});
        Object.entries(current).concat(Object.entries(newEntries)).forEach(([key, value]) => {
            if (value)
                (newCurrent as any)[key] = value;
        });
        AnimeStorage._ANIMES.set(anime.malId!, [AnimeStorage._TTL_DATE(), newCurrent]);
        return newCurrent;
    },
    get(anime: AnimeEntry): AnimeEntry | undefined {
        AnimeStorage.cleanOld();
        if (anime.malId)
            return (AnimeStorage._ANIMES.get(anime.malId) || [])[1];
        if (anime.name) {
            let mostSimilar: { similarity: number, anime?: AnimeEntry } = { similarity: 0 };
            AnimeStorage._ANIMES.forEach(storedAnime => {
                if (!storedAnime[1].name) return;
                let similarity = stringRelativeSimilarity(anime.name!.toLowerCase(), storedAnime[1].name!.toLowerCase());
                if (similarity > mostSimilar.similarity && similarity > 0.8) {
                    mostSimilar = {
                        similarity,
                        anime: storedAnime[1]
                    };
                }
            });
            console.log(anime, mostSimilar, AnimeStorage._ANIMES);
            if (mostSimilar.anime)
                return mostSimilar.anime;
        }
    },
    get size() {
        AnimeStorage.cleanOld();
        return AnimeStorage._ANIMES.size;
    },
    _TTL_DATE() {
        let date = new Date();
        date.setSeconds(date.getSeconds() + AnimeStorage.STORAGE_TTL_IN_SECONDS);
        return date;
    }
}

function levenshteinDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    var costs = [];
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i === 0) costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

function stringRelativeSimilarity(str1: string, str2: string) {
    var longer = str1;
    var shorter = str2;
    if (str1.length < str2.length) {
        longer = str2;
        shorter = str1;
    }
    var longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - levenshteinDistance(longer, shorter)) / longerLength;
}

function stringCompare(givenString: string, toCompare: string) {
    let givenSplit = givenString.split(" "),
        compareSplit = toCompare.split(" ");
    let minDistances = givenSplit.map(givenWord => {
        return Math.min(
            ...compareSplit.map(compareWord => {
                return levenshteinDistance(givenWord, compareWord);
            })
        );
    });
    return minDistances.reduce((acc, curr) => acc + curr, 0);
}

export default class MALUtils {
    static MAX_ANIMES_PER_PAGE = 300;

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
    static async getUserAnimeList(user: User, listType: AnimeListTypes = "watching", page = 1): Promise<AnimeList> {
        let data = (await mal.User.animeList(user.username, listType, page));
        if (!data) return user.animeList;
        user.animeList[listType] = data.anime.reduce((map: any, result) => {
            let fromData = new AnimeEntry({});
            fromData.malId = result.mal_id;
            fromData.totalEpisodes = result.total_episodes;
            fromData.startDate = new Date(result.start_date);
            fromData.imageURL = result.image_url;
            fromData.myMalRating = result.score as any;
            fromData.name = result.title;
            fromData.malUrl = result.url;
            fromData.endDate = new Date(result.end_date as any);
            fromData.myMalStatus = AnimeEntry.STATUSES[result.watching_status - 1];
            fromData.myWatchedEpisodes = result.watched_episodes;
            fromData.userStartDate = new Date(result.watch_start_date as any);
            fromData.userEndDate = new Date(result.watch_end_date as any);
            map[fromData.malId] = AnimeStorage.sync(fromData);
            return map;
        }, {});
        if (data.anime.length === this.MAX_ANIMES_PER_PAGE)
            await this.getUserAnimeList(user, listType, page + 1);
        return user.animeList;
    }
    static async getAnimeInfo(anime: AnimeEntry) {
        let data = (await mal.Anime.byId(anime.malId!))!;
        return data;
    }
    static syncAnime = AnimeStorage.sync;
    static getAnime = AnimeStorage.get;
    static get storageSize() { return AnimeStorage.size; };
}
