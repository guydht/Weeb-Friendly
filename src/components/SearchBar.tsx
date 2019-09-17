import React, { Component } from "react";

import { FormControl, Form, ListGroup, ListGroupItem } from "react-bootstrap";
import AnimeEntry from "../classes/AnimeEntry";
import MALUtils from "../classes/MALUtils";
import loadingGif from "../assets/LoadingGIF.svg";

export default class SearchBar extends Component {
    state = {
        entries: [],
        loading: false,
        loadingText: ""
    };
    static SEARCH_INPUT_TIMEOUT = 250;

    render() {
        return (
            <Form>
                <FormControl type="text" placeholder="Search" className="mr-sm-2"
                    onChangeCapture={(e: any) => this.searchAnime(e)}
                    onBlur={() => this.setState({ loading: false, loadingText: "" })} />
                <ListGroup style={{ position: "relative", height: 0 }}>
                    <ListGroup style={{ position: "absolute", maxHeight: "30vh", overflowY: "auto", width: "100%" }}
                        className="guydht-scrollbar">
                        {
                            this.state.entries.length ?
                                this.state.entries.map((entry: AnimeEntry) => {
                                    return (
                                        <ListGroupItem title={Array.from(entry.synonyms).join(", ")} key={entry.malId}>
                                            {
                                                entry.name
                                            }
                                        </ListGroupItem>
                                    )
                                }) : !this.state.loading ||
                                <ListGroupItem>
                                    <img src={loadingGif} alt="" style={{ transform: "scale(2)", float: "right", height: "26px" }} />
                                    {this.state.loadingText}
                                </ListGroupItem>
                        }
                    </ListGroup>
                </ListGroup>
            </Form>
        )
    }
    searchInputTimeout: any;
    async searchAnime(e: any) {
        let searchName = e.target.value;
        if (this.searchInputTimeout)
            clearTimeout(this.searchInputTimeout);
        this.setState({
            loading: true,
            loadingText: "Waiting for typing to end...",
            entries: []
        });
        this.searchInputTimeout = setTimeout(
            async () => {
                if (this.inputValidForSearch(searchName)) {
                    this.setState({
                        loadingText: "Loading..."
                    });
                    let results = await MALUtils.searchAnime(searchName);
                    this.setState({
                        entries: results,
                        loading: false,
                        loadingText: ""
                    });
                }
                else
                    this.setState({
                        loadingText: "Waiting for input to be longer..."
                    })
            }, SearchBar.SEARCH_INPUT_TIMEOUT);
    }
    inputValidForSearch(value: string): boolean {
        return value.length > 3;
    }
}