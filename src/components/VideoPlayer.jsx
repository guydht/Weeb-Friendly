import React, { Component } from "react";
import { asd } from "../jsHelpers/jifa";
import { handleFile, handleURL } from "../jsHelpers/subtitleParsers/mkvExtract";
import { SubtitlesOctopus } from "../jsHelpers/subtitleParsers/Octopus";
import { CacheLocalStorage } from "../utils/general";


export default class VideoPlayer extends Component {

    videoWrapper = React.createRef();
    subtitlesOctopus;

    state = {
        src: this.props.src
    }

    componentDidMount() {
        this.setupVideo();
    }

    setupVideo() {
        let container = asd(this.props.name, this.videoWrapper.current, this.props.src),
            handleSubs = async subFiles => {
                const subtitles = [],
                    subtitleNames = [],
                    fonts = [];
                let chosenSubtitleIndex = 0;
                for (let f of subFiles) {
                    if ((f.name.endsWith(".ass") || f.name.endsWith(".ssa"))) {
                        subtitles.push(f.data);
                        subtitleNames.push(f.name);
                    }
                    else if (f.name.endsWith(".ttf"))
                        fonts.push(URL.createObjectURL(new Blob([f.data])));
                }
                var options = {
                    video: container.querySelector("video"),
                    subContent: subtitles[0],
                    fonts: fonts,
                    workerUrl: "/OctopusWorker.js"
                };
                subtitleNames[0] += " - active";
                container.setSubtitleTracksNames(subtitleNames);
                container.addEventListener("guydhtChangeSubs", event => {
                    let index = subtitleNames.indexOf(event.detail);
                    if (index >= 0 && chosenSubtitleIndex !== index) {
                        chosenSubtitleIndex = index;
                        this.subtitlesOctopus.setTrack(subtitles[index]);
                    }
                })
                if (this.subtitlesOctopus) {
                    clearInterval(this.subtitlesOctopus.resizeInterval);
                    try {
                        this.subtitlesOctopus.dispose();
                    } catch (e) { }
                }
                this.subtitlesOctopus = new SubtitlesOctopus(options);
                let video = container.querySelector("video"),
                    previousVideoSize = video.getBoundingClientRect().toJSON();
                this.subtitlesOctopus.resizeInterval = setInterval(() => {
                    let currentVideoSize = video.getBoundingClientRect().toJSON();
                    if (currentVideoSize.height !== previousVideoSize.height || currentVideoSize.width !== previousVideoSize.width) {
                        previousVideoSize = currentVideoSize;
                        this.subtitlesOctopus.resize();
                    }
                }, 500);
            };
        if (this.props.src.endsWith(".mkv")) {
            if (this.props.src.startsWith("file:"))
                handleFile(this.props.src.substring(7), handleSubs);
            else
                handleURL(this.props.src, handleSubs).then((...arr) => console.log('finished', ...arr));
        }
    }

    componentDidUpdate() {
        if (this.props.src !== this.state.src) {
            this.setState({ src: this.props.src });
            this.setupVideo();
        }
    }

    componentWillUnmount() {
        new CacheLocalStorage("videoLastTime").setItem(this.props.name, this.videoWrapper.current.querySelector("video").currentTime);
        if (this.subtitlesOctopus)
            try {
                this.subtitlesOctopus.dispose();
            } catch (e) { }
    }

