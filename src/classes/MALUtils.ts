import AnimeEntry from "./AnimeEntry";

class Consts {
    static MAL_SEARCH_URL = "https://myanimelist.net/search/prefix.json?type=anime&keyword=";
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
    static async searchAnime(searchString: string): Promise<any> {
        let response = await fetch(Consts.MAL_SEARCH_URL + searchString);
        let data = await response.json(),
            parsedData = (data.categories || []).find((category: any) => category.type === "anime");
        if (!parsedData) return [];;
        parsedData = parsedData.items.sort((a: any, b: any) => {
            return stringCompare(searchString.toLowerCase(), a.name.toLowerCase()) -
                stringCompare(searchString.toLowerCase(), b.name.toLowerCase()) +
                (b['es_score'] - a['es_score']);
        }).map((item: any) => {
            const entry = new AnimeEntry();
            entry.name = item.name;
            entry.imageURL = item.imageURL;
            entry.malUrl = item.url;
            entry.malId = item.id;
            return entry
        });
        return parsedData;
    }
}