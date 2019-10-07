import React, { Component } from "react";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { withRouter } from "react-router";
import styles from "../components/css/DownloadedAnime.module.css";
import Consts from "../consts";
import MALUtils from "./MALUtils";
import { stringRelativeSimilarity } from "./utils";
import VideoThumbnail from "./VideoThumbnail";

export default withRouter(class DownloadedFileThumbnail extends Component {
    render() {
        let downloadedItem = this.props.downloadedItem,
            props = { ...this.props };
        for (let prop of ['downloadedItem', 'history', 'location', 'match', 'staticContext'])
            delete props[prop];
        return (
            <div {...props}
                className={styles.gridElement + " " + this.props.className || ""}
                onDoubleClick={e => this.showAnime(downloadedItem) && e.stopPropagation()}
                onClick={() => this.showVideo(downloadedItem)}>
                <LazyLoadComponent>
                    <VideoThumbnail
                        videoUrl={Consts.FILE_URL_PROTOCOL + downloadedItem.absolutePath}
                        alt={downloadedItem.fileName}
                        className={styles.thumbnail}
                    />
                </LazyLoadComponent>
                <div className={styles.cover}>
                    <span
                        style={{ position: "absolute", zIndex: 4, right: 0, top: 0, cursor: "pointer" }}
                        className="mr-2 mt-1 p-1" onClick={e => this.confirmDeletion() && e.stopPropagation()}>
                        <span aria-hidden="true">×</span>
                    </span>
                </div>
                <span className={styles.title}>{downloadedItem.fileName}</span>
            </div>
        )
    }
    showAnime(downloadedItem) {
        downloadedItem.animeEntry.sync();
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
            MALUtils.searchAnime(downloadedItem.animeEntry.name).then(results => {
                results = results.filter(ele => stringRelativeSimilarity(downloadedItem.animeEntry.name.toLowerCase(),
                    ele.name.toLowerCase()) >= MALUtils.MINIMUM_ANIMENAME_SIMILARITY);
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
    showVideo(videoItem) {
        if (!this.waitingForDeletionConfirmation)
            window.setAppState({
                showVideo: true,
                videoItem
            });
    }
    confirmDeletion() {
        this.waitingForDeletionConfirmation = true;
        Confirm(`Are you sure you want to delete ${this.props.downloadedItem.fileName}?`, ok => {
            this.waitingForDeletionConfirmation = false;
            if (ok) {
                let fs = window.require("fs");
                fs.unlink(this.props.downloadedItem.absolutePath, err => {
                    if (!err) {
                        window.setAppState({});
                        window.displayToast({ title: "Successfully deleted video", body: this.props.downloadedItem.fileName + " was successfully deleted!" });
                    }
                    else
                        window.displayToast({ title: "Couldn't delte video!", body: err.toString() })
                });
            }
        })
    }
});

function Confirm(String, sendResponse, timer, yesText, noText) {
    String = String.charAt(0).toUpperCase() + String.replace(/\s\w|^./g, letter => letter.toUpperCase()).slice(1);
    var div = document.createElement("div"),
        stringDotsFlag = false,
        previousFocusedElement = document.activeElement;
    if (!sendResponse) sendResponse = function () { }
    div.dataset.string = String;
    if (stringDotsFlag) String = String.trim() + "...";
    var width = 1,
        elements = document.getElementsByClassName("GuydhtTemporaryBox"),
        top = 15,
        i = 0,
        array = [],
        asd = "<div style='position:absolute; bottom:0; width:100%; height:5px; background-color:rgba(255,255,255,0.3); opacity:0; overflow: hidden;' id='progressBar'><div style='width:100%; height:100%; background-color: rgba(0, 0, 0, 0.4); position: relative; left: -100%;' id='progress'></div></div>";
    for (i = 0; i < elements.length; i++)
        if (elements[i].style.top.includes("%")) array[i] = parseInt(elements[i].style.top.replace("%", ""));
        else array[i] = 100 / (window.innerHeight / (Number(elements[i].style.top.replace("px", "")) + 50));
    if (!yesText) yesText = "Yes";
    if (!noText) noText = "No";
    array.sort(function (a, b) {
        return a - b
    });
    for (i = 0; i < elements.length; i++) {
        if (top === array[i]) top = top + 15;
        else break;
    }
    div.innerHTML = "<h1 style='color:white; pointer-events: none; font-size:20px; line-height:normal; margin-bottom: 20px;'>" + String + "</h1><button class='Yes' style='color:white; border:none; float: left; margin-left: 100px; height:25px; margin-top: -5px; border-radius:7px; width:50px; background:rgba(81, 163, 81, 0.5); font-size: 13px; box-shadow: 0 0 12px rgb(153, 153, 153); left:15px; transition:all .5s; outline: 0; position:absolute; bottom: 8px;'>" + yesText + "</button><button class='No' style='color:white; border:none; float: right; margin-right: 100px; height:25px; margin-top: -5px; border-radius:7px; width:50px; background:rgba(163,81, 81, 0.5); font-size: 13px; box-shadow: 0 0 12px rgb(153, 153, 153); right:15px; transition:all .5s; outline: 0; position:absolute; bottom: 8px;' >" + noText + "</button>" + asd;
    div.style = "cursor:default; text-align:center; box-shadow: 0 0 12px rgb(153, 153, 153); transition: all .5s; z-index:9999999999999; width: 450px; height: fit-content; background: rgb(81, 81, 163); opacity:0; left: calc(50% - 225px); padding: 10px 0;position:fixed; top: calc(" + top + "% - 50px);";

    div.className = "GuydhtTemporaryBox";
    div.onmouseenter = div.onmouseover = function () {
        this.style.opacity = 1;
        this.style.boxShadow = "0 0 12px rgb(30, 30, 30)";
        if (timer === true) clearInterval(loadConfirm);
    };
    div.onmouseleave = function () {
        this.style.opacity = 0.8;
        this.style.boxShadow = "0 0 12px rgb(153, 153, 153)";
        if (timer === true) loadConfirm = setInterval(loadingConfirm, 25);
    };
    document.body.appendChild(div);
    div.children[1].onmouseover = div.children[2].onmouseover = function () {
        this.style.boxShadow = "0 0 12px rgb(30, 30, 30)";
    };
    div.children[1].onmouseout = div.children[2].onmouseout = function () {
        this.style.boxShadow = "0 0 12px rgb(153, 153, 153)"
    };
    div.children[1].onclick = function () {
        this.innerHTML += "✔";
        sendResponse(true);
        setTimeout(function () {
            div.remove();
        }, 500);
        div.onmouseleave = function () { };
        div.onmouseenter = function () { };
        div.style.opacity = 0;
        div.style.pointerEvents = "none";
        previousFocusedElement.focus();
    }
    div.children[2].onclick = function () {
        this.innerHTML += "✔";
        sendResponse(false);
        setTimeout(function () {
            div.remove();
        }, 500);
        div.onmouseleave = function () { };
        div.onmouseenter = function () { };
        div.style.opacity = 0;
        div.style.pointerEvents = "none";
        previousFocusedElement.focus();
    }
    document.addEventListener("keydown", keydown);
    div.tabIndex = 0;
    div.focus();
    div.style.outline = "none";

    function keydown(e) {
        if (!div.visible) return document.removeEventListener("keydown", keydown);
        e.stopPropagation();
        e.preventDefault();
        if (["KeyY", "Enter"].includes(e.code)) div.children[1].click();
        else if (["KeyN", "Escape"].includes(e.code)) div.children[2].click();
    }
    setTimeout(function () {
        div.style.opacity = 0.8;
    }, 0);
    if (timer === true) {
        div.querySelector("#progressBar").style.opacity = "1";
        var loadConfirm = setInterval(loadingConfirm, 25);
        div.onmouseup = function () {
            clearInterval(loadConfirm);
            setTimeout(function () {
                div.remove();
            }, 500);
            this.onmouseleave = function () { };
            this.onmouseenter = function () { };
            this.style.opacity = 0;
            this.style.pointerEvents = "none";
        }
    }
    var totalWidth = parseFloat(div.clientWidth);
    div.onresize = function () {
        totalWidth = parseFloat(div.clientWidth);
    };

    function loadingConfirm() {
        width += 4;
        if (width >= totalWidth) {
            setTimeout(function () {
                div.remove();
            }, 500);
            this.onmouseout = function () { };
            this.onmouseover = function () { };
            div.style.opacity = 0;
            div.style.pointerEvents = "none";
            clearInterval(loadConfirm);
        } else div.querySelector("#progress").style.transform = "translateX(" + width + "px)";
    }
}
