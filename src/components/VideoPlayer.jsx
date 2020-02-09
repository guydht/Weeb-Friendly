import React, { Component } from "react";
import ReactDom from "react-dom";
import { ReactComponent as NextEpisodeIcon } from "../assets/NextIcon.svg";
import Consts from "../classes/Consts";
import styles from "../css/components/VideoPlayer.module.css";
import { asd, waitFor } from "../jsHelpers/jifa";
import { handleFile } from "../jsHelpers/subtitleParsers/mkvExtract";
import { SubtitlesOctopus } from "../jsHelpers/subtitleParsers/Octopus";
import { DisplayDownloadedAnime } from "../pages/home/DownloadedAnime";
import { CacheLocalStorage, groupBy } from "../utils/general";
import { renderVideo } from "./VideoThumbnail";

class AdjacentEpisodeButton extends Component {

    static SIZE_PERCENTAGE_OF_CONTAINER = .5;

    thumbnailCanvas = React.createRef();
    isPrev = null;

    state = {
        showThumbnail: false
    }

    componentDidMount() {
        renderVideo({
            videoUrl: this.props.src
        }).then(canvasWithData => {
            waitFor(() => this.thumbnailCanvas.current, () => {
                const canvasToDrawTo = this.thumbnailCanvas.current;
                canvasToDrawTo.getContext("2d").drawImage(canvasWithData, 0, 0);
            });
        });
    }

    iconRef = React.createRef();

