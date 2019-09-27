import Browser from "./components/Browser.tsx";
import AnimePage from "./components/AnimePage.tsx";
import Watch from "./components/Watch"

export default {
    '/': Browser,
    '/anime/:id': AnimePage,
    "/watch/:filename": Watch
}