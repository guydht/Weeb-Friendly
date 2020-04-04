import { AnimeById } from "jikants/dist/src/interfaces/anime/ById";
import { Reviews } from "jikants/dist/src/interfaces/anime/Reviews";
import { Seasons } from "jikants/dist/src/interfaces/season/Season";
import { AnimeListTypes } from "jikants/dist/src/interfaces/user/AnimeList";
import App from "../App";
import AnimeEntry from "../classes/AnimeEntry";
import AnimeList from "../classes/AnimeList";
import { updateInMalWhenHasInternet } from "../classes/AnimeStorage";
import Consts from "../classes/Consts";
import DownloadedItem from "../classes/DownloadedItem";
import { MALStatuses } from "../classes/MalStatuses";
import User from "../classes/User";
import { Confirm, getCurrentSeason, hasInternet, parseStupidAmericanDateString } from "./general";

let mal = window.require("jikan-node");
mal = new mal();

type HasMalId = {
    malId: Number
}

export default class MALUtils {
    static readonly MAX_ANIMES_PER_PAGE = 300;
    static readonly MINIMUM_ANIMENAME_SIMILARITY = 0.8;

    static async searchAnime(anime: AnimeEntry, searchString: string = ""): Promise<AnimeEntry[]> {
        searchString = searchString || anime.name!;
        let data = (await mal.search("anime", searchString));
        if (!data) return [];
        let parsedData = data.results.map((result: any) => {
            let fromData = new AnimeEntry({});
            fromData.malId = result.mal_id;
            fromData.totalEpisodes = result.episodes;
            fromData.imageURL = result.image_url;
            fromData.score = result.score;
            fromData.startDate = parseStupidAmericanDateString(result.start_date);
            fromData.endDate = parseStupidAmericanDateString(result.end_date);
            fromData.name = result.title;
            fromData.malUrl = result.url;
            return fromData.syncPut();
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
            return fromData.syncPut();
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
            fromData.name = result.title;
            fromData.malUrl = result.url;
            return fromData.syncGet().syncPut();
        });
    }
    static async getUserAnimeList(user: User, listType: AnimeListTypes = "all", page = 1): Promise<AnimeList> {
        let data = (await mal.findUser(user.username, "animelist", listType, { page }).catch((e: string) => {
            if (e === "Response: 429")
                return this.getUserAnimeList(user, listType, page);
        }));
        if (!data || !data.anime) return user.animeList;
        data.anime.forEach((anime: any) => {
            user.animeList.loadAnime(new AnimeEntry({
                malId: anime.mal_id,
                totalEpisodes: anime.total_episodes,
                startDate: parseStupidAmericanDateString(anime.start_date),
                endDate: parseStupidAmericanDateString(anime.end_date),
                userStartDate: parseStupidAmericanDateString(anime.watch_start_date),
                userEndDate: parseStupidAmericanDateString(anime.watch_end_date),
                myMalRating: anime.score as any,
                myMalStatus: anime.watching_status,
                myWatchedEpisodes: anime.watched_episodes,
                imageURL: anime.image_url,
                malUrl: anime.url,
                name: anime.title,
                sync: false
            }).syncPut());
        });
        if (data.anime.length === this.MAX_ANIMES_PER_PAGE)
            await this.getUserAnimeList(user, listType, page + 1);
        user.animeList.fetchedDate = new Date();
        return user.animeList;
    }
    static async getAnimeInfo(anime: AnimeEntry & HasMalId): Promise<AnimeById | undefined> {
        let data = (await mal.findAnime(anime.malId));
        if (!data)
            return data;
        anime.syncGet()
        anime.score = data.score;
        anime.name = data.title;
        anime.genres = new Set(data.genres.map((ele: { Name: string; }) => ele.Name));
        anime.imageURL = data.image_url;
        anime.startDate = parseStupidAmericanDateString(data.aired.from);
        anime.endDate = parseStupidAmericanDateString(data.aired.to);
        anime.synonyms = new Set([...anime.synonyms, data.title, data.title_english, data.title_japanese, ...data.title_synonyms]);
        anime.synonyms.delete(null as any);
        anime.malUrl = data.url;
        anime.totalEpisodes = data.episodes;
        anime.syncPut();
        return data;
    }
    static UPDATE_ANIME_URL = "https://myanimelist.net/ownlist/anime/edit.json";
    static ADD_ANIME_URL = "https://myanimelist.net/ownlist/anime/add.json";
    static MAL_LOGIN_URL = "https://myanimelist.net/login.php";
    static async updateAnime(anime: AnimeEntry & HasMalId, { episodes, status, score }: { episodes?: number, status?: MALStatuses, score?: number }, reloginWhenFailure = true): Promise<boolean> {
        if (!hasInternet()) {
            return await new Promise(resolve => Confirm(`You don't have internet connection, but I can update it when you do have internet.`,
                (ok: boolean) => {
                    if (ok) {
                        updateInMalWhenHasInternet(
                            anime, {
                            episodes,
                            status
                        });
                        anime.myMalStatus = status;
                        anime.myWatchedEpisodes = episodes;
                        anime.syncPut();
                        (window as any).displayToast({
                            title: "Success",
                            body: `Will update ${anime.name} in MAL when you have internet connectivity again!`
                        });
                    }
                    resolve(ok);
                }));
        }
        let rightNow = new Date(),
            body: any = {
                anime_id: anime.malId,
                status: status,
                score: score,
                num_watched_episodes: episodes,
                csrf_token: Consts.CSRF_TOKEN
            };
        if (episodes === 1 && !(anime.userStartDate && !isNaN(anime.userStartDate.getDate())))
            body['start_date'] = {
                month: rightNow.getMonth() + 1,
                day: rightNow.getDate(),
                year: rightNow.getFullYear()
            }
        if (status === MALStatuses.Completed && !(anime.userEndDate && !isNaN(anime.userEndDate.getDate())))
            body['finish_date'] = {
                month: rightNow.getMonth() + 1,
                day: rightNow.getDate(),
                year: rightNow.getFullYear()
            };
        let request = await fetch(this.UPDATE_ANIME_URL, {
            method: "POST",
            body: JSON.stringify(body)
        });
        let isOk = request.ok && request.url === this.UPDATE_ANIME_URL;
        if (isOk) {
            anime.syncGet();
            anime.myWatchedEpisodes = episodes;
            anime.myMalStatus = status;
            anime.myMalRating = score as any;
            if (body['start_date'])
                anime.userStartDate = rightNow;
            if (body['finish_date'])
                anime.userEndDate = rightNow;
            anime.syncPut();
            Consts.MAL_USER.animeList.loadAnime(anime);
        }
        else if (reloginWhenFailure) {
            let password = Consts.MAL_USER.password,
                username = Consts.MAL_USER.username;
            await Consts.MAL_USER.logOut();
            const response = await this.login(username, password);
            if (response.url === this.MAL_LOGIN_URL) {
                App.loadLoginModal(username, password);
                (window as any).displayToast({ title: "Please login to MAL again", body: "For some reason MAL needs users to sign in every once in a while..... So please do" })
            }
            else {
                Consts.setMALUser(new User(username, password, undefined, true));
                await MALUtils.getUserAnimeList(Consts.MAL_USER);
                Consts.setMALUser(Consts.MAL_USER);
                return this.updateAnime(anime, { episodes, status, score }, false);
            }
        }
        return isOk;
    }
    static async login(username: string, password: string) {
        let formData = new FormData();
        formData.append('user_name', username);
        formData.append('password', password);
        formData.append('csrf_token', Consts.CSRF_TOKEN)
        formData.append('cookie', "1");
        formData.append('sublogin', 'Login');
        formData.append('submit', "1");
        let response = await fetch(this.MAL_LOGIN_URL, {
            method: "POST",
            body: formData
        });
        return response;
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
        let ok = (request.ok || (await request.json()).errors[0].message === "The anime is already in your list.") && request.url === this.ADD_ANIME_URL;
        if (ok) {
            anime.syncGet();
            anime.myMalStatus = MALStatuses.Watching;
            anime.myWatchedEpisodes = 0;
            anime.syncPut();
            Consts.MAL_USER.animeList.loadAnime(anime);
            Consts.setMALUser(Consts.MAL_USER);
        }
        return ok;
    }
    static async removeAnime(anime: AnimeEntry & HasMalId): Promise<boolean> {
        const formData = new FormData();
        formData.append('csrf_token', Consts.CSRF_TOKEN);
        const request = await fetch(`https://myanimelist.net/ownlist/anime/${anime.malId}/delete`, {
            method: "POST",
            body: formData
        });
        const ok = (request.ok || (await request.text()).includes("Successfully deleted entry."));
        if (ok) {
            anime.syncGet();
            anime.myMalStatus = undefined;
            anime.myWatchedEpisodes = undefined;
            anime.myMalRating = undefined;
            anime.myRewatchAmount = undefined;
            anime.syncPut();
            Consts.MAL_USER.animeList.loadAnime(anime);
            Consts.setMALUser(Consts.MAL_USER);
        }
        return ok;
    }
    static async UpdateWatchedEpisode(downloadedItem: DownloadedItem): Promise<boolean> {
        downloadedItem.animeEntry.syncGet();
        if (!downloadedItem.animeEntry.malId) return false;
        let episode = downloadedItem.episodeData.episodeNumber,
            status = downloadedItem.animeEntry.totalEpisodes === episode ? MALStatuses.Completed : MALStatuses.Watching,
            ok: boolean = true;
        if (!downloadedItem.animeEntry.myMalStatus)
            ok = await MALUtils.addAnime(downloadedItem.animeEntry as AnimeEntry & HasMalId);
        ok = await MALUtils.updateAnime(downloadedItem.animeEntry as AnimeEntry & HasMalId, { episodes: episode, status });
        Consts.MAL_USER.animeList.loadAnime(downloadedItem.animeEntry);
        Consts.setMALUser(Consts.MAL_USER);
        return ok;
    }
    static async animeForum(anime: AnimeEntry & HasMalId, page: number = 0): Promise<[ForumTopic[], number]> {
        const response = await fetch(`https://myanimelist.net/forum/?animeid=${anime.malId}&show=${page * 50}`).then(r => r.text()),
            html = document.createElement("html");
        html.innerHTML = response;
        const rows = [...html.querySelectorAll("tbody tr:not(.forum-table-header)")];
        const data = rows.map(row => {
            const author = row.querySelector("a[href*='/profile/']"),
                title: HTMLAnchorElement | null = row.querySelector("a[href*='/forum/']:not([title=\"Go to Newest Post\"])"),
                posted = row.querySelector("td:last-child"),
                replies = posted ? posted.previousElementSibling : posted;
            return {
                author: author ? author.textContent || "" : "",
                title: title ? title.textContent || "" : "",
                url: title ? title.href.replace(window.location.origin, "https://myanimelist.net") : "",
                posted: posted && posted.lastChild ? posted.lastChild.textContent || "" : "",
                replies: replies ? Number(replies.textContent) || 0 : 0
            };
        }),
            numOfPages = html.querySelector("#content .borderClass .di-ib");
        data.sort((a, b) => {
            const aDiscussion = a.title.includes("Discussion"),
                bDiscussion = b.title.includes("Discussion");
            return aDiscussion && bDiscussion ? b.title.localeCompare(a.title, "en-us", { numeric: true }) : bDiscussion ? 1 : -1;
        });
        return [data, numOfPages && numOfPages.firstChild ? Number((numOfPages.firstChild.textContent || "").match(/(?<=Pages \()\d(?=\))/g)) - 1 : 0];
    }
    static async forumEntry(topic: ForumTopic): Promise<ForumEntry> {
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
        const data = await mal.findAnime(anime.malId, "reviews");
        data.reviews.forEach((review: any) => {
            review.date = new Date(review.date);
        });
        return data;
    }
    static async animeRecommandation(anime: AnimeEntry & HasMalId): Promise<AnimeRecommandation[] | void> {
        const data = await fetch(`https://myanimelist.net/anime/${anime.malId}/asd/userrecs`).then(ele => ele.text()),
            html = document.createElement("html");
        html.innerHTML = data;
        const recommandations: AnimeRecommandation[] = [...html.querySelectorAll(".js-scrollfix-bottom-rel > .borderClass")].map(ele => {
            const recommandedAnimeId = Number(ele.querySelector("a")?.href.match(/(?<=\/)[0-9]+(?=\/)/g));
            return {
                animeRecommanded: new AnimeEntry({
                    malId: recommandedAnimeId,
                    imageURL: (ele.querySelector("a > img[srcset]") as any)?.src,
                    name: ele.querySelector("td:nth-child(2) > div > a")?.textContent ?? ""
                }),
                recommandationEntries: [...ele.querySelectorAll(".borderClass")].map(ele => {
                    return {
                        recommandedUsername: ele.children[1].querySelector("a[href*='/profile/']")?.innerHTML ?? "",
                        recommandedText: ele.children[0].textContent ?? ""
                    };
                })
            }
        });
        return recommandations;
    }
}

interface RecommandationEntry {
    recommandedUsername: string;
    recommandedText: string;
}

interface AnimeRecommandation {
    animeRecommanded: AnimeEntry;
    recommandationEntries: RecommandationEntry[];
}

export interface ForumTopic {
    posted: string;
    author: string;
    url: string;
    title: string;
    replies: number;
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