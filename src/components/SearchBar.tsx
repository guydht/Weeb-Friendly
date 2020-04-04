import React, { Component } from "react";
import { Col, Form, FormControl, ListGroup, ListGroupItem, Row, Spinner } from "react-bootstrap";
//@ts-ignore
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import AnimeEntry from "../classes/AnimeEntry";
import styles from "../css/components/SearchBar.module.css";
import MALUtils from "../utils/MAL";

interface SearchBarProps {
    placeholder?: string;
    defaultValue?: string;
    gotoAnimePageOnChoose?: boolean;
    onItemClick?: (animeEntry: AnimeEntry) => void;
    onInputClick?: (e: React.MouseEvent & { doSearch: () => void }) => void;
    onInputChange?: (e: React.MouseEvent & { setResults: (resuslts: AnimeEntry[]) => void }) => void;
    showImage?: boolean;
    style?: object;
}

export default class SearchBar extends Component<SearchBarProps> {
    static SEARCH_INPUT_TIMEOUT = 250;

    state = {
        displayEntries: true,
        entries: [],
        loadingText: ""
    };

    componentWillUnmount() {
        this.setState = () => { };
    }

    render() {
        const onFocus = () => {
            this.setState({
                displayEntries: true
            })
        },
            onBlur = () => {
                setTimeout(() => {
                    this.setState({
                        loadingText: "",
                        displayEntries: false
                    });
                });
            };
        return (
            <Form onBlur={onBlur} onFocus={onFocus} onSubmit={() => false} style={(this.props.style || {})}>
                <FormControl type="text" placeholder={this.props.placeholder || "Search"} className="mr-sm-2"
                    onClick={(e: any) => {
                        e.doSearch = this.searchAnime.bind(this, e);
                        (this.props.onInputClick || function () { })(e);
                    }}
                    onChange={(e: any) => this.searchAnime(e)}
                    defaultValue={this.props.defaultValue || ""}
                    onBlur={() => this.setState({ loadingText: "" })} />
                <ListGroup className={styles.wrapper}>
                    {
                        this.state.entries.length && this.state.displayEntries ?
                            this.state.entries.map((entry: AnimeEntry) => {
                                return (
                                    <ListGroupItem onClick={() => this.chooseEntry(entry)}
                                        title={Array.from(entry.synonyms).join(", ")} key={entry.name}>
                                        <Row>
                                            {
                                                this.props.showImage && (
                                                    <Col>
                                                        <LazyLoadImage className={styles.image} src={entry.imageURL} />
                                                    </Col>
                                                )
                                            }
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
                            }) : !!this.state.loadingText ?
                                <ListGroupItem>
                                    <span>{this.state.loadingText}</span>
                                    <Spinner animation="border" role="status" size="sm" as="span"
                                        className={styles.spinner} />
                                </ListGroupItem> : null
                    }
                </ListGroup>
            </Form>
        )
    }
    searchInputTimeout: any;
    async searchAnime(e: any) {
        e.persist();
        let searchName = e.target.value;
        clearTimeout(this.searchInputTimeout);
        this.setState({
            loadingText: "Loading...",
            entries: []
        });
        this.searchInputTimeout = setTimeout(
            async () => {
                if (this.inputValidForSearch(searchName)) {
                    this.setState({
                        loadingText: "Loading..."
                    });
                    if (this.props.onInputChange) {
                        e.setResults = (results: AnimeEntry[]) => this.setState({ entries: results, loadingText: "" });
                        return this.props.onInputChange(e);
                    }
                    let results = await MALUtils.searchAnime(new AnimeEntry({ name: searchName })),
                        equal = results.filter(result => searchName.toLowerCase().match(/[a-z0-9]+/g).join("") ===
                            result.name!.toLowerCase().match(/[a-z0-9]+/g)!.join(""));
                    this.setState({
                        entries: results,
                        loadingText: ""
                    });
                    if (equal.length === 1)
                        this.chooseEntry(equal[0]);
                }
                else
                    this.setState({
                        loadingText: "I need a longer input..."
                    });
            }, SearchBar.SEARCH_INPUT_TIMEOUT);
    }
    inputValidForSearch(value: string): boolean {
        return value.length > 3;
    }
    chooseEntry(entry: AnimeEntry) {
        if (this.props.onItemClick)
            this.props.onItemClick(entry);
    }
}