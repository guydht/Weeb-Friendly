import React, { Component } from "react";
import { Carousel, Table } from "react-bootstrap";
//@ts-ignore
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import AnimeList from "../../classes/AnimeList";
import Consts from "../../classes/Consts";
import styles from "../../css/pages/SeasonalCarousel.module.css";
import { chunkArray } from "../../utils/general";
import MALUtils from "../../utils/MAL";
import SeasonalCarousel from "./SeasonalCarousel";

export default class CurrentlyWatching extends Component {

    state: { animeList: AnimeList } = {
        animeList: Consts.MAL_USER.animeList
    }

    componentDidMount() {
        console.log("componentDidMount")
        if (!Object.keys(Consts.MAL_USER.animeList.all).length)
            MALUtils.getUserAnimeList(Consts.MAL_USER, 'all').then(() => {
                Consts.setMALUser(Consts.MAL_USER);
                this.setState({});
            });
        else if (!Object.keys(Consts.MAL_USER.animeList.watching).length)
            MALUtils.getUserAnimeList(Consts.MAL_USER, 'watching').then(() => {
                Consts.setMALUser(Consts.MAL_USER);
                this.setState({ animeList: Consts.MAL_USER.animeList });
            });
    }

    render() {
        console.log('render');
        return (
            <div>
                <h1>
                    Currently Watching:
                    </h1>
                <Carousel interval={null} className="px-5 mx-5 mt-5">
                    {
                        chunkArray(Object.values(this.state.animeList.watching).sort(
                            (a, b) => b.startDate!.getTime() - a.startDate!.getTime()), SeasonalCarousel.GRID_SIZE_X * SeasonalCarousel.GRID_SIZE_Y)
                            .map((arrayChunk, i) => {
                                return (
                                    <Carousel.Item key={i} className={styles.carousel}>
                                        <Table responsive={false} className={styles.table}>
                                            <tbody>
                                                {
                                                    chunkArray(arrayChunk, SeasonalCarousel.GRID_SIZE_X).map(chunk => {
                                                        return (
                                                            <tr key={chunk[0].name}>
                                                                {
                                                                    chunk.map(seasonalAnime => {
                                                                        return <td key={seasonalAnime.name} className={styles.td}>
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