import React, { Component } from "react";
import { Carousel, Table } from "react-bootstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import MALUtils from "../classes/MALUtils";
import Consts from "../consts";
import styles from "./css/SeasonalCarousel.module.css";

function chunkArray(myArray, chunk_size) {
    var results = [],
        arrayCopy = [...myArray];

    while (arrayCopy.length)
        results.push(arrayCopy.splice(0, chunk_size));

    return results;
}

export default class CurrentlyWatching extends Component {
    static GRID_SIZE_X = 5;
    static GRID_SIZE_Y = 2;

    componentDidMount() {
        if (!Object.keys(Consts.MAL_USER.animeList.all).length)
            MALUtils.getUserAnimeList(Consts.MAL_USER, 'all').then(() => {
                Consts.setMALUser(Consts.MAL_USER);
                this.setState({});
            });
        else if (!Object.keys(Consts.MAL_USER.animeList.watching).length)
            MALUtils.getUserAnimeList(Consts.MAL_USER, 'watching').then(() => {
                Consts.setMALUser(Consts.MAL_USER);
                this.setState({});
            });
    }

    render() {
        return (
            <div>
                <h1>
                    Currently Watching:
                    </h1>
                <Carousel interval={null} className="px-5 mx-5 mt-5">
                    {
                        chunkArray(Object.values(Consts.MAL_USER.animeList.watching).sort(
                            (a, b) => a.userStartDate - b.userStartDate || a.myWatchedEpisodes - b.myWatchedEpisodes), CurrentlyWatching.GRID_SIZE_X * CurrentlyWatching.GRID_SIZE_Y)
                            .map((arrayChunk, i) => {
                                return (
                                    <Carousel.Item key={i} className={styles.carousel}>
                                        <Table responsive={false} className={styles.table}>
                                            <tbody>
                                                {
                                                    chunkArray(arrayChunk, CurrentlyWatching.GRID_SIZE_X).map((chunk, i) => {
                                                        return (
                                                            <tr key={i}>
                                                                {
                                                                    chunk.map((seasonalAnime, i) => {
                                                                        return <td key={i} className={styles.td}>
                                                                            <Link to={{
                                                                                pathname: "/anime/" + seasonalAnime.malId,
                                                                                state: {
                                                                                    animeEntry: seasonalAnime
                                                                                }
                                                                            }}
                                                                                className={styles.link}>
                                                                                <LazyLoadImage src={seasonalAnime.imageURL}
                                                                                    alt={seasonalAnime.name}
                                                                                    className={styles.image} />
                                                                                <div className={styles.cover}></div>
                                                                                <span className={styles.title}>{seasonalAnime.name}</span>
                                                                            </Link>
                                                                        </td>
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
}