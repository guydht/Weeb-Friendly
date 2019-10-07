import React, { Component } from "react";
import { Button, ButtonGroup, Card, Col, Container, OverlayTrigger, Popover, Row, Spinner } from "react-bootstrap";
import DownloadedFileThumbnail from "../../classes/DownloadedFileThumbnail";
import DownloadedItem from "../../classes/DownloadedItem";
import HorribleSubsUtils, { SearchResult } from "../../classes/HorribleSubsUtils";
import TorrentManager from "../../classes/TorrentManager";
import { groupBy, stringCompare } from "../../classes/utils";
import Consts from "../../consts";
import { AnimeProps } from "../AnimePage";
import { walkDir } from "../DownloadedAnime";
import styles from "./Episodes.module.css";
import { ReactComponent as DownloadIcon } from "./icons/download.svg";

export default class Episodes extends Component<AnimeProps, { episodes: SearchResult[], loading: boolean }> {
    state = {
        anime: this.props.anime,
        info: this.props.info,
        episodes: [],
        loading: true
    };
    downloadedFromSeries: DownloadedItem[] = [];

    componentDidMount() {
        this.state.anime.sync();
        // eslint-disable-next-line
        HorribleSubsUtils.search(this.state.anime).then(episodes => {
            let groupedBySeries = groupBy(episodes, ['episodeData', 'seriesName']);
            if (groupedBySeries.length > 1)
                episodes = groupedBySeries.sort((a, b) => {
                    let aVal = Math.max(...a.map(ele => stringCompare(ele.episodeData.seriesName, this.state.anime.name!))),
                        bVal = Math.max(...b.map(ele => stringCompare(ele.episodeData.seriesName, this.state.anime.name!)));
                    return aVal - bVal;
                })[0];
            this.downloadedFromSeries = walkDir(Consts.DOWNLOADS_FOLDER).filter(item => item.animeEntry.sync().malId === this.state.anime.malId ||
                (item.animeEntry.name.match(/[a-zA-Z0-9\s]*/g) || []).join("") === (this.state.anime.name!.match(/[a-zA-Z0-9\s]*/g) || []).join(""));
            this.setState({
                episodes: episodes.sort((a, b) => b.episodeData.episodeNumber - a.episodeData.episodeNumber),
                loading: false
            });
        });
    }

    render() {
        if (this.state.loading)
            return (
                <Container>
                    <div>Loading....</div>
                    <Spinner animation="grow" />
                </Container>
            );
        if (this.state.episodes.length === 0)
            return (
                <Container>
                    Couldn't find any episodes for {this.state.anime.name} :(
                </Container>
            );
        return (
            <Container className={styles.grid + " mx-1 mt-3"}>
                {
                    Episodes.groupByQuality(this.state.episodes).map((episode, i) => {
                        return (
                            <Card key={i} className={styles.gridElement + " m-1"}>
                                <Card.Header>
                                    <Card.Title>
                                        Episode {episode.episodeData.episodeNumber}
                                    </Card.Title>
                                    <Card.Subtitle>
                                        {
                                            episode.category.label
                                        }
                                    </Card.Subtitle>
                                    {
                                        !!this.downloadedItemOfEpisode(episode) ||
                                        <ButtonGroup size="sm" className="mt-1">
                                            {
                                                episode.episodeData.qualities.map((quality, i) => {
                                                    return (
                                                        <OverlayTrigger
                                                            key={quality}
                                                            trigger="focus"
                                                            placement="auto"
                                                            overlay={
                                                                <Popover id="popover-position-top">
                                                                    <Popover.Title as="h3">
                                                                        Download {episode.episodeData.seriesName} Episode {episode.episodeData.episodeNumber} in {quality}p:
                                                            </Popover.Title>
                                                                    <Popover.Content>
                                                                        <Row>
                                                                            <Col style={{ minHeight: 0 }}>
                                                                                <DownloadIcon style={{ cursor: "pointer" }} onClick={() => this.startDownload(episode.links[i].magnet, episode)} />
                                                                            </Col>
                                                                            <Col style={{ minHeight: 0 }}>
                                                                                <svg viewBox="0 0 56 18" className={styles.svgText}>
                                                                                    <text fill="green">Seeders:</text>
                                                                                </svg>
                                                                                <span className={styles.seedersText}>{episode.seedersArr[i]}</span>
                                                                            </Col>
                                                                            <Col style={{ minHeight: 0 }}>
                                                                                <svg viewBox="0 0 56 18" className={styles.svgText}>
                                                                                    <text fill="red">Leechers:</text>
                                                                                </svg>
                                                                                <span className={styles.seedersText}>{episode.leechersArr[i]}</span>
                                                                            </Col>
                                                                        </Row>
                                                                    </Popover.Content>
                                                                </Popover>
                                                            }>
                                                            <Button variant="outline-dark">{quality}p</Button>
                                                        </OverlayTrigger>
                                                    )
                                                })
                                            }
                                        </ButtonGroup>
                                    }
                                </Card.Header>
                                <Card.Body>
                                    {
                                        !!this.downloadedItemOfEpisode(episode) && <DownloadedFileThumbnail downloadedItem={this.downloadedItemOfEpisode(episode)} />
                                    }
                                </Card.Body>
                            </Card>
                        );
                    })
                }
            </Container>
        );
    }
    downloadedItemOfEpisode(episode: SearchResult): DownloadedItem | undefined {
        return this.downloadedFromSeries.find(downloadedItem => {
            return (downloadedItem.fileName.match(/(?<=episode\s)[0-9]+/gi) || [])[0] === episode.episodeData.episodeNumber.toString();
        });
    }
    static groupByQuality(episodes: SearchResult[]): Array<SearchResult & {
        episodeData: { qualities: number[] }, seedersArr: number[], leechersArr: number[], links: {
            page: string,
            file: string,
            magnet: string
        }[]
    }> {
        return groupBy(episodes.map(ele => { return { ...ele, asd: ele.episodeData.seriesName + ele.episodeData.episodeNumber } }), ['asd']).map(episodes => {
            let result: any = episodes[0];
            result.episodeData.qualities = episodes.map(episode => episode.episodeData.quality).sort((a, b) => a - b);
            result.seedersArr = episodes.map(episode => episode.seeders);
            result.leechersArr = episodes.map(episode => episode.leechers);
            result.links = episodes.map(episode => episode.link);
            return result;
        })
    }
    startDownload(magnetLink: string, episode: SearchResult) {
        TorrentManager.add(magnetLink, `${episode.episodeData.seriesName} Episode ${episode.episodeData.episodeNumber}`);
        (window as any).displayToast({
            title: "Download Successfully started",
            body: `Started downloading ${episode.episodeData.seriesName} Episode ${episode.episodeData.episodeNumber}.`
        });
    }
}