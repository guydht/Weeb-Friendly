import AnimeEntry from "./AnimeEntry";
import { Search, Top, Season } from "jikan-client";
import { Seasons as SeasonType } from "jikan-client/dist/interfaces/season/Season";


function getCurrentSeason(): string {
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
        case 9:
        case 10:
        case 11:
            return 'fall';
    }
    return '';
}

function jikanObjToAnimeEntry(jikanObject: any): AnimeEntry {
    const entry = new AnimeEntry();
    entry.name = jikanObject.title;
    entry.imageURL = jikanObject.image_url;
    entry.malUrl = jikanObject.url;
    entry.malId = jikanObject.mal_id;
    entry.synopsis = jikanObject.synopsis;
    entry.genres = new Set(jikanObject.genres);
    entry.totalEpisodes = jikanObject.episodes;
    entry.score = jikanObject.score;
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
        let data = (await Search.search(searchString, "anime")).results,
            parsedData = data.sort((a: any, b: any) => {
                return stringCompare(searchString.toLowerCase(), a.title.toLowerCase()) -
                    stringCompare(searchString.toLowerCase(), b.title.toLowerCase()) +
                    (b['es_score'] - a['es_score']);
            }).map(jikanObjToAnimeEntry);
        return parsedData;
    }
    static async topAnime(): Promise<Array<AnimeEntry>> {
        let data= (await Top.items()) as unknown as any[]
        return data.map(jikanObjToAnimeEntry);
    }
    static async seasonalAnime(year: number = new Date().getFullYear(), season: SeasonType): Promise<AnimeEntry[]> {
        season = season || getCurrentSeason();
        let data = (await Season.anime(year, season)).anime;
        return data.map(jikanObjToAnimeEntry);
    }
}