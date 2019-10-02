import { AnimeById } from "jikants/dist/src/interfaces/anime/ById";
import React, { Component } from "react";
import { Col, Image, Row, Tab, Tabs } from "react-bootstrap";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import AnimeEntry from "../classes/AnimeEntry";
import MALUtils from "../classes/MALUtils";
import Recommendations from "./AnimeHome/ Recommendations";
import Details from "./AnimeHome/Details";
import Episodes from "./AnimeHome/Episodes";
import Forum from "./AnimeHome/Forum";
import News from "./AnimeHome/News";
import Pictures from "./AnimeHome/Pictures";
import Reviews from "./AnimeHome/Reviews";
import Stats from "./AnimeHome/Stats";

export interface AnimeProps {
    info: AnimeById;
    anime: AnimeEntry;
}


export default class AnimePage extends Component {

    private PAGE_LINKS = { Details, Episodes: Episodes, Reviews, Recommendations, Stats, News, Forum, Pictures }

    state = {
        info: {} as AnimeById,
        anime: ((this.props as any).location.state || {}).animeEntry as AnimeEntry
    }

    componentDidMount() {
        if (this.state.anime)
            MALUtils.getAnimeInfo(this.state.anime).then((info) => {
                this.setState({
                    info,
                    anime: this.state.anime
                });
            });
    }

    render() {
        console.log(this.state);
        if (!this.state.anime || !this.state.anime.malId) {
            let id = (this.props as any).match.params.id;
            if (id) {
                let anime = new AnimeEntry({ malId: Number(id) });
                MALUtils.getAnimeInfo(anime).then((info) => {
                    anime = new AnimeEntry({ malId: Number(id) });
                    this.setState({
                        info,
                        anime: anime
                    });
                });
                return null;
            }
            (this.props as any).history.push('/');
            return null;
        }
        return (
            <div className="mx-auto px-4" style={{ width: "fit-content" }}>
                <Row>
                    <h2>
                        {
                            this.state.anime.name
                        }
                    </h2>
                </Row>
                <Row>
                    <Col md="auto">
                        <Image src={this.state.info.image_url} />
                    </Col>
                    <Col md="auto" style={{ flex: 1 }}>
                        <Tabs id="mal-links" defaultActiveKey={"Details"}>
                            {
                                Object.entries(this.PAGE_LINKS).map(([name, MyComponent], i) => {
                                    if (this.state.info.score)
                                        return (
                                            <Tab eventKey={name} title={name} mountOnEnter={true} key={i}>
                                                <LazyLoadComponent>
                                                    <MyComponent anime={this.state.anime} info={this.state.info} />
                                                </LazyLoadComponent>
                                            </Tab>
                                        )
                                    return (
                                        <Tab eventKey={name} title={name} key={i} />
                                    )
                                })
                            }
                        </Tabs>
                    </Col>
                </Row>
            </div>
        );
    }
}