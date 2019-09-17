export default class Consts {
    static HORRIBLE_SUBS_URL = "";

    static WANTS_TO_LOGIN_TO_MAL_STORAGE_KEY = "wants to login";
    static WANTS_TO_LOGIN_TO_MAL = localStorage.getItem(Consts.WANTS_TO_LOGIN_TO_MAL_STORAGE_KEY) === "true";

    static setWantsToLogin(val){
        Consts.WANTS_TO_LOGIN_TO_MAL = val;
        localStorage.setItem(Consts.WANTS_TO_LOGIN_TO_MAL_STORAGE_KEY, val);
    }

    static MAL_USER_STORAGE_KEY = "mal_user";
    static MAL_USER = JSON.parse(localStorage.getItem(Consts.MAL_USER_STORAGE_KEY) || JSON.stringify({
        password: null,
        username: null,
        isLoggedOn: false
    }));

    static setMALUser(obj){
        Consts.MAL_USER = obj;
        localStorage.setItem(Consts.MAL_USER_STORAGE_KEY, JSON.stringify(obj));
    }

    static MAL_LOGIN_URL = "https://myanimelist.net/login.php";

    static CRSF_TOKEN_STORAGE_KEY = "CRSF_TOKEN";
    static CSRF_TOKEN = localStorage.getItem(Consts.CRSF_TOKEN_STORAGE_KEY);

    static setCSRFToken(val){
        Consts.CRSF_TOKEN = val;
        localStorage.setItem(Consts.CRSF_TOKEN_STORAGE_KEY, val);
    }
    static DEFAULT_THEME = "Dark";
    static THEMES = {
        DARK_THEME: "Dark",
        LIGHT_THEME: "Light",
        GREY_THEME: "Grey",
        DARK_BLUE_THEME: "Dark Blue"
    };

    static THEME_STORAGE_KEY = "theme";
    static CURRENT_THEME = localStorage.getItem(Consts.THEME_STORAGE_KEY) || Consts.DEFAULT_THEME;

    static setCurrentTheme(val){
        Consts.CURRENT_THEME = val;
        localStorage.setItem(Consts.THEME_STORAGE_KEY, val);
    }
}