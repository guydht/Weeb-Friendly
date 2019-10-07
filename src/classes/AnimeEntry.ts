import { sync } from "./AnimeStorage";
import { MALStatuses } from "./MALStatuses";

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
        this.synonyms = new Set(synonyms);
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
    imageURL?: string;
    private _name?: string;
    set name(val: string | undefined) {
        if (val)
            this.synonyms.add(val);
        this._name = val;
    }
    get name(): string | undefined {
        return this._name;
    }
    sync() {
        Object.entries(sync(this)).forEach(([key, value]) => {
            if (value)
                (this as any)[key] = value;
        });
        return this;
    }
    readyForJSON() {
        function JSONReplacer(key: any, value: any) {
            if (value && typeof value === "object" && value[Symbol.iterator])
                return [...value];
            return value;
        }
        let copy: any = { ...this };
        copy.synonyms = [...this.synonyms];
        copy.genres = [...(this.genres || [])];
        return copy;
    }
}