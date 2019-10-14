import { MALStatuses } from "../utils/MAL";
import { sync, ThumbnailManager } from "./AnimeStorage";

const fs = window.require("fs"),
    path = window.require("path"),
    request = window.require("request");

export default class AnimeEntry {
    static SCORES = ["Appaling", "Horrible", "Very Bad", "Bad", "Average", "Fine", "Good", "Very Good", "Great", "Masterpiece"];
    constructor({
        synonyms = undefined,
        malId = undefined,
        score = undefined,
        malUrl = undefined,
        genres = undefined,
        synopsis = undefined,
        totalEpisodes = undefined,
        startDate = undefined,
        endDate = undefined,
        userStartDate = undefined,
        userEndDate = undefined,
        myWatchedEpisodes = undefined,
        myMalStatus = undefined,
        myMalRating = undefined,
        myRewatchAmount = undefined,
        imageURL = undefined,
        name = undefined,
        _name = undefined,
        sync = true
    }: {
        synonyms?: Set<string>,
        malId?: number,
        score?: number,
        malUrl?: string,
        genres?: Set<string>,
        synopsis?: string,
        totalEpisodes?: number,
        startDate?: Date,
        endDate?: Date,
        userStartDate?: Date,
        userEndDate?: Date,
        myWatchedEpisodes?: number,
        myMalStatus?: MALStatuses,
        myMalRating?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        myRewatchAmount?: number,
        imageURL?: string,
        name?: string,
        _name?: string,
        sync?: boolean
    }) {
        this.score = score;
        this.malId = malId;
        this.malUrl = malUrl;
        this.genres = new Set(genres);
        this.synonyms = new Set(Array.from(synonyms || []).sort());
        this.synopsis = synopsis;
        this.totalEpisodes = totalEpisodes;
        this.startDate = new Date(startDate!);
        this.endDate = new Date(endDate!);
        this.userStartDate = new Date(userStartDate!);
        this.userEndDate = new Date(userEndDate!);
        this.myWatchedEpisodes = myWatchedEpisodes;
        this.myMalStatus = myMalStatus;
        this.myMalRating = myMalRating;
        this.myRewatchAmount = myRewatchAmount;
        this.imageURL = imageURL;
        this.name = name || _name;
        if (sync && (malId || name))
            this.sync();
    }
    synonyms: Set<string>;
    malId?: number;
    score?: number;
    malUrl?: string;
    genres?: Set<String>;
    synopsis?: string;
    totalEpisodes?: number;
    startDate?: Date;
    endDate?: Date;
    userStartDate?: Date;
    userEndDate?: Date;
    myWatchedEpisodes?: number;
    myMalStatus?: MALStatuses;
    myMalRating?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    myRewatchAmount?: number;
    private _imageURL?: string;
    get imageURL() {
        if (ThumbnailManager.SAVED_THUMBNAILS_STATE && this.malId && !ThumbnailManager.SAVED_THUMBNAILS.has(this.malId) && this._imageURL) {
            let imageRequest = request(this._imageURL),
                writeStream = fs.createWriteStream(ThumbnailManager.SAVED_THUMBNAILS_PATH + this.malId);
            imageRequest.pipe(writeStream);
            ThumbnailManager.SAVED_THUMBNAILS.add(this.malId);
            ThumbnailManager.setThumbnailStorage();
        }
        return ThumbnailManager.SAVED_THUMBNAILS_STATE && this.malId && ThumbnailManager.SAVED_THUMBNAILS.has(this.malId) ?
            "file://" + ThumbnailManager.SAVED_THUMBNAILS_PATH + this.malId : this._imageURL;
    }
    set imageURL(value) {
        this._imageURL = value;
        if (ThumbnailManager.SAVED_THUMBNAILS_STATE && this.malId && !ThumbnailManager.SAVED_THUMBNAILS.has(this.malId) && this._imageURL) {
            let imageRequest = request(this._imageURL),
                writeStream = fs.createWriteStream(ThumbnailManager.SAVED_THUMBNAILS_PATH + this.malId);
            imageRequest.pipe(writeStream);
            ThumbnailManager.SAVED_THUMBNAILS.add(this.malId);
            ThumbnailManager.setThumbnailStorage();
        }
    }
    private _name?: string;
    set name(val: string | undefined) {
        if (val)
            this.synonyms.add(val);
        this._name = val;
    }
    get name(): string | undefined {
        return this._name;
    }
    sync(forceSynonyms: boolean = false) {
        Object.entries(sync(this, forceSynonyms)).forEach(([key, value]) => {
            if (value)
                (this as any)[key] = value;
        });
        return this;
    }
    readyForJSON() {
        let copy: any = { ...this };
        copy.synonyms = [...this.synonyms];
        copy.genres = [...(this.genres || [])];
        return copy;
    }
}