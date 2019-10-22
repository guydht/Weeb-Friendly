import React, { Component } from "react";

type RenderParams = {
    videoUrl: string;
    snapshotTime?: number;
    // Time in seconds in video on which to capture snapshot.
    // Values between 1 and 0 and treated as a fraction of the total video duration.
    renderedHeight?: number;
    renderedWidth?: number;
}

let waitingForVideo = 0;
const rendererVideo = document.createElement("video"),
    queue: [RenderParams, (canvas: HTMLCanvasElement) => void][] = [],
    tryLoadingNextInQueue = () => {
        if (waitingForVideo === 0 && queue.length) {
            waitingForVideo++;
            let params = queue.splice(0, 1)[0];
            renderVideo(params[0]).then(canvas => {
                params[1](canvas);
                waitingForVideo--;
                tryLoadingNextInQueue();
            });
        }
        if (waitingForVideo === 1 && queue.length) {
            waitingForVideo++;
            let params = queue.splice(0, 1)[0];
            renderVideo(params[0]).then(canvas => {
                params[1](canvas);
                waitingForVideo--;
                tryLoadingNextInQueue();
            });
        }
    },
    addToQueue = (renderParams: RenderParams, onLoaded: (canvas: HTMLCanvasElement) => void, index?: number) => {
        queue.splice(index || 0, 0, [renderParams, onLoaded]);
        tryLoadingNextInQueue();
    };
(window as any).queue = queue;
function renderVideo(renderParams: RenderParams): Promise<HTMLCanvasElement> {
    let localRendererVideo = rendererVideo.cloneNode(true) as HTMLVideoElement;
    return new Promise(resolve => {
        const DEFAULT_SNAPSHOT_TIME = 0.4,
            LOADED_METADATA_STATE = 'metadata-loaded',
            LOADED_DATA_STATE = 'loaded-data',
            SUSPENDED_STATE = 'suspended-state',
            SEEKED_STATE = 'seeked',
            videoState = {
                [LOADED_METADATA_STATE]: false,
                [SUSPENDED_STATE]: false,
                [LOADED_DATA_STATE]: false,
                [SEEKED_STATE]: false
            },
            canvas = document.createElement("canvas"),
            giveUpTimeout = setTimeout(() => {
                resolve(canvas);
            }, 10000);;
        localRendererVideo.src = renderParams.videoUrl;
        localRendererVideo.onloadedmetadata = () => videoStateUpdated(LOADED_METADATA_STATE);
        localRendererVideo.onsuspend = () => videoStateUpdated(SUSPENDED_STATE);
        localRendererVideo.onloadeddata = () => videoStateUpdated(LOADED_DATA_STATE);
        localRendererVideo.onseeked = () => videoStateUpdated(SEEKED_STATE);
        function videoStateUpdated(state: string) {
            (videoState as any)[state] = true;
            if (state === LOADED_METADATA_STATE)
                videoLoadedMetadata();
            else if (videoState[SUSPENDED_STATE] && videoState[LOADED_DATA_STATE] && videoState[SEEKED_STATE])
                videoLoadedData();
        }
        function videoLoadedMetadata() {
            let snapshotTime = renderParams.snapshotTime || DEFAULT_SNAPSHOT_TIME;
            snapshotTime = snapshotTime > 0 && snapshotTime <= 1 ? localRendererVideo.duration * snapshotTime : snapshotTime; //Support 0.x for snapshot duration
            localRendererVideo.currentTime = snapshotTime;
        }
        function videoLoadedData() {
            let ctx = canvas.getContext("2d"),
                ratioOfImage = localRendererVideo.videoHeight / localRendererVideo.videoWidth,
                renderedHeight = renderParams.renderedHeight,
                renderedWidth = renderParams.renderedWidth;
            if (renderedWidth && !renderedHeight)
                renderedHeight = renderedWidth * ratioOfImage;
            else if (!renderedWidth && renderedHeight)
                renderedWidth = renderedHeight / ratioOfImage;
            renderedWidth = renderedWidth || canvas.width;
            renderedHeight = renderedHeight || canvas.height;
            canvas.height = renderedHeight;
            canvas.width = renderedWidth;
            ctx!.drawImage(localRendererVideo, 0, 0, localRendererVideo.videoWidth, localRendererVideo.videoHeight, 0, 0, canvas.width, canvas.height);
            localRendererVideo.src = "";
            clearTimeout(giveUpTimeout);
            resolve(canvas);
        }
    });
}

export default class VideoThumbnail extends Component<RenderParams> {

    canvas = React.createRef<HTMLCanvasElement>();

    render() {
        let filteredProps: any = { ...this.props };
        for (let prop of ["videoUrl", "snapshotTime", "renderedHeight", "renderedWidth"])
            if (filteredProps[prop])
                delete filteredProps[prop];
        return (
            <canvas ref={this.canvas} {...filteredProps}></canvas>
        )
    }
    componentDidMount() {
        addToQueue(this.props, canvas => {
            if (this.canvas.current) {
                this.canvas.current.height = canvas.height;
                this.canvas.current.width = canvas.width;
                this.canvas.current.getContext("2d")!.drawImage(canvas, 0, 0, canvas.width, canvas.height);
            }
        });
    }

}