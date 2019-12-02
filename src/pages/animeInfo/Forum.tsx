import React, { Component } from "react";
import { Accordion, Col, Container, Jumbotron, Modal, OverlayTrigger, Pagination, Row, Spinner, Toast, Tooltip } from "react-bootstrap";
//@ts-ignore
import { LazyLoadImage } from "react-lazy-load-image-component";
import PageTransition from "../../components/PageTransition";
import styles from "../../css/pages/Forum.module.css";
import { hasInternet } from "../../utils/general";
import MALUtils, { ForumEntry, ForumTopic } from "../../utils/MAL";
import { AnimeInfoProps } from "../AnimeInfo";
import Home from "../Home";


export default class Forum extends Component<AnimeInfoProps> {

    state: {
        topics?: ForumTopic[], forumEntry?: ForumEntry, loading: boolean, errorFetching?: boolean,
        errorMessage?: string, currentPageNumber: number, totalPages: number
    } = {
            loading: true,
            currentPageNumber: 0,
            totalPages: 0
        }

    transitionController = React.createRef<PageTransition>();
    savedPages: Map<number, ForumTopic[]> = new Map();

    componentDidMount() {
        this.loadPageNumber(0);
    }

    loadPageNumber(pageNumber: number) {
        if(pageNumber < 0) return;
        if (this.savedPages.has(pageNumber))
            return this.setState({ topics: this.savedPages.get(pageNumber), loading: false, currentPageNumber: pageNumber });;
        this.setState({ loading: true })
        MALUtils.animeForum(this.props.anime as any, pageNumber).then(([topics, numOfPages]) => {
            if (topics && topics.length) {
                this.savedPages.set(pageNumber, topics);
                this.setState({ topics, loading: false, totalPages: numOfPages, currentPageNumber: pageNumber });
            }
            else throw new Error("MyAnimeList didn't respond as expected!");
        }).catch((e) => { this.setState({ loading: false, errorFetching: true, errorMessage: e.toString() }); });
    }

    render() {
        return (
            <PageTransition style={{ overflow: "visible" }} ref={this.transitionController} className="mt-5" >
                <Container>
                    {this.state.totalPages !== 0 &&
                        <Pagination >
                            <Pagination.First onClick={() => this.loadPageNumber(1)} />
                            <Pagination.Prev onClick={() => this.loadPageNumber(this.state.currentPageNumber - 1)} />
                            {
                                Array.from(new Array(this.state.totalPages)).map((_, i) => {
                                    return (
                                        <Pagination.Item
                                            key={i}
                                            onClick={() => this.loadPageNumber(i)}
                                            active={this.state.currentPageNumber === i}>
                                            {i + 1}
                                        </Pagination.Item>
                                    )
                                })
                            }
                            <Pagination.Next onClick={() => this.loadPageNumber(this.state.currentPageNumber + 1)} />
                            <Pagination.Last onClick={() => this.loadPageNumber(this.state.totalPages)} />
                        </Pagination>
                    }
                    {
                        this.state.topics && this.state.topics.map((topic, i) => {
                            return (
                                <Modal.Dialog className="my-1" size="xl" key={i}>
                                    <div className={styles.modalWrapper}>
                                        <Modal.Header onClick={() => this.loadForum(topic)}
                                            className={"ml-3 my-auto " + styles.modalHeader}>
                                            {topic.title}
                                        </Modal.Header>
                                        <Modal.Body className={styles.modalBody}>
                                            <Row>
                                                <Col>Replies: {topic.replies}</Col>
                                                <Col>Author: {topic.author}</Col>
                                                <Col>Posted: {topic.posted}</Col>
                                            </Row>
                                        </Modal.Body>
                                    </div>
                                </Modal.Dialog>
                            )
                        })
                    }
                    {
                        hasInternet() && this.state.loading ? (
                            <div className={styles.loadingContainer} style={{ position: this.state.topics ? "absolute" : "initial" }}>
                                <Modal.Dialog>
                                    <Modal.Header>
                                        Loading....
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Spinner animation="border" />
                                    </Modal.Body>
                                </Modal.Dialog>
                            </div>
                        ) : !hasInternet() ? Home.noInternetComponent("Forums") : this.state.errorFetching && (
                            <Toast className="mx-auto mt-5">
                                <Toast.Header closeButton={false}>
                                    <span>Couldn't load forum topics from MyAnimeList. Something went wrong!</span>
                                </Toast.Header>
                                <Toast.Body>
                                    Error Message:
                                    {this.state.errorMessage}
                                </Toast.Body>
                            </Toast>
                        )
                    }
                </Container>
                <Container>
                    {this.state.forumEntry && (
                        <Jumbotron>
                            <OverlayTrigger trigger="hover" overlay={<Tooltip id="placement-right">Go Back</Tooltip>} placement="right">
                                <span style={{ position: "absolute", top: "1.75rem", cursor: "pointer" }}
                                    className="carousel-control-prev-icon"
                                    onClick={() => this.transitionController.current!.moveTo(0)} />
                            </OverlayTrigger>
                            <h1>
                                {this.state.forumEntry.title}
                            </h1>
                            {
                                this.state.forumEntry.messages.map((message, i) => {
                                    return (
                                        <Modal.Dialog id={message.id.toString()} className="my-1" size="xl" key={i}>
                                            <Accordion as={Modal.Header} className="mx-4">
                                                <Accordion.Toggle as={Container} eventKey={"0"} className={styles.accordingToggle}>
                                                    <Row className="py-2">{message.user.name}</Row>
                                                    <Accordion.Collapse eventKey={"0"} className="ml-5 w-100">
                                                        <Container className="d-flex">
                                                            <Row>
                                                                <Col>Joined: {message.user.joined}</Col>
                                                                <Col>Status: {message.user.status}</Col>
                                                                <Col>Posts: {message.user.posts}</Col>
                                                            </Row>
                                                            <Row className="ml-auto">
                                                                <LazyLoadImage src={message.user.imageURL} />
                                                            </Row>
                                                        </Container>
                                                    </Accordion.Collapse>
                                                </Accordion.Toggle>
                                            </Accordion>
                                            <Modal.Body dangerouslySetInnerHTML={{ __html: message.messageHTML }}>
                                            </Modal.Body>
                                        </Modal.Dialog>
                                    )
                                })
                            }
                        </Jumbotron>
                    )}
                </Container>
                <span></span>
            </PageTransition >
        )
    }
    forumEntries: Map<ForumTopic, ForumEntry> = new Map();
    loadForum(topic: ForumTopic) {
        if (this.forumEntries.has(topic)) {
            this.setState({
                forumEntry: this.forumEntries.get(topic),
                loading: false
            });
            if (this.transitionController.current)
                this.transitionController.current.moveTo(1);
            return;
        }
        this.setState({
            loading: true
        });
        MALUtils.forumEntry(topic).then(forumEntry => {
            this.forumEntries.set(topic, forumEntry);
            this.setState({
                forumEntry,
                loading: false
            });
            if (this.transitionController.current)
                this.transitionController.current.moveTo(1);
        }).catch(() => this.setState({ loading: false }));
    }
}

