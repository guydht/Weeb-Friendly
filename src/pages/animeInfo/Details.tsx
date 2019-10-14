import React, { Component, RefObject } from "react";
import { Badge, Button, Col, FormControl, Modal, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import AnimeEntry from "../../classes/AnimeEntry";
import Consts from "../../classes/Consts";
import ChangableText from "../../components/ChangableText";
import { hasInternet } from "../../utils/general";
import MALUtils, { MALStatuses } from "../../utils/MAL";
import { AnimeInfoProps } from "../AnimeInfo";
import styles from "../../css/pages/Details.module.css";

export default class Details extends Component<AnimeInfoProps> {

    scoreElement = React.createRef() as RefObject<any>;
    statusElement = React.createRef() as RefObject<any>;
    episodElement = React.createRef() as RefObject<any>;

    state = {
        anime: this.props.anime,
        info: this.props.info
    };

    render() {
        this.state.anime.sync();
        return (
            <div className={styles.container}>
                {
                    this.state.info && (
                        <Row className="mt-4" style={{ fontSize: "130%" }}>
                            <Col md="auto" className="text-center">
                                <Badge>Score</Badge>
                                <h5>{this.state.anime.score || "Unknown"}</h5>
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
                                    <Col>Aired: <strong>{this.state.info.aired.string}</strong></Col>
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
                                    <Col>Popularity: <strong>{this.state.info.popularity || "Unknown"}</strong></Col>
                                </Row>
                            </Col>
                        </Row>
                    )
                }
                <Row>
                    <Col style={{ flex: 0 }}>
                        Synonyms:
                    </Col>
                    <Col>
                        {
                            [...this.state.anime.synonyms].map((name) => {
                                if (name === this.state.anime.name) return null;
                                return <ChangableText key={name} text={name} onChange={(value: any) => this.changeAnimeSynonyms(name, value)} />;
                            })
                        }
                    </Col>
                </Row>
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
                                        as="select" className="w-auto" value={this.state.anime.myMalStatus as any}>
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
                                Consts.MAL_USER.isLoggedIn && hasInternet() ? (
                                    <Button onClick={() => this.addAnime(this.state.anime)}>Add to MyAnimeList</Button>
                                ) : Consts.MAL_USER.isLoggedIn && (
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
                                    this.state.anime.synopsis
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
        if (Number(this.episodElement.current.value) === this.state.anime.totalEpisodes)
            this.statusElement.current.value = MALStatuses.Completed;
        else if (Number(this.episodElement.current.value) === 1)
            this.statusElement.current.value = MALStatuses.Watching;
        this.updateTimeout = window.setTimeout(() => {
            if (!this.statusElement.current || !this.episodElement.current || !this.scoreElement.current) return;
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
    changeAnimeSynonyms(synonymToChange: string, newSynonym: string) {
        this.state.anime.synonyms.delete(synonymToChange);
        if (newSynonym)
            this.state.anime.synonyms.add(newSynonym);
        console.log(this.state.anime, arguments);
        this.state.anime.sync(true);
        this.setState({ anime: this.state.anime });
    }
}