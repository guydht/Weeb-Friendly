//@ts-ignore
import { pantsu, si } from "nyaapi";
import AnimeEntry from "../classes/AnimeEntry";
import Consts from "../classes/Consts";
import DownloadedItem from "../classes/DownloadedItem";
import TorrentManager from "../classes/TorrentManager";

const ENGLISH_TRANSLATED_ANIME_CATEGORY = "1_2",
	DEFAULT_MAX_RESULTS = 300;

export enum Sources {
	HorribleSubs,
	"Erai-raws",
	All,
	Any
}

export interface SearchResultExtraInfo {
	description: string;
	size: string;
	fileList: string[];
	comments: {
		text: string,
		author: string,
		authorImage: string,
		date: Date
	}[];
}

const siPantsuMapping = {
	[Sources.HorribleSubs]: {
		si: "HorribleSubs",
		pantsu: "12035"
	},
	[Sources["Erai-raws"]]: {
		pantsu: "11974",
		si: "Erai-raws"
	}
}

export default class TorrentUtils {
	static async search(anime: AnimeEntry, fetchAll: boolean = false, source: Sources = Sources.Any): Promise<SearchResult[]> {
		switch (source) {
			//     case Sources.Any:
			//         for (let source of Consts.SOURCE_PREFERENCE) {
			//             let results = await this.searchSource(anime, fetchAll, source);
			//             if (results.length)
			//                 return results;
			//         }
			//         break;
			case Sources.All:
				let results: SearchResult[] = [];
				for (let source of Consts.SOURCE_PREFERENCE) {
					results.concat(await this.searchSource(anime, fetchAll, source));
				}
				return results;
			default:
				return await this.searchSource(anime, fetchAll, source);
		}
	}
	private static async searchSource(anime: AnimeEntry, fetchAll: boolean = false, source: Sources): Promise<SearchResult[]> {
		for (let name of anime.synonyms) {
			try {
				let apiSource = (siPantsuMapping as any)[source] || {},
					results = [];
				if (apiSource.si) {
					let sourceValue = apiSource.si;
					if (fetchAll)
						try {
							results.push(...(await si.searchAllByUser(sourceValue, name, { category: ENGLISH_TRANSLATED_ANIME_CATEGORY })).map(siResultToSearchResult.bind(this, source)));
						} catch (e) { console.error(e); }
					else
						try {
							results.push(...(await si.searchByUser(sourceValue, name, DEFAULT_MAX_RESULTS, { category: ENGLISH_TRANSLATED_ANIME_CATEGORY })).map(siResultToSearchResult.bind(this, source)));
						} catch (e) { console.error(e); }
				}
				if (results.length === 0 && apiSource.pantsu) {
					let sourceValue = apiSource.pantsu;
					if (fetchAll)
						try {
							results.push(...(await pantsu.searchAll({
								term: name,
								userID: sourceValue,
								c: ENGLISH_TRANSLATED_ANIME_CATEGORY
							})).map(pantsuResultToSearchResult.bind(this, source)));
						} catch (e) { console.error(e); }
					else
						try {
							results.push(...(await pantsu.search({
								term: name,
								userID: sourceValue,
								c: ENGLISH_TRANSLATED_ANIME_CATEGORY
							})).map(pantsuResultToSearchResult.bind(this, source)));
						} catch (e) { console.error(e); }
				}
				if (results.length === 0 && Object.keys(apiSource).length === 0) {
					if (fetchAll)
						try {
							results.push(...(await si.searchAll(name, { category: ENGLISH_TRANSLATED_ANIME_CATEGORY }).map(siResultToSearchResult.bind(this, source))));
						} catch (e) { console.error(e); }
					else
						try {
							results.push(...(await si.search(name, DEFAULT_MAX_RESULTS, {
								category: ENGLISH_TRANSLATED_ANIME_CATEGORY
							})).map(siResultToSearchResult.bind(this, source)));
						} catch (e) { console.error(e); }
				}
				if (results.length === 0 && Object.keys(apiSource).length === 0) {
					if (fetchAll)
						try {
							results.push(...(await pantsu.searchAll({
								term: name,
								c: ENGLISH_TRANSLATED_ANIME_CATEGORY
							})).map(pantsuResultToSearchResult.bind(this, source)));
						} catch (e) { console.error(e); }
					else
						try {
							results.push(...(await pantsu.search({
								term: name,
								c: ENGLISH_TRANSLATED_ANIME_CATEGORY
							})).map(pantsuResultToSearchResult.bind(this, source)));
						} catch (e) { console.error(e); }
				}
				if (results.length)
					return results;
			}
			catch (e) {
				console.error(e);
			}
		}
		return [];
	}

