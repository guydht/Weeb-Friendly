import React, { Component } from "react";
import { waitFor } from "../classes/jifa";
import MovableComponent from "../classes/MovableComponent";
import Consts from "../consts";
import styles from "./css/WatchPlayer.module.css";
import VideoPlayer from "./VideoPlayer";

export default class Watch extends Component {

    state = {
        showingVideo: true,
        videoOpacity: 1
    };
    removingVideo = false;
    componentDidUpdate() {
        if (this.removingVideo)
            return this.removingVideo = false;
        if (!this.state.showingVideo && !this.removingVideo) {
            this.setState({
                showingVideo: true
            })
        }
    };
    render() {
        const hide = e => {
            this.setState({
                videoOpacity: 0
            });
            e.stopPropagation();
            setTimeout(() => {
                this.removingVideo = true;
                this.setState({
                    showingVideo: false,
                    videoOpacity: 1
                });
            }, 500);
        };
        return (
            <MovableComponent
                style={{ transition: "opacity .5s", opacity: this.state.videoOpacity, display: this.state.showingVideo ? "" : "none" }}
                className={styles.container}
                onDragFinish={this.onDragFinish}
                resizable={true}>
                <span
                    style={{ position: "relative", zIndex: 1, float: "right", cursor: "pointer" }}
                    className="mr-2 mt-1 p-1" onClick={hide}>
                    <span aria-hidden="true">×</span>
                </span>
                <VideoPlayer
                    style={{ zIndex: 0 }}
                    src={Consts.FILE_URL_PROTOCOL + this.props.downloadedItem.absolutePath} name={this.props.downloadedItem.fileName} />
            </MovableComponent>
        )
    }
    onDragFinish(e, didMoveInGesture) {
        if (didMoveInGesture) {
            let target = e.target,
                pausedStatus = target.paused;
            let waitInterval = waitFor(() => target.paused !== pausedStatus, () => pausedStatus ? target.pause() : target.play(), 10);
            setTimeout(() => clearInterval(waitInterval), 500);
        }
    }
}