    render() {
        let props = { ...this.props };
        for (let prop of ["src", "name"])
            delete props[prop];
        return (
            <div ref={this.videoWrapper} {...props}></div>
            //     <div className={styles.wrapper}><video tabIndex="1" className={styles.video}></video>
            //         <div className={styles.subsText}></div>
            //         <div className={styles.info} style={{ display: "none" }}>
            //             <div className={styles.timer}></div><span className={styles.guydhtVideoClear}></span>
            //             <div className={styles.volume}></div><span className={styles.guydhtVideoClear}></span>
            //         </div>
            //         <div className={styles.upperSlider}><div className={styles.name}>{this.props.name}</div>
            //         </div>
            //         <div className={styles.slider}>
            //             <div className={styles.playButton}></div>
            //             <div className={styles.volumeControl}><svg height="100%" viewBox="0 0 100 100" width="100%">
            //                 <path></path>
            //             </svg></div>
            //             <div className={styles.volumeSlider}>
            //                 <div className={styles.volumeHandle}></div>
            //             </div>
            //             <div className={styles.fullscreenButton}><svg height="100%" width="100%">
            //                 <path d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z"></path>
            //                 <path d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z"></path>
            //                 <path d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z"></path>
            //                 <path d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z"></path>
            //             </svg></div>
            //             <div className={styles.settings}><svg viewbox="0 0 36 36" height="100%" width="35px">
            //                 <path
            //                     d="m 23.94,18.78 c .03,-0.25 .05,-0.51 .05,-0.78 0,-0.27 -0.02,-0.52 -0.05,-0.78 l 1.68,-1.32 c .15,-0.12 .19,-0.33 .09,-0.51 l -1.6,-2.76 c -0.09,-0.17 -0.31,-0.24 -0.48,-0.17 l -1.99,.8 c -0.41,-0.32 -0.86,-0.58 -1.35,-0.78 l -0.30,-2.12 c -0.02,-0.19 -0.19,-0.33 -0.39,-0.33 l -3.2,0 c -0.2,0 -0.36,.14 -0.39,.33 l -0.30,2.12 c -0.48,.2 -0.93,.47 -1.35,.78 l -1.99,-0.8 c -0.18,-0.07 -0.39,0 -0.48,.17 l -1.6,2.76 c -0.10,.17 -0.05,.39 .09,.51 l 1.68,1.32 c -0.03,.25 -0.05,.52 -0.05,.78 0,.26 .02,.52 .05,.78 l -1.68,1.32 c -0.15,.12 -0.19,.33 -0.09,.51 l 1.6,2.76 c .09,.17 .31,.24 .48,.17 l 1.99,-0.8 c .41,.32 .86,.58 1.35,.78 l .30,2.12 c .02,.19 .19,.33 .39,.33 l 3.2,0 c .2,0 .36,-0.14 .39,-0.33 l .30,-2.12 c .48,-0.2 .93,-0.47 1.35,-0.78 l 1.99,.8 c .18,.07 .39,0 .48,-0.17 l 1.6,-2.76 c .09,-0.17 .05,-0.39 -0.09,-0.51 l -1.68,-1.32 0,0 z m -5.94,2.01 c -1.54,0 -2.8,-1.25 -2.8,-2.8 0,-1.54 1.25,-2.8 2.8,-2.8 1.54,0 2.8,1.25 2.8,2.8 0,1.54 -1.25,2.8 -2.8,2.8 l 0,0 z" />
            //             </svg>
            //                 <div className={styles.settingsWindow}>
            //                     <ul className={styles.settingsList2} style={{margin: 0}}>
            //                         <li className={styles.settingsHead}>
            //                             <div>back</div>
            //                         </li>
            //                     </ul>
            //                     <ul className={styles.settingsList}>
            //                         <li>
            //                             <div className={styles.stretchText}>Stretch Video</div><span className={styles.stretch}></span>
            //                         </li>
            //                         <li className={styles.subs}>
            //                             <div>Subs</div>
            //                             <div></div>
            //                         </li>
            //                     </ul>
            //                 </div>
            //             </div>
            //             <div className={styles.thumbnail}><img></img>
            //             </div>
            //             <div className={styles.timeTooltip}></div>
            //             <div className={styles.widthLimiter}>
            //                 <div className={styles.progressContainer}>
            //                     <div className={styles.progressShadow}></div>
            //                     <div className={styles.progress}></div>
            //                     <div className={styles.progressCircle}></div>
            //                 </div>
            //             </div>
            //         </div>
            //         <div className={styles.middleIcon}>
            //             <div className={styles.middleText}></div>
            //         </div>
            //     </div >
        )
    }
}