	static async torrentExtraInfo(torrentPageUrl: string): Promise<SearchResultExtraInfo> {
		const response = await fetch(torrentPageUrl),
			responseHTML = new DOMParser().parseFromString(await response.text(), 'text/html');
		return {
			description: responseHTML.querySelector("#torrent-description")?.textContent ?? "",
			size: [...responseHTML.querySelectorAll(".panel .row .col-md-5")].find(element => element.previousElementSibling?.textContent === "File size:")?.textContent ?? "",
			fileList: [...responseHTML.querySelectorAll(".torrent-file-list .fa.fa-file")].map(ele => ele.parentNode?.textContent ?? ""),
			comments: [...responseHTML.querySelectorAll(".comment-panel")].map(element => ({
				text: element.querySelector(".comment-content")?.textContent ?? "",
				author: element.querySelector("a[title=\"User\"]")?.textContent ?? "",
				authorImage: element.querySelector("img")?.src ?? "",
				date: new Date(element.querySelector("[data-timestamp]")?.textContent ?? "")
			}))
		};
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
			try {
				results.push(...(await si.searchByUserAndByPage(apiSource.si, '', page)).map(siResultToSearchResult.bind(this, source)));
			} catch (e) { console.error(e); }
		if (apiSource.pantsu)
			try {
				results.push(...(await pantsu.search({
					term: '*',
					userId: apiSource.pantsu,
					page,
					c: "3_5"
				})).map(pantsuResultToSearchResult.bind(this, source)));
			} catch (e) { console.error(e); }
		return results;
	}
}
function siResultToSearchResult(source: Sources, siResult: any): SearchResult {
	return pantsuResultToSearchResult(source, siResult); //They changed it in the new update to look just like pantsu result!
}
function pantsuResultToSearchResult(source: Sources, pantsuResult: any) {
	let categoryMapping: any = {
		"1_2": { label: "English-translated" },
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
	result.episodeData = episodeDataFromFilename(result.name, source)!;
	result.animeEntry = new AnimeEntry({
		name: result.episodeData.seriesName
	});
	return result;
}
(window as any).torrentUtils = TorrentUtils;

export function episodeDataFromFilename(name: string, source?: Sources): EpisodeData | undefined {
	let episodeData;
	source = source ?? findSourceFromFilename(name);
	switch (source) {
		case Sources.HorribleSubs:
			episodeData = {
				episodeNumber: Number((name.match(/[0-9]+(\.[0-9]+)?(?=\s\[[0-9]+p\])/g) || [])[0]),
				seriesName: (name.match(/(?<=\[HorribleSubs\]\s).+(?=\s-\s[0-9]+)/g) || [])[0],
				episodeString: ((name.match(/(?<=\s-\s(\([a-zA-Z0-9\s]*\))?)[a-zA-Z0-9\s]+/g) || [])[0] || "").trim(),
				quality: Number((name.match(/[0-9]+(?=p)/g) || [])[0])
			};
			break;
		case Sources["Erai-raws"]:
			episodeData = {
				episodeNumber: Number((name.match(/(?<=\s-\s)[0-9]+(\.[0-9]+)?(?=\s)/g) || [])[0]),
				seriesName: (name.match(/(?<=\[Erai-raws\]\s).+(?=\s-\s[0-9]+)/g) || [])[0],
				episodeString: ((name.match(/(?<=\s-\s(\([a-zA-Z0-9\s]*\))?)[a-zA-Z0-9\s]+/g) || [])[0] || "").trim(),
				quality: Number((name.match(/[0-9]+(?=p)/g) || [])[0]),
				episodeType: (name.match(/(?<=\[[0-9]+p\]\[])[^[]]+(?=\])+/g) || name.match(/(?<=\s-\s[0-9]+(\.[0-9]+)?\s)[a-zA-Z]+/g) || [])[0]
			};
			break;
		case Sources.Any:
			episodeData = {
				episodeNumber: Number((name.match(/(?<=\s-\s)[0-9]+(\.[0-9]+)?(?=\s)/g) || [])[0]) ||
					Number((name.match(/(?<=(s|season)[0-9\s-]+(e|episode)\s?)[0-9]+/gi) || [])[0]),
				episodeString: ((name.match(/(?<=\s-\s(\([a-zA-Z0-9\s]*\))?)[a-zA-Z0-9\s]+/g) || [])[0] || "").trim(),
				seriesName: ((name.match(/(?<=((\[|\()[a-zA-Z0-9\s]*(\]|\)))?)[^[\])(]+(?=(\s-\s|\[|$))/g) || [])[0] || "").trim(),
				quality: Number((name.match(/[0-9]+(?=p)/g) || [])[0])
			}
	}
	return episodeData;
}

export function findSourceFromFilename(fileName: string): Sources {
	const lowerCased = fileName.toLowerCase();
	if (lowerCased.startsWith("[horriblesubs]"))
		return Sources.HorribleSubs;
	if (lowerCased.startsWith("[erai-raws]"))
		return Sources["Erai-raws"];
	return Sources.Any;
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
	get downloadStatus(): DownloadStatus {
		const compareEpisodeData = (downloadedItem: Pick<DownloadedItem, "episodeData">) => {
			return downloadedItem.episodeData.seriesName === this.episodeData.seriesName &&
				downloadedItem.episodeData.episodeNumber === this.episodeData.episodeNumber;
		},
			compareAnimeEntry = (downloadedItem: DownloadedItem) => {
				return this.animeEntry.malId === downloadedItem.animeEntry.malId &&
					downloadedItem.episodeData.episodeNumber === this.episodeData.episodeNumber;
			},
			compareMaybeEpisodeData = (episodeData: EpisodeData | undefined) => {
				return episodeData && compareEpisodeData({ episodeData });
			},
			isDownloaded = Consts.DOWNLOADED_ITEMS.some(compareAnimeEntry) || Consts.DOWNLOADED_ITEMS.some(compareEpisodeData),
			isDownloading = TorrentManager.getAll().some(torrent => {
				return compareMaybeEpisodeData(episodeDataFromFilename(torrent.name)) ||
					torrent.files?.some(file => compareMaybeEpisodeData(episodeDataFromFilename(file.name)));
			});
		return isDownloaded ? DownloadStatus.downloaded : isDownloading ? DownloadStatus.currentlyDownloading : DownloadStatus.notDownloaded;
	}
}

export class EpisodeData {
	episodeNumber!: number;
	seriesName!: string;
	episodeString!: string;
	quality!: number;
	episodeType?: string; // strings like "OVA" and "END"
}