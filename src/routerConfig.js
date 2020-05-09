import AnimePage from "./pages/AnimeInfo.tsx";
import Browser from "./pages/Home.tsx";
import Settings from "./pages/Settings";

export default {
	'/anime/:id': AnimePage,
	'/settings': Settings,
	'/': Browser
};