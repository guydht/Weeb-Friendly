//@ts-ignore
import { pantsu, si } from "nyaapi";
import AnimeEntry from "../classes/AnimeEntry";

export enum Sources {
    HorribleSubs = "HorribleSubs",
    Ohys = "ohys",
    EraiRaws = 11974,
    All = "All",
    Any = "Any"
}
const siPantsuMapping = {
    "HorribleSubs": si,
    "ohys": si,
    "All": si,
    "Any": si,
    "EraiRaws": pantsu
}

let sourcesPriority: Sources[] = [Sources.HorribleSubs, Sources.EraiRaws, Sources.Ohys]; //index === importance (0 is better than infinity).
export { sourcesPriority };
export default class TorrentUtils {
    static async search(anime: AnimeEntry, fetchAll: boolean = false, source: Sources = Sources.Any): Promise<SearchResult[]> {
        switch (source) {
            case Sources.Any:
                for (let source of sourcesPriority) {
                    let results = await this.searchSource(anime, fetchAll, source);
                    if (results.length)
                        return results;
                }
                break;
            case Sources.All:
                let results: SearchResult[] = [];
                for (let source of sourcesPriority) {
                    results.concat(await this.searchSource(anime, fetchAll, source));
                }
                return results;
            default:
                return await this.searchSource(anime, fetchAll, source);
        }
        return [];
    }
    private static async searchSource(anime: AnimeEntry, fetchAll: boolean = false, source: Sources): Promise<SearchResult[]> {
        for (let name of anime.synonyms) {
            try {
                let apiSource = (siPantsuMapping as any)[source];
                if (apiSource === si) {
                    let results;
                    if (fetchAll)
                        results = await si.searchAllByUser(source, name);
                    else
                        results = await si.searchByUserAndByPage(source, name, 1);
                    if (results && results.length)
                        return results.map(siResultToSearchResult.bind(this, source));
                }
                else {
                    let results;
                    if (fetchAll)
                        results = await pantsu.searchAll({
                            term: name,
                            userID: source
                        })
                    else
                        results = await pantsu.search({
                            term: name,
                            userID: source
                        });
                    if (results && results.length)
                        return results.map(pantsuResultToSearchResult.bind(this, source));
                }
            }
            catch (e) {
            }
        }
        return [];
    }
    static async latest(page = 1, source: Sources = Sources.Any): Promise<SearchResult[]> {
        switch (source) {
            case Sources.Any:
                for (let source of sourcesPriority) {
                    let results = await this.getLatestOfSource(page, source);
                    if (results.length)
                        return results;
                }
                break;
            case Sources.All:
                let results: SearchResult[] = [];
                for (let source of sourcesPriority) {
                    results.concat(await this.getLatestOfSource(page, source));
                }
                return results;
            default:
                return await this.getLatestOfSource(page, source);
        }
        return [];
    }
    static async getLatestOfSource(page: number, source: Sources): Promise<SearchResult[]> {
        let results = await si.searchByUserAndByPage(source, '', page);
        return results.map(siResultToSearchResult.bind(this, source));
    }
}
function siResultToSearchResult(source: Sources, siResult: any): SearchResult {
    let result = new SearchResult()
    result.category = siResult.category;
    result.fileSize = siResult.fileSize;
    result.leechers = Number(siResult.leechers);
    result.link = siResult.links;
    result.name = siResult.name;
    result.nbDownload = Number(siResult.nbDownload);
    result.seeders = Number(siResult.seeders);
    result.timestamp = new Date(siResult.timestamp);
    switch (source) {
        case Sources.HorribleSubs:
            result.episodeData = {
                episodeNumber: Number((result.name.match(/[0-9]+(\.[0-9]+)?(?=\s\[[0-9]+p\])/g) || [])[0]),
                seriesName: (result.name.match(/(?<=\[HorribleSubs\]\s).+(?=\s-\s[0-9]+)/g) || [])[0],
                quality: Number((result.name.match(/(?<=\s-\s[0-9]+(\.[0-9]+)?\s\[)[0-9]+(?=p)/g) || [])[0])
            };
            break;
        case Sources.Ohys:
            result.episodeData = {
                episodeNumber: Number((result.name.match(/(?<=\s-\s)[0-9]+(\.[0-9]+)?(?=\s)/g) || [])[0]),
                seriesName: (result.name.match(/(?<=\[Ohys-Raws\]\s).+(?=\s-\s[0-9]+)/g) || [])[0],
                quality: Number((result.name.match(/(?<=\s[0-9]+x)[0-9]+(?=\sx264)/g) || [])[0]),
                episodeType: (result.name.match(/(?<=\s-\s[0-9]+(\.[0-9]+)?\s)[a-zA-Z]+/g) || [])[0]
            };
    }
    result.animeEntry = new AnimeEntry({
        name: result.episodeData.seriesName
    });
    return result;
}
function pantsuResultToSearchResult(source: Sources, pantsuResult: any) {
    let categoryMapping: any = {
        "3": "English-translated"
    };
    let result = new SearchResult();
    result.category = categoryMapping[pantsuResult.category];
    result.name = pantsuResult.name;
    result.link = {
        magnet: pantsuResult.magnet,
        page: "",
        file: pantsuResult.torrent
    };
    result.fileSize = pantsuResult.filesize;
    result.seeders = pantsuResult.seeders;
    result.leechers = pantsuResult.leechers;
    result.timestamp = new Date(pantsuResult.date);
    result.nbDownload = pantsuResult.completed;
    switch (source) {
        case Sources.EraiRaws:
            result.episodeData = {
                episodeNumber: Number((result.name.match(/(?<=\s-\s)[0-9]+(\.[0-9]+)?(?=\s)/g) || [])[0]),
                seriesName: (result.name.match(/(?<=\[Erai-raws\]\s).+(?=\s-\s[0-9]+)/g) || [])[0],
                quality: Number((result.name.match(/[0-9]+(?=p)/g) || [])[0]),
                episodeType: (result.name.match(/(?<=\[[0-9]+p\]\[])[^[]]+(?=\])+/g) || result.name.match(/(?<=\s-\s[0-9]+(\.[0-9]+)?\s)[a-zA-Z]+/g) || [])[0]
            };
    }
    result.animeEntry = new AnimeEntry({
        name: result.name
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

export class EpisodeData {
    episodeNumber!: number;
    seriesName!: string;
    quality!: number;
    episodeType?: string; // strings like "OVA" and "END"
}