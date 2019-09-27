import React, { Component } from "react";
import MovableComponent from "../classes/MovableComponent";
import { waitFor } from "../classes/jifa";
import Consts from "../consts";
import styles from "./css/WatchPlayer.module.css";
import VideoPlayer from "./VideoPlayer";

export default class Watch extends Component {

    render() {
        return (
            <MovableComponent
                className={styles.container}
                onDragFinish={this.onDragFinish}
                resizable={true}>
                <VideoPlayer src={Consts.FILE_URL_PROTOCOL + this.props.downloadedItem.absolutePath} name={this.props.downloadedItem.fileName} />
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