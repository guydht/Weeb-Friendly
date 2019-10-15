import React, { Component } from "react";
import { Col, Container, FormCheck, Jumbotron, Row } from "react-bootstrap";
//@ts-ignore
import Sortable from "react-sortablejs";
import Consts from "../classes/Consts";
import changableTextStyles from "../css/components/ChangableText.module.css";
import styles from "../css/pages/Settings.module.css";
import { Sources } from "../utils/torrents";
import { ThumbnailManager } from "../classes/AnimeStorage";

export default class Settings extends Component {
    render() {
        return (
            <Jumbotron className="text-center px-5">
                <h2>Settings</h2>
                <Container className={styles.container}>
                    <Row className="mb-5">
                        <Col>
                            Sources Preferences:
                        </Col>
                        <Col>
                            <Sortable className={styles.backgroundGreenToRed + " py-1"} onChange={(sources: Sources[]) => this.setSourcesPriority(sources)}>
                                {
                                    Consts.SOURCE_PREFERENCE_ENTRIES.map(([sourceName, source]) => {
                                        return (
                                            <span key={source} data-id={source} className={changableTextStyles.textWrapper + " ml-1"}>{sourceName}</span>
                                        );
                                    })
                                }
                            </Sortable>
                        </Col>
                    </Row>
                    <Row className="mb-5">
                        <Col>
                            Quality Priority:
                        </Col>
                        <Col>
                            <Sortable className={styles.backgroundGreenToRed + " py-1"} onChange={(qualities: number[]) => this.setQualityPreference(qualities)}>
                                {
                                    Consts.QUALITY_PREFERENCE.map(quality => {
                                        return (
                                            <span key={quality} data-id={quality} className={changableTextStyles.textWrapper}>{quality}</span>
                                        );
                                    })
                                }
                            </Sortable>
                        </Col>
                    </Row>
                    <Row className="mb-5">
                        <Col>
                            Toggle Middle Click Functionallity:
                        </Col>
                        <Col>
                            <FormCheck
                                className={styles.bigSwitch}
                                type="switch"
                                id="middleClickToggle"
                                checked={Consts.MIDDLE_CLICK}
                                onChange={(e: React.ChangeEvent) => this.setMiddleClickToggle((e.target as HTMLInputElement).checked)}
                                label="" custom />
                        </Col>
                    </Row>
                    <Row className="mb-5">
                        <Col>Save anime thumbnail photos locally</Col>
                        <Col>
                            <FormCheck
                                className={styles.bigSwitch}
                                type="switch"
                                id="thumbnailStorage"
                                checked={ThumbnailManager.SAVED_THUMBNAILS_STATE}
                                onChange={(e: React.ChangeEvent) => this.setThumbnailStorage((e.target as HTMLInputElement).checked)}
                                label="" custom />
                        </Col>
                    </Row>
                </Container>
            </Jumbotron>
        );
    }
    setSourcesPriority(sources: Sources[]) {
        Consts.setSourcesPreference(sources);
        this.forceUpdate();
    }
    setQualityPreference(qualities: number[]) {
        Consts.setQualityPreference(qualities.map(Number));
        this.forceUpdate();
    }
    setMiddleClickToggle(activated: boolean) {
        Consts.setMiddleClick(activated);
        this.forceUpdate();
    }
    setThumbnailStorage(activated: boolean){
        ThumbnailManager.setThumbnailStorageState(activated);
        this.forceUpdate();
    }
}