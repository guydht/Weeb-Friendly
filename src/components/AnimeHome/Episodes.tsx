import { createSliderWithTooltip, Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import React, { Component } from "react";
import { Button, ButtonGroup, Card, Col, Container, Modal, OverlayTrigger, Popover, Row, Spinner } from "react-bootstrap";
import AnimeEntry from "../../classes/AnimeEntry";
import Consts from "../../classes/Consts";
import DownloadedFileThumbnail from "../../classes/DownloadedFileThumbnail";
import DownloadedItem from "../../classes/DownloadedItem";
import HorribleSubsUtils, { SearchResult } from "../../classes/HorribleSubsUtils";
import TorrentManager from "../../classes/TorrentManager";
import { groupBy, stringCompare } from "../../classes/utils";
import { AnimeProps } from "../AnimePage";
import { walkDir } from "../DownloadedAnime";
import SearchBar from "../SearchBar";
import styles from "./Episodes.module.css";
import { ReactComponent as DownloadIcon } from "./icons/download.svg";

export default class Episodes extends Component<AnimeProps & { episodes: SearchResult[], loading: boolean, chosenForDownload: number[] }> {
    state = {
        anime: this.props.anime,
        info: this.props.info,
        episodes: [],
        loading: true,
        chosenForDownload: []
    };
    downloadedFromSeries: DownloadedItem[] = [];

    get chosenForDownload() {
        if (this.state.chosenForDownload.length)
            return this.state.chosenForDownload;
        return [1, Episodes.groupByQuality(this.state.episodes).length]
    }

    componentDidMount() {
        this.searchAnime(this.state.anime).then(episodes => {
            this.setState({
                episodes: episodes.sort((a, b) => b.episodeData.episodeNumber - a.episodeData.episodeNumber),
                loading: false
            });
        });
    }
    componentWillUpdate() {
        this.downloadedFromSeries = walkDir(Consts.DOWNLOADS_FOLDER).filter(item => item.animeEntry.sync().malId === this.state.anime.malId ||
            (item.animeEntry.name.match(/[a-zA-Z0-9\s]*/g) || []).join("") === (this.state.anime.name!.match(/[a-zA-Z0-9\s]*/g) || []).join(""));
    }

    async searchAnime(anime: AnimeEntry, fetchAll = false): Promise<SearchResult[]> {
        let episodes = await HorribleSubsUtils.search(anime, fetchAll);
        let groupedBySeries = groupBy(episodes, ['episodeData', 'seriesName']);
        if (groupedBySeries.length > 0)
            episodes = groupedBySeries.sort((a, b) => {
                let aVal = Math.max(...a.map(ele => stringCompare(ele.episodeData.seriesName, this.state.anime.name!))),
                    bVal = Math.max(...b.map(ele => stringCompare(ele.episodeData.seriesName, this.state.anime.name!)));
                return aVal - bVal;
            })[0];
        return episodes.sort((a, b) => b.episodeData.episodeNumber - a.episodeData.episodeNumber);
    }

    render() {
        const userChoseAnime = (anime: AnimeEntry) => {
            this.state.anime.synonyms.add(anime.name!);
            this.state.anime.sync();
            this.componentDidMount();
            this.setState({
                loading: true
            });
        };
        if (this.state.loading)
            return (
                <Container>
                    <div>Loading....</div>
                    <Spinner animation="grow" />
                </Container>
            );
        if (this.state.episodes.length === 0)
            return (
                <Modal.Dialog className={styles.modal}>
                    <Modal.Header>
                        <Modal.Title>Couldn't Find any episodes for {this.state.anime.name} :(</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        Try and search it:
                        <SearchBar gotoAnimePageOnChoose={false} showImage={false} onItemClick={userChoseAnime}
                            onInputChange={e => this.searchAnime(new AnimeEntry({ name: (e.target as any).value }), false)
                                .then(results => e.setResults(results.map(ele => ele.animeEntry).filter((ele, i, arr) => arr.map(ele => ele.name).indexOf(ele.name) === i)))}
                            onInputClick={e => (e.target as any).value === "" && ((e.target as any).value = this.state.anime.name)} />
                    </Modal.Body>
                </Modal.Dialog>
            );
        const TooltipRange = createSliderWithTooltip(Range),
            grouped = Episodes.groupByQuality(this.state.episodes),
            chosenForDownload = this.chosenForDownload;
        return (
            <div className="mx-1 mt-3">
                {
                    grouped.length > 1 && (
                        <div>
                            <TooltipRange max={grouped.length} min={1}
                                value={chosenForDownload}
                                onChange={chosenForDownload => this.setState({ chosenForDownload })} />
                            <Button onClick={() => this.confirmDownloadEpisodes(chosenForDownload)}>
                                Download Episode {chosenForDownload[0]} - {chosenForDownload[1]} ({chosenForDownload[1] - chosenForDownload[0] + 1} Episodes)?
                            </Button>
                            (In highest available Quality)
                        </div>
                    )
                }
                <Container className={styles.grid}>
                    {
                        grouped.map((episode, i) => {
                            return (
                                <Card key={i} className="m-1">
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
                                            !this.downloadedItemOfEpisode(episode) &&
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
            </div >
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
            episodes = episodes.sort((a, b) => b.episodeData.quality - a.episodeData.quality);
            result.episodeData.qualities = episodes.map(episode => episode.episodeData.quality);
            result.seedersArr = episodes.map(episode => episode.seeders);
            result.leechersArr = episodes.map(episode => episode.leechers);
            result.links = episodes.map(episode => episode.link);
            return result;
        })
    }
    startDownload(magnetLink: string, episode: SearchResult) {
        TorrentManager.add({ magnetURL: magnetLink, name: `${episode.episodeData.seriesName} Episode ${episode.episodeData.episodeNumber}` });
        (window as any).displayToast({
            title: "Download Successfully started",
            body: `Started downloading ${episode.episodeData.seriesName} Episode ${episode.episodeData.episodeNumber}.`
        });
    }
    confirmDownloadEpisodes([episodeStart, episodeEnd]: number[]) {
        let episodes = Episodes.groupByQuality(this.state.episodes);
        episodes.slice(episodeStart - 1, episodeEnd).forEach(episode => {
            this.startDownload(episode.links.slice(-1)[0].magnet, episode);
        });
    }
}