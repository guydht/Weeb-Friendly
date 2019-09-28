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
    _ANIMES: new Map<number, AnimeEntry>(),
    sync(anime: AnimeEntry): AnimeEntry {
        if (!anime || !anime.malId) return new AnimeEntry({});
        let current = AnimeStorage._ANIMES.get(anime.malId!);
        if (!current) {
            AnimeStorage._ANIMES.set(anime.malId!, anime);
            return anime;
        }
        let newEntries = { ...anime },
            newCurrent: any = { ...current };
        Object.entries(newEntries).forEach(([key, value]) => {
            if (value)
                newCurrent[key] = value;
        });
        newCurrent = new AnimeEntry(newCurrent);
        AnimeStorage._ANIMES.set(anime.malId!, newCurrent);
        return newCurrent;
    },
    get(anime: number | AnimeEntry): AnimeEntry | undefined {
        let num: number = typeof anime === "number" ? anime : anime.malId!;
        return AnimeStorage._ANIMES.get(num);
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
        let data = (await mal.Search.search(searchString, "anime"))!.results,
            parsedData = data.sort((a, b) => {
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
                return AnimeStorage.sync(fromData);
            });
        return parsedData;
    }
    static async topAnime(page = 1): Promise<Array<AnimeEntry>> {
        let data = (await mal.Top.items("anime", page))!.top;
        return data.map(ele => {
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
        let data = (await mal.Season.anime(year, season))!.anime;
        return data.map(result => {
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
            return AnimeStorage.sync(fromData);
        });
    }
    static async getUserAnimeList(user: User, listType: AnimeListTypes = "watching", page = 1): Promise<AnimeList> {
        let data = (await mal.User.animeList(user.username, listType, page))!.anime;
        user.animeList[listType] = data.reduce((map: any, result) => {
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
        if (data.length === this.MAX_ANIMES_PER_PAGE)
            await this.getUserAnimeList(user, listType, page + 1);
        return user.animeList;
    }
    static async getAnimeInfo(anime: AnimeEntry) {
        let data = (await mal.Anime.byId(anime.malId!))!;
        return data;
    }
    static syncAnime = AnimeStorage.sync;
}

// export type MalLinkObject = {
//     mal_id: number;
//     name: string;
//     type: string;
//     url: string
// }
// export interface AnimeInfo {
//     aired: { from: string, to: string | null, prop: { from: Object, to: Object }, string: string };
//     airing: boolean;
//     background?: null;
//     broadcast: string;
//     duration: string;
//     ending_themes: string[];
//     episodes?: number;
//     favorites?: number;
//     genres: MalLinkObject[];
//     image_url: string;
//     licensors: MalLinkObject[];
//     mal_id: number;
//     members: number;
//     opening_themes: string[];
//     popularity: number;
//     premiered: string;
//     producers: MalLinkObject[];
//     rank: number;
//     rating: string;
//     related: {
//         Adaptation: MalLinkObject[],
//         "Alternative version": MalLinkObject[],
//         "Side story": MalLinkObject[],
//         Other: MalLinkObject[]
//     };
//     request_cache_expiry: number;
//     request_cached: boolean;
//     request_hash: string;
//     score: number;
//     scored_by: number;
//     source: string;
//     status: string;
//     studios: MalLinkObject[];
//     synopsis: string;
//     title: string;
//     title_english: string;
//     title_japanese: string;
//     title_synonyms: string[];
//     trailer_url: string;
//     type: string;
//     url: string;
// }
