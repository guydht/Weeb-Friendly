import React, { Component } from "react";
import { Carousel, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
//@ts-ignore
import { LazyLoadComponent, LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import AnimeEntry from "../../classes/AnimeEntry";
import TorrentManager from "../../classes/TorrentManager";
import ChooseSource from "../../components/ChooseSource";
import HasSeen from "../../components/HasSeen";
import SearchBar from "../../components/SearchBar";
import downloadedAnimeStyle from "../../css/pages/DownloadedAnime.module.css";
import styles from "../../css/pages/SeasonalCarousel.module.css";
import { ReactComponent as DownloadIcon } from "../../icons/download.svg";
import { chunkArray, Confirm } from "../../utils/general";
import TorrentUtils, { SearchResult, Sources } from "../../utils/torrents";
import { DisplayEpisodes } from "../animeInfo/Episodes";
import SeasonalCarousel from "./SeasonalCarousel";


class DisplayTorrentEntry extends Component<{ searchResult: SearchResult; }> {
    render() {
        if (this.props.searchResult.animeEntry.malId)
            return (
                <div className="position-relative">
                    {
                        this.props.searchResult.seenThisEpisode() ? <HasSeen className={styles.downloadIcon} hasSeen={true} />
                            : this.props.searchResult.alreadyDownloaded() ?
                                <OverlayTrigger overlay={<Tooltip id={this.props.searchResult.animeEntry.malId}>Already Downloaded</Tooltip>} placement="auto">
                                    <DownloadIcon className={styles.downloadIcon} style={{ cursor: "not-allowed", opacity: 0.4 }} />
                                </OverlayTrigger>
                                : <OverlayTrigger overlay={<Tooltip id={this.props.searchResult.animeEntry.malId}>Download Episode</Tooltip>}>
                                    <DownloadIcon className={styles.downloadIcon} onClick={() => this.downloadNow(this.props.searchResult)} />
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
                <LazyLoadComponent>
                    <div style={{ height: "-webkit-fill-available", overflowY: "hidden" }}>
                        <SearchBar
                            showImage={true}
                            placeholder="Search in MAL"
                            gotoAnimePageOnChoose={false}
                            onInputClick={e =>
                                (e.target as any).value = this.props.searchResult.episodeData.seriesName}
                            onItemClick={entry => this.setMALLink(this.props.searchResult, entry)} />
                    </div>
                    <span
                        style={{ flex: "0 1" }}
                        className={styles.title}>{this.props.searchResult.episodeData.seriesName}</span>
                </LazyLoadComponent>
            </div>
        )
    }
    setMALLink(searchResult: SearchResult, animeEntry: AnimeEntry) {
        animeEntry.synonyms.add(searchResult.episodeData.seriesName);
        searchResult.animeEntry = animeEntry;
        this.setState({});
    }
    downloadNow(searchResult: any) {
        const downloadName = `${searchResult.episodeData.seriesName} Episode ${searchResult.episodeData.episodeNumber}`;
        Confirm(`Download ${downloadName}?`, (ok: boolean) => {
            if (ok && searchResult.links && searchResult.links[0] && searchResult.links[0].magnet)
                TorrentManager.add({ magnetURL: (searchResult as any).links[0].magnet });
        });
    }
}

class DisplayLatestTorrents extends Component<{ source?: Sources }>{

    state: { torrents: SearchResult[], nextPageToLoad: number } = {
        torrents: [],
        nextPageToLoad: 1
    }

    componentDidMount() {
        this.loadMoreUpdated();
    }

    loadMoreUpdated() {
        if (this.props.source === undefined) return;
        TorrentUtils.latest(this.state.nextPageToLoad, this.props.source).then(latest => {
            this.state.torrents.push(...DisplayEpisodes.groupByQuality(latest.filter(ele => ele.animeEntry.name)));
            this.setState({ torrents: this.state.torrents, nextPageToLoad: this.state.nextPageToLoad + 1 });
        })
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
        const handleSelect = (index: number, direction: string) => {
            if (direction === "next" && index + 1 >= this.state.torrents.length / (SeasonalCarousel.GRID_SIZE_X * SeasonalCarousel.GRID_SIZE_Y)) {
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
                            .map((arrayChunk, i) => {
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
                <ChooseSource>
                    <DisplayLatestTorrents />
                </ChooseSource>
            </div>
        )
    }
}