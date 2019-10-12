import AnimeEntry from "./AnimeEntry";
//@ts-ignore
import {si} from "nyaapi";

export default class HorribleSubsUtils {
    static HORRIBLE_SUBS_USER = "HorribleSubs";
    static async search(anime: AnimeEntry, fetchAll: boolean = false): Promise<SearchResult[]> {
        for (let name of anime.synonyms) {
            try {
                let results;
                if (fetchAll)
                    results = await si.searchAllByUser(this.HORRIBLE_SUBS_USER, name);
                else
                    results = await si.searchByUserAndByPage(this.HORRIBLE_SUBS_USER, name, 1);
                if (results && results.length)
                    return results.map(siResultToSearchResult);
            }
            catch (e) {
            }
        }
        return [];
    }
    static async latest(page = 1): Promise<SearchResult[]> {
        let results = await si.searchByUserAndByPage(this.HORRIBLE_SUBS_USER, '', page);
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
    }).sync();
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

export class EpisodeData {
    episodeNumber!: number;
    seriesName!: string;
    quality!: number;
}