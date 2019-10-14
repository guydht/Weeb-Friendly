import AnimeEntry from "./AnimeEntry";
import { EpisodeData } from "../utils/torrents";

export default class DownloadedItem {
    constructor(absolutePath: string, fileName: string, lastUpdated: Date, animeEntry = new AnimeEntry({})) {
        this.absolutePath = absolutePath;
        this.fileName = fileName;
        this.lastUpdated = lastUpdated;
        this.animeEntry = animeEntry;
        this.episodeData = {
            episodeNumber: Number((this.fileName.match(/(?<=Episode\s)[0-9]+/g) || [])[0]),
            seriesName: (this.fileName.match(/.+(?=\sEpisode\s)/g) || [])[0]
        }
    }
    absolutePath: string;
    fileName: string;
    lastUpdated: Date;
    animeEntry: AnimeEntry;
    episodeData: Omit<EpisodeData, 'quality'>
}