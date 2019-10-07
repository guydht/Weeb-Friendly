import React, { Component } from "react";
import { Button, ButtonGroup, Col, Container, ListGroup, ProgressBar, Row } from "react-bootstrap";
import { Torrent } from "webtorrent";
import MovableComponent from "../classes/MovableComponent";
import TorrentManager from "../classes/TorrentManager";

export default class DownloadManager extends Component {

    state: { torrents: Torrent[], hideFlag: boolean } = {
        torrents: TorrentManager.getAll(),
        hideFlag: false
    };

    container = React.createRef<any>();

    componentDidMount() {
        const updateState = () => this.setState({ torrents: TorrentManager.getAll() });
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
        return (
            <MovableComponent
                style={{ position: "fixed", top: 0, left: 10, height: this.state.hideFlag ? 0 : "auto", zIndex: 9 }}>
                <span
                    onPointerEnter={show}
                    style={{ position: "absolute" }}>
                    View Current Downloads
                </span>
                <Container
                    ref={this.container}
                    className="p-0"
                    style={{ zIndex: this.state.hideFlag ? -1 : 999, transition: "transform 0.5s", overflow: "hidden", transform: "scaleY(1)", transformOrigin: '0 0' }}>
                    <span
                        style={{ position: "relative", zIndex: 1, float: "right", cursor: "pointer" }}
                        className="mr-2 mt-1 p-1" onClick={hide}>
                        <span aria-hidden="true">×</span>
                    </span>
                    <ListGroup>
                        {
                            this.state.torrents.map(torrent => {
                                return (
                                    <ListGroup.Item key={torrent.name}>
                                        <h5>
                                            {torrent.name}
                                        </h5>
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
                                            <ProgressBar style={{ width: "100%" }} now={torrent.progress * 100} label={`${Number((torrent.progress * 100).toPrecision(3))}%`} />
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
        let url = "";
        if (torrent.paused)
            url = torrent.files[0].path;
        else {
            let server = torrent.createServer();
            server.listen(0);
            let info = server.address(),
                maybePort = (info as any).port;
            url = `http://localhost:${maybePort}/0/${torrent.files[0].name}`;
        }
        (window as any).setAppState({
            showVideo: true,
            videoItem: {
                videoSrc: url,
                fileName: (torrent as any).torrentName
            }
        });
    }
}
function downloadSpeedText(bytesPerSecond: number): string {
    if (bytesPerSecond > 1000000)
        return `${bytesPerSecond / 1000000} MB/s`;
    if (bytesPerSecond > 1000)
        return `${bytesPerSecond / 1000} KB/s`;
    return `${bytesPerSecond} B/s`
}