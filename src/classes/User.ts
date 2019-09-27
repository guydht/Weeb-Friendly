import AnimeEntry from "./AnimeEntry";
export class AnimeList {
    constructor({ _watching = [], _completed = [], _dropped = [], all = new Set(), _planToWatch = [], _onHold = [] }) {
        this._watching = _watching.map(e => new AnimeEntry(e));
        this._completed = _completed;
        this._dropped = _dropped;
    }
    private _watching: AnimeEntry[] = [];
    private _completed: AnimeEntry[] = [];
    private _dropped: AnimeEntry[] = [];
    all: Set<AnimeEntry> = new Set();
    private _planToWatch: AnimeEntry[] = [];
    private _onHold: AnimeEntry[] = [];

    set watching(value: AnimeEntry[]) {
        this._watching = value;
        value.forEach(a => this.all.add(a));
    }
    get watching(): AnimeEntry[] {
        return this._watching;
    }

    set completed(value: AnimeEntry[]) {
        this._completed = value;
        value.forEach(a => this.all.add(a));
    }
    get completed(): AnimeEntry[] {
        return this._completed;
    }

    set dropped(value: AnimeEntry[]) {
        this._dropped = value;
        value.forEach(a => this.all.add(a));
    }
    get dropped(): AnimeEntry[] {
        return this._dropped;
    }

    set planToWatch(value: AnimeEntry[]) {
        this._planToWatch = value;
        value.forEach(a => this.all.add(a));
    }
    get planToWatch(): AnimeEntry[] {
        return this._planToWatch;
    }

    set onHold(value: AnimeEntry[]) {
        this._onHold = value;
        value.forEach(a => this.all.add(a));
    }
    get onHold(): AnimeEntry[] {
        return this._onHold;
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
        let typedAnimeList = new AnimeList(animeList);
        return new User(username, password, typedAnimeList, isLoggedIn, last_time_updated);
    }
}
export default User;