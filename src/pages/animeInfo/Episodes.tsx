import { createSliderWithTooltip, Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import React, { Component } from "react";
import { Button, ButtonGroup, Card, Col, Container, Modal, OverlayTrigger, Popover, Row, Spinner } from "react-bootstrap";
import AnimeEntry from "../../classes/AnimeEntry";
import Consts from "../../classes/Consts";
import DownloadedItem from "../../classes/DownloadedItem";
import TorrentManager from "../../classes/TorrentManager";
import ChooseSource from '../../components/ChooseSource';
import DownloadedFileThumbnail from "../../components/DownloadedFileThumbnail";
import SearchBar from "../../components/SearchBar";
import changableTextStyles from "../../css/components/ChangableText.module.css";
import animeStyles from "../../css/pages/DownloadedAnime.module.css";
import styles from "../../css/pages/Episodes.module.css";
import { ReactComponent as DownloadIcon } from "../../icons/download.svg";
import { groupBy } from "../../utils/general";
import TorrentUtils, { SearchResult, Sources } from "../../utils/torrents";
import { AnimeInfoProps } from "../AnimeInfo";

export class DisplayEpisodes extends Component<AnimeInfoProps & { source: Sources }>{

    downloadedFromSeries: DownloadedItem[] = [];

    state: {
        episodes: SearchResult[],
        loading: boolean,
        chosenForDownload: number[],
        displayDownloadedOnly: boolean
    } = {
            episodes: [],
            loading: true,
            chosenForDownload: [],
            displayDownloadedOnly: false
        };

    componentDidMount() {
        this.loadEpisodes();
    }

    loadEpisodes() {
        this.searchAnime(this.props.anime, this.props.source).then(episodes => {
            this.setState({
                episodes,
                loading: false
            });
        });
    }

    searchDownloadedFromSeries() {
        this.downloadedFromSeries = Consts.DOWNLOADED_ITEMS.filter(item => {
            return !isNaN(item.animeEntry.malId!) && (item.animeEntry.malId === this.props.anime.malId ||
                (item.animeEntry.name!.match(/[a-zA-Z0-9\s]*/g) || []).join("") === (this.props.anime.name!.match(/[a-zA-Z0-9\s]*/g) || []).join(""))
        });
    }

    render() {
        this.searchDownloadedFromSeries();
        const grouped = DisplayEpisodes.groupByQuality(this.state.episodes),
            groupedBySeries = groupBy(this.state.episodes, ["episodeData", "seriesName"]),
            TooltipRange = createSliderWithTooltip(Range),
            chosenForDownload = this.chosenForDownload;
        if (this.state.loading)
            return (
                <div className="mx-auto" style={{ width: "fit-content", textAlign: "center" }}>
                    <div>Loading Episodes of {this.props.anime.name} from {Sources[this.props.source]}</div>
                    <Spinner animation="grow" />
                </div>
            )
        if (!this.state.episodes.length)
            return this.couldntFindEpisodesComponent;
        if (!groupedBySeries.length)
            return this.notSureAboutSeriesComponent(groupedBySeries);
        return [(
            grouped.length > 1 && (
                <div key={1} className="mb-3">
                    <TooltipRange max={grouped.length} min={1}
                        value={chosenForDownload}
                        onChange={chosenForDownload => this.setState({ chosenForDownload })} />
                    <Button onClick={() => this.confirmDownloadEpisodes(chosenForDownload)}>
                        Download Episode {chosenForDownload[0]} - {chosenForDownload[1]} ({chosenForDownload[1] - chosenForDownload[0] + 1} Episodes)?
                        </Button>
                    (In {Consts.QUALITY_PREFERENCE[0]}p, according to your quality preferences in the settings.)
                </div>
            )
        ), (
            <Container className={styles.grid} key={0}>
                {
                    grouped.map((episode, i) => {
                        return (
                            <Card key={i} className="m-1">
                                <Card.Header>
                                    <Card.Title className={episode.animeEntry.isUserInterested() ? (
                                        episode.seenThisEpisode() ? animeStyles.seenEpisode : animeStyles.notSeenEpisode
                                    ) : ""}>
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
                                                    const popover = (
                                                        <Popover id={"popover-basic-" + quality}>
                                                            <Popover.Title as="h3">
                                                                Download {episode.names[i]}:
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
                                                    );
                                                    return (
                                                        <OverlayTrigger
                                                            key={i}
                                                            trigger="focus"
                                                            placement="auto"
                                                            overlay={popover}>
                                                            <Button variant="outline-dark">{
                                                                `${quality}p${episode.episodeTypes[i] ? " - " + episode.episodeTypes[i] : ""}`
                                                            }</Button>
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
        )]
    }

    get chosenForDownload() {
        if (this.state.chosenForDownload.length)
            return this.state.chosenForDownload;
        return [1, DisplayEpisodes.groupByQuality(this.state.episodes).length]
    }

    downloadedItemOfEpisode(episode: SearchResult): DownloadedItem | undefined {
        return this.downloadedFromSeries.find(downloadedItem => {
            return downloadedItem.episodeData.episodeNumber === episode.episodeData.episodeNumber;
        });
    }

    static groupByQuality(episodes: SearchResult[]): Array<SearchResult & {
        episodeData: { qualities: number[] }, seedersArr: number[], leechersArr: number[], names: string[], episodeTypes: (string | undefined)[], links: {
            page: string,
            file: string,
            magnet: string
        }[]
    }> {
        return groupBy(episodes.map(ele => {
            (ele as any).asd = ele.episodeData.seriesName + ele.episodeData.episodeNumber;
            return ele;
        }), ['asd']).map(episodes => {
            let result: any = episodes[0];
            delete result.asd;
            episodes = episodes.sort((a, b) => b.episodeData.quality - a.episodeData.quality);
            result.episodeData.qualities = episodes.map(episode => episode.episodeData.quality);
            result.seedersArr = episodes.map(episode => episode.seeders);
            result.leechersArr = episodes.map(episode => episode.leechers);
            result.links = episodes.map(episode => episode.link);
            result.names = episodes.map(episode => episode.name);
            result.episodeTypes = episodes.map(ele => ele.episodeData.episodeType);
            return result;
        })
    }
    startDownload(magnetLink: string, episode: SearchResult) {
        TorrentManager.add({ magnetURL: magnetLink });
        (window as any).displayToast({
            title: "Download Successfully started",
            body: `Started downloading ${episode.episodeData.seriesName} Episode ${episode.episodeData.episodeNumber}.`
        });
    }
    confirmDownloadEpisodes([episodeStart, episodeEnd]: number[]) {
        let episodes = DisplayEpisodes.groupByQuality(this.state.episodes);
        episodes.slice(episodes.length - episodeEnd, episodes.length - episodeStart + 1).forEach(episode => {
            let qualityOfBiggestPriority = episode.episodeData.qualities.sort((a: number, b: number) => {
                a = Consts.QUALITY_PREFERENCE.indexOf([...Consts.QUALITY_PREFERENCE].sort((q1, q2) => Math.abs(q1 - a) - Math.abs(q2 - a))[0]);
                b = Consts.QUALITY_PREFERENCE.indexOf([...Consts.QUALITY_PREFERENCE].sort((q1, q2) => Math.abs(q1 - b) - Math.abs(q2 - b))[0]);
                return b - a;
            })[0],
                indexOfChosenQuality = episode.episodeData.qualities.indexOf(qualityOfBiggestPriority);
            this.startDownload(episode.links[indexOfChosenQuality].magnet, episode);
        });
    }
    async searchAnime(anime: AnimeEntry, source: Sources = Sources.Any, fetchAll = false): Promise<SearchResult[]> {
        let episodes = await TorrentUtils.search(anime, fetchAll, source);
        let groupedBySeries = groupBy(episodes, ['episodeData', 'seriesName']);
        if (groupedBySeries.length > 0)
            episodes = groupedBySeries.find(ele => {
                return anime.synonyms.has(ele[0].episodeData.seriesName);
            }) || episodes;
        return episodes.sort((a, b) => b.episodeData.episodeNumber - a.episodeData.episodeNumber);
    }
    userChoseAnime = (anime: AnimeEntry) => {
        this.props.anime.syncGet();
        this.props.anime.synonyms.add(anime.name!);
        this.props.anime.syncPut(true);
        this.loadEpisodes();
        this.setState({
            loading: false
        });
    };

    couldntFindEpisodesComponent = (
        <div className="mx-1 mt-3">
            <Modal.Dialog className={styles.modal}>
                <Modal.Header>
                    <Modal.Title>Couldn't Find any episodes for {this.props.anime.name} :(</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Try and search it:
            <SearchBar gotoAnimePageOnChoose={false} showImage={false} onItemClick={this.userChoseAnime.bind(this)}
                        onInputChange={e => this.searchAnime(new AnimeEntry({ name: (e.target as any).value }), this.props.source)
                            .then(results => e.setResults(results.map(ele => ele.animeEntry).filter((ele, i, arr) => arr.map(ele => ele.name).indexOf(ele.name) === i)))}
                        onInputClick={e => (e.target as any).value === "" && ((e.target as any).value = this.props.anime.name)} />
                </Modal.Body>
            </Modal.Dialog>
        </div>
    );

    notSureAboutSeriesComponent(groupedBySeries: SearchResult[][]) {
        const onChoose = (episodes: SearchResult[]) => {
            this.props.anime.syncGet();
            this.props.anime.synonyms.add(episodes[0].episodeData.seriesName);
            this.props.anime.syncPut(true);
            this.setState({
                episodes
            });
            (window as any).reloadPage();
        }
        return (
            <div className="mx-1 mt-3">
                <Modal.Dialog className={styles.modal}>
                    <Modal.Header>
                        <Modal.Title>Found {groupedBySeries.length} different series for {this.props.anime.name} :(</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            Please tell me which series is {this.props.anime.name} So I'll add it to the synonyms :)
                        </div>
                        {
                            groupedBySeries.map((episodes, i) => {
                                return (
                                    <div key={i} className={changableTextStyles.textWrapper} onClick={() => onChoose(episodes)}>{episodes[0].episodeData.seriesName}</div>
                                )
                            })
                        }
                    </Modal.Body>
                </Modal.Dialog>
            </div>
        )
    }
}
export default class Episodes extends Component<AnimeInfoProps>{
    render() {
        return (
            <div className="mt-4">
                <ChooseSource render={source => (
                    <div>
                        {/* <span className="float-right f-right ">Display downloaded episodes only: <Form.Check type="switch" /></span> */}
                        <DisplayEpisodes source={source} {...this.props} />
                    </div>
                )}>
                </ChooseSource>
            </div>
        )
    }
}