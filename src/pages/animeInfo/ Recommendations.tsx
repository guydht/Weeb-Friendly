import React, { Component } from "react";
import { Col, Container, Modal, Row } from "react-bootstrap";
//@ts-ignore
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import MALUtils from "../../utils/MAL";
import { AnimeInfoProps } from "../AnimeInfo";


type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
type RecommandationData = Exclude<ThenArg<ReturnType<typeof MALUtils.animeRecommandation>>, void>[0];

class DisplayRecommandation extends Component<{ recommandation: RecommandationData }>{

	state: { expanded: boolean } = {
		expanded: false
	}

	render() {
		const recommandation = this.props.recommandation;
		return (
			<Modal.Dialog size="xl"
				onMouseEnter={() => this.setState({ expanded: true })}
				onMouseLeave={() => this.setState({ expanded: false })}>
				<Modal.Header>
					<h1>
						<Link key={recommandation.animeRecommanded.malId} className="mr-3" to={{
							pathname: "/anime/" + recommandation.animeRecommanded.malId,
							state: {
								animeEntry: recommandation.animeRecommanded
							}
						}}>{recommandation.animeRecommanded.name}</Link>
					</h1>
				</Modal.Header>
				<Modal.Body>
					<Container>
						<Row>
							<Col md="auto"><LazyLoadImage src={recommandation.animeRecommanded.imageURL} /></Col>
							<Col>
								<Row>
									{
										recommandation.recommandationEntries.map((recommandationEntry, i) => {
											const isHidden = !this.state.expanded && i > 1;
											if (isHidden) return null;
											return (
												<Modal.Dialog key={i} style={{ marginTop: 0, marginBottom: 0 }}>
													<Modal.Header>
														{recommandationEntry.recommandedText}
													</Modal.Header>
													<Modal.Body style={{ marginBottom: ".5rem", marginTop: ".5rem" }}>
														Recommanded by {recommandationEntry.recommandedUsername}
													</Modal.Body>
												</Modal.Dialog>
											)
										})
									}
								</Row>
							</Col>
						</Row>
					</Container>
				</Modal.Body>
			</Modal.Dialog>
		)
	}
}

export default class Recommendations extends Component<AnimeInfoProps> {

	state: { recommandations: RecommandationData[] } = {
		recommandations: []
	}

	componentDidMount() {
		MALUtils.animeRecommandation(this.props.anime as any).then(recommandations => {
			this.setState({ recommandations: recommandations ?? [] });
		})
	}

	render() {
		return this.state.recommandations.map((recommandation, i) => {
			return <DisplayRecommandation key={i} recommandation={recommandation} />
		})
	}
}