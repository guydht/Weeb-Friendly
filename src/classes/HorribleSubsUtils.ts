import { si } from "nyaapi";
import AnimeEntry from "./AnimeEntry";

export default class HorribleSubsUtils {
    static HORRIBLE_SUBS_USER = "HorribleSubs";
    static NUMBER_OF_LATEST_ANIMES = 75;
    static async search(anime: AnimeEntry): Promise<SearchResult[]> {
        for (let name of anime.synonyms) {
            try {
                let results = await si.searchAllByUser(this.HORRIBLE_SUBS_USER, name);
                if (results)
                    return results.map(siResultToSearchResult);
            }
            catch (e) {
            }
        }
        return [];
    }
    static async latest(): Promise<SearchResult[]> {
        let results = await si.searchByUser(this.HORRIBLE_SUBS_USER, '', this.NUMBER_OF_LATEST_ANIMES);
        return results.map(siResultToSearchResult);
    }
}

function siResultToSearchResult(siResult: any): SearchResult {
    let result = new SearchResult()
    result.category = siResult.category;
    result.fileSize = siResult.fileSize;
    result.leechers = Number(siResult.leechers);
    result.link = siResult.links;
    result.name = siResult.name;
    result.nbDownload = Number(siResult.nbDownload);
    result.seeders = Number(siResult.seeders);
    result.timestamp = new Date(siResult.timestamp);
    result.episodeData = {
        episodeNumber: Number((result.name.match(/[0-9]+(\.[0-9]+)?(?=\s\[[0-9]+p\])/g) || [])[0]),
        seriesName: (result.name.match(/(?<=\[HorribleSubs\]\s).+(?=\s-\s[0-9]+)/g) || [])[0],
        quality: Number((result.name.match(/(?<=\s-\s[0-9]+(\.[0-9]+)?\s\[)[0-9]+(?=p)/g) || [])[0])
    };
    result.animeEntry = new AnimeEntry({
        name: result.episodeData.seriesName
    });
    return result;
}

export class SearchResult {
    category!: {
        label: string;
        code: string;
    };
    fileSize!: string;
    leechers!: number;
    link!: {
        page: string;
        file: string;
        magnet: string;
    };
    name!: string;
    nbDownload!: number;
    seeders!: number;
    timestamp!: Date;
    episodeData!: EpisodeData;
    animeEntry!: AnimeEntry
}

class EpisodeData {
    episodeNumber!: number;
    seriesName!: string;
    quality!: number;
}