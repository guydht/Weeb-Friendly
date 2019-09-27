import React, { Component } from "react";

interface VideoThumbnailProps {
    videoUrl: string;
    snapshotTime?: number;
    // Time in seconds in video on which to capture snapshot.
    // Values between 1 and 0 and treated as a fraction of the total video duration.
    renderedHeight?: number;
    renderedWidth?: number;
}

export default class VideoThumbnail extends Component {
    private DEFAULT_SNAPSHOT_TIME = 0.4;
    private LOADED_METADATA_STATE = 'metadata-loaded';
    private LOADED_DATA_STATE = 'loaded-data';
    private SUSPENDED_STATE = 'suspended-state'
    private SEEKED_STATE = 'seeked';

    videoState = {
        [this.LOADED_METADATA_STATE]: false,
        [this.SUSPENDED_STATE]: false,
        [this.LOADED_DATA_STATE]: false,
    }

    props!: VideoThumbnailProps;
    canvas = React.createRef<any>();
    video = document.createElement("video");

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
        this.video.src = this.props.videoUrl;
        this.video.onloadedmetadata = () => this.videoStateUpdated(this.LOADED_METADATA_STATE);
        this.video.onsuspend = () => this.videoStateUpdated(this.SUSPENDED_STATE);
        this.video.onloadeddata = () => this.videoStateUpdated(this.LOADED_DATA_STATE);
        this.video.onseeked = () => this.videoStateUpdated(this.SEEKED_STATE);
    }
    videoStateUpdated(state_updated: string) {
        if(!this.canvas.current)
            return this.video.src = "";
        this.videoState[state_updated] = true;
        if (state_updated === this.LOADED_METADATA_STATE)
            this.videoLoadedMetadata();
        else if (this.videoState[this.SUSPENDED_STATE] && this.videoState[this.LOADED_DATA_STATE] && this.videoState[this.SEEKED_STATE])
            this.videoLoadedData();
    }
    videoLoadedData() {
        let ctx = this.canvas.current.getContext("2d"),
            ratioOfImage = this.video.videoHeight / this.video.videoWidth,
            renderedHeight = this.props.renderedHeight,
            renderedWidth = this.props.renderedWidth;
        if (renderedWidth && !renderedHeight)
            renderedHeight = renderedWidth * ratioOfImage;
        else if (!renderedWidth && renderedHeight)
            renderedWidth = renderedHeight / ratioOfImage;
        renderedWidth = renderedWidth || this.canvas.current.width 
        renderedHeight = renderedHeight || this.canvas.current.height
        this.canvas.current.height = renderedHeight;
        this.canvas.current.width = renderedWidth;
        ctx.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight, 0, 0, this.canvas.current.width, this.canvas.current.height);
        this.video.src = "";
    }
    videoLoadedMetadata() {
        let snapshotTime = this.props.snapshotTime || this.DEFAULT_SNAPSHOT_TIME;
        snapshotTime = snapshotTime > 0 && snapshotTime <= 1 ? this.video.duration * snapshotTime : snapshotTime;
        this.video.currentTime = snapshotTime;
    }

}