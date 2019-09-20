import React, { Component } from "react";
import { Carousel, Table } from "react-bootstrap"
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";

import MALUtils from "../classes/MALUtils";

function chunkArray(myArray, chunk_size) {
    var results = [];

    while (myArray.length) {
        results.push(myArray.splice(0, chunk_size));
    }

    return results;
}

export default class SeasonalCarousel extends Component {

    static SEASONAL_GRID_SIZE = 3;

    state = {
        seasonalAnimes: []
    }

    componentWillMount() {
        MALUtils.seasonalAnime().then(seasonalAnimes => {
            this.setState({ seasonalAnimes });
        })
    }

    render() {
        return (
            <Carousel interval={null} className="px-5 mx-5 mt-5">
                {
                    chunkArray(this.state.seasonalAnimes, SeasonalCarousel.SEASONAL_GRID_SIZE ** 2).map((arrayChunk, i) => {
                        return (
                            <Carousel.Item key={i}>
                                <Table responsive={false}>
                                    <tbody>
                                        {
                                            chunkArray(arrayChunk, SeasonalCarousel.SEASONAL_GRID_SIZE).map((chunk, i) => {
                                                return (
                                                    <tr key={i}>
                                                        {
                                                            chunk.map((seasonalAnime, i) => {
                                                                return <td key={i} style={{ height: "150px" }}>
                                                                    <Link to={{
                                                                        pathname: "/anime/" + seasonalAnime.malId,
                                                                        state: {
                                                                            animeEntry: seasonalAnime
                                                                        }
                                                                    }}>
                                                                        <LazyLoadImage src={seasonalAnime.imageURL}
                                                                            alt={seasonalAnime.name}
                                                                            height={150} />
                                                                        <span className="title">{seasonalAnime.name}</span>
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
        )
    }
}