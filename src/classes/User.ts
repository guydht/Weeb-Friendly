import AnimeEntry from "./AnimeEntry";
export class AnimeList {
    constructor({ _watching = {}, _completed = {}, _dropped = {}, _all = {}, _plantowatch = {}, _onhold = {} }) {
        this._all = _all;
        this._watching = _watching;
        this._completed = _completed;
        this._dropped = _dropped;
        this._onhold = _onhold;
        this._plantowatch = _plantowatch;
    }
    private _watching: Record<string | number, AnimeEntry>;
    private _completed: Record<string | number, AnimeEntry>;
    private _dropped: Record<string | number, AnimeEntry>;
    private _all: Record<string | number, AnimeEntry> = {};
    private _plantowatch: Record<string | number, AnimeEntry>;
    private _onhold: Record<string | number, AnimeEntry>;

    set all(value: Record<string | number, AnimeEntry>) {
        let allKeys = Object.entries(value);
        allKeys.forEach(([key, value]) => {
            this._all[key] = value;
            switch ((value as AnimeEntry).myMalStatus) {
                case "Watching":
                    (this._watching as any)[key] = value;
                    break
                case "Completed":
                    (this._completed as any)[key] = value;
                    break;
                case "Dropped":
                    (this._dropped as any)[key] = value;
                    break;
                case "On Hold":
                    (this._onhold as any)[key] = value;
                    break;
                case "Plan To Watch":
                    (this._plantowatch as any)[key] = value;
            }
        })
    }
    get all(): Record<string | number, AnimeEntry> {
        return this._all;
    }
    set watching(value: Record<string | number, AnimeEntry>) {
        this._watching = value;
        Object.values(value).forEach(val => this.all[val.malId!.toString()] = val);
    }
    get watching(): Record<string | number, AnimeEntry> {
        return this._watching;
    }

    set completed(value: Record<string | number, AnimeEntry>) {
        this._completed = value;
        Object.values(value).forEach(val => this.all[val.malId!.toString()] = val);
    }
    get completed(): Record<string | number, AnimeEntry> {
        return this._completed;
    }

    set dropped(value: Record<string | number, AnimeEntry>) {
        this._dropped = value;
        Object.values(value).forEach(val => this.all[val.malId!.toString()] = val);
    }
    get dropped(): Record<string | number, AnimeEntry> {
        return this._dropped;
    }

    set plantowatch(value: Record<string | number, AnimeEntry>) {
        this._plantowatch = value;
        Object.values(value).forEach(val => this.all[val.malId!.toString()] = val);
    }
    get plantowatch(): Record<string | number, AnimeEntry> {
        return this._plantowatch;
    }

    set onhold(value: Record<string | number, AnimeEntry>) {
        this._onhold = value;
        Object.values(value).forEach(val => this.all[val.malId!.toString()] = val);
    }
    get onhold(): Record<string | number, AnimeEntry> {
        return this._onhold;
    }
    set ptw(value: Record<string | number, AnimeEntry>) {
        this._plantowatch = value;
        Object.values(value).forEach(val => this.all[val.malId!.toString()] = val);
    }
    get ptw(): Record<string | number, AnimeEntry> {
        return this._plantowatch;
    }
    static fromJson(data: { _watching: any, _completed: any, _dropped: any, _all: any, _plantowatch: any, _onhold: any }): AnimeList {
        for (let listType in data)
            if (typeof (data as any)[listType] === "object")
                for (let key in (data as any)[listType])
                    (data as any)[listType][key] = new AnimeEntry((data as any)[listType][key]);
        return new AnimeList(data);
    }
}
export class User {
    constructor(username: string = "", password: string = "", animeList: AnimeList = new AnimeList({}), isLoggedIn: boolean = false, last_time_updated = new Date()) {
        this.username = username;
        this.password = password;
        this.isLoggedIn = isLoggedIn;
        this.last_time_updated = last_time_updated;
        this.animeList = animeList;
    }
    username: string;
    password: string;
    animeList: AnimeList;
    isLoggedIn = false;
    last_time_updated: Date;
    static fromJson({ username = '', password = '', animeList = {}, isLoggedIn = false, last_time_updated = new Date() }) {
        let typedAnimeList = AnimeList.fromJson(animeList as any || {});
        return new User(username, password, typedAnimeList, isLoggedIn, last_time_updated);
    }
    readyForJson() {
        function JSONReplacer(key: any, value: any) {
            if (typeof value === "object" && value[Symbol.iterator])
                return [...value];
            return value;
        }
        return JSON.parse(JSON.stringify(this, JSONReplacer))
    }
}
export default User;