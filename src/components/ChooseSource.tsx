import React, { Component, ReactElement } from "react";
import { Nav, Tab, TabContainerProps } from "react-bootstrap";
//@ts-ignore
import { LazyLoadComponent } from "react-lazy-load-image-component";
import Consts from "../classes/Consts";
import { Sources } from "../utils/torrents";

export default class ChooseSource extends Component<{ contentComponent?: ReactElement, render?: (source: Sources) => ReactElement, lazyLoad?: boolean } & TabContainerProps> {

    state: { currentSource: Sources } = {
        currentSource: Consts.SOURCE_PREFERENCE[0]
    }

    changeSource(source: Sources) {
        this.setState({ source });
    }

    render() {
        let props = { ...this.props },
            contentComponent = this.props.contentComponent || this.props.children;
        if (!React.isValidElement(contentComponent) && !this.props.render) return null;
        delete props.contentComponent;
        delete props.children;
        delete props.render;
        return (
            <Tab.Container {...props} defaultActiveKey={Consts.SOURCE_PREFERENCE[0]}>
                <Nav variant="pills" defaultActiveKey={this.state.currentSource} className="mb-3 justify-content-center">
                    {
                        Consts.SOURCE_PREFERENCE_ENTRIES.map(([sourceName, source]) => {
                            return (
                                <Nav.Item key={source} onClick={() => this.changeSource(source)}>
                                    <Nav.Link eventKey={source}>{sourceName}</Nav.Link>
                                </Nav.Item>
                            );
                        })
                    }
                </Nav>
                <Tab.Content>
                    {
                        Consts.SOURCE_PREFERENCE.map((source, index) =>
                            <Tab.Pane eventKey={source} key={index}>
                                {
                                    this.props.lazyLoad && index !== 0 ?
                                        <LazyLoadComponent>
                                            {
                                                this.props.render ? this.props.render(source) : React.cloneElement(contentComponent as any, { source })
                                            }
                                        </LazyLoadComponent>
                                        :
                                        this.props.render ? this.props.render(source) : React.cloneElement(contentComponent as any, { source })
                                }
                            </Tab.Pane>
                        )
                    }
                </Tab.Content>
            </Tab.Container >
        )
    }
}
