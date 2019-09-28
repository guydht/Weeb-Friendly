import React, { Component } from "react";
import { Badge, Col, Container, FormControl, Row } from "react-bootstrap";
import AnimeEntry from "../../classes/AnimeEntry";
import Consts from "../../consts";
import { AnimeProps } from "../AnimePage";

export default class Details extends Component<AnimeProps> {

    state = {
        anime: this.props.anime,
        info: this.props.info
    };

    render() {
        return (
            <Container>
                <Row className="mt-4" style={{ fontSize: "130%" }}>
                    <Col md="auto" className="text-center">
                        <Badge>Score</Badge>
                        <h5>{this.state.info.score}</h5>
                        <small>{this.state.info.scored_by} Users</small>
                    </Col>
                    <Col style={{
                        display: "flex",
                        flexDirection: "column"
                    }}>
                        <Row>
                            <Col>Ranked: <strong>{this.state.info.rank}</strong></Col>
                            <Col>Popularity: <strong>{this.state.info.popularity}</strong></Col>
                            <Col>Members: <strong>{this.state.info.members}</strong></Col>
                        </Row>
                        <Row>
                            <Col>Season: <strong>{this.state.info.premiered}</strong></Col>
                            <Col>Type: <strong>{this.state.info.type}</strong></Col>
                            <Col>Studio <strong>{this.state.info.studios[0].name}</strong></Col>
                        </Row>
                    </Col>
                </Row>
                {
                    Consts.MAL_USER.isLoggedIn && Consts.MAL_USER.animeList.all[this.state.anime.malId!] && <Row>
                        <Col>
                            <FormControl as="select" className="w-auto" defaultValue={this.state.anime.myMalStatus}>
                                {
                                    AnimeEntry.STATUSES.map(status => <option key={status} value={status}>{status}</option>)
                                }
                                <option></option>
                            </FormControl>
                        </Col>
                        <Col>
                            <FormControl as="select" className="w-auto" defaultValue={(this.state.anime.myMalRating || 0).toString()}>
                                <option value="0">Select</option>
                                {
                                    AnimeEntry.SCORES.map((score, i) =>
                                        <option key={score} value={i + 1}>{`(${i + 1}) ${score}`}</option>
                                    )
                                }
                            </FormControl>
                        </Col>
                        <Col>
                            <FormControl type="number"
                                style={{ background: "transparent", width: "1.5em" }}
                                plaintext
                                className="d-inline guydhtNoSpinner"
                                defaultValue={(this.state.anime.myWatchedEpisodes || 0).toString()} />/{this.state.anime.totalEpisodes}
                        </Col>
                    </Row>
                }
            </Container >
        )
    }
}