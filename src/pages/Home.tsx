import React, { Component } from "react";
import { Jumbotron, Toast } from "react-bootstrap";
import Consts from "../classes/Consts";
import { hasInternet } from "../utils/general";
import LatestTorrents from "./home/LatestTorrents";
import SeasonalCarousel from "./home/SeasonalCarousel";
import CurrentlyWatching from "./home/CurrentlyWatching";
import DownloadedAnime from "./home/DownloadedAnime";


export default class Home extends Component {

	static noInternetComponent(componentDiscription: string) {
		return (
			<Toast className="mx-auto mt-5">
				<Toast.Header closeButton={false}>
					<span>You don't have internet connection!</span>
				</Toast.Header>
				<Toast.Body>
					To see {componentDiscription}, Please connect to the internet!
                </Toast.Body>
			</Toast>
		)
	}

	render() {
		return (
			<Jumbotron style={{ textAlign: "center" }}>
				{
					Consts.DOWNLOADS_FOLDER &&
					<DownloadedAnime />
				}
				{
					Consts.MAL_USER.isLoggedIn && hasInternet() ?
						<CurrentlyWatching /> : Consts.MAL_USER.isLoggedIn && Home.noInternetComponent("Currently Watching")
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