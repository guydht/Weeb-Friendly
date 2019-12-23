import React, { Component, RefObject, SyntheticEvent } from "react";
import { Badge, Button, Col, FormControl, Modal, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import AnimeEntry from "../../classes/AnimeEntry";
import Consts from "../../classes/Consts";
import { MALStatuses } from "../../classes/MalStatuses";
import ChangableText from "../../components/ChangableText";
import DownloadedFileThumbnail from "../../components/DownloadedFileThumbnail";
import styles from "../../css/pages/Details.module.css";
import { hasInternet } from "../../utils/general";
import MALUtils from "../../utils/MAL";
import { AnimeInfoProps } from "../AnimeInfo";

export default class Details extends Component<AnimeInfoProps> {

    scoreElement = React.createRef() as RefObject<any>;
    statusElement = React.createRef() as RefObject<any>;
    episodElement = React.createRef() as RefObject<any>;

    render() {
        let sameSeries = Consts.DOWNLOADED_ITEMS.filter(ele => this.props.anime.synonyms.has(ele.episodeData.seriesName));
        return (
            <div className={styles.container}>
                {
                    this.props.info && (
                        <Row className="mt-4" style={{ fontSize: "130%" }}>
                            <Col md="auto" className="text-center">
                                <Badge>Score</Badge>
                                <h5>{this.props.anime.score || "Unknown"}</h5>
                                {
                                    this.props.info.scored_by &&
                                    <small>{this.props.info.scored_by} Users</small>
                                }
                            </Col>
                            <Col style={{
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <Row>
                                    <Col>Ranked: <strong>{this.props.info.rank || "Unknown"}</strong></Col>
                                    <Col>Aired: <strong>{this.props.info.aired.string}</strong></Col>
                                    <Col>Members: <strong>{this.props.info.members || "Unknown"}</strong></Col>
                                </Row>
                                <Row>
                                    <Col>Season: <strong>{this.props.info.premiered || "Unknown"}</strong></Col>
                                    <Col>Type: <strong>{this.props.info.type || "Unknown"}</strong></Col>
                                    <Col>Studio: <strong>{this.props.info.studios.length ? this.props.info.studios[0].name : "Unknown"}</strong></Col>
                                </Row>
                                <Row>
                                    <Col>Status: <strong>{this.props.info.status}</strong></Col>
                                    <Col>Genres: <strong>{this.props.info.genres.map(ele => ele.name).join(", ")}</strong></Col>
                                    <Col>Popularity: <strong>{this.props.info.popularity || "Unknown"}</strong></Col>
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
                            [...this.props.anime.synonyms].map((name) => {
                                if (name === this.props.anime.name) return null;
                                return <ChangableText key={name} text={name} removeButtonTooltipText="Remove Synonyms" onChange={(value: any) => this.changeAnimeSynonyms(name, value)} />;
                            })
                        }
                        <ChangableText key={this.props.anime.synonyms.size} text="+" removeButton={false} onChange={(value: any) => value && this.addAnimeSynonym(value)} onClick={e => (e.target as any).innerHTML = ""} />
                    </Col>
                </Row>
                {
                    Consts.MAL_USER.isLoggedIn && Consts.MAL_USER.animeList.all[this.props.anime.malId!] ? (
                        <div>
                            <Row>
                                <Col className="mt-3">
                                    <h3>{Consts.MAL_USER.username}'s status of {this.props.anime.name}:</h3>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <FormControl key={this.props.anime.myMalStatus} onChange={this.updateAnime.bind(this)} ref={this.statusElement}
                                        as="select" className="w-auto" defaultValue={this.props.anime.myMalStatus as any}>
                                        {
                                            Object.keys(MALStatuses).filter(ele => isNaN(Number(ele))).map(status => (
                                                <option key={status} value={(MALStatuses as any)[status]}>{status}</option>
                                            ))
                                        }
                                    </FormControl>
                                </Col>
                                <Col>
                                    <FormControl key={this.props.anime.myMalRating} onChange={this.updateAnime.bind(this)} ref={this.scoreElement} as="select"
                                        className="w-auto" defaultValue={(this.props.anime.myMalRating || 0).toString()}>
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
                                        key={this.props.anime.myWatchedEpisodes}
                                        type="number"
                                        max={this.props.anime.totalEpisodes}
                                        min={0}
                                        style={{ background: "transparent", width: "1.5em" }}
                                        plaintext
                                        onChange={this.updateAnime.bind(this)}
                                        className="d-inline guydhtNoSpinner"
                                        ref={this.episodElement}
                                        defaultValue={(this.props.anime.myWatchedEpisodes || 0).toString()} />/{this.props.anime.totalEpisodes || "?"}
                                </Col>
                            </Row>
                        </div>
                    ) : <Row>
                            {
                                Consts.MAL_USER.isLoggedIn && hasInternet() ? (
                                    <Button onClick={() => this.addAnime(this.props.anime)}>Add to MyAnimeList</Button>
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
                                    this.props.anime.synopsis
                                }
                            </p>
                        </Modal.Body>
                    </Modal.Dialog>
                </Row>
                {
                    !!Object.values(this.props.info.related).length &&
                    <Row>
                        <Modal.Dialog className={styles.modal}>
                            <Modal.Header>
                                <Modal.Title>Related</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {
                                    Object.entries(this.props.info.related).map(([type, data]) => {
                                        return (
                                            <p key={type}>
                                                {type}: {
                                                    data.map((ele: any) => {
                                                        if (ele.type === "anime")
                                                            return (
                                                                <Link key={ele.mal_id} className="mr-3" to={{
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
                {
                    sameSeries.length > 0 && (
                        <Row>
                            <Modal.Dialog className={styles.modal}>
                                <Modal.Header>
                                    <Modal.Title>Downloaded Episodes</Modal.Title>
                                </Modal.Header>
                                <Modal.Body style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                                    gridGap: ".5rem"
                                }}>
                                    {
                                        sameSeries.map((ele, i) =>
                                            <DownloadedFileThumbnail key={i} downloadedItem={ele} />
                                        )
                                    }
                                </Modal.Body>
                            </Modal.Dialog>
                        </Row>
                    )
                }
            </div >
        )
    }
    updateTimeout?: number;
    static UPDATE_TIMEOUT_MS = 2000;
    addAnime(anime: AnimeEntry) {
        MALUtils.addAnime(anime as any).then(ok => ok && this.setState({}));
    }
    updateAnime(e: SyntheticEvent) {
        if (!this.statusElement.current || !this.episodElement.current || !this.scoreElement.current) return;
        clearTimeout(this.updateTimeout);
        switch (e.currentTarget) {
            case this.episodElement.current:
                switch (Number(this.episodElement.current.value)) {
                    case this.props.anime.totalEpisodes:
                        this.statusElement.current.value = MALStatuses.Completed;
                        break;
                    case 0:
                        this.statusElement.current.value = MALStatuses["Plan To Watch"];
                        break;
                };
                break;
            case this.statusElement.current:
                switch (Number(this.statusElement.current.value)) {
                    case MALStatuses.Completed:
                        this.episodElement.current.value = this.props.anime.totalEpisodes;
                        break;
                    case MALStatuses["Plan To Watch"]:
                        this.episodElement.current.value = 0;
                };
        };
        this.updateTimeout = window.setTimeout(() => {
            if (!this.statusElement.current || !this.episodElement.current || !this.scoreElement.current) return;
            MALUtils.updateAnime(this.props.anime as any, {
                episodes: Number(this.episodElement.current.value),
                status: Number(this.statusElement.current.value),
                score: Number(this.scoreElement.current.value)
            }).then(ok => {
                if (ok)
                    (window as any).displayToast({ title: 'Successfully updated!', body: `Succesfully update ${this.props.anime.name}!` });
                else if (hasInternet())
                    (window as any).displayToast({ title: 'Something Went Wrong!', body: `MyanimeList sent error code :(\nTry logging in again!` });
                (window as any).reloadPage();
            });
        }, Details.UPDATE_TIMEOUT_MS);
    }
    addAnimeSynonym(synonym: string) {
        this.props.anime.syncGet();
        this.props.anime.synonyms.add(synonym);
        this.props.anime.syncPut(true);
        this.forceUpdate();
    }
    changeAnimeSynonyms(synonymToChange: string, newSynonym: string) {
        this.props.anime.syncGet();
        this.props.anime.synonyms.delete(synonymToChange);
        if (newSynonym && newSynonym.trim())
            this.props.anime.synonyms.add(newSynonym);
        this.props.anime.syncPut(true);
        this.forceUpdate();
    }
}