import React, { Component } from "react";
import { Jumbotron } from "react-bootstrap";
import Consts from "../../classes/Consts";
import DownloadedItem from "../../classes/DownloadedItem";
import MovableComponent from "../../components/MovableComponent";
import VideoPlayer from "../../components/VideoPlayer";
import styles from "../../css/pages/WatchPlayer.module.css";
import { Confirm } from "../../utils/general";
import MALUtils from "../../utils/MAL";
import AnimeInfo from "../AnimeInfo";

export default class Watch extends Component<{ downloadedItem: DownloadedItem }> {

    static UPDATE_ANIME_PROGRESS_THRESHOLD = 0.9;
    wantsToUpdateInMAL = true;

    state: {
        showingVideo: boolean,
        videoOpacity: number,
        showAnimePage: boolean,
        preventScroll: boolean
    } = {
            showingVideo: true,
            videoOpacity: 1,
            showAnimePage: false,
            preventScroll: false
        };

    removingVideo = false;
    movingElement = React.createRef<MovableComponent>();
    checkForProgressInterval = 0;

    componentDidMount() {
        window.addEventListener("webkitfullscreenchange", this.bindedFullScreenListener);
        document.addEventListener("pointerlockchange", this.bindedPointerLockListener);
        if (!this.props.downloadedItem.animeEntry || !this.props.downloadedItem.animeEntry.malId ||
            (this.props.downloadedItem.animeEntry.myWatchedEpisodes || 0) >= this.props.downloadedItem.episodeData.episodeNumber) return;
        this.props.downloadedItem.animeEntry.syncGet();
        const progressFromLocalStorage = () => {
            let obj = JSON.parse(localStorage.getItem("videoLastTime") || "{}"),
                relevant = obj[this.props.downloadedItem.fileName];
            if (relevant)
                return relevant[1].progress;
            return 0;
        }
        this.checkForProgressInterval = setInterval(() => {
            let current = progressFromLocalStorage();
            if (current <= Watch.UPDATE_ANIME_PROGRESS_THRESHOLD)
                this.wantsToUpdateInMAL = true;
            if (this.wantsToUpdateInMAL && current > Watch.UPDATE_ANIME_PROGRESS_THRESHOLD) {
                this.wantsToUpdateInMAL = false;
                Confirm(`Do you want to update ${this.props.downloadedItem.fileName} in MAL?`, (ok: boolean) => {
                    if (ok) {
                        MALUtils.UpdateWatchedEpisode(this.props.downloadedItem).then(ok => {
                            ok ? (window as any).displayToast({
                                title: "Anime Updated Successfully",
                                body: `Successfully updated ${this.props.downloadedItem.fileName} in MAL!`
                            }) : (window as any).displayToast({
                                title: "Failed updating Anime",
                                body: `Failed updating ${this.props.downloadedItem.fileName} in MAL! Try logging in again!`
                            });
                            (window as any).reloadPage();
                        })
                    }
                })
            }
        }, 500) as unknown as number;
    }

    componentWillUnmount() {
        window.removeEventListener("webkitfullscreenchange", this.bindedFullScreenListener);
        document.removeEventListener("pointerlockchange", this.bindedPointerLockListener);
        clearInterval(this.checkForProgressInterval);
    }

    fullScreenListener() {
        this.setState({
            showAnimePage: document.fullscreenElement !== null
        });
    }

    bindedFullScreenListener = this.fullScreenListener.bind(this);

    pointerLockListener() {
        this.setState({
            preventScroll: document.pointerLockElement !== null
        });
    }

    bindedPointerLockListener = this.pointerLockListener.bind(this);

    componentDidUpdate(prevProps: any) {
        if (this.removingVideo)
            return this.removingVideo = false;
        if (!this.state.showingVideo && !this.removingVideo) {
            this.setState({
                showingVideo: true
            });
        }
        if (prevProps.downloadedItem.fileName !== this.props.downloadedItem.fileName){
            this.wantsToUpdateInMAL = true;
            console.log("changed video from", prevProps.downloadedItem, "to", this.props.downloadedItem)
        }
    };
    render() {
        const hide = (e: React.MouseEvent) => {
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
                (window as any).setAppState({
                    showVideo: false
                });
            }, 500);
        };
        let styleObject: any = { transition: "opacity .5s", opacity: this.state.videoOpacity, position: "fixed", zIndex: 7 };
        for (let key in Consts.WATCH_PLAYER_SIZE)
            (styleObject as any)[key] = Consts.WATCH_PLAYER_SIZE[key];
        if (!this.state.showingVideo)
            return null;
        return (
            <MovableComponent
                onResizeFinish={this.onMoveFinish.bind(this)}
                onDragFinish={this.onMoveFinish.bind(this)}
                ref={this.movingElement}
                style={styleObject}
                resizable={true}>
                <span
                    style={{ position: "absolute", zIndex: 2, right: 0, cursor: "pointer" }}
                    className="mr-2 mt-1 p-1" onClick={hide}>
                    <span aria-hidden="true">×</span>
                </span>
                <VideoPlayer
                    style={{ position: this.state.showAnimePage ? "fixed" : "initial", overflowY: this.state.preventScroll ? "hidden" : "auto" }}
                    downloadedItem={this.props.downloadedItem}
                    as={Jumbotron}
                    className={styles.container}
                    src={(this.props.downloadedItem as any).videoSrc || Consts.FILE_URL_PROTOCOL + this.props.downloadedItem.absolutePath}
                    name={this.props.downloadedItem.fileName}>
                    {
                        this.props.downloadedItem.animeEntry && this.props.downloadedItem.animeEntry.malId && (
                            <AnimeInfo
                                className={(this.state.showAnimePage ? styles.animeInfo : "d-none") + " mx-5 px-5 mt-5"}
                                key={this.props.downloadedItem.animeEntry.malId}
                                anime={this.props.downloadedItem.animeEntry} />
                        )
                    }
                </VideoPlayer>
            </MovableComponent>
        )
    }
    onMoveFinish(_: any, didMoveInGesture: boolean) {
        if (didMoveInGesture && this.movingElement.current && this.movingElement.current.element.current) {
            let rect = (this.movingElement.current.element.current.getBoundingClientRect() as DOMRect).toJSON();
            delete rect.bottom;
            delete rect.right;
            delete rect.x;
            delete rect.y;
            Consts.setWatchPlayerSize(rect);
        }
    }
}