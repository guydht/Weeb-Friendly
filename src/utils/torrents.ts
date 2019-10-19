//@ts-ignore
import { pantsu, si } from "nyaapi";
import AnimeEntry from "../classes/AnimeEntry";
import Consts from "../classes/Consts";

export enum Sources {
    HorribleSubs,
    Ohys,
    EraiRaws,
    All,
    Any
}

const siPantsuMapping = {
    [Sources.HorribleSubs]: {
        si: "HorribleSubs",
        pantsu: "12035"
    },
    [Sources.Ohys]: {
        si: "ohys"
    },
    [Sources.EraiRaws]: {
        pantsu: "11974",
        si: "Erai-raws"
    }
}

export default class TorrentUtils {
    static async search(anime: AnimeEntry, fetchAll: boolean = false, source: Sources = Sources.Any): Promise<SearchResult[]> {
        switch (source) {
            case Sources.Any:
                for (let source of Consts.SOURCE_PREFERENCE) {
                    let results = await this.searchSource(anime, fetchAll, source);
                    if (results.length)
                        return results;
                }
                break;
            case Sources.All:
                let results: SearchResult[] = [];
                for (let source of Consts.SOURCE_PREFERENCE) {
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
                let apiSource = (siPantsuMapping as any)[source],
                    results = [];
                if (apiSource.si) {
                    let sourceValue = apiSource.si;
                    if (fetchAll)
                        results.push(...(await si.searchAllByUser(sourceValue, name)).map(siResultToSearchResult.bind(this, source)));
                    else
                        results.push(...(await si.searchByUserAndByPage(sourceValue, name, 1)).map(siResultToSearchResult.bind(this, source)));
                }
                if (apiSource.pantsu) {
                    let sourceValue = apiSource.pantsu;
                    if (fetchAll)
                        results.push(...(await pantsu.searchAll({
                            term: name,
                            userID: sourceValue
                        })).map(pantsuResultToSearchResult.bind(this, source)));
                    else
                        results.push(...(await pantsu.search({
                            term: name,
                            userID: sourceValue
                        })).map(pantsuResultToSearchResult.bind(this, source)));
                }
                if (results.length)
                    return results;
            }
            catch (e) {console.log(e);
            }
        }
        return [];
    }
    static async latest(page = 1, source: Sources = Sources.Any): Promise<SearchResult[]> {
        switch (source) {
            case Sources.Any:
                for (let source of Consts.SOURCE_PREFERENCE) {
                    let results = await this.getLatestOfSource(page, source);
                    if (results.length)
                        return results;
                }
                break;
            case Sources.All:
                let results: SearchResult[] = [];
                for (let source of Consts.SOURCE_PREFERENCE) {
                    results.concat(await this.getLatestOfSource(page, source));
                }
                return results;
        }
        return await this.getLatestOfSource(page, source);
    }
    private static async getLatestOfSource(page: number, source: Sources): Promise<SearchResult[]> {
        let apiSource = (siPantsuMapping as any)[source],
            results = [];
        console.log(apiSource, source);
        if (apiSource.si)
            results.push(...(await si.searchByUserAndByPage(apiSource.si, '', page)).map(siResultToSearchResult.bind(this, source)));
        if (apiSource.pantsu)
            results.push(...(await pantsu.search({
                term: '*',
                userId: apiSource.pantsu,
                page
            })).map(pantsuResultToSearchResult.bind(this, source)));
        return results;
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
            break;
        case Sources.EraiRaws:
            result.episodeData = {
                episodeNumber: Number((result.name.match(/(?<=\s-\s)[0-9]+(\.[0-9]+)?(?=\s)/g) || [])[0]),
                seriesName: (result.name.match(/(?<=\[Erai-raws\]\s).+(?=\s-\s[0-9]+)/g) || [])[0],
                quality: Number((result.name.match(/[0-9]+(?=p)/g) || [])[0]),
                episodeType: (result.name.match(/(?<=\[[0-9]+p\]\[])[^[]]+(?=\])+/g) || result.name.match(/(?<=\s-\s[0-9]+(\.[0-9]+)?\s)[a-zA-Z]+/g) || [])[0]
            };
    }
    result.animeEntry = new AnimeEntry({
        name: result.episodeData.seriesName
    });
    return result;
}
function pantsuResultToSearchResult(source: Sources, pantsuResult: any) {
    let categoryMapping: any = {
        "5": { label: "English-translated" },
        "6": { label: "Raw" },
        "13": { label: "Non-English-Translated" }
    };
    let result = new SearchResult();
    result.category = categoryMapping[pantsuResult.sub_category];
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
            break;
        case Sources.HorribleSubs:
            result.episodeData = {
                episodeNumber: Number((result.name.match(/[0-9]+(\.[0-9]+)?(?=\s\[[0-9]+p\])/g) || [])[0]),
                seriesName: (result.name.match(/(?<=\[HorribleSubs\]\s).+(?=\s-\s[0-9]+)/g) || [])[0],
                quality: Number((result.name.match(/(?<=\s-\s[0-9]+(\.[0-9]+)?\s\[)[0-9]+(?=p)/g) || [])[0])
            };
    }
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

export class EpisodeData {
    episodeNumber!: number;
    seriesName!: string;
    quality!: number;
    episodeType?: string; // strings like "OVA" and "END"
}