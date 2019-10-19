import React, { Component } from "react";
import { Button, ButtonGroup, Container, FormControl, InputGroup, Row } from "react-bootstrap";
import Form from "react-bootstrap/FormGroup";
import { withRouter } from "react-router";
import Consts from "../../classes/Consts";
import { walkDir } from "../../utils/general";
import DownloadedFileThumbnail from "../../components/DownloadedFileThumbnail";
import { waitFor } from "../../jsHelpers/jifa";
import MALUtils from "../../utils/MAL";
import styles from "../../css/pages/DownloadedAnime.module.css";

export default withRouter(class DownloadedAnime extends Component {

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
    componentDidMount() {
        if (this.downloadedItems.every(ele => !ele.malId) || MALUtils.storageSize === 0)
            waitFor(() => MALUtils.storageSize > 0, () => {
                this.setState({});
            });
    }
    componentWillUpdate() {
        this.downloadedItems = walkDir(Consts.DOWNLOADS_FOLDER);
    }

    render() {
        return (
            <div>
                <h1>
                    Downloaded Anime:
                </h1>
                <Container>
                    <Row>
                        <InputGroup className="mx-5 mb-2 d-block">
                            <ButtonGroup style={{ float: "left" }}>
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
                                this.sortedItems.map(downloadedItem => {
                                    return (
                                        <DownloadedFileThumbnail key={downloadedItem.absolutePath} downloadedItem={downloadedItem} className="m-1" />
                                    )
                                })
                            }
                        </div>
                    </Row>
                </Container>
            </div>
        )
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
        if (this.filterElement.current) {
            let filterValue = this.filterElement.current.value.toLowerCase();
            if (filterValue)
                items = items.filter(ele => filterValue.startsWith("!") && filterValue.length > 1 ?
                    !ele.absolutePath.toLowerCase().includes(filterValue.slice(1)) : ele.absolutePath.toLowerCase().includes(filterValue));
        }
        let sorted = items.sort(current.sortFunction);
        if (current.reverse)
            sorted.reverse()
        return sorted;
    }
    get currentOption() {
        return this.state.sortOptions.find(ele => ele.active);
    }
});