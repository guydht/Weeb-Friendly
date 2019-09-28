import React, { Component } from "react";
import { Form, FormControl, ListGroup, ListGroupItem, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import AnimeEntry from "../classes/AnimeEntry";
import MALUtils from "../classes/MALUtils";


export default class SearchBar extends Component {
    static SEARCH_INPUT_TIMEOUT = 250;

    state = {
        displayEntries: true,
        entries: [],
        loading: false,
        loadingText: ""
    };

    render() {
        const onFocus = () => {
            this.setState({
                displayEntries: true
            })
        },
            onBlur = () => {
                setTimeout(() => {
                    this.setState({
                        loading: false,
                        loadingText: "",
                        displayEntries: false
                    });
                });
            };
        return (
            <Form onBlur={onBlur} onFocus={onFocus}>
                <FormControl type="text" placeholder="Search" className="mr-sm-2"
                    onChangeCapture={(e: any) => this.searchAnime(e)}
                    onBlur={() => this.setState({ loading: false, loadingText: "" })} />
                <ListGroup style={{ position: "relative", height: 0, zIndex: 99 }}>
                    <ListGroup style={{ position: "absolute", maxHeight: "30vh", overflowY: "auto", width: "100%" }}
                        className="guydht-scrollbar">
                        {
                            this.state.entries.length && this.state.displayEntries ?
                                this.state.entries.map((entry: AnimeEntry) => {
                                    return (
                                        <ListGroupItem onClick={() => console.log(entry)} title={Array.from(entry.synonyms).join(", ")} key={entry.malId}>
                                            <Link to={{
                                                pathname: "/anime/" + entry.malId,
                                                state: {
                                                    animeEntry: entry
                                                }
                                            }}>
                                                {entry.name}
                                            </Link>
                                        </ListGroupItem>
                                    )
                                }) : !this.state.loading ||
                                <ListGroupItem>
                                    <span>{this.state.loadingText}</span>
                                    <Spinner animation="border" role="status" size="sm" as="span"
                                        style={{ float: "right" }} />
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
            loadingText: "Loading...",
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
                        loadingText: "I need a longer input..."
                    })
            }, SearchBar.SEARCH_INPUT_TIMEOUT);
    }
    inputValidForSearch(value: string): boolean {
        return value.length > 3;
    }
}