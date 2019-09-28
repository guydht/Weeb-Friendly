import User from './classes/User';
let storage = window.require("electron-json-config");

console.log(storage.set("mal_user", {}));
export default class Consts {
    static HORRIBLE_SUBS_URL = "";

    static WANTS_TO_LOGIN_TO_MAL_STORAGE_KEY = "wants to login";
    static WANTS_TO_LOGIN_TO_MAL = storage.get(Consts.WANTS_TO_LOGIN_TO_MAL_STORAGE_KEY) !== "false";

    static setWantsToLogin(val: boolean) {
        Consts.WANTS_TO_LOGIN_TO_MAL = val;
        storage.set(Consts.WANTS_TO_LOGIN_TO_MAL_STORAGE_KEY, String(val));
    }

    static MAL_USER_STORAGE_KEY = "mal_user";
    static MAL_USER: User = User.fromJson(storage.get(Consts.MAL_USER_STORAGE_KEY, {}));

    static setMALUser(val: User) {
        Consts.MAL_USER = val;
        storage.set(Consts.MAL_USER_STORAGE_KEY, val);
    }

    static CSRF_TOKEN_STORAGE_KEY = "csrf-storage";
    static CSRF_TOKEN = storage.get(Consts.CSRF_TOKEN_STORAGE_KEY) || "";
    static setCsrfToken(val: string) {
        this.CSRF_TOKEN = val;
        storage.set(this.CSRF_TOKEN_STORAGE_KEY, val);
    }

    static MAL_LOGIN_URL = "https://myanimelist.net/login.php";

    static DEFAULT_THEME = "Dark";
    static THEMES = [
        "Dark",
        "Light",
        "Grey",
        "Spacelab",
        "Dark Blue",
        "Sketchy"
    ];

    static THEME_STORAGE_KEY = "theme";
    static CURRENT_THEME = storage.get(Consts.THEME_STORAGE_KEY) || Consts.DEFAULT_THEME;

    static setCurrentTheme(val: string) {
        Consts.CURRENT_THEME = val;
        storage.set(Consts.THEME_STORAGE_KEY, val);
    }

    static DOWNLOADS_FOLDER_STORAGE_KEY = "downloads folder";
    static DOWNLOADS_FOLDER = storage.get(Consts.DOWNLOADS_FOLDER_STORAGE_KEY) || "";
    static setDownloadsFolder(val: string) {
        Consts.DOWNLOADS_FOLDER = val;
        storage.set(Consts.DOWNLOADS_FOLDER_STORAGE_KEY, val);
    }

    static FILE_URL_PROTOCOL = "file://";

}