import React, { Component, MouseEvent } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Placement } from "react-bootstrap/Overlay";
import styles from "../css/components/CloseButton.module.css";

export default class CloseButton extends Component<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & { onClick: (e?: MouseEvent) => any | void, tooltipText?: string, toolTipElement?: Component, toolTipPlacement?: Placement }> {
    render() {
        let placement = this.props.toolTipPlacement || "auto",
            overlay = this.props.toolTipElement || <Tooltip id={`tooltip-${placement}`}>
                {this.props.tooltipText || ""}
            </Tooltip>;
        if (this.props.tooltipText)
            return (
                <OverlayTrigger
                    placement={placement}
                    overlay={overlay}>
                    <span
                        className={styles.span}
                        onClick={e => this.props.onClick(e)}>
                        <span aria-hidden="true">×</span>
                    </span>
                </OverlayTrigger>
            )
        return (
            <span
                style={this.props.style || {}}
                className={styles.span}
                onClick={e => this.props.onClick(e)}>
                <span aria-hidden="true">×</span>
            </span>
        )
    }
}