import React, { Component } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ReactComponent as ClosedEyelid } from "../assets/ClosedEyelid.svg";

interface HasSeenProps {
	hasSeen: boolean;
}

export default class HasSeen extends Component<HasSeenProps & React.ComponentPropsWithRef<'svg'>> {
	render() {
		const props = { ...this.props };
		delete props.hasSeen;
		return (
			this.props.hasSeen ? <OverlayTrigger trigger={["hover", "focus"]} placement="top" overlay={
				<Tooltip id="">Seen This Episode</Tooltip>
			}>
				<ClosedEyelid {...props} style={{
					position: "absolute",
					zIndex: 4,
					cursor: "auto",
					top: "4%",
					fill: "rgba(250, 250, 250, 0.7)",
					left: "8%",
					borderRadius: "70%",
					background: "rgba(0, 0, 0, 0.5)"
				}} />
			</OverlayTrigger> : null
		)
	}
}