import React, { Component } from "react";
import { Jumbotron } from "react-bootstrap";
import { hasInternet } from "../classes/utils";
import Consts from "../consts";
import CurrentlyWatching from "./CurrentlyWatching";
import DownloadedAnime from "./DownloadedAnime";
import LatestTorrents from "./LatestTorrents";
import SeasonalCarousel from "./SeasonalCarousel";


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