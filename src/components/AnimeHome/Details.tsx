import React, { Component, RefObject } from "react";
import { Badge, Button, Col, Container, FormControl, Row } from "react-bootstrap";
import AnimeEntry from "../../classes/AnimeEntry";
import MALUtils, { MALStatuses } from "../../classes/MALUtils";
import { hasInternet } from "../../classes/utils";
import Consts from "../../consts";
import { AnimeProps } from "../AnimePage";

export default class Details extends Component<AnimeProps> {

    scoreElement = React.createRef() as RefObject<any>;
    statusElement = React.createRef() as RefObject<any>;
    episodElement = React.createRef() as RefObject<any>;

    state = {
        anime: this.props.anime,
        info: this.props.info
    };

    render() {
        console.log(this.state);
        return (
            <Container>
                {
                    this.state.info && (
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
                    )
                }
                {
                    Consts.MAL_USER.isLoggedIn && Consts.MAL_USER.animeList.all[this.state.anime.malId!] ? (
                        <div>
                            <Row>
                                <Col className="mt-3">
                                    <h3>{Consts.MAL_USER.username}'s status of {this.state.anime.name}:</h3>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <FormControl onChange={this.updateAnime.bind(this)} ref={this.statusElement}
                                        as="select" className="w-auto" defaultValue={(MALStatuses as any)[this.state.anime.myMalStatus!]}>
                                        {
                                            Object.keys(MALStatuses).filter(ele => isNaN(Number(ele))).map(status => (
                                                <option key={status} value={(MALStatuses as any)[status]}>{status}</option>
                                            ))
                                        }
                                    </FormControl>
                                </Col>
                                <Col>
                                    <FormControl onChange={this.updateAnime.bind(this)} ref={this.scoreElement} as="select"
                                        className="w-auto" defaultValue={(this.state.anime.myMalRating || 0).toString()}>
                                        <option value="0">Select</option>
                                        {
                                            AnimeEntry.SCORES.map((score, i) =>
                                                <option key={score} value={i + 1}>{`(${i + 1}) ${score}`}</option>
                                            )
                                        }
                                    </FormControl>
                                </Col>
                                <Col>
                                    <FormControl
                                        type="number"
                                        max={this.state.anime.totalEpisodes}
                                        min={0}
                                        style={{ background: "transparent", width: "1.5em" }}
                                        plaintext
                                        onChange={this.updateAnime.bind(this)}
                                        className="d-inline guydhtNoSpinner"
                                        ref={this.episodElement}
                                        defaultValue={(this.state.anime.myWatchedEpisodes || 0).toString()} />/{this.state.anime.totalEpisodes}
                                </Col>
                            </Row>
                        </div>
                    ) : <Row>
                            {
                                hasInternet() ? (
                                    <Button>Add to MyAnimeList</Button>
                                ) : (
                                        <span>
                                            Can't add to MyAnimeList since you dont have internet connectivity!
                                    </span>
                                    )
                            }
                        </Row>
                }
            </Container >
        )
    }
    updateTimeout?: number;
    static UPDATE_TIMEOUT_MS = 2000;
    updateAnime() {
        if (!this.statusElement.current || !this.episodElement.current || !this.scoreElement.current) return;
        clearTimeout(this.updateTimeout);
        this.updateTimeout = window.setTimeout(() => {
            MALUtils.updateAnime(this.state.anime as any, {
                episodes: Number(this.episodElement.current.value),
                status: Number(this.statusElement.current.value),
                score: Number(this.scoreElement.current.value)
            }).then(ok => {
                if (ok)
                    (window as any).displayToast({ title: 'Successfully updated!', body: `Succesfully update ${this.state.anime.name}!` })
                else
                    (window as any).displayToast({ title: 'Something Went Wrong!', body: `MyanimeList sent error code :(` })
            });
        }, Details.UPDATE_TIMEOUT_MS);
    }
}