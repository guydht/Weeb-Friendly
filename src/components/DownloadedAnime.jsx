import React, { Component } from "react";
import { Button, ButtonGroup, Container, FormControl, InputGroup, Row } from "react-bootstrap";
import Form from "react-bootstrap/FormGroup";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import DownloadedItem from "../classes/DownloadedItem";
import VideoThumbnail from "../classes/VideoThumbnail";
import Consts from "../consts";
import styles from "./css/DownloadedAnime.module.css";

const fs = window.require("fs"),
    path = window.require("path");
var walkDir = function (dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function (filename) {
        let file = path.join(dir, filename);
        var stat = fs.statSync(file);
        if (stat.isDirectory())
            results = results.concat(walkDir(file));
        else
            results.push(new DownloadedItem(file, filename.replace(path.extname(filename), ""), stat.birthtime));
    });
    return results;
}

export default class DownloadedAnime extends Component {

    filterElement = React.createRef();

    downloadedItems = walkDir(Consts.DOWNLOADS_FOLDER);
    state = {
        sortOptions: [
            {
                displayName: 'File Name',
                active: false,
                reverse: true,
                sortFunction(a, b) { return a.fileName.localeCompare(b.fileName) }
            },
            {
                displayName: 'Download Time',
                active: true,
                default: true,
                reverse: false,
                sortFunction(a, b) { return b.lastUpdated - a.lastUpdated }
            }
        ]
    };

    render() {
        return (
            <div>
                <h1>
                    Downloaded Anime:
                </h1>
                <Container>
                    <Row>
                        <InputGroup className="mx-5 d-block">
                            <ButtonGroup style={{float: "left"}}>
                                {
                                    this.state.sortOptions.map((props, i) => {
                                        return (
                                            <Button key={i} onClick={() => this.setSort(i)} className={props.active ? "active" : ""}>
                                                <span className={props.active ? props.reverse ? styles.arrowUp : styles.arrowDown : ""}>{props.displayName}</span>
                                            </Button>
                                        );
                                    })
                                }
                            </ButtonGroup>
                            <Form style={{ float: "right", marginBottom: 0 }}>
                                <FormControl
                                    placeholder="Filter"
                                    ref={this.filterElement}
                                    onChange={() => this.setState({})}
                                    type="text" />
                            </Form>
                        </InputGroup>
                    </Row>
                    <Row>
                        <div className={styles.grid + " guydht-scrollbar mx-5"}>
                            {
                                this.sortedItems.map((downloadedItem, i) => {
                                    return (
                                        <div key={downloadedItem.absolutePath} className={styles.gridElement + " m-3"}
                                            onClick={() => this.showVideo(downloadedItem)}>
                                            <LazyLoadComponent>
                                                <VideoThumbnail
                                                    videoUrl={Consts.FILE_URL_PROTOCOL + downloadedItem.absolutePath}
                                                    alt={downloadedItem.fileName}
                                                    renderedHeight={220}
                                                    className={styles.thumbnail}
                                                />
                                            </LazyLoadComponent>
                                            <div className={styles.cover}></div>
                                            <span className={styles.title}>{downloadedItem.fileName}</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </Row>
                </Container>
            </div>
        )
    }
    showVideo(videoItem) {
        window.setAppState({
            showVideo: true,
            videoItem
        })
    }
    setSort(propIndex) {
        let options = this.state.sortOptions.map((prop, i) => {
            if (i !== propIndex) {
                prop.active = false;
                prop.reverse = true;
            }
            else {
                prop.reverse = !prop.reverse;
                prop.active = true;
            }
            return prop;
        });
        this.setState({
            sortOptions: options
        })
    }
    get sortedItems() {
        let current = this.currentOption,
            items = [...this.downloadedItems];
        if (this.filterElement.current)
            items = items.filter(ele => ele.absolutePath.toLowerCase().includes(this.filterElement.current.value.toLowerCase()));
        let sorted = items.sort(current.sortFunction);
        if (current.reverse)
            sorted.reverse()
        return sorted;
    }
    get currentOption() {
        return this.state.sortOptions.find(ele => ele.active);
    }
}