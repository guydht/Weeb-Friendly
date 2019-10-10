import { AnimeById } from "jikants/dist/src/interfaces/anime/ById";
import React, { Component } from "react";
import { Col, Container, Row, Tab, Tabs } from "react-bootstrap";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import ImageZoom from "react-medium-image-zoom";
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
        info: undefined,
        anime: ((this.props as any).location.state || {}).animeEntry as AnimeEntry,
        highResPhoto: ""
    }
    componentDidUpdate() {
        if (this.state.anime.malId !== Number((this.props as any).match.params.id))
            this.setState({
                anime: (this.props as any).location.state.animeEntry,
                info: undefined
            });
    }

    render() {
        if (!this.state.anime || !this.state.anime.malId || !this.state.info) {
            let id = (this.props as any).match.params.id;
            if (id) {
                let anime = new AnimeEntry({ malId: Number(id) }).sync();
                MALUtils.getAnimeInfo(anime as AnimeEntry & { malId: number }).then(info => {
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
            <div className="mx-5 px-5">
                <Row>
                    <h2>
                        {
                            this.state.anime.name
                        }
                    </h2>
                </Row>
                <Row>
                    <Col md="auto">
                        <ImageZoom image={{
                            src: this.state.info ? (this.state.info as any).image_url : "",
                            alt: this.state.anime.name
                        }} zoomImage={{
                            src: this.state.highResPhoto || this.state.info ? (this.state.info as any).image_url : "",
                            alt: this.state.anime.name
                        }} defaultStyles={{
                            overlay: {
                                background: "rgba(0, 0, 0, 0.8)"
                            },
                            image: {
                                cursor: "pointer"
                            },
                            zoomImage: {
                                cursor: "pointer"
                            }
                        }} onZoom={() => this.searchHighResPhoto((this.state.info as any).image_url)} />
                    </Col>
                    <Col md="auto" style={{ flex: 1 }}>
                        <Tabs id="mal-links" defaultActiveKey={"Details"}>
                            {
                                Object.entries(this.PAGE_LINKS).map(([name, MyComponent], i) => {
                                    return (
                                        <Tab eventKey={name} title={name} mountOnEnter={true} key={i}>
                                            <LazyLoadComponent>
                                                <Container>
                                                    <MyComponent anime={this.state.anime} info={this.state.info! as AnimeById} />
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
    async searchHighResPhoto(image: string) {
        let data = await fetch("https://www.google.com/searchbyimage?site=search&image_url=" + image).then(r => r.text()),
            html = document.createElement("html");
        html.innerHTML = data;
        let link = html.querySelector("a[title=\"All sizes\"") as HTMLAnchorElement;
        if (!link) return;
        data = await fetch(link.href.replace(window.location.origin, "https://www.google.com")).then(r => r.text());
        html.innerHTML = data;
        let highResPhoto = (html.querySelector("#search img") as HTMLImageElement).src.replace(window.location.origin, "https://www.google.com");
        if (highResPhoto)
            this.setState({ highResPhoto });
    }
}