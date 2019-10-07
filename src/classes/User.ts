import AnimeList from "./AnimeList";
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
    static fromJson({ username = '', password = '', animeList = [], isLoggedIn = false, last_time_updated = new Date() }) {
        let typedAnimeList = AnimeList.fromJson(animeList as any || []);
        return new User(username, password, typedAnimeList, isLoggedIn, last_time_updated);
    }
    readyForJson() {
        function JSONReplacer(key: any, value: any) {
            if (value && typeof value === "object" && value[Symbol.iterator])
                return [...value];
            return value;
        }
        let copy: any = { ...this };
        copy.animeList = this.animeList.readyForJson();
        return copy;
    }
}
export default User;