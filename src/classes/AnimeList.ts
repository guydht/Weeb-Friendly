import AnimeEntry from "./AnimeEntry";
import { MALStatuses } from "../utils/MAL";
export default class AnimeList {
    constructor({ _watching = {}, _completed = {}, _dropped = {}, _all = {}, _plantowatch = {}, _onhold = {} }) {
        this._all = _all;
        this._watching = _watching;
        this._completed = _completed;
        this._dropped = _dropped;
        this._onhold = _onhold;
        this._plantowatch = _plantowatch;
    }
    private _watching: Record<number, AnimeEntry>;
    private _completed: Record<number, AnimeEntry>;
    private _dropped: Record<number, AnimeEntry>;
    private _all: Record<number, AnimeEntry> = {};
    private _plantowatch: Record<number, AnimeEntry>;
    private _onhold: Record<number, AnimeEntry>;
    fetchedDate?: Date;

    set all(value: Record<number, AnimeEntry>) {
        let allKeys = Object.entries(value);
        Object.values(allKeys).forEach(([strKey, value]) => {
            let key = Number(strKey);
            value.sync();
            (this._all as any)[key] = value;
            switch ((MALStatuses as any)[(value as AnimeEntry).myMalStatus!]) {
                case MALStatuses.Watching:
                    (this._watching as any)[key] = value;
                    break
                case MALStatuses.Completed:
                    (this._completed as any)[key] = value;
                    break;
                case MALStatuses.Dropped:
                    (this._dropped as any)[key] = value;
                    break;
                case MALStatuses["On-Hold"]:
                    (this._onhold as any)[key] = value;
                    break;
                case MALStatuses["Plan To Watch"]:
                    (this._plantowatch as any)[key] = value;
            }
        })
    }
    get all(): Record<number, AnimeEntry> {
        return this._all;
    }
    set watching(value: Record<number, AnimeEntry>) {
        this._watching = value;
        Object.values(value).forEach(val => this._all[val.malId!] = val);
    }
    get watching(): Record<number, AnimeEntry> {
        return this._watching;
    }

    set completed(value: Record<number, AnimeEntry>) {
        this._completed = value;
        Object.values(value).forEach(val => this._all[val.malId!] = val);
    }
    get completed(): Record<number, AnimeEntry> {
        return this._completed;
    }

    set dropped(value: Record<number, AnimeEntry>) {
        this._dropped = value;
        Object.values(value).forEach(val => this._all[val.malId!] = val);
    }
    get dropped(): Record<number, AnimeEntry> {
        return this._dropped;
    }

    set plantowatch(value: Record<number, AnimeEntry>) {
        this._plantowatch = value;
        Object.values(value).forEach(val => this._all[val.malId!] = val);
    }
    get plantowatch(): Record<number, AnimeEntry> {
        return this._plantowatch;
    }

    set onhold(value: Record<number, AnimeEntry>) {
        this._onhold = value;
        Object.values(value).forEach(val => this._all[val.malId!] = val);
    }
    get onhold(): Record<number, AnimeEntry> {
        return this._onhold;
    }
    set ptw(value: Record<number, AnimeEntry>) {
        this._plantowatch = value;
        Object.values(value).forEach(val => this._all[val.malId!] = val);
    }
    get ptw(): Record<number, AnimeEntry> {
        return this._plantowatch;
    }
    static fromJson({ _all: data = [] }: { _all: number[] }): AnimeList {
        let list = new AnimeList({});
        let obj: Record<number, AnimeEntry> = {};
        data.forEach(id => {
            obj[Number(id)] = new AnimeEntry({ malId: Number(id) });
        })
        list.all = obj;
        return list;
    }
    readyForJson() {
        return { _all: Object.keys(this.all) };
    }
    loadAnime(anime: AnimeEntry) {
        this.all[anime.malId!] = anime;
        this.loadFromAll(this.all);
    }
    loadFromAll(all: Record<number, AnimeEntry>) {
        this._watching = {};
        this._completed = {};
        this._dropped = {};
        this._plantowatch = {};
        this._onhold = {};
        this.all = all;
    }
}