import React, { Component } from "react";
import { Carousel, Spinner, Table } from "react-bootstrap";
//@ts-ignore
import { LazyLoadComponent, LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import AnimeEntry from "../../classes/AnimeEntry";
import TorrentManager from "../../classes/TorrentManager";
import ChooseSource from "../../components/ChooseSource";
import SearchBar from "../../components/SearchBar";
import styles from "../../css/pages/SeasonalCarousel.module.css";
import { chunkArray, Confirm } from "../../utils/general";
import TorrentUtils, { SearchResult, Sources } from "../../utils/torrents";
import { DisplayEpisodes } from "../animeInfo/Episodes";
import SeasonalCarousel from "./SeasonalCarousel";

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
                    Latest {Sources[this.props.source]} Updates:
            </h1>
                <Carousel interval={null} className="px-5 mx-5 mt-5" onSelect={handleSelect}>
                    {
                        chunkArray(this.state.torrents, SeasonalCarousel.GRID_SIZE_X * SeasonalCarousel.GRID_SIZE_Y)
                            .map((arrayChunk, i) => {
                                return (
                                    <Carousel.Item key={i} className={styles.carousel}>
                                        <Table responsive={true} className={styles.table}>
                                            <tbody>
                                                {
                                                    chunkArray(arrayChunk, SeasonalCarousel.GRID_SIZE_X).map((chunk, i) => {
                                                        return (
                                                            <tr key={i}>
                                                                {
                                                                    chunk.map((searchResult, i) => {
                                                                        if (searchResult.animeEntry.malId)
                                                                            return <td key={i} className={styles.td}>
                                                                                <span onClick={() => this.downloadNow(searchResult)} className={styles.upperTitle}>
                                                                                    Episode {searchResult.episodeData.episodeNumber}
                                                                                </span>
                                                                                <Link to={{
                                                                                    pathname: "/anime/" + searchResult.animeEntry.malId,
                                                                                    state: {
                                                                                        animeEntry: searchResult.animeEntry
                                                                                    }
                                                                                }}
                                                                                    className={styles.link}>
                                                                                    <LazyLoadImage src={searchResult.animeEntry.imageURL}
                                                                                        alt={searchResult.animeEntry.name}
                                                                                        className={styles.image} />
                                                                                    <div className={styles.cover}></div>
                                                                                    <span className={styles.title}>{searchResult.animeEntry.name}</span>
                                                                                </Link>
                                                                            </td>
                                                                        return (
                                                                            <td key={i} className={styles.td + " pb-4"}>
                                                                                <LazyLoadComponent key={i}>
                                                                                    <div style={{ height: "-webkit-fill-available", overflowY: "hidden" }}>
                                                                                        <SearchBar
                                                                                            showImage={true}
                                                                                            placeholder="Search in MAL"
                                                                                            gotoAnimePageOnChoose={false}
                                                                                            onInputClick={e =>
                                                                                                (e.target as any).value = searchResult.episodeData.seriesName}
                                                                                            onItemClick={entry => this.setMALLink(searchResult, entry)} />
                                                                                    </div>
                                                                                    <span
                                                                                        style={{ flex: "0 1" }}
                                                                                        className={styles.title}>{searchResult.episodeData.seriesName}</span>
                                                                                </LazyLoadComponent>
                                                                            </td>
                                                                        )
                                                                    })
                                                                }
                                                            </tr>
                                                        );
                                                    })
                                                }
                                            </tbody>
                                        </Table>
                                    </Carousel.Item>
                                );
                            })
                    }
                </Carousel>
            </div>
        )
    }
    setMALLink(searchResult: SearchResult, animeEntry: AnimeEntry) {
        animeEntry.synonyms.add(searchResult.episodeData.seriesName);
        searchResult.animeEntry = animeEntry.sync();
        this.setState({});
    }
    downloadNow(searchResult: any) {
        if (!searchResult || !searchResult.episodeData || !searchResult.episodeData.seriesName || !searchResult.episodeData.episodeNumber) return;
        let downloadName = `${searchResult.episodeData.seriesName} Episode ${searchResult.episodeData.episodeNumber}`
        Confirm(`Download ${downloadName}?`, (ok: boolean) => {
            if (ok && searchResult.links && searchResult.links[0] && searchResult.links[0].magnet)
                TorrentManager.add({ magnetURL: (searchResult as any).links[0].magnet, name: downloadName })
        })
    }
}

export default class LatestTorrents extends Component {
    render() {
        return (
            <div className="mx-auto">
                <ChooseSource>
                    <DisplayLatestTorrents />
                </ChooseSource>
            </div>
        )
    }
}