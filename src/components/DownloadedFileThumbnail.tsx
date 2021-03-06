import React, { Component } from "react";
//@ts-ignore
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { withRouter } from "react-router";
import AnimeEntry from "../classes/AnimeEntry";
import Consts from "../classes/Consts";
import DownloadedItem from "../classes/DownloadedItem";
import styles from "../css/pages/DownloadedAnime.module.css";
import { Confirm, stringRelativeSimilarity } from "../utils/general";
import MALUtils from "../utils/MAL";
import HasSeen from "./HasSeen";
import VideoThumbnail from "./VideoThumbnail";

interface DownloadedFileThumbnailProps {
	downloadedItem: DownloadedItem;
	className: string;
	disableDoubleClick: boolean;
}

export default withRouter(class DownloadedFileThumbnail extends Component<DownloadedFileThumbnailProps | any> {
	render() {
		const downloadedItem: DownloadedItem = this.props.downloadedItem,
			props = { ...this.props };
		for (let prop of ['downloadedItem', 'history', 'location', 'match', 'staticContext', 'disableDoubleClick', 'downloadedItems', 'noDeleteButton'])
			delete props[prop];
		return (
			<div {...props}
				className={(this.props.className || "") + " " + styles.gridElement}>
				<HasSeen hasSeen={downloadedItem.seenThisEpisode()} />
				<div className={styles.coverElement}
					onDoubleClick={e => this.props.disableDoubleClick !== false && this.showAnime(downloadedItem) && e.stopPropagation()}
					onClick={() => this.showVideo(downloadedItem)} />
				<LazyLoadComponent>
					<VideoThumbnail
						videoUrl={Consts.FILE_URL_PROTOCOL + downloadedItem.absolutePath}
						className={styles.thumbnail}
					/>
				</LazyLoadComponent>
				{
					this.props.noDeleteButton !== true &&
					<span
						className={"mr-2 mt-1 p-1 " + styles.deleteButton} onClick={e => this.confirmDeletion() && e.stopPropagation()}>
						<span aria-hidden="true">×</span>
					</span>
				}
				<span className={styles.title}>{downloadedItem.episodeName}</span>
			</div>
		)
	}
	showAnime(downloadedItem: DownloadedItem) {
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
				const similarityScores: [AnimeEntry, number][] = results.map(result => {
					return [result, Math.max(...[...result.synonyms].map(name => {
						return Math.max(...[...downloadedItem.animeEntry.synonyms].map(animeName => {
							return stringRelativeSimilarity(animeName.toLowerCase(), name.toLowerCase());
						}));
					}))];
				});
				results = similarityScores.filter(ele => ele[1] >= MALUtils.MINIMUM_ANIMENAME_SIMILARITY).sort((a, b) => a[1] - b[1]).map(ele => ele[0]);
				if (!results.length)
					(window as any).displayToast({ title: "Can't find Anime!", body: `Sorry! Can't find ${downloadedItem.episodeName} in MyAnimeList!` })
				else {
					downloadedItem.animeEntry.malId = results[0].malId;
					downloadedItem.animeEntry.syncGet();
					this.showAnime(downloadedItem);
				}
			})
		}
	}
	waitingForDeletionConfirmation = false;
	doubleClickTimeout?: number;
	doubleClickTimeoutMiliseconds = 400;
	showVideo(videoItem: DownloadedItem) {
		clearTimeout(this.doubleClickTimeout);
		this.doubleClickTimeout = setTimeout(() => {
			if (!this.waitingForDeletionConfirmation)
				videoItem.startPlaying();
		}, this.doubleClickTimeoutMiliseconds) as unknown as number;
	}
	confirmDeletion() {
		this.waitingForDeletionConfirmation = true;
		Confirm(`Are you sure you want to delete ${this.props.downloadedItem.episodeName}?`, (ok: boolean) => {
			this.waitingForDeletionConfirmation = false;
			if (ok) {
				let fs = window.require("fs");
				fs.unlink(this.props.downloadedItem.absolutePath, (err: any) => {
					if (!err) {
						Consts.DOWNLOADED_ITEMS.splice(Consts.DOWNLOADED_ITEMS.findIndex(ele => ele.absolutePath === this.props.downloadedItem.absolutePath), 1);
						(window as any).reloadPage();
						(window as any).displayToast({ title: "Successfully deleted video", body: this.props.downloadedItem.episodeName + " was successfully deleted!" });
					}
					else
						(window as any).displayToast({ title: "Couldn't delee video!", body: err.toString() })
				});
			}
		})
		return true;
	}
});