    render() {
        const hideThumbnail = () => this.setState({ showThumbnail: false }),
            showThumbnail = () => this.setState({ showThumbnail: true }),
            props = { ...this.props };
        delete props.src;
        delete props.videoContainer;
        delete props.title;
        delete props.thumbnailMarginLeft;
        delete props.children;
        return (
            <div className={styles.nextEpisodeIcon} {...props}>
                <NextEpisodeIcon style={{ transform: this.isPrev ? "rotate(180deg)" : "" }}
                    onMouseEnter={showThumbnail} onMouseLeave={hideThumbnail} ref={this.iconRef} />
                <div className={styles.thumbnailCanvasContainer + (this.state.showThumbnail ? "" : ` ${styles.hidden}`)} style={{
                    height: this.props.videoContainer.clientHeight * (NextEpisodeButton.SIZE_PERCENTAGE_OF_CONTAINER / 2),
                    width: this.props.videoContainer.clientWidth * NextEpisodeButton.SIZE_PERCENTAGE_OF_CONTAINER,
                    marginLeft: this.props.thumbnailMarginLeft
                }}
                    onMouseEnter={showThumbnail} onMouseLeave={hideThumbnail}>
                    <canvas ref={this.thumbnailCanvas} className={styles.thumbnailCanvas} />
                    <div className={styles.thumbnailCanvasTitle}>
                        <strong>
                            {this.isPrev ? "Prev (Shift + B)" : "Next (Shift + N)"}
                        </strong>
                        <span>
                            {this.props.title}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

}

class NextEpisodeButton extends AdjacentEpisodeButton {
    isPrev = false
}

class PrevEpisodeButton extends AdjacentEpisodeButton {
    isPrev = true
}

export default class VideoPlayer extends Component {

    videoWrapper = React.createRef();
    subtitlesOctopus;
    videoHandler;

    state = {
        displayFinishScreenEntries: []
    }

    componentDidMount() {
        this.setupVideo();
    }

    setupVideo() {
        const container = this.videoWrapper.current,
            [prevEpisode, nextEpisode] = this.getAdjacentDownloadedItems(),
            handleKeyDown = e => {
                if (e.shiftKey && !e.ctrlKey && !e.altKey && e.code === "KeyN" && nextEpisode) 
                    nextEpisode.startPlaying();
                else if (e.shiftKey && !e.ctrlKey && !e.altKey && e.code === "KeyP" && prevEpisode) 
                    prevEpisode.startPlaying();
            };
        document.body.addEventListener("keydown", handleKeyDown);
        this.videoHandler = asd(this.props.name, container, this.props.src);
        this.videoHandler.handleKeyDown = handleKeyDown;
        if (nextEpisode)
            ReactDom.render(<NextEpisodeButton thumbnailMarginLeft={prevEpisode ? -60 : -25}
                onClick={() => nextEpisode.startPlaying()}
                videoContainer={container} title={nextEpisode.episodeName} src={Consts.FILE_URL_PROTOCOL + nextEpisode.absolutePath} />,
                container.querySelector("#guydhtNextEpisodeButton"));
        if (prevEpisode)
            ReactDom.render(<PrevEpisodeButton thumbnailMarginLeft={10}
                onClick={() => prevEpisode.startPlaying()}
                videoContainer={container} title={prevEpisode.episodeName} src={Consts.FILE_URL_PROTOCOL + prevEpisode.absolutePath} />,
                container.querySelector("#guydhtPrevEpisodeButton"));
        let handleSubs = async subFiles => {
            const subtitles = [],
                subtitleNames = [],
                fonts = [];
            let chosenSubtitleIndex = 0;
            for (let f of subFiles) {
                if ((f.name.endsWith(".ass") || f.name.endsWith(".ssa"))) {
                    subtitles.push(f.data);
                    subtitleNames.push(f.title);
                }
                else if (f.name.endsWith(".ttf"))
                    fonts.push(URL.createObjectURL(new Blob([f.data])));
            }
            var options = {
                video: container.querySelector("video"),
                subContent: subtitles[0],
                fonts: fonts,
                workerUrl: "./OctopusWorker.js"
            };
            container.setSubtitleTracksNames(subtitleNames);
            container.addEventListener("guydhtChangeSubs", event => {
                let index = subtitleNames.indexOf(event.detail);
                if (index >= 0 && chosenSubtitleIndex !== index) {
                    chosenSubtitleIndex = index;
                    this.subtitlesOctopus.setTrack(subtitles[index]);
                }
            });
            if (!this.subtitlesOctopus) {
                this.subtitlesOctopus = new SubtitlesOctopus(options);
                this.subtitlesOctopus.resizeInterval = setInterval(() => {
                    let currentVideoSize = video.getBoundingClientRect().toJSON();
                    if (currentVideoSize.height !== previousVideoSize.height || currentVideoSize.width !== previousVideoSize.width) {
                        previousVideoSize = currentVideoSize;
                        this.subtitlesOctopus.resize();
                    }
                }, 500);
            }
            else {
                this.subtitlesOctopus.setTrack(subtitles[0]);
            }
            let video = container.querySelector("video"),
                previousVideoSize = video.getBoundingClientRect().toJSON();
        }
        let video = container.querySelector("video");
        if (this.props.src.startsWith("file://")) {
            this.subsHandler = handleFile(this.props.src.substring(7), handleSubs);
            video.addEventListener("seeking", () => {
                let fraction = video.currentTime / video.duration;
                this.subsHandler.startAt(fraction);
            });
            video.addEventListener("ended", () => {
                if (video.currentTime === video.duration)
                    this.setState({ displayFinishScreenEntries: this.getSimilarDownloadedItems() });
            });
            let removeFinishScreen = () => {
                if (video.currentTime !== video.duration)
                    this.setState({ displayFinishScreenEntries: [] });
            };
            video.addEventListener("playing", removeFinishScreen);
            video.addEventListener("seeking", removeFinishScreen);
        }
    }

    getSimilarDownloadedItems() {
        const downloadedItem = this.props.downloadedItem,
            series = groupBy(Consts.FILTERED_DOWNLOADED_ITEMS.filter(ele => ele.absolutePath !== downloadedItem.absolutePath), ["episodeData", "seriesName"]).filter(ele => ele[0].episodeData.seriesName),
            thisSeries = series.find(ele => ele[0].episodeData.seriesName === downloadedItem.episodeData.seriesName) || [];
        const similar = series.filter(ele => ele[0].episodeData.seriesName !== downloadedItem.episodeData.seriesName).sort((a, b) => {
            return Math.max(...b.map(ele => ele.lastUpdated)) -
                Math.max(...a.map(ele => ele.lastUpdated))
        }).map(ele => ele.sort((a, b) => a.episodeName.localeCompare(b.episodeName, undefined, { numeric: true }))[0]);
        return thisSeries.sort(sortByEpisodeProximity).slice(0, 2).concat(similar);
        function sortByEpisodeProximity(a, b) {
            return Math.abs(a.episodeData.episodeNumber - downloadedItem.episodeData.episodeNumber) -
                Math.abs(b.episodeData.episodeNumber - downloadedItem.episodeData.episodeNumber)
        }
    }

    getAdjacentDownloadedItems() {
        const downloadedItem = this.props.downloadedItem;
        if (isNaN(downloadedItem.episodeData.episodeNumber)) return [];
        const thisSeries = Consts.FILTERED_DOWNLOADED_ITEMS.filter(ele => ele.episodeData.seriesName === downloadedItem.episodeData.seriesName) || [],
            epiNumber = downloadedItem.episodeData.episodeNumber;
        return [thisSeries.find(ele => ele.episodeData.episodeNumber === epiNumber - 1),
        thisSeries.find(ele => ele.episodeData.episodeNumber === epiNumber + 1)]
    }

    componentWillUnmount() {
        let video = this.videoWrapper.current.querySelector("video");
        new CacheLocalStorage("videoLastTime").setItem(this.props.name, { currentTime: video.currentTime, progress: video.currentTime / video.duration });
        if (this.subtitlesOctopus)
            try {
                clearInterval(this.subtitlesOctopus.resizeInterval);
                this.subtitlesOctopus.dispose();
            } catch (e) { }
            finally {
                delete this.subtitlesOctopus;
            }
        if (this.subsHandler)
            this.subsHandler.destroy();
        if (this.videoHandler) {
            document.body.removeEventListener("keydown", this.videoHandler.handleKeyDown);
            this.videoHandler.destroy();
        }
        if (document.fullscreenElement)
            document.exitFullscreen();
    }

    componentDidUpdate() {
        if (this.props.src !== this.videoHandler.currentSrc) {
            let video = this.videoWrapper.current.querySelector("video");
            new CacheLocalStorage("videoLastTime").setItem(this.videoHandler.currentName, { currentTime: video.currentTime, progress: video.currentTime / video.duration });
            if (this.subtitlesOctopus)
                try {
                    clearInterval(this.subtitlesOctopus.resizeInterval);
                    this.subtitlesOctopus.dispose();
                } catch (e) {
                }
                finally {
                    delete this.subtitlesOctopus;
                }
            if (this.subsHandler)
                this.subsHandler.destroy();
            if (this.videoHandler) {
                document.body.removeEventListener("keydown", this.videoHandler.handleKeyDown);
                this.videoHandler.destroy();
            }
            delete this.videoHandler;
            delete this.subsHandler;
            this.setupVideo();
            this.setState({ displayFinishScreenEntries: [] });
        }
    }

    render() {
        let props = { ...this.props };
        props.ref = this.videoWrapper;
        for (let prop of ["src", "name", "downloadedItem"])
            delete props[prop];
        props.children = React.Children.toArray(props.children);
        if (this.state.displayFinishScreenEntries.length)
            props.children.push((
                <div className={styles.endScreenContainer} key={0}>
                    <DisplayDownloadedAnime style={{ overflowY: "hidden" }} noDeleteButton={true} disableDoubleClick={true} downloadedItems={this.state.displayFinishScreenEntries} />
                </div>
            ));
        let element = this.props.as ? React.createElement(this.props.as, { ...props }) : <div {...props} />;
        return element;
        // return (
        //     <div {...props}>
        //         {
        //             this.state.displayFinishScreenEntries.length &&
        //             <div className={styles.endScreenContainer + " p-4"}>
        //                 <DisplayDownloadedAnime noDeleteButton={true} disableDoubleClick={true} downloadedItems={this.state.displayFinishScreenEntries} />
        //             </div>
        //         }
        //         {React.Children.toArray(this.props.children)}
        //     </div>
        // );
    }
}