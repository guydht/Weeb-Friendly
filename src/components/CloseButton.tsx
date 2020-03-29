import React, { Component, MouseEvent } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Placement, OverlayChildren } from "react-bootstrap/Overlay";
import styles from "../css/components/CloseButton.module.css";

export default class CloseButton extends Component<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & { onClick: (e?: MouseEvent) => any | void, tooltipText?: string, toolTipElement?: OverlayChildren, toolTipPlacement?: Placement }> {
    render() {
        let placement = this.props.toolTipPlacement || "auto",
            overlay = this.props.toolTipElement || <Tooltip id={`tooltip-${placement}`}>
                {this.props.tooltipText || ""}
            </Tooltip>,
            props = { ...this.props };
        delete props.onClick;
        delete props.tooltipText;
        delete props.toolTipElement;
        delete props.toolTipPlacement;
        delete props.className;
        if (this.props.tooltipText)
            return (
                <OverlayTrigger
                    placement={placement}
                    overlay={overlay}>
                    <span
                        {...props}
                        className={styles.span + (this.props.className ? " " + this.props.className : "")}
                        onClick={e => this.props.onClick(e)}>
                        <span aria-hidden="true">×</span>
                    </span>
                </OverlayTrigger>
            )
        return (
            <span
                {...props}
                className={styles.span + (this.props.className ? " " + this.props.className : "")}
                onClick={e => this.props.onClick(e)}>
                <span aria-hidden="true">×</span>
            </span>
        )
    }
}