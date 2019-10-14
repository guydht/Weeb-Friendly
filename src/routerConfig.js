import AnimePage from "./pages/AnimeInfo.tsx";
import Browser from "./pages/Home.tsx";

export default {
    '/': Browser,
    '/anime/:id': AnimePage
}