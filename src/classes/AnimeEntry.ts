export default class AnimeEntry {
    constructor({
        synonyms = new Set<string>(),
        malId = undefined,
        score = undefined,
        malUrl = undefined,
        genres = undefined,
        synopsis = undefined,
        totalEpisodes = undefined,
        startDate = undefined,
        userStartDate = undefined,
        myWatchedEpisodes = undefined,
        myMalStatus = undefined,
        myMalRating = undefined,
        myRewatchAmount = undefined,
        imageURL = undefined,
        _name = undefined

    }) {
        this.score = score;
        this.malId = malId;
        this.malUrl = malUrl;
        this.genres = genres;
        this.synonyms = synonyms;
        this.synopsis = synopsis;
        this.totalEpisodes = totalEpisodes;
        this.startDate = startDate;
        this.userStartDate = userStartDate;
        this.myWatchedEpisodes = myWatchedEpisodes;
        this.myMalStatus = myMalStatus;
        this.myMalRating = myMalRating;
        this.myRewatchAmount = myRewatchAmount;
        this.imageURL = imageURL;
        this._name = _name;
    }
    synonyms: Set<string> = new Set();
    malId?: number;
    score?: number;
    malUrl?: string;
    genres?: Set<String>;
    synopsis?: string;
    totalEpisodes?: number;
    startDate?: Date;
    userStartDate?: Date;
    myWatchedEpisodes?: number;
    myMalStatus?: "Completed" | "Plan to watch" | "Dropped" | "Watching" | "On Hold";
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
}