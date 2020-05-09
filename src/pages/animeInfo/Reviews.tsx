import React, { Component } from "react";
import { Col, Modal, Row, Table } from "react-bootstrap";
//@ts-ignore
import { LazyLoadImage } from "react-lazy-load-image-component";
import MALUtils from "../../utils/MAL";
import { AnimeInfoProps } from "../AnimeInfo";

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
type ReviewData = Exclude<ThenArg<ReturnType<typeof MALUtils.animeReviews>>, undefined>["reviews"][0];

class DisplayReview extends Component<{ review: ReviewData, anime: AnimeInfoProps["anime"], active?: boolean } & React.ComponentPropsWithRef<'div'>>{

	render() {
		const review = this.props.review,
			collapsed = !this.props.active,
			reviewString = collapsed ? review.content.substring(0, 500) + "..." : review.content,
			props: any = { ...this.props };
		delete props.anime;
		delete props.review;
		delete props.active;
		return (
			<Modal.Dialog key={review.mal_id} size="xl" {...props}>
				<Modal.Header>
					<div>
						<Row>
							<Col><LazyLoadImage src={review.reviewer.image_url} /></Col>
							<Col>
								<Row>{review.reviewer.username}</Row>
								<Row><strong style={{ marginRight: ".5rem" }}>{review.helpful_count}</strong> People found this review helpful!</Row>
							</Col>
						</Row>
					</div>
					<div style={{ float: "right", textAlign: "right" }}>
						<div>{review.date.toLocaleDateString()}</div>
						<div>{review.reviewer.episodes_seen} of {this.props.anime.totalEpisodes} episodes seen</div>
						{
							collapsed && <div>Overall Rating: {review.reviewer.scores.overall}</div>
						}
						{
							!collapsed &&
							<Table striped bordered hover size="sm" style={{ textAlign: "initial" }}>
								<thead>
									<tr>
										<th>Overall</th>
										<th>{review.reviewer.scores.overall}</th>
									</tr>
								</thead>
								<tbody>
									{
										Object.entries(review.reviewer.scores).map(([key, val]) => {
											if (key === "overall") return null;
											return (
												<tr key={key}>
													<td>{key}</td>
													<td>{val}</td>
												</tr>
											)
										})
									}
								</tbody>
							</Table>
						}
					</div>
				</Modal.Header>
				<Modal.Body>
					{
						reviewString.split("\n").map((content, i) => {
							return <p key={i}>{content.replace(/\n/g, "")}</p>;
						})
					}
				</Modal.Body>
			</Modal.Dialog>
		)
	}
}

export default class Reviews extends Component<AnimeInfoProps> {

	state: { reviews: ReviewData[], activeReviewIndex: number } = {
		reviews: [],
		activeReviewIndex: -1
	}

	componentDidMount() {
		MALUtils.animeReviews(this.props.anime as any).then(reviews => {
			this.setState({ reviews: reviews?.reviews });
		})
	}

	render() {
		return this.state.reviews.map((review, index) => {
			return <DisplayReview review={review} key={review.mal_id} anime={this.props.anime}
				onMouseEnter={() => this.setState({ activeReviewIndex: index })}
				active={index === this.state.activeReviewIndex} />
		})
	}
}