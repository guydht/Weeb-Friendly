import React, { Component } from "react";
import { Carousel, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
//@ts-ignore
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { ReactComponent as DownloadIcon } from "../../assets/download.svg";
import { ReactComponent as DownloadingIcon } from "../../assets/Downloading.svg";
import AnimeEntry from "../../classes/AnimeEntry";
import Consts from "../../classes/Consts";
import { MALStatuses } from "../../classes/MalStatuses";
import TorrentManager from "../../classes/TorrentManager";
import ChooseSource from "../../components/ChooseSource";
import HasSeen from "../../components/HasSeen";
import SearchBar from "../../components/SearchBar";
import downloadedAnimeStyle from "../../css/pages/DownloadedAnime.module.css";
import styles from "../../css/pages/SeasonalCarousel.module.css";
import { chunkArray, Confirm } from "../../utils/general";
import TorrentUtils, { DownloadStatus, SearchResult, Sources } from "../../utils/torrents";
import { DisplayEpisodes } from "../animeInfo/Episodes";
import SeasonalCarousel from "./SeasonalCarousel";

type GroupedSearchResult = ReturnType<typeof DisplayEpisodes.groupByQuality>[0];

class DisplayTorrentEntry extends Component<{ searchResult: GroupedSearchResult; }> {
	render() {
		const downloadStatus = this.props.searchResult.downloadStatus;
		if (this.props.searchResult.animeEntry.malId)
			return (
				<div className="position-relative">
					{
						this.props.searchResult.seenThisEpisode() ? <HasSeen className={styles.downloadIcon} hasSeen={true} />
							: downloadStatus === DownloadStatus.downloaded ?
								<OverlayTrigger overlay={<Tooltip id={this.props.searchResult.animeEntry.malId.toString()}>Already Downloaded</Tooltip>} placement="auto">
									<DownloadIcon className={styles.downloadIcon} style={{ cursor: "not-allowed", opacity: 0.4 }} />
								</OverlayTrigger>
								: downloadStatus === DownloadStatus.currentlyDownloading ?
									<OverlayTrigger overlay={<Tooltip id={this.props.searchResult.animeEntry.malId.toString()}>Currently Downloading Episode</Tooltip>}>
										<DownloadingIcon className={styles.downloadIcon} style={{ cursor: "progress" }} />
									</OverlayTrigger>
									: <OverlayTrigger overlay={<Tooltip id={this.props.searchResult.animeEntry.malId.toString()}>Download Episode</Tooltip>}>
										<DownloadIcon className={styles.downloadIcon} onClick={() => DisplayTorrentEntry.downloadNow(this.props.searchResult)} />
									</OverlayTrigger>
					}
					<span className={styles.upperTitle}>
						Episode {this.props.searchResult.episodeData.episodeNumber}
					</span>
					<Link to={{
						pathname: "/anime/" + this.props.searchResult.animeEntry.malId,
						state: {
							animeEntry: this.props.searchResult.animeEntry
						}
					}}
						className={styles.link}>
						<LazyLoadImage src={this.props.searchResult.animeEntry.imageURL}
							className={styles.image} />
						<div className={styles.cover}></div>
						<span className={styles.title}>{this.props.searchResult.animeEntry.name}</span>
					</Link>
				</div>
			)
		return (
			<div className="position-relative pb-4">
				<div style={{ overflowY: "hidden" }}>
					<SearchBar
						showImage={true}
						placeholder="Search in MAL"
						gotoAnimePageOnChoose={false}
						onInputClick={e => {
							const target = e.target as HTMLInputElement,
								prevValue = target.value;
							target.value = this.props.searchResult.episodeData.seriesName;
							if (!prevValue)
								e.doSearch();
						}}
						onItemClick={entry => this.setMALLink(this.props.searchResult, entry)} />
				</div>
				<span
					style={{ flex: "0 1" }}
					className={styles.title}>{this.props.searchResult.episodeData.seriesName}</span>
			</div>
		)
	}
	setMALLink(searchResult: SearchResult, animeEntry: AnimeEntry) {
		animeEntry.synonyms.add(searchResult.episodeData.seriesName);
		searchResult.animeEntry = animeEntry;
		this.setState({});
	}
	static downloadNow(searchResult: GroupedSearchResult, promptDownload: boolean = true) {
		console.log(searchResult);
		if (!searchResult.searchResults.length) return;
		const downloadName = `${searchResult.episodeData.seriesName} Episode ${searchResult.episodeData.episodeNumber}`,
			doDownload = () => TorrentManager.add({ magnetURL: searchResult.searchResults[0]?.link.magnet });
		if (promptDownload)
			Confirm(`Download ${downloadName}?`, (ok: boolean) => {
				if (ok && searchResult.searchResults[0]?.link.magnet)
					doDownload();
			});
		else
			doDownload();
	}
}
class DisplayLatestTorrents extends Component<{ source?: Sources }>{

	state: { torrents: GroupedSearchResult[], nextPageToLoad: number } = {
		torrents: [],
		nextPageToLoad: 1
	}

	componentDidMount() {
		this.loadMoreUpdated();
	}

	async loadMoreUpdated() {
		if (this.props.source === undefined) return;

		const latest = await TorrentUtils.latest(this.state.nextPageToLoad, this.props.source);
		this.state.torrents.push(...DisplayEpisodes.groupByQuality(latest.filter(ele => ele.animeEntry.name)));
		this.setState({ torrents: this.state.torrents, nextPageToLoad: this.state.nextPageToLoad + 1 });

		if (Consts.AUTO_DOWNLOAD_NEW_EPISODES_OF_WATCHED_SERIES)
			this.autoDownloadNewEpisodes();
		return latest;
	}

	autoDownloadNewEpisodes() {
		this.state.torrents.forEach(torrentEntry => {
			if ((torrentEntry.animeEntry.myMalStatus === MALStatuses.Watching || torrentEntry.animeEntry.myMalStatus === MALStatuses["Plan To Watch"])
				&& !torrentEntry.seenThisEpisode() && torrentEntry.downloadStatus === DownloadStatus.notDownloaded
				&& torrentEntry.searchResults[0]?.episodeData.quality === Consts.QUALITY_PREFERENCE[0])
				DisplayTorrentEntry.downloadNow(torrentEntry, false);
		});
	}

	render() {
		if (this.props.source === undefined) return null;
		if (!this.state.torrents.length)
			return (
				<div>
					<small className="d-block">Loading Torrents From {Sources[this.props.source]}...</small>
					<Spinner animation="grow" />
				</div>
			)
		const handleSelect = (selectedIndex: number) => {
			if (selectedIndex + 1 >= this.state.torrents.length / (SeasonalCarousel.GRID_SIZE_X * SeasonalCarousel.GRID_SIZE_Y)) {
				this.loadMoreUpdated();
			}
		};
		return (
			<div>
				<h1>
					Latest {Sources[this.props.source]} Uploads:
            </h1>
				<Carousel interval={null} className="px-5 mx-5 mt-5" onSelect={handleSelect}>
					{
						chunkArray(this.state.torrents, SeasonalCarousel.GRID_SIZE_X * SeasonalCarousel.GRID_SIZE_Y)
							.map((arrayChunk: GroupedSearchResult[], i) => {
								return (
									<Carousel.Item key={i} className={styles.carousel}>
										<div className={downloadedAnimeStyle.grid}>
											{
												arrayChunk.map((searchResult, i) => {
													return <DisplayTorrentEntry searchResult={searchResult} key={i} />;
												})
											}
										</div>
									</Carousel.Item>
								);
							})
					}
				</Carousel>
			</div >
		)
	}
}

export default class LatestTorrents extends Component {

	render() {
		return (
			<div className="mx-auto mt-5">
				<ChooseSource lazyLoad>
					<DisplayLatestTorrents />
				</ChooseSource>
			</div>
		)
	}
}