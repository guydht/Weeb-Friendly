import { EpisodeData } from "../utils/torrents";
import AnimeEntry from "./AnimeEntry";

export default class DownloadedItem {
    constructor(absolutePath: string, fileName: string, lastUpdated: Date, animeEntry = new AnimeEntry({})) {
        this.absolutePath = absolutePath;
        this.fileName = fileName;
        this.lastUpdated = lastUpdated;
        this.animeEntry = animeEntry;
        this.episodeData = {
            episodeNumber: Number((this.fileName.match(/(?<=Episode\s)[0-9]+(\.[0-9]+)?/g) || [])[0]),
            seriesName: (this.fileName.match(/.+(?=\sEpisode\s)/g) || [])[0]
        }
    }
    absolutePath: string;
    fileName: string;
    lastUpdated: Date;
    animeEntry: AnimeEntry;
    episodeData: Omit<EpisodeData, 'quality'>;
    seenThisEpisode() {
        return !isNaN(this.episodeData.episodeNumber) && this.animeEntry.seenEpisode(this.episodeData.episodeNumber);
    }
}