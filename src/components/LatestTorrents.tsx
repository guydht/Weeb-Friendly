import React, { Component } from "react";
import { Carousel, Spinner, Table } from "react-bootstrap";
import { LazyLoadComponent, LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import AnimeEntry from "../classes/AnimeEntry";
import HorribleSubsUtils, { SearchResult } from "../classes/HorribleSubsUtils";
import { chunkArray } from "../classes/utils";
import Episodes from "../components/AnimeHome/Episodes";
import styles from "./css/SeasonalCarousel.module.css";
import SearchBar from "./SearchBar";
import SeasonalCarousel from "./SeasonalCarousel";

export default class LatestTorrents extends Component {

    state: { torrents: SearchResult[] } = {
        torrents: []
    }

    componentDidMount() {
        HorribleSubsUtils.latest().then(latest => {
            this.setState({ torrents: Episodes.groupByQuality(latest) })
        });
    }

    render() {
        if (!this.state.torrents.length)
            return (
                <div>
                    <small className="d-block">Loading Torrents...</small>
                    <Spinner animation="grow" />
                </div>
            )
        return (
            <div>
                <h1>
                    Latest HorribleSubs Updates:
            </h1>
                <Carousel interval={null} className="px-5 mx-5 mt-5">
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
                                                                            <td key={i} className={styles.td}>
                                                                                <LazyLoadComponent key={i}>
                                                                                    <small>
                                                                                        <SearchBar
                                                                                            showImage={true}
                                                                                            placeholder="Search in MAL"
                                                                                            gotoAnimePageOnChoose={false}
                                                                                            onInputClick={e =>
                                                                                                (e.target as any).value = searchResult.episodeData.seriesName}
                                                                                            onItemClick={entry => this.setMALLink(searchResult, entry)} /></small>
                                                                                    <span className={styles.title}>{searchResult.episodeData.seriesName}</span>
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
}
