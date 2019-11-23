import React, { Component } from "react";
import Consts from "../classes/Consts";
import styles from "../css/components/VideoPlayer.module.css";
import { asd } from "../jsHelpers/jifa";
import { handleFile } from "../jsHelpers/subtitleParsers/mkvExtract";
import { SubtitlesOctopus } from "../jsHelpers/subtitleParsers/Octopus";
import { DisplayDownloadedAnime } from "../pages/home/DownloadedAnime";
import { CacheLocalStorage, groupBy } from "../utils/general";


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
            video.addEventListener("seeked", () => {
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
            video.addEventListener("seeked", removeFinishScreen);
        }
    }

    getSimilarDownloadedItems() {
        let downloadedItem = this.props.downloadedItem,
            series = groupBy(Consts.DOWNLOADED_ITEMS.filter(ele => ele.absolutePath !== downloadedItem.absolutePath), ["episodeData", "seriesName"]).filter(ele => ele),
            thisSeries = series.find(ele => ele[0].episodeData.seriesName === downloadedItem.episodeData.seriesName) || [];
        let similar = series.filter(ele => ele[0].episodeData.seriesName !== downloadedItem.episodeData.seriesName).sort((a, b) => {
            return Math.max(...b.map(ele => ele.lastUpdated)) -
                Math.max(...a.map(ele => ele.lastUpdated))
        }).map(ele => ele.sort((a, b) => a.fileName.localeCompare(b.fileName, undefined, { numeric: true }))[0]);
        return thisSeries.sort(sortByEpisodeProximity).slice(0, 2).concat(similar);
        function sortByEpisodeProximity(a, b) {
            return Math.abs(a.episodeData.episodeNumber - downloadedItem.episodeData.episodeNumber) -
                Math.abs(b.episodeData.episodeNumber - downloadedItem.episodeData.episodeNumber)
        }
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
        if (this.videoHandler)
            this.videoHandler.destroy();
        if (document.fullscreen)
            document.exitFullscreen();
    }

    componentDidUpdate() {
        if (this.props.src !== this.videoHandler.currentSrc) {
            let video = this.videoWrapper.current.querySelector("video");
            new CacheLocalStorage("videoLastTime").setItem(this.props.name, { currentTime: video.currentTime, progress: video.currentTime / video.duration });
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
            if (this.videoHandler)
                this.videoHandler.destroy();
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