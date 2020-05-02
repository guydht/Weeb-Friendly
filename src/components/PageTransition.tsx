import React, { Component, HTMLAttributes } from "react";
import { Carousel, CarouselProps } from "react-bootstrap";

export default class PageTransition extends Component<Omit<CarouselProps, "activeIndex" | "controls" | "indicators"> & HTMLAttributes<HTMLDivElement>> {

	carousel = React.createRef<Carousel>();

	state = {
		activeIndex: 0
	}

	render() {
		let props = { ...this.props };
		delete props.children;
		return (
			<Carousel {...props} activeIndex={this.state.activeIndex}
				onSelect={() => { }} // to silence annoying error
				ref={this.carousel as any} controls={false} indicators={false}>
				{
					React.Children.map(this.props.children, (page, i) => {
						return (
							<Carousel.Item>
								{page}
							</Carousel.Item>
						);
					})
				}
			</Carousel>
		)
	}
	moveTo(pageIndex: number) {
		this.setState({
			activeIndex: pageIndex
		});
	}
}