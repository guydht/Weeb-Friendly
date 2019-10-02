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
    movingElement = React.createRef();
    componentDidUpdate() {
        if (this.removingVideo)
            return this.removingVideo = false;
        if (!this.state.showingVideo && !this.removingVideo) {
            this.setState({
                showingVideo: true
            });
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
        let styleObject = { transition: "opacity .5s", opacity: this.state.videoOpacity, display: this.state.showingVideo ? "" : "none" };
        for (let key in Consts.WATCH_PLAYER_SIZE)
            styleObject[key] = Consts.WATCH_PLAYER_SIZE[key];
        return (
            <MovableComponent
                style={styleObject}
                className={styles.container}
                onDragFinish={this.onDragFinish.bind(this)}
                onResizeFinish={this.onResizeFinish.bind(this)}
                ref={this.movingElement}
                resizable={true}>
                <span
                    style={{ position: "relative", zIndex: 1, float: "right", cursor: "pointer" }}
                    className="mr-2 mt-1 p-1" onClick={hide}>
                    <span aria-hidden="true">×</span>
                </span>
                <VideoPlayer
                    style={{ zIndex: 0 }}
                    src={this.props.downloadedItem.videoSrc || Consts.FILE_URL_PROTOCOL + this.props.downloadedItem.absolutePath}
                    name={this.props.downloadedItem.fileName} />
            </MovableComponent>
        )
    }
    onResizeFinish(_, didMoveInGesture) {
        if (didMoveInGesture && this.movingElement.current && this.movingElement.current.element.current) {
            let rect = this.movingElement.current.element.current.getBoundingClientRect().toJSON();
            delete rect.bottom;
            delete rect.right;
            delete rect.x;
            delete rect.y;
            Consts.setWatchPlayerSize(rect);
        }
    }
    onDragFinish(e, didMoveInGesture) {
        if (didMoveInGesture) {
            let video = document.querySelector("video"),
                pausedStatus = video.paused;
            let waitInterval = waitFor(() => video.paused !== pausedStatus, () => pausedStatus ? video.pause() : video.play(), 10);
            setTimeout(() => clearInterval(waitInterval), 500);
            this.onResizeFinish(e, didMoveInGesture);
        }
    }
}