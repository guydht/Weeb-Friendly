import AnimeEntry from "./AnimeEntry";
import { MALStatuses } from "./MalStatuses";
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

	set all(_all: Record<number, AnimeEntry>) {
		Object.values(_all).forEach(anime => {
			this.loadAnime(anime);
		});
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
	static fromJson({ _all: data = [], fetchedDate }: { _all: number[], fetchedDate: Date }): AnimeList {
		let list = new AnimeList({});
		let obj: Record<number, AnimeEntry> = {};
		data.forEach(id => {
			obj[Number(id)] = new AnimeEntry({ malId: Number(id) });
		});
		list.all = obj;
		list.fetchedDate = fetchedDate;
		return list;
	}
	readyForJson() {
		return { _all: Object.keys(this.all), fetchedDate: this.fetchedDate };
	}
	loadAnime(anime: AnimeEntry) {
		this._all[anime.malId!] = anime;
		delete this._watching[anime.malId!];
		delete this._completed[anime.malId!];
		delete this._dropped[anime.malId!];
		delete this._onhold[anime.malId!];
		delete this._plantowatch[anime.malId!];
		switch (anime.myMalStatus!) {
			case MALStatuses.Watching:
				this._watching[anime.malId!] = anime;
				break
			case MALStatuses.Completed:
				this._completed[anime.malId!] = anime;
				break;
			case MALStatuses.Dropped:
				this._dropped[anime.malId!] = anime;
				break;
			case MALStatuses["On-Hold"]:
				this._onhold[anime.malId!] = anime;
				break;
			case MALStatuses["Plan To Watch"]:
				this._plantowatch[anime.malId!] = anime;
				break;
			default:
				delete this._all[anime.malId!];
		}
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