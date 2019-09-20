import Browser from "./components/Browser";
import AnimeDetails from "./components/AnimeDetails";

export default {
    '/': Browser,
    '/anime/:id': AnimeDetails
}