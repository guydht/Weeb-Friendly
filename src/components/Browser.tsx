import React, { Component } from "react";
import { Jumbotron } from "react-bootstrap";
import Consts from "../consts";
import CurrentlyWatching from "./CurrentlyWatching";
import SeasonalCarousel from "./SeasonalCarousel";
import DownloadedAnime from "./DownloadedAnime";


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
                <SeasonalCarousel />
            </Jumbotron>
        )
    }
}