import { get, sync, ThumbnailManager } from "./AnimeStorage";
import { MALStatuses } from "./MalStatuses";
const fs = window.require("fs"),
	request = window.require("request");

export default class AnimeEntry {
	static SCORES = ["Appaling", "Horrible", "Very Bad", "Bad", "Average", "Fine", "Good", "Very Good", "Great", "Masterpiece"];
	constructor({
		synonyms = undefined,
		malId = undefined,
		score = undefined,
		malUrl = undefined,
		genres = undefined,
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
		_imageURL = undefined,
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
		_imageURL?: string,
		name?: string,
		_name?: string,
		sync?: boolean
	}) {
		this.score = score;
		this.malId = malId;
		this.malUrl = malUrl;
		this.genres = new Set(genres);
		this._synonyms = new Set(Array.from(synonyms || []).sort());
		this.totalEpisodes = totalEpisodes;
		this.startDate = startDate ? new Date(startDate) : startDate;
		this.endDate = endDate ? new Date(endDate) : endDate;
		this.userStartDate = userStartDate ? new Date(userStartDate) : userStartDate;
		this.userEndDate = userEndDate ? new Date(userEndDate) : userEndDate;
		this.myWatchedEpisodes = myWatchedEpisodes;
		this.myMalStatus = myMalStatus;
		this.myMalRating = myMalRating;
		this.myRewatchAmount = myRewatchAmount;
		this.imageURL = imageURL || _imageURL;
		this.name = name || _name;
		if (sync && (malId || name))
			this.syncGet();
	}
	_synonyms: Set<string>;
	get synonyms() {
		if (this.name)
			this._synonyms.add(this.name);
		return this._synonyms;
	}
	set synonyms(value: Set<string>) {
		this._synonyms = value;
	}
	malId?: number;
	score?: number;
	malUrl?: string;
	genres?: Set<String>;
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
			writeStream.on("finish", () => {
				ThumbnailManager.SAVED_THUMBNAILS.add(this.malId!);
			});
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
			writeStream.on("finish", () => {
				ThumbnailManager.SAVED_THUMBNAILS.add(this.malId!);
			});
		}
	}
	name?: string;
	syncPut(forceSynonyms: boolean = false) {
		sync(this, forceSynonyms);
		return this;
	}
	readyForJSON() {
		let copy: any = { ...this };
		copy.synonyms = [...this.synonyms];
		copy.genres = [...(this.genres || [])];
		return copy;
	}
	syncGet() {
		let inStorage = get(this);
		if (inStorage)
			Object.entries(inStorage).forEach(([key, value]) => {
				if (value !== this[key as keyof AnimeEntry])
					(this as any)[key] = value;
			});
		return this;
	}

	seenEpisode(episodeNumber: number) {
		this.syncGet();
		return this.myWatchedEpisodes !== undefined && this.myWatchedEpisodes >= episodeNumber;
	}

	isUserInterested() {
		return this.myMalStatus !== undefined && (
			this.myMalStatus === MALStatuses.Completed ||
			this.myMalStatus === MALStatuses.Watching ||
			this.myMalStatus === MALStatuses["Plan To Watch"]
		);
	}

	clearUserData() {
		delete this.myMalRating;
		delete this.myMalStatus;
		delete this.myRewatchAmount;
		delete this.myWatchedEpisodes;
	}
}