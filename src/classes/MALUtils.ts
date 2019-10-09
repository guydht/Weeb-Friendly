import mal from "jikants";
import { AnimeById } from "jikants/dist/src/interfaces/anime/ById";
import { Reviews } from "jikants/dist/src/interfaces/anime/Reviews";
import { Forum } from "jikants/dist/src/interfaces/manga/Forum";
import { Seasons } from "jikants/dist/src/interfaces/season/Season";
import { AnimeListTypes } from "jikants/dist/src/interfaces/user/AnimeList";
import Consts from "../classes/Consts";
import AnimeEntry from "./AnimeEntry";
import AnimeList from "./AnimeList";
import * as AnimeStorage from "./AnimeStorage";
import DownloadedItem from "./DownloadedItem";
import { MALStatuses } from "./MALStatuses";
import User from "./User";
import { getCurrentSeason, stringCompare } from "./utils";

type HasMalId = {
    malId: Number
}

export default class MALUtils {
    static MAX_ANIMES_PER_PAGE = 300;
    static MINIMUM_ANIMENAME_SIMILARITY = 0.7;

    static async searchAnime(searchString: string): Promise<AnimeEntry[]> {
        let data = (await mal.Search.search(searchString, "anime"));
        if (!data) return [];
        let parsedData = data.results.sort((a, b) => {
            return stringCompare(searchString.toLowerCase(), a.title.toLowerCase()) -
                stringCompare(searchString.toLowerCase(), b.title.toLowerCase());
        }).map(result => {
            let fromData = new AnimeEntry({});
            fromData.malId = result.mal_id;
            fromData.totalEpisodes = result.episodes;
            fromData.imageURL = result.image_url;
            fromData.myMalRating = result.rated as any;
            fromData.score = result.score;
            fromData.startDate = new Date(result.start_date);
            fromData.endDate = new Date(result.end_date as any);
            fromData.synopsis = result.synopsis;
            fromData.name = result.title;
            fromData.malUrl = result.url;
            return fromData.sync();
        });
        return parsedData;
    }
    static async topAnime(page = 1): Promise<AnimeEntry[]> {
        let data = (await mal.Top.items("anime", page));
        if (!data) return [];
        return data.top.map(ele => {
            let fromData = new AnimeEntry({});
            fromData.malUrl = ele.url;
            fromData.endDate = new Date(ele.end_date as any);
            fromData.startDate = new Date(ele.start_date as any);
            fromData.score = ele.score;
            fromData.imageURL = ele.image_url;
            fromData.malId = ele.mal_id;
            fromData.name = ele.title;
            return fromData.sync();
        });
    }
    static async getCurrentSeasonalAnime() {
        return this.seasonalAnime(new Date().getFullYear(), getCurrentSeason() as Seasons);
    }
    static async seasonalAnime(year: number, season: Seasons): Promise<AnimeEntry[]> {
        let data = (await mal.Season.anime(year, season));
        if (!data) return [];
        return data.anime.map(result => {
            let fromData = new AnimeEntry({});
            fromData.malId = result.mal_id;
            fromData.totalEpisodes = result.episodes as any;
            fromData.startDate = new Date(result.airing_start as any);
            fromData.genres = result.genres as any;
            fromData.imageURL = result.image_url;
            fromData.score = result.score as any;
            fromData.synopsis = result.synopsis;
            fromData.name = result.title;
            fromData.malUrl = result.url;
            return fromData.sync();
        });
    }
    static async getUserAnimeList(user: User, listType: AnimeListTypes = "all", page = 1): Promise<AnimeList> {
        let data = (await mal.User.animeList(user.username, listType, page));
        if (!data) return user.animeList;
        user.animeList[listType] = data.anime.reduce((map: any, result) => {
            map[result.mal_id] = new AnimeEntry({
                malId: result.mal_id,
                totalEpisodes: result.total_episodes,
                startDate: new Date(result.start_date),
                endDate: new Date(result.end_date!),
                userStartDate: new Date(result.watch_start_date!),
                userEndDate: new Date(result.watch_end_date!),
                myMalRating: result.score as any,
                myMalStatus: MALStatuses[result.watching_status] as any,
                myWatchedEpisodes: result.watched_episodes,
                imageURL: result.image_url,
                malUrl: result.url,
                name: result.title,
            });
            return map;
        }, {});
        if (data.anime.length === this.MAX_ANIMES_PER_PAGE)
            await this.getUserAnimeList(user, listType, page + 1);
        user.animeList.fetchedDate = new Date();
        return user.animeList;
    }
    static async getAnimeInfo(anime: AnimeEntry & HasMalId): Promise<AnimeById | undefined> {
        let data = (await mal.Anime.byId(anime.malId));
        if (!data)
            return data;
        anime.score = data.score;
        anime.name = data.title;
        anime.startDate = data.aired.from;
        anime.endDate = data.aired.to;
        anime.synonyms = new Set([...anime.synonyms, data.title, data.title_english, data.title_japanese, ...data.title_synonyms]);
        anime.synonyms.delete(null as any);
        anime.synopsis = data.synopsis;
        anime.malUrl = data.url;
        anime.totalEpisodes = data.episodes;
        return data;
    }
    static UPDATE_ANIME_URL = "https://myanimelist.net/ownlist/anime/edit.json";
    static ADD_ANIME_URL = "https://myanimelist.net/ownlist/anime/add.json";
    static async updateAnime(anime: AnimeEntry & HasMalId, { episodes, status, score }: { episodes?: number, status?: MALStatuses, score?: number }): Promise<boolean> {
        let startDate = new Date(),
            body: any = {
                anime_id: anime.malId,
                status: status,
                score: score,
                num_watched_episodes: episodes,
                csrf_token: Consts.CSRF_TOKEN
            };
        if (episodes === 1)
            body['start_date'] = {
                month: startDate.getMonth(),
                day: startDate.getDate(),
                year: startDate.getFullYear()
            }
        let request = await fetch(this.UPDATE_ANIME_URL, {
            method: "POST",
            body: JSON.stringify(body)
        });
        if (request.ok) {
            anime.myWatchedEpisodes = episodes;
            (anime.myMalStatus as any) = status;
            (anime.myMalRating as any) = score;
            if (episodes === 1) anime.startDate = startDate;
            anime.sync();
        }
        return request.ok;
    }
    static async addAnime(anime: AnimeEntry & HasMalId) {
        let request = await fetch(this.ADD_ANIME_URL, {
            method: "POST",
            body: JSON.stringify({
                anime_id: anime.malId,
                status: MALStatuses["Plan To Watch"],
                score: 0,
                num_watched_episodes: 0,
                csrf_token: Consts.CSRF_TOKEN
            })
        });
        let ok = request.ok || (await request.json()).errors[0].message === "The anime is already in your list.";
        if (ok) {
            anime.myMalStatus = MALStatuses.Watching;
            anime.myWatchedEpisodes = 0;
            anime.sync();
            Consts.MAL_USER.animeList.watching[anime.malId!] = anime;
            Consts.setMALUser(Consts.MAL_USER);
        }
        return ok;
    }
    static async UpdateWatchedEpisode(downloadedItem: DownloadedItem): Promise<boolean> {
        let anime = downloadedItem.animeEntry,
            episode = downloadedItem.episodeData.episodeNumber,
            status = anime.totalEpisodes === episode ? MALStatuses.Completed : MALStatuses.Watching,
            ok: boolean = true;
        // if (!anime.myMalStatus)
            ok = await MALUtils.addAnime(anime as any)
        if (!ok) return ok;
        ok = await MALUtils.updateAnime(anime as any, { episodes: episode, status });
        return ok;
    }
    static async animeForum(anime: AnimeEntry & HasMalId): Promise<Forum | undefined> {
        let data = await mal.Anime.forum(anime.malId);
        return data;
    }
    static async animeReviews(anime: AnimeEntry & HasMalId): Promise<Reviews | undefined> {
        let data = await mal.Anime.reviews(anime.malId);
        return data;
    }
    static syncAnime = AnimeStorage.sync;
    static getAnime = AnimeStorage.get;
    static get storageSize() { return AnimeStorage.size(); };
}
