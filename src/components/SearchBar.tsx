import React, { Component } from "react";
import { Col, Form, FormControl, ListGroup, ListGroupItem, Row, Spinner } from "react-bootstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import AnimeEntry from "../classes/AnimeEntry";
import MALUtils from "../classes/MALUtils";
import styles from "./css/SearchBar.module.css";

interface SearchBarProps {
    placeholder?: string;
    gotoAnimePageOnChoose?: boolean;
    onItemClick?: (animeEntry: AnimeEntry) => any;
    onInputClick?: (e: React.MouseEvent) => any;
    showImage?: boolean;
    style?: object;
}

export default class SearchBar extends Component<SearchBarProps> {
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
            <Form onBlur={onBlur} onFocus={onFocus} {...(this.props.style || {})}>
                <FormControl type="text" placeholder={this.props.placeholder || "Search"} className="mr-sm-2"
                    onClick={(e: React.MouseEvent) => (this.props.onInputClick || function () { })(e) && this.searchAnime(e)}
                    onChange={(e: any) => this.searchAnime(e)}
                    onBlur={() => this.setState({ loading: false, loadingText: "" })} />
                <ListGroup className={styles.container}>
                    <ListGroup className={styles.wrapper + " guydht-scrollbar"}>
                        {
                            this.state.entries.length && this.state.displayEntries ?
                                this.state.entries.map((entry: AnimeEntry) => {
                                    return (
                                        <ListGroupItem onClick={() => (this.props.onItemClick || function () { })(entry)}
                                            title={Array.from(entry.synonyms).join(", ")} key={entry.malId}>
                                            <Row>
                                                <Col>
                                                    {
                                                        this.props.showImage && (
                                                            <LazyLoadImage className={styles.image} src={entry.imageURL} />
                                                        )
                                                    }
                                                </Col>
                                                <Col>
                                                    {
                                                        (this.props.gotoAnimePageOnChoose !== false) ?
                                                            <Link to={{
                                                                pathname: "/anime/" + entry.malId,
                                                                state: {
                                                                    animeEntry: entry
                                                                }
                                                            }}>
                                                                {entry.name}
                                                            </Link>
                                                            : entry.name
                                                    }
                                                </Col>
                                            </Row>
                                        </ListGroupItem>
                                    )
                                }) : !this.state.loading ||
                                <ListGroupItem>
                                    <span>{this.state.loadingText}</span>
                                    <Spinner animation="border" role="status" size="sm" as="span"
                                        className={styles.spinner} />
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