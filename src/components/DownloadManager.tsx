import React, { Component } from "react";
import { Button, ButtonGroup, Col, ListGroup, ProgressBar, Row } from "react-bootstrap";
import { Torrent } from "webtorrent";
import MovableComponent from "../classes/MovableComponent";
import TorrentManager from "../classes/TorrentManager";

export default class DownloadManager extends Component {

    state: { torrents: Torrent[] } = {
        torrents: TorrentManager.getAll()
    };

    componentDidMount() {
        setInterval(() => {
            this.setState({
                torrents: TorrentManager.getAll()
            });
        }, 100);
    };
    render() {
        return (
            <MovableComponent
                style={{ position: "fixed", top: 0, left: 10, zIndex: 999 }}
                resizable={true}>
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
        if(!torrent.files.length) return (window as any).displayToast({title: "Couldn't start playnig torrent", body: "Can't find downloaded files!"})
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
        console.log(url);
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