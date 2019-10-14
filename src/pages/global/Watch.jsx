import React, { Component } from "react";
import MALUtils from "../../utils/MAL";
import MovableComponent from "../../components/MovableComponent";
import { Confirm } from "../../utils/general";
import Consts from "../../classes/Consts";
import styles from "../../css/pages/WatchPlayer.module.css";
import VideoPlayer from "../../components/VideoPlayer";

export default class Watch extends Component {

    static UPDATE_ANIME_PROGRESS_THRESHOLD = 0.9;

    state = {
        showingVideo: true,
        videoOpacity: 1
    };

    removingVideo = false;
    movingElement = React.createRef();

    componentDidMount() {
        if (!this.props.downloadedItem.animeEntry || !this.props.downloadedItem.animeEntry.malId ||
            this.props.downloadedItem.animeEntry.myWatchedEpisodes >= this.props.downloadedItem.episodeData.episodeNumber) return;
        const progressFromLocalStorage = () => {
            let obj = JSON.parse(localStorage.getItem("videoLastTime")),
                relevant = obj[this.props.downloadedItem.fileName];
            if (relevant)
                return relevant[1].progress;
            return 0;
        }
        let lastLocalStorageValue = progressFromLocalStorage(),
            finishEpisodeListener = setInterval(() => {
                let current = progressFromLocalStorage();
                if (current !== lastLocalStorageValue) {
                    lastLocalStorageValue = current;
                    if (current > Watch.UPDATE_ANIME_PROGRESS_THRESHOLD) {
                        clearInterval(finishEpisodeListener);
                        Confirm(`Do you want to update ${this.props.downloadedItem.fileName} in MAL?`, ok => {
                            if (ok) {
                                MALUtils.UpdateWatchedEpisode(this.props.downloadedItem).then(ok => {
                                    ok ? window.displayToast({
                                        title: "Anime Updated Successfully",
                                        body: `Successfully updated ${this.props.downloadedItem.fileName} in MAL!`
                                    }) : window.displayToast({
                                        title: "Failed updaating Anime",
                                        body: `Failed updating ${this.props.downloadedItem.fileName} in MAL!`
                                    });
                                })
                            }
                        })
                    }
                }
            }, 500);
    }

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
                window.setAppState({
                    showVideo: false
                });
            }, 500);
        };
        let styleObject = { transition: "opacity .5s", opacity: this.state.videoOpacity };
        for (let key in Consts.WATCH_PLAYER_SIZE)
            styleObject[key] = Consts.WATCH_PLAYER_SIZE[key];
        if (!this.state.showingVideo)
            return null;
        return (
            <MovableComponent
                style={styleObject}
                className={styles.container}
                onResizeFinish={this.onResizeFinish.bind(this)}
                ref={this.movingElement}
                resizable={true}>
                <span
                    style={{ position: "absolute", zIndex: 1, right: 0, cursor: "pointer" }}
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
}