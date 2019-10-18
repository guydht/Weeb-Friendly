import { AnimeById } from 'jikants/dist/src/interfaces/anime/ById';
import { createSliderWithTooltip, Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import React, { Component } from "react";
import { Button, ButtonGroup, Card, Col, Container, Modal, Nav, OverlayTrigger, Popover, Row, Tab } from "react-bootstrap";
//@ts-ignore
import { LazyLoadComponent } from "react-lazy-load-image-component";
import AnimeEntry from "../../classes/AnimeEntry";
import Consts from "../../classes/Consts";
import DownloadedItem from "../../classes/DownloadedItem";
import TorrentManager from "../../classes/TorrentManager";
import DownloadedFileThumbnail from "../../components/DownloadedFileThumbnail";
import SearchBar from "../../components/SearchBar";
import changableTextStyles from "../../css/components/ChangableText.module.css";
import styles from "../../css/pages/Episodes.module.css";
import { ReactComponent as DownloadIcon } from "../../icons/download.svg";
import { groupBy, walkDir } from "../../utils/general";
import TorrentUtils, { SearchResult, Sources } from "../../utils/torrents";
import { AnimeInfoProps } from "../AnimeInfo";


export class DisplayEpisodes extends Component<AnimeInfoProps & { episodes: SearchResult[] }> {

    downloadedFromSeries: DownloadedItem[] = [];

    state = {
        chosenForDownload: []
    }

    searchDownloadedFromSeries() {
        this.downloadedFromSeries = walkDir(Consts.DOWNLOADS_FOLDER).filter(item => {
            return item.animeEntry.malId === this.props.anime.malId ||
                (item.animeEntry.name.match(/[a-zA-Z0-9\s]*/g) || []).join("") === (this.props.anime.name!.match(/[a-zA-Z0-9\s]*/g) || []).join("")
        });
    }

    render() {
        this.searchDownloadedFromSeries();
        const grouped = DisplayEpisodes.groupByQuality(this.props.episodes),
            TooltipRange = createSliderWithTooltip(Range),
            chosenForDownload = this.chosenForDownload;
        return [(
            grouped.length > 1 && (
                <div key={1} className="mb-3">
                    <TooltipRange max={grouped.length} min={1}
                        value={chosenForDownload}
                        onChange={chosenForDownload => this.setState({ chosenForDownload })} />
                    <Button onClick={() => this.confirmDownloadEpisodes(chosenForDownload)}>
                        Download Episode {chosenForDownload[0]} - {chosenForDownload[1]} ({chosenForDownload[1] - chosenForDownload[0] + 1} Episodes)?
                        </Button>
                    (In highest available Quality)
                </div>
            )
        ), (
            <Container className={styles.grid} key={0}>
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
        return [1, DisplayEpisodes.groupByQuality(this.props.episodes).length]
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
        return groupBy(episodes.map(ele => { return { ...ele, asd: ele.episodeData.seriesName + ele.episodeData.episodeNumber } }), ['asd']).map(episodes => {
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
        TorrentManager.add({ magnetURL: magnetLink, name: `${episode.episodeData.seriesName} Episode ${episode.episodeData.episodeNumber}` });
        (window as any).displayToast({
            title: "Download Successfully started",
            body: `Started downloading ${episode.episodeData.seriesName} Episode ${episode.episodeData.episodeNumber}.`
        });
    }
    confirmDownloadEpisodes([episodeStart, episodeEnd]: number[]) {
        let episodes = DisplayEpisodes.groupByQuality(this.props.episodes);
        episodes.slice(episodeStart - 1, episodeEnd).forEach(episode => {
            this.startDownload(episode.links.slice(-1)[0].magnet, episode);
        });
    }
}

export default class Episodes extends Component<AnimeInfoProps & { episodes: SearchResult[], loading: boolean, chosenForDownload: number[] }> {
    state: {
        anime: AnimeEntry,
        info: AnimeById,
        episodes: Record<Sources, SearchResult[]>,
        loading: Record<Sources, boolean>,
        currentSource: Sources
    } = {
            anime: this.props.anime,
            info: this.props.info,
            episodes: Object.fromEntries(Object.values(Sources).map(source => [source, []])) as { [source in Sources]: [] },
            loading: Object.fromEntries(Object.values(Sources).map(source => [source, true])) as { [source in Sources]: boolean },
            currentSource: Consts.SOURCE_PREFERENCE[0]
        };

    componentDidMount() {
        let source = this.state.currentSource;
        this.searchAnime(this.state.anime, source).then(episodes => {
            let episodeState = this.state.episodes,
                loading = this.state.loading;
            episodeState[source] = episodes.sort((a, b) => b.episodeData.episodeNumber - a.episodeData.episodeNumber);
            loading[source] = false;
            this.setState({
                episodes: episodeState,
                loading
            });
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
    changeSource(source: Sources) {
        if (source === this.state.currentSource || this.state.episodes[source].length) return;
        let loading = this.state.loading;
        loading[source] = true;
        this.setState({
            loading
        });
        this.searchAnime(this.state.anime, source).then(episodes => {
            let episodeState = this.state.episodes,
                loading = this.state.loading;
            episodeState[source] = episodes.sort((a, b) => b.episodeData.episodeNumber - a.episodeData.episodeNumber);
            loading[source] = false
            this.setState({
                episodes: episodeState,
                loading
            });
        });
    }


    userChoseAnime = (anime: AnimeEntry) => {
        this.props.anime.synonyms.add(anime.name!);
        this.props.anime.sync();
        this.componentDidMount();
        let loading = this.state.loading;
        loading[this.state.currentSource] = false;
        this.setState({
            loading
        });
    };

    couldntFindEpisodesComponent = (
        <div className="mx-1 mt-3">
            <Modal.Dialog className={styles.modal}>
                <Modal.Header>
                    <Modal.Title>Couldn't Find any episodes for {this.state.anime.name} :(</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Try and search it:
            <SearchBar gotoAnimePageOnChoose={false} showImage={false} onItemClick={this.userChoseAnime.bind(this)}
                        onInputChange={e => this.searchAnime(new AnimeEntry({ name: (e.target as any).value }), this.state.currentSource)
                            .then(results => e.setResults(results.map(ele => ele.animeEntry).filter((ele, i, arr) => arr.map(ele => ele.name).indexOf(ele.name) === i)))}
                        onInputClick={e => (e.target as any).value === "" && ((e.target as any).value = this.state.anime.name)} />
                </Modal.Body>
            </Modal.Dialog>
        </div>
    );

    notSureAboutSeriesCcomponent(groupedBySeries: SearchResult[][], source: Sources) {
        const onChoose = (episodes: SearchResult[]) => {
            this.state.anime.sync();
            this.state.anime.synonyms.add(episodes[0].episodeData.seriesName);
            this.state.anime.sync(true);
            // eslint-disable-next-line
            this.state.episodes[source] = episodes;
            this.setState({
                anime: this.state.anime,
                episodes: this.state.episodes
            });
            (window as any).reloadPage();
        }
        return (
            <div className="mx-1 mt-3">
                <Modal.Dialog className={styles.modal}>
                    <Modal.Header>
                        <Modal.Title>Found {groupedBySeries.length} different series for {this.state.anime.name} :(</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            Please tell me which series is {this.state.anime.name} So I'll add it to the synonyms :)
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

    render() {
        return (
            <div className="mx-1 mt-3">
                <Tab.Container defaultActiveKey={Consts.SOURCE_PREFERENCE[0]}>
                    <Nav variant="pills" defaultActiveKey={this.state.currentSource} className="mb-3">
                        {
                            Consts.SOURCE_PREFERENCE_ENTRIES.map(([sourceName, source]) => {
                                return (
                                    <Nav.Item key={source} onClick={() => this.changeSource(source)}>
                                        <Nav.Link eventKey={source}>{sourceName}</Nav.Link>
                                    </Nav.Item>
                                );
                            })
                        }
                    </Nav>
                    <Tab.Content>
                        {
                            Consts.SOURCE_PREFERENCE.map(source => {
                                let episodes = this.state.episodes[source],
                                    loading = this.state.loading[source],
                                    groupedBySeries = groupBy(episodes, ["episodeData", "seriesName"]);
                                return (
                                    <Tab.Pane eventKey={source} key={source}>
                                        <LazyLoadComponent>
                                            {
                                                loading ? "" :
                                                    episodes.length ?
                                                        groupedBySeries.length === 1 ?
                                                            <DisplayEpisodes {...this.props} episodes={episodes} />
                                                            : this.notSureAboutSeriesCcomponent(groupedBySeries, source)
                                                        : this.couldntFindEpisodesComponent
                                            }
                                        </LazyLoadComponent>
                                    </Tab.Pane>
                                )
                            })
                        }
                    </Tab.Content>
                </Tab.Container >
            </div>
        );
    }
}