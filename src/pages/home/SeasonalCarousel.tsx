import React, { Component } from "react";
import { Carousel, Spinner, Table } from "react-bootstrap";
//@ts-ignore
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import AnimeEntry from "../../classes/AnimeEntry";
import styles from "../../css/pages/SeasonalCarousel.module.css";
import { chunkArray } from "../../utils/general";
import MALUtils from "../../utils/MAL";


export default class SeasonalCarousel extends Component {
    static GRID_SIZE_X = 5;
    static GRID_SIZE_Y = 2;

    state: { seasonalAnimes: AnimeEntry[] } = {
        seasonalAnimes: []
    };

    componentDidMount() {
        MALUtils.getCurrentSeasonalAnime().then(seasonalAnimes => {
            this.setState({ seasonalAnimes });
        })
    }

    render() {
        if (!this.state.seasonalAnimes.length)
            return (
                <div>
                    <small className="d-block">Loading Seasonal...</small>
                    <Spinner animation="grow" />
                </div>
            )
        return (
            <div>
                <h1>
                    Current Seasonal:
            </h1>
                <Carousel interval={null} className="px-5 mx-5 mt-5">
                    {
                        chunkArray(this.state.seasonalAnimes, SeasonalCarousel.GRID_SIZE_X * SeasonalCarousel.GRID_SIZE_Y)
                            .map((arrayChunk, i) => {
                                return (
                                    <Carousel.Item key={i} className={styles.carousel}>
                                        <Table responsive={false} className={styles.table}>
                                            <tbody>
                                                {
                                                    chunkArray(arrayChunk, SeasonalCarousel.GRID_SIZE_X).map((chunk, i) => {
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