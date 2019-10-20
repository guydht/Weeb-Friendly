import { AnimeById } from "jikants/dist/src/interfaces/anime/ById";
import { Forum } from "jikants/dist/src/interfaces/anime/Forum";
import { Reviews } from "jikants/dist/src/interfaces/anime/Reviews";
import { Seasons } from "jikants/dist/src/interfaces/season/Season";
import { AnimeListTypes } from "jikants/dist/src/interfaces/user/AnimeList";
import AnimeEntry from "../classes/AnimeEntry";
import AnimeList from "../classes/AnimeList";
import Consts from "../classes/Consts";
import DownloadedItem from "../classes/DownloadedItem";
import User from "../classes/User";
import { getCurrentSeason, parseStupidAmericanDateString } from "./general";

let mal = window.require("jikan-node");
mal = new mal();

type HasMalId = {
    malId: Number
}
export enum MALStatuses {
    Watching = 1,
    Completed = 2,
    "On-Hold" = 3,
    Dropped = 4,
    "Plan To Watch" = 6
};

export default class MALUtils {
    static MAX_ANIMES_PER_PAGE = 300;

    static async searchAnime(anime: AnimeEntry, searchString: string = ""): Promise<AnimeEntry[]> {
        searchString = searchString || anime.name!;
        let data = (await mal.search("anime", searchString));
        if (!data) return [];
        let parsedData = data.results.map((result: any) => {
            let fromData = new AnimeEntry({});
            fromData.malId = result.mal_id;
            fromData.totalEpisodes = result.episodes;
            fromData.imageURL = result.image_url;
            fromData.myMalRating = result.rated as any;
            fromData.score = result.score;
            fromData.startDate = parseStupidAmericanDateString(result.start_date);
            fromData.endDate = parseStupidAmericanDateString(result.end_date);
            fromData.synopsis = result.synopsis;
            fromData.name = result.title;
            fromData.malUrl = result.url;
            return fromData.sync();
        });
        return parsedData;
    }
    static async topAnime(page = 1): Promise<AnimeEntry[]> {
        let data = (await mal.findTop("anime", page));
        if (!data) return [];
        return data.top.map((ele: any) => {
            let fromData = new AnimeEntry({});
            fromData.malUrl = ele.url;
            fromData.endDate = parseStupidAmericanDateString(ele.end_date);
            fromData.startDate = parseStupidAmericanDateString(ele.start_date);
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
        let data = (await mal.findSeason(season, year));
        if (!data) return [];
        return data.anime.map((result: any) => {
            let fromData = new AnimeEntry({});
            fromData.malId = result.mal_id;
            fromData.totalEpisodes = result.episodes as any;
            fromData.startDate = parseStupidAmericanDateString(result.airing_start);
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
        let data = (await mal.findUser(user.username, "animelist", listType, { page }).catch((e: string) => {
            if (e === "Response: 429")
                return this.getUserAnimeList(user, listType, page);
        }));
        if (!data) return user.animeList;
        user.animeList[listType] = data.anime.reduce((map: any, result: any) => {
            map[result.mal_id] = new AnimeEntry({
                malId: result.mal_id,
                totalEpisodes: result.total_episodes,
                startDate: parseStupidAmericanDateString(result.start_date),
                endDate: parseStupidAmericanDateString(result.end_date),
                userStartDate: parseStupidAmericanDateString(result.watch_start_date),
                userEndDate: parseStupidAmericanDateString(result.watch_end_date),
                myMalRating: result.score as any,
                myMalStatus: result.watching_status,
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
        let data = (await mal.findAnime(anime.malId));
        if (!data)
            return data;
        anime.score = data.score;
        anime.name = data.title;
        anime.genres = new Set(data.genres.map((ele: { Name: string; }) => ele.Name));
        anime.imageURL = data.image_url;
        anime.startDate = parseStupidAmericanDateString(data.aired.from);
        anime.endDate = parseStupidAmericanDateString(data.aired.to);
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
        let rightNow = new Date(),
            body: any = {
                anime_id: anime.malId,
                status: status,
                score: score,
                num_watched_episodes: episodes,
                csrf_token: Consts.CSRF_TOKEN
            };
        if (episodes === 1)
            body['start_date'] = {
                month: rightNow.getMonth(),
                day: rightNow.getDate(),
                year: rightNow.getFullYear()
            }
        if (status === MALStatuses.Completed)
            body['finish_date'] = {
                month: rightNow.getMonth(),
                day: rightNow.getDate(),
                year: rightNow.getFullYear()
            }
        let request = await fetch(this.UPDATE_ANIME_URL, {
            method: "POST",
            body: JSON.stringify(body)
        });
        if (request.ok) {
            anime.myWatchedEpisodes = episodes;
            anime.myMalStatus = status;
            Consts.MAL_USER.animeList.loadAnime(anime);
            anime.myMalRating = score as any;
            if (episodes === 1) anime.startDate = rightNow;
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
            Consts.MAL_USER.animeList.loadAnime(anime);
            Consts.setMALUser(Consts.MAL_USER);
        }
        return ok;
    }
    static async UpdateWatchedEpisode(downloadedItem: DownloadedItem): Promise<boolean> {
        if (!downloadedItem.animeEntry.malId) return false;
        let episode = downloadedItem.episodeData.episodeNumber,
            status = downloadedItem.animeEntry.totalEpisodes === episode ? MALStatuses.Completed : MALStatuses.Watching,
            ok: boolean = true;
        if (!downloadedItem.animeEntry.myMalStatus)
            ok = await MALUtils.addAnime(downloadedItem.animeEntry as AnimeEntry & { malId: Number })
        if (!ok) return ok;
        ok = await MALUtils.updateAnime(downloadedItem.animeEntry as AnimeEntry & { malId: Number }, { episodes: episode, status });
        Consts.MAL_USER.animeList.loadAnime(downloadedItem.animeEntry);
        Consts.setMALUser(Consts.MAL_USER);
        return ok;
    }
    static async animeForum(anime: AnimeEntry & HasMalId): Promise<Forum["topics"] | undefined> {
        let data = await mal.findAnime(anime.malId, "forum");
        return data ? data.topics : [];
    }
    static async forumEntry(topic: Forum["topics"][0]): Promise<ForumEntry> {
        let response = await fetch(topic.url).then(r => r.text());
        let html = document.createElement("html");
        html.innerHTML = response;
        let messages = [...html.querySelectorAll(".forum_border_around ")].map(msg => {
            let userData = msg.querySelector("td:first-child")!.textContent!.split("\n").map(ele => ele.trim()).filter(ele => ele.length),
                msgHTML = msg.querySelector("[id^=\"message\"]:not([id^=\"messageuser\"]).clearfix")!.innerHTML,
                msgId = Number(msg.querySelector("[id^=\"message\"]:not([id^=\"messageuser\"]).clearfix")!.id.replace("message", ""));
            msgHTML = msgHTML.replace(/<iframe/g, "<iframe allowfullscreen").replace(/href="\/forum\/message\/[0-9]+\?goto=topic/g, m => "href=\"#" + m.replace("href=\"/forum/message/", "").replace("?goto=topic", ""));
            return new ForumMessage({
                messageHTML: msgHTML,
                time: parseStupidAmericanDateString(msg.querySelector(".date")!.textContent as string),
                user: {
                    imageURL: (msg.querySelector(".forum-icon img") || {} as any).src,
                    posts: Number(userData[3].replace("Posts: ", "")),
                    joined: userData[2].replace("Joined: ", ""),
                    status: userData[1] as any,
                    name: userData[0]
                },
                id: msgId
            });
        });
        return new ForumEntry({
            messages: messages, title: topic.title
        });
    }
    static async animeReviews(anime: AnimeEntry & HasMalId): Promise<Reviews | undefined> {
        let data = await mal.findAnime(anime.malId, "reviews");
        return data;
    }
}

export class ForumEntry {
    title: string;
    messages: ForumMessage[];
    constructor({
        title,
        messages
    }: {
        title: string,
        messages: ForumMessage[]
    }) {
        this.title = title;
        this.messages = messages;
    }
}

class ForumMessage {
    messageHTML: string;
    user: { name: string; imageURL?: string; status: "offline" | "online"; joined: string; posts: number; };
    time: Date;
    id: number;
    constructor({
        messageHTML,
        user,
        time,
        id
    }:
        {
            messageHTML: string,
            user: {
                name: string,
                imageURL?: string,
                status: "offline" | "online",
                joined: string,
                posts: number
            },
            time: Date,
            id: number
        }) {
        this.messageHTML = messageHTML;
        this.user = user;
        this.time = time;
        this.id = id;
    }
}