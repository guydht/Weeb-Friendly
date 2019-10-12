import AnimePage from "./components/AnimePage.tsx";
import Browser from "./components/Browser.tsx";

export default {
    '/': Browser,
    '/anime/:id': AnimePage
}