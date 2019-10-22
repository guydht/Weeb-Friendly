import { Forum as ForumType } from "jikants/dist/src/interfaces/anime/Forum";
import React, { Component } from "react";
import { Accordion, Col, Container, Jumbotron, Modal, OverlayTrigger, Row, Spinner, Tooltip } from "react-bootstrap";
//@ts-ignore
import { LazyLoadImage } from "react-lazy-load-image-component";
import PageTransition from "../../components/PageTransition";
import styles from "../../css/pages/Forum.module.css";
import { hasInternet } from "../../utils/general";
import MALUtils, { ForumEntry } from "../../utils/MAL";
import { AnimeInfoProps } from "../AnimeInfo";
import Home from "../Home";


export default class Forum extends Component<AnimeInfoProps> {

    state: { topics?: ForumType["topics"], forumEntry?: ForumEntry, loading: boolean } = {
        loading: true
    }

    transitionController = React.createRef<PageTransition>();

    componentDidMount() {
        MALUtils.animeForum(this.props.anime as any).then(topics => {
            if (topics && topics.length)
                this.setState({ topics, loading: false });
        }).catch(() => { this.setState({ loading: false }); this.componentDidMount() });
    }

    render() {
        return (
            <PageTransition style={{ overflow: "visible" }} ref={this.transitionController} className="mt-5" >
                <Container>
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
                                                <Col>Author: {topic.author_name}</Col>
                                                <Col>Posted: {topic.date_posted}</Col>
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
                        ) : !hasInternet() ? Home.noInternetComponent("Forums") : null
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
    forumEntries: Map<ForumType["topics"][0], ForumEntry> = new Map();
    loadForum(topic: ForumType["topics"][0]) {
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

