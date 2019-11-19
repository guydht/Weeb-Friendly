import React, { Component } from "react";
import Consts from "../classes/Consts";
import styles from "../css/components/VideoPlayer.module.css";
import { asd } from "../jsHelpers/jifa";
import { handleFile } from "../jsHelpers/subtitleParsers/mkvExtract";
import { SubtitlesOctopus } from "../jsHelpers/subtitleParsers/Octopus";
import { DisplayDownloadedAnime } from "../pages/home/DownloadedAnime";
import { CacheLocalStorage, stringCompare } from "../utils/general";


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
        let container = this.videoWrapper.current;
        this.videoHandler = asd(this.props.name, container, this.props.src);
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
            if (!this.subtitlesOctopus || this.subtitlesOctopus.destroyed) {
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
            let subsHandler = handleFile(this.props.src.substring(7), handleSubs);
            this.subsHandler = subsHandler;
            video.addEventListener("seeked", () => {
                let fraction = video.currentTime / video.duration;
                subsHandler.startAt(fraction);
            });
            video.addEventListener("ended", () => {
                if (video.currentTime === video.duration)
                    this.setState({ displayFinishScreenEntries: this.getSimilarDownloadedItems() });
            });
            video.addEventListener("playing", () => {
                if (video.currentTime !== video.duration)
                    this.setState({ displayFinishScreenEntries: [] });
            });
        }
    }

    getSimilarDownloadedItems() {
        let path = window.require("path"),
            similar = Consts.DOWNLOADED_ITEMS.sort((a, b) => {
                let aVal = stringCompare(path.basename(a.absolutePath), this.props.src),
                    bVal = stringCompare(path.basename(b.absolutePath), this.props.src);
                return aVal === bVal ?
                    (a.episodeData.episodeNumber - this.props.downloadedItem.episodeData.episodeNumber)
                    - (b.episodeData.episodeNumber - this.props.downloadedItem.episodeData.episodeNumber)
                    : aVal - bVal;
            });
        return similar.slice(0, 30);
    }

    componentWillUnmount() {
        let video = this.videoWrapper.current.querySelector("video");
        new CacheLocalStorage("videoLastTime").setItem(this.props.name, { currentTime: video.currentTime, progress: video.currentTime / video.duration });
        if (this.subtitlesOctopus)
            try {
                clearInterval(this.subtitlesOctopus.resizeInterval);
                this.subtitlesOctopus.dispose();
            } catch (e) { }
        if (this.subsHandler)
            this.subsHandler.destroy();
        if(this.videoHandler)
            this.videoHandler.destroy();
        if (document.fullscreen)
            document.exitFullscreen();
    }

    render() {
        let props = { ...this.props };
        props.ref = this.videoWrapper;
        for (let prop of ["src", "name", "downloadedItem", "children"])
            delete props[prop];
        return (
            <div {...props}>
                {
                    this.state.displayFinishScreenEntries.length &&
                    <div className={styles.endScreenContainer + " p-4"}>
                        <DisplayDownloadedAnime noDeleteButton={true} disableDoubleClick={true} downloadedItems={this.state.displayFinishScreenEntries} />
                    </div>
                }
                {React.Children.toArray(this.props.children)}
            </div>
        );
    }
}