export default class AnimeEntry {
    synonyms: Set<string> = new Set();
    malId?: string;
    malUrl?: string;
    genres?: Set<String>;
    totalEpisodes?: number;
    myWatchedEpisodes?: number;
    myMalStatus?: "Completed" | "Plan to watch" | "Dropped" | "Watching" | "On Hold";
    myMalRating?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    myRewatchAmount?: number;
    imageURL?: string;
    private _name?: string;
    set name(val: string | undefined) {
        if(val)
            this.synonyms.add(val);
        this._name = val;
    }
    get name(): string | undefined {
        return this._name;
    }
}