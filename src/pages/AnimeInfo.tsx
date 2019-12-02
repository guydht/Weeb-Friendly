import { AnimeById } from "jikants/dist/src/interfaces/anime/ById";
import React, { Component } from "react";
import { Col, Container, Row, Tab, Tabs } from "react-bootstrap";
//@ts-ignore
import { LazyLoadComponent } from "react-lazy-load-image-component";
import ImageZoom from "react-medium-image-zoom";
import AnimeEntry from "../classes/AnimeEntry";
import { hasInternet } from "../utils/general";
import MALUtils from "../utils/MAL";
import Recommendations from "./animeInfo/ Recommendations";
import Details from "./animeInfo/Details";
import Episodes from "./animeInfo/Episodes";
import Forum from "./animeInfo/Forum";
import News from "./animeInfo/News";
import Pictures from "./animeInfo/Pictures";
import Reviews from "./animeInfo/Reviews";
import Stats from "./animeInfo/Stats";
const qwantApi = window.require("qwant-api");

export interface AnimeInfoProps {
    info: AnimeById;
    anime: AnimeEntry;
}
let emptyFrom = {
    day: -1,
    month: -1,
    year: -1
},
    emptyProp = {
        from: { ...emptyFrom },
        to: { ...emptyFrom }
    },
    emptyAired = {
        from: new Date("undefined"),
        prop: { ...emptyProp },
        string: "",
        to: new Date("undefined")
    },
    emptyInfo = {
        aired: { ...emptyAired },
        airing: null,
        background: "",
        broadcast: "",
        duration: "",
        ending_themes: [],
        episodes: null,
        favorites: null,
        genres: [],
        image_url: "",
        licensors: [],
        mal_id: null,
        members: null,
        opening_themes: [],
        popularity: null,
        premiered: "",
        producers: [],
        rank: null,
        rating: "",
        related: {},
        request_cache_expiry: null,
        request_cached: null,
        request_hash: "",
        score: null,
        scored_by: null,
        source: "",
        status: "",
        studios: [],
        synopsis: "",
        title_english: "",
        title_japanese: "",
        title_synonyms: [],
        title: "",
        trailer_url: "",
        type: "",
        url: ""
    }

export default class AnimeInfo extends Component<{ anime?: AnimeEntry } & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>> {

    private PAGE_LINKS = { Details, Episodes: Episodes, Reviews, Recommendations, Stats, News, Forum, Pictures }

    state: { info?: AnimeById, anime: AnimeEntry, highResPhoto: string } = {
        anime: this.props.anime ||
            (((this.props as any).location.state || {}).animeEntry || new AnimeEntry({ malId: Number((this.props as any).match.params.id) })) as AnimeEntry,
        highResPhoto: ""
    }

    componentDidUpdate() {
        if (!this.props.anime && this.state.anime && this.state.anime.malId !== Number((this.props as any).match.params.id))
            this.setState({
                anime: (this.props as any).location.state.animeEntry,
                info: undefined
            });
    }

    render() {
        if (!this.state.anime || !this.state.anime.malId || !this.state.info) {
            let id = this.state.anime.malId || (this.props as any).match.params.id;
            if (id) {
                let anime = new AnimeEntry({ malId: Number(id) });
                MALUtils.getAnimeInfo(anime as AnimeEntry & { malId: number }).then(info => {
                    this.setState({
                        info,
                        anime
                    });
                });
            }
        }
        this.state.anime.syncGet();
        let props = { ...this.props };
        delete props.anime;
        delete (props as any).staticContext;
        return (
            <div className={`mx-5 px-5${props.className ? " " + props.className : ""}`} {...props}>
                <Row>
                    <h2>
                        {
                            this.state.anime.name
                        }
                    </h2>
                </Row>
                <Row>
                    <Col md="auto">
                        <ImageZoom
                            image={{
                                src: this.state.anime.imageURL || "",
                                alt: this.state.anime.name
                            }}
                            zoomImage={{
                                src: this.state.highResPhoto || this.state.anime.imageURL || "",
                                alt: this.state.anime.name
                            }}
                            shouldReplaceImage={false}
                            defaultStyles={{
                                overlay: {
                                    background: "rgba(0, 0, 0, 0.8)"
                                },
                                image: {
                                    cursor: "pointer"
                                },
                                zoomImage: {
                                    cursor: "pointer"
                                }
                            }}
                            onZoom={() => (hasInternet() && !this.state.highResPhoto && this.searchHighResPhoto(this.state.anime)) as object} />
                    </Col>
                    <Col md="auto" style={{ flex: 1 }}>
                        <Tabs id="mal-links" defaultActiveKey={"Details"} className="justify-content-start">
                            {
                                Object.entries(this.PAGE_LINKS).map(([name, MyComponent], i) => {
                                    return (
                                        <Tab eventKey={name} title={name} mountOnEnter={true} key={i}>
                                            <LazyLoadComponent>
                                                <Container>
                                                    <MyComponent key={this.state.anime.malId} anime={this.state.anime} info={this.state.info || { ...emptyInfo } as any} />
                                                </Container>
                                            </LazyLoadComponent>
                                        </Tab>
                                    )
                                })
                            }
                        </Tabs>
                    </Col>
                </Row>
            </div>
        );
    }
    async searchHighResPhoto(anime: AnimeEntry) {
        qwantApi.search("images", {
            query: anime.name + " Cover",
            count: 10
        }, (err: any, data: any) => {
            if (!err && data.data) {
                console.log(data);
                let highResPhoto = data.data.result.items[0].media;
                if (highResPhoto)
                    this.setState({ highResPhoto });
            }
        });
    }
}