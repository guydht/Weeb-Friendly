import AnimeEntry from "./AnimeEntry";

export default class DownloadedItem {
    constructor(absolutePath: string, fileName: string, lastUpdated: Date, animeEntry = new AnimeEntry({})) {
        this.absolutePath = absolutePath;
        this.fileName = fileName;
        this.lastUpdated = lastUpdated;
        this.animeEntry = animeEntry;
    }
    absolutePath: string;
    fileName: string;
    lastUpdated: Date;
    animeEntry?: AnimeEntry;
    createAnimeEntry() {
        this.animeEntry = new AnimeEntry({});
        this.animeEntry.name = this.fileName.substring(0, this.fileName.search(/episode .+/i));
        this.animeEntry.sync();
        return this.animeEntry;
    }
}