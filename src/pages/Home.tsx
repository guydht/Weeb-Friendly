import React, { Component } from "react";
import { Jumbotron } from "react-bootstrap";
import { hasInternet } from "../utils/general";
import Consts from "../classes/Consts";
import CurrentlyWatching from "./home/CurrentlyWatching";
import DownloadedAnime from "./home/DownloadedAnime";
import LatestTorrents from "./home/LatestTorrents";
import SeasonalCarousel from "./home/SeasonalCarousel";


export default class Browser extends Component {

    render() {
        return (
            <Jumbotron style={{ textAlign: "center" }}>
                {
                    Consts.DOWNLOADS_FOLDER &&
                    <DownloadedAnime />
                }
                {
                    Consts.MAL_USER.isLoggedIn &&
                    <CurrentlyWatching />
                }
                {
                    hasInternet() && (
                        <div>
                            <SeasonalCarousel />
                            <LatestTorrents />
                        </div>
                    )
                }
            </Jumbotron>
        )
    }
}