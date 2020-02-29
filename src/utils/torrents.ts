//@ts-ignore
import { pantsu, si } from "nyaapi";
import AnimeEntry from "../classes/AnimeEntry";
import Consts from "../classes/Consts";
import DownloadedItem from "../classes/DownloadedItem";
import TorrentManager from "../classes/TorrentManager";

export enum Sources {
    HorribleSubs,
    Ohys,
    "Erai-raws",
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
    [Sources["Erai-raws"]]: {
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
            catch (e) {
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
    result.episodeData = episodeDataFromSource(source, result.name)!;
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
    result.episodeData = episodeDataFromSource(source, result.name)!;
    result.animeEntry = new AnimeEntry({
        name: result.episodeData.seriesName
    });
    return result;
}
(window as any).torrentUtils = TorrentUtils;

export function episodeDataFromSource(source: Sources, name: string): EpisodeData | undefined {
    let episodeData;
    switch (source) {
        case Sources.HorribleSubs:
            episodeData = {
                episodeNumber: Number((name.match(/[0-9]+(\.[0-9]+)?(?=\s\[[0-9]+p\])/g) || [])[0]),
                seriesName: (name.match(/(?<=\[HorribleSubs\]\s).+(?=\s-\s[0-9]+)/g) || [])[0],
                quality: Number((name.match(/(?<=\s-\s[0-9]+(\.[0-9]+)?\s\[)[0-9]+(?=p)/g) || [])[0])
            };
            break;
        case Sources.Ohys:
            episodeData = {
                episodeNumber: Number((name.match(/(?<=\s-\s)[0-9]+(\.[0-9]+)?(?=\s)/g) || [])[0]),
                seriesName: (name.match(/(?<=\[Ohys-Raws\]\s).+(?=\s-\s[0-9]+)/g) || [])[0],
                quality: Number((name.match(/(?<=\s[0-9]+x)[0-9]+(?=\sx264)/g) || [])[0]),
                episodeType: (name.match(/(?<=\s-\s[0-9]+(\.[0-9]+)?\s)[a-zA-Z]+/g) || [])[0]
            };
            break;
        case Sources["Erai-raws"]:
            episodeData = {
                episodeNumber: Number((name.match(/(?<=\s-\s)[0-9]+(\.[0-9]+)?(?=\s)/g) || [])[0]),
                seriesName: (name.match(/(?<=\[Erai-raws\]\s).+(?=\s-\s[0-9]+)/g) || [])[0],
                quality: Number((name.match(/[0-9]+(?=p)/g) || [])[0]),
                episodeType: (name.match(/(?<=\[[0-9]+p\]\[])[^[]]+(?=\])+/g) || name.match(/(?<=\s-\s[0-9]+(\.[0-9]+)?\s)[a-zA-Z]+/g) || [])[0]
            };
    }
    return episodeData;
}

export enum DownloadStatus {
    notDownloaded,
    currentlyDownloading,
    downloaded
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
    animeEntry!: AnimeEntry;
    seenThisEpisode() {
        return this.animeEntry && !isNaN(this.episodeData.episodeNumber) && this.animeEntry.seenEpisode(this.episodeData.episodeNumber);
    }
    downloadStatus(): DownloadStatus {
        const compareEpisodeData = (downloadedItem: DownloadedItem) => {
            return downloadedItem.episodeData.seriesName === this.episodeData.seriesName &&
                downloadedItem.episodeData.episodeNumber === this.episodeData.episodeNumber;
        },
            compareAnimeEntry = (downloadedItem: DownloadedItem) => {
                return this.animeEntry.malId === downloadedItem.animeEntry.malId &&
                    downloadedItem.episodeData.episodeNumber === this.episodeData.episodeNumber;
            },
            isDownloaded = Consts.DOWNLOADED_ITEMS.some(compareAnimeEntry) || Consts.DOWNLOADED_ITEMS.some(compareEpisodeData),
            isDownloading = TorrentManager.getAll().some(torrent => torrent.name === this.name || torrent.files?.some(torrentFile => torrentFile.name === this.name))
        return isDownloaded ? DownloadStatus.downloaded : isDownloading ? DownloadStatus.currentlyDownloading : DownloadStatus.notDownloaded;
    }
}

export class EpisodeData {
    episodeNumber!: number;
    seriesName!: string;
    quality!: number;
    episodeType?: string; // strings like "OVA" and "END"
}