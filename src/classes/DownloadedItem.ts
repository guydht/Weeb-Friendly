import { EpisodeData, episodeDataFromSource, Sources } from "../utils/torrents";
import AnimeEntry from "./AnimeEntry";

export default class DownloadedItem {
    constructor(absolutePath: string, fileName: string, lastUpdated: Date, animeEntry?: AnimeEntry, episodeData?: Omit<EpisodeData, 'quality'>) {
        this.absolutePath = absolutePath;
        this.fileName = fileName;
        this.lastUpdated = lastUpdated;
        if (!episodeData) {
            const downloadSource: Sources = Sources[Object.keys(Sources).find(source => isNaN(source as any) && fileName.includes(source)) || Sources[Sources.Any] as any] as any;
            this.episodeData = episodeDataFromSource(downloadSource, fileName) || {} as any;
        }
        else
            this.episodeData = episodeData;
        this.animeEntry = animeEntry || new AnimeEntry({ name: this.episodeData.seriesName });
        if (!isNaN(this.episodeData.episodeNumber) && this.episodeData.seriesName)
            this.episodeName = `${this.episodeData.seriesName} Episode ${this.episodeData.episodeNumber}`;
        else
            this.episodeName = this.fileName;
    }
    absolutePath: string;
    fileName: string;
    lastUpdated: Date;
    animeEntry: AnimeEntry;
    episodeData: Omit<EpisodeData, 'quality'>;
    episodeName: string;
    seenThisEpisode() {
        return !isNaN(this.episodeData.episodeNumber) && this.animeEntry.seenEpisode(this.episodeData.episodeNumber);
    }
    startPlaying() {
        (window as any).setAppState({
            showVideo: true,
            videoItem: this
        });
    }
}