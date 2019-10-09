import React, { Component, RefObject } from "react";
import { Badge, Button, Col, FormControl, Modal, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import AnimeEntry from "../../classes/AnimeEntry";
import Consts from "../../classes/Consts";
import { MALStatuses } from "../../classes/MALStatuses";
import MALUtils from "../../classes/MALUtils";
import { hasInternet } from "../../classes/utils";
import { AnimeProps } from "../AnimePage";
import styles from "./css/details.module.css";

export default class Details extends Component<AnimeProps> {

    scoreElement = React.createRef() as RefObject<any>;
    statusElement = React.createRef() as RefObject<any>;
    episodElement = React.createRef() as RefObject<any>;

    state = {
        anime: this.props.anime,
        info: this.props.info
    };

    render() {
        return (
            <div>
                {
                    this.state.info && (
                        <Row className="mt-4" style={{ fontSize: "130%" }}>
                            <Col md="auto" className="text-center">
                                <Badge>Score</Badge>
                                <h5>{this.state.info.score || "Unknown"}</h5>
                                {
                                    this.state.info.scored_by &&
                                    <small>{this.state.info.scored_by} Users</small>
                                }
                            </Col>
                            <Col style={{
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <Row>
                                    <Col>Ranked: <strong>{this.state.info.rank || "Unknown"}</strong></Col>
                                    <Col>Popularity: <strong>{this.state.info.popularity || "Unknown"}</strong></Col>
                                    <Col>Members: <strong>{this.state.info.members || "Unknown"}</strong></Col>
                                </Row>
                                <Row>
                                    <Col>Season: <strong>{this.state.info.premiered || "Unknown"}</strong></Col>
                                    <Col>Type: <strong>{this.state.info.type || "Unknown"}</strong></Col>
                                    <Col>Studio: <strong>{this.state.info.studios.length ? this.state.info.studios[0].name : "Unknown"}</strong></Col>
                                </Row>
                                <Row>
                                    <Col>Status: <strong>{this.state.info.status}</strong></Col>
                                    <Col>Genres: <strong>{this.state.info.genres.map(ele => ele.name).join(", ")}</strong></Col>
                                    <Col>Aired: <strong>{this.state.info.aired.string}</strong></Col>
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
                                    <Button onClick={() => this.addAnime(this.state.anime)}>Add to MyAnimeList</Button>
                                ) : (
                                        <span>
                                            Can't add to MyAnimeList since you dont have internet connectivity!
                                    </span>
                                    )
                            }
                        </Row>
                }
                <Row>
                    <Modal.Dialog className={styles.modal}>
                        <Modal.Header>
                            <Modal.Title>Synopsis</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <p>
                                {
                                    this.state.info.synopsis
                                }
                            </p>
                        </Modal.Body>
                    </Modal.Dialog>
                </Row>
                {
                    !!Object.values(this.state.info.related).length &&
                    <Row>
                        <Modal.Dialog className={styles.modal}>
                            <Modal.Header>
                                <Modal.Title>Related</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {
                                    Object.entries(this.state.info.related).map(([type, data]) => {
                                        return (
                                            <p key={type}>
                                                {type}: {
                                                    data.map((ele: any) => {
                                                        if (ele.type === "anime")
                                                            return (
                                                                <Link key={ele.mal_id} to={{
                                                                    pathname: "/anime/" + ele.mal_id,
                                                                    state: {
                                                                        animeEntry: new AnimeEntry({
                                                                            name: ele.name,
                                                                            malId: ele.mal_id,
                                                                            malUrl: ele.url
                                                                        })
                                                                    }
                                                                }}>
                                                                    {ele.name}
                                                                </Link>
                                                            )
                                                        return `${ele.name} (${ele.type})`;
                                                    })
                                                }
                                            </p>
                                        )
                                    })
                                }
                            </Modal.Body>
                        </Modal.Dialog>
                    </Row>
                }
            </div >
        )
    }
    updateTimeout?: number;
    static UPDATE_TIMEOUT_MS = 2000;
    addAnime(anime: AnimeEntry) {
        MALUtils.addAnime(anime as any).then(ok => ok && this.setState({}));
    }
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