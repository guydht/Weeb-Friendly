import React, { Component } from "react";
import { Button, ButtonGroup, Col, Container, ListGroup, OverlayTrigger, ProgressBar, Row, Tooltip } from "react-bootstrap";
import { Torrent } from "webtorrent";
import TorrentManager from "../../classes/TorrentManager";
import CloseButton from "../../components/CloseButton";
import MovableComponent from "../../components/MovableComponent";
import styles from "../../css/pages/DownloadManager.module.css";
import Consts from "../../classes/Consts";

export default class DownloadManager extends Component {

    state: { torrents: Torrent[], hideFlag: boolean } = {
        torrents: TorrentManager.getAll(),
        hideFlag: false
    };

    container = React.createRef<any>();

    componentDidMount() {
        let updatingFlag = false;
        const updateState = () => {
            if (updatingFlag) return;
            updatingFlag = true;
            setTimeout(() => {
                this.setState({ torrents: TorrentManager.getAll() });
                updatingFlag = false;
            }, 1000);
        };
        TorrentManager.addEventListener(TorrentManager.Listener.addedTorrent, updateState);
        TorrentManager.addEventListener(TorrentManager.Listener.removedTorrent, updateState);
        TorrentManager.addEventListener(TorrentManager.Listener.updatedTorrent, updateState);
    };
    render() {
        const hide = () => {
            this.container.current!.style.transform = "scaleY(0)";
            this.setState({
                hideFlag: true
            });
        },
            show = () => {
                this.container.current!.style.transform = "scaleY(1)";
                this.setState({
                    hideFlag: false
                });
            };
        if (!this.state.torrents.length)
            return null;
        this.state.torrents.sort((a, b) => a.name && b.name ? a.name.localeCompare(b.name) : 0);
        return (
            <MovableComponent
                style={{ position: "fixed", top: 0, left: 10, height: this.state.hideFlag ? 0 : "auto", zIndex: 2029 }}>
                <span
                    onPointerEnter={show}
                    style={{ position: "absolute" }}>
                    View Current Downloads
                </span>
                <Container
                    ref={this.container}
                    className="p-0"
                    style={{ zIndex: this.state.hideFlag ? -1 : 999, transition: "transform 0.5s", overflow: "hidden", transform: "scaleY(1)", transformOrigin: '0 0' }}>
                    <CloseButton onClick={hide} className="mr-2 mt-1 p-1" />
                    <ListGroup className={styles.grid + " " + styles[`grid-template-${(Math.floor(this.state.torrents.length / 4) + 1)}`]}>
                        {
                            this.state.torrents.map(torrent => {
                                if (!torrent.name || !torrent.magnetURI) return null;
                                return (
                                    <ListGroup.Item key={torrent.magnetURI}>
                                        <OverlayTrigger trigger="hover" overlay={
                                            <Tooltip id="tooltip-auto" style={{ zIndex: 9999 }}>
                                                Renamed to: "{(torrent as any).torrentName}"
                                            </Tooltip>
                                        } placement="auto">
                                            <h5>
                                                {torrent.name}
                                            </h5>
                                        </OverlayTrigger>
                                        <Row>
                                            <Col>
                                                <small>
                                                    {downloadSpeedText(Number(torrent.downloadSpeed.toPrecision(3)))}
                                                </small>
                                            </Col>
                                            <Col>
                                                <small>
                                                    Peers: {torrent.numPeers}
                                                </small>
                                            </Col>
                                            <Col>
                                                <ButtonGroup>
                                                    <Button onClick={() => torrent.paused ? this.resumeTorrent(torrent) : this.pauseTorrent(torrent)}>
                                                        {torrent.paused ? "Resume" : "Pause"}
                                                    </Button>
                                                    <Button onClick={() => this.playTorrent(torrent)}>
                                                        Play Torrent
                                                </Button>
                                                    <Button onClick={() => this.removeTorrent(torrent)}>
                                                        Cancel Torrent
                                                </Button>
                                                </ButtonGroup>
                                            </Col>
                                        </Row>
                                        <Row className="mt-2">
                                            <ProgressBar style={{ width: "100%" }}
                                                now={torrent.progress * 100}
                                                label={`${Number((torrent.progress * 100).toPrecision(3))}% / ${downloadSizeText(torrent.length)}`} />
                                        </Row>
                                    </ListGroup.Item>
                                )
                            })
                        }
                    </ListGroup>
                </Container>
            </MovableComponent>
        )
    }
    removeTorrent(torrent: Torrent) {
        TorrentManager.remove(torrent);
    }
    pauseTorrent(torrent: Torrent) {
        TorrentManager.pause(torrent);
    }
    resumeTorrent(torrent: Torrent) {
        TorrentManager.resume(torrent);
    }
    currentServers = new Set();
    playTorrent(torrent: Torrent) {
        if (!torrent.files.length) return (window as any).displayToast({ title: "Couldn't start playnig torrent", body: "Can't find downloaded files!" })
        let url = Consts.FILE_URL_PROTOCOL + torrent.path + "/" + torrent.files[0].path;
        (window as any).setAppState({
            showVideo: true,
            videoItem: {
                videoSrc: url,
                fileName: (torrent as any).torrentName
            }
        });
    }
}
function downloadSizeText(bytes: number): string {
    if (bytes > 1000000000)
        return `${bytes / 1000000000} GB`;
    if (bytes > 1000000)
        return `${bytes / 1000000} MB`;
    if (bytes > 1000)
        return `${bytes / 1000} KB`;
    return `${bytes || 0} B`;
}
function downloadSpeedText(bytesPerSecond: number): string {
    return downloadSizeText(bytesPerSecond) + "/s";
}