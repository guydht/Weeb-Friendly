import React, { Component } from "react";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { withRouter } from "react-router";
import Consts from "../classes/Consts";
import styles from "../css/pages/DownloadedAnime.module.css";
import { Confirm, stringRelativeSimilarity } from "../utils/general";
import MALUtils from "../utils/MAL";
import VideoThumbnail from "./VideoThumbnail";

export default withRouter(class DownloadedFileThumbnail extends Component {
    render() {
        let downloadedItem = this.props.downloadedItem,
            props = { ...this.props };
        for (let prop of ['downloadedItem', 'history', 'location', 'match', 'staticContext', 'disableDoubleClick', 'downloadedItems', 'noDeleteButton'])
            delete props[prop];
        return (
            <div {...props}
                className={styles.gridElement + " " + this.props.className || ""}
                onDoubleClick={e => this.props.disableDoubleClick !== false && this.showAnime(downloadedItem) && e.stopPropagation()}
                onClick={() => this.showVideo(downloadedItem)}>
                <LazyLoadComponent>
                    <VideoThumbnail
                        videoUrl={Consts.FILE_URL_PROTOCOL + downloadedItem.absolutePath}
                        alt={downloadedItem.fileName}
                        className={styles.thumbnail}
                    />
                </LazyLoadComponent>
                <div className={styles.cover}>
                    {
                    this.props.noDeleteButton !== true &&
                        <span
                            style={{ position: "absolute", zIndex: 4, right: 0, top: 0, cursor: "pointer" }}
                            className="mr-2 mt-1 p-1" onClick={e => this.confirmDeletion() && e.stopPropagation()}>
                            <span aria-hidden="true">×</span>
                        </span>
                    }
                </div>
                <span className={styles.title}>{downloadedItem.fileName}</span>
            </div>
        )
    }
    showAnime(downloadedItem) {
        clearTimeout(this.doubleClickTimeout);
        if (downloadedItem.animeEntry.malId) {
            this.props.history.push({
                pathname: "/anime/" + downloadedItem.animeEntry.malId,
                state: {
                    animeEntry: downloadedItem.animeEntry
                },
                anime: downloadedItem.animeEntry
            });
        }
        else {
            MALUtils.searchAnime(downloadedItem.animeEntry).then(results => {
                let similarityScores = results.map(result => {
                    return [result, Math.max(...[...result.synonyms].map(name => {
                        return Math.max(...[...downloadedItem.animeEntry.synonyms].map(animeName => {
                            return stringRelativeSimilarity(animeName.toLowerCase(), name.toLowerCase());
                        }));
                    }))];
                });
                results = similarityScores.filter(ele => ele[1] >= MALUtils.MINIMUM_ANIMENAME_SIMILARITY).sort((a, b) => a[1] - b[1]).map(ele => ele[0]);
                if (!results.length)
                    window.displayToast({ title: "Can't find Anime!", body: `Sorry! Can't find ${downloadedItem.fileName} in MyAnimeList!` })
                else {
                    downloadedItem.animeEntry.malId = results[0].malId;
                    downloadedItem.animeEntry.sync();
                    this.showAnime(downloadedItem);
                }
            })
        }
    }
    waitingForDeletionConfirmation = false;
    doubleClickTimeout;
    doubleClickTimeoutMiliseconds = 400;
    showVideo(videoItem) {
        clearTimeout(this.doubleClickTimeout);
        this.doubleClickTimeout = setTimeout(() => {
            if (!this.waitingForDeletionConfirmation)
                window.setAppState({
                    showVideo: true,
                    videoItem
                });
        }, this.doubleClickTimeoutMiliseconds);
    }
    confirmDeletion() {
        this.waitingForDeletionConfirmation = true;
        Confirm(`Are you sure you want to delete ${this.props.downloadedItem.fileName}?`, ok => {
            this.waitingForDeletionConfirmation = false;
            if (ok) {
                let fs = window.require("fs");
                fs.unlink(this.props.downloadedItem.absolutePath, err => {
                    if (!err) {
                        Consts.DOWNLOADED_ITEMS.splice(Consts.DOWNLOADED_ITEMS.findIndex(ele => ele.absolutePath === this.props.downloadedItem.absolutePath), 1);
                        window.reloadPage();
                        window.displayToast({ title: "Successfully deleted video", body: this.props.downloadedItem.fileName + " was successfully deleted!" });
                    }
                    else
                        window.displayToast({ title: "Couldn't delte video!", body: err.toString() })
                });
            }
        })
    }
});
