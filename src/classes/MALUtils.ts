import mal from "node-myanimelist";
import season from "node-myanimelist/typings/methods/jikan/season";
import AnimeEntry from "./AnimeEntry";
import User, { AnimeList } from "./User";


function getCurrentSeason(): season {
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

function jikanObjToAnimeEntry(jikanObject: any): AnimeEntry {
    const entry = new AnimeEntry({});
    entry.name = jikanObject.title;
    entry.imageURL = jikanObject.image_url.split("?")[0];
    entry.malUrl = jikanObject.url;
    entry.malId = jikanObject.mal_id;
    entry.synopsis = jikanObject.synopsis;
    entry.genres = new Set(jikanObject.genres);
    entry.totalEpisodes = jikanObject.total_episodes || jikanObject.episodes;
    entry.score = jikanObject.score;
    entry.myMalRating = jikanObject.userScore;
    return entry
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
    static async searchAnime(searchString: string): Promise<AnimeEntry[]> {
        let data = (await mal.search().anime({ q: searchString })).data.results,
            parsedData = data.sort((a: any, b: any) => {
                return stringCompare(searchString.toLowerCase(), a.title.toLowerCase()) -
                    stringCompare(searchString.toLowerCase(), b.title.toLowerCase()) +
                    (b['es_score'] - a['es_score']);
            }).map(jikanObjToAnimeEntry);
        return parsedData;
    }
    static async topAnime(page = 1): Promise<Array<AnimeEntry>> {
        let data = (await mal.top().anime().all(page)).data;
        return data.map(jikanObjToAnimeEntry);
    }
    static async getCurrentSeasonalAnime() {
        return this.seasonalAnime(new Date().getFullYear(), getCurrentSeason() as season);
    }
    static async seasonalAnime(year: number, season: season): Promise<AnimeEntry[]> {
        let data = (await mal.season(year, season)).data.anime;
        return data.map(jikanObjToAnimeEntry);
    }
    static async getUserAnimeList(user: User): Promise<AnimeList> {
        let data = (await mal.user(user.username).animelist().watching()).data.anime;
        for (let entry of data)
            (entry as any).userScore = entry.score;
        user.animeList.watching = data.map(jikanObjToAnimeEntry);
        return user.animeList;
    }
    static async getAnimeInfo(anime: AnimeEntry): Promise<AnimeInfo> {
        let info = await mal.anime(anime.malId!).info();
        return info.data;
    }
}

export type MalLinkObject = {
    mal_id: number;
    name: string;
    type: string;
    url: string
}
export interface AnimeInfo {
    aired: { from: string, to: string | null, prop: { from: Object, to: Object }, string: string };
    airing: boolean;
    background?: null;
    broadcast: string;
    duration: string;
    ending_themes: string[];
    episodes?: number;
    favorites?: number;
    genres: MalLinkObject[];
    image_url: string;
    licensors: MalLinkObject[];
    mal_id: number;
    members: number;
    opening_themes: string[];
    popularity: number;
    premiered: string;
    producers: MalLinkObject[];
    rank: number;
    rating: string;
    related: {
        Adaptation: MalLinkObject[],
        "Alternative version": MalLinkObject[],
        "Side story": MalLinkObject[],
        Other: MalLinkObject[]
    };
    request_cache_expiry: number;
    request_cached: boolean;
    request_hash: string;
    score: number;
    scored_by: number;
    source: string;
    status: string;
    studios: MalLinkObject[];
    synopsis: string;
    title: string;
    title_english: string;
    title_japanese: string;
    title_synonyms: string[];
    trailer_url: string;
    type: string;
    url: string;
}
