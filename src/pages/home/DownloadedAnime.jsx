import React, { Component } from "react";
import { Button, ButtonGroup, Container, InputGroup, Row } from "react-bootstrap";
import Form from "react-bootstrap/FormGroup";
import { withRouter } from "react-router";
import Consts from "../../classes/Consts";
import ChangableText from "../../components/ChangableText";
import DownloadedFileThumbnail from "../../components/DownloadedFileThumbnail";
import styles from "../../css/pages/DownloadedAnime.module.css";
import { waitFor } from "../../jsHelpers/jifa";
import MALUtils from "../../utils/MAL";

export class DisplayDownloadedAnime extends Component {
	render() {
		let props = { ...this.props };
		delete props.style;
		return (
			<div className={styles.grid} style={this.props.style || {}} >
				{
					this.props.downloadedItems.map(downloadedItem => {
						return (
							<DownloadedFileThumbnail {...props} key={downloadedItem.absolutePath} downloadedItem={downloadedItem} />
						);
					})
				}
			</div>
		);
	}
}

export default withRouter(class DownloadedAnime extends Component {

	filterElement = React.createRef();

	state = {
		sortOptions: [
			{
				displayName: 'File Name',
				active: false,
				reverse: true,
				sortFunction(a, b) { return a.episodeName.localeCompare(b.episodeName); }
			},
			{
				displayName: 'Download Time',
				active: true,
				default: true,
				reverse: false,
				sortFunction(a, b) { return b.lastUpdated - a.lastUpdated; }
			}
		],
		filters: []
	};
	componentDidMount() {
		if (Consts.DOWNLOADED_ITEMS.every(ele => !ele.malId) || MALUtils.storageSize === 0)
			waitFor(() => MALUtils.storageSize > 0, () => {
				this.setState({});
			});
	}

	render() {
		return (
			<div>
				<h1>
					Downloaded Anime:
                </h1>
				<Container>
					<Row>
						<InputGroup className="mx-5 mb-2 d-block">
							<ButtonGroup style={{ float: "left" }}>
								{
									this.state.sortOptions.map((props, i) => {
										return (
											<Button key={i} onClick={() => this.setSort(i)} className={props.active ? "active" : ""}>
												<span className={props.active ? props.reverse ? styles.arrowUp : styles.arrowDown : ""}>{props.displayName}</span>
											</Button>
										);
									})
								}
							</ButtonGroup>
							<Form style={{ float: "right", marginBottom: 0 }}>
								{
									Consts.DOWNLOADED_ITEMS_FILTER.map((filter, i) => {
										return (
											<ChangableText text={filter} key={i + filter}
												onChange={text => {
													if (text.trim() === "")
														Consts.DOWNLOADED_ITEMS_FILTER.splice(i, 1);
													else
														Consts.DOWNLOADED_ITEMS_FILTER[i] = text;
													Consts.setDownloadedItemsFilter(Consts.DOWNLOADED_ITEMS_FILTER);
													this.forceUpdate();
												}} />
										);
									})
								}
								<ChangableText text="Add Filter" removeButton={false}
									key={Consts.DOWNLOADED_ITEMS_FILTER.length}
									onClick={e => e.target.innerHTML = ""}
									onChange={text => {
										if (text === "") return;
										Consts.DOWNLOADED_ITEMS_FILTER.push(text);
										Consts.setDownloadedItemsFilter(Consts.DOWNLOADED_ITEMS_FILTER);
										this.forceUpdate();
									}} />
							</Form>
						</InputGroup>
					</Row>
					<Row>
						<DisplayDownloadedAnime downloadedItems={this.sortedItems} />
					</Row>
				</Container>
			</div>
		);
	}
	setSort(propIndex) {
		let options = this.state.sortOptions.map((prop, i) => {
			if (i !== propIndex) {
				prop.active = false;
				prop.reverse = true;
			}
			else {
				prop.reverse = !prop.reverse;
				prop.active = true;
			}
			return prop;
		});
		this.setState({
			sortOptions: options
		});
	}
	get sortedItems() {
		const current = this.currentOption;
		if (this.filterElement.current) {
			let filterValue = this.filterElement.current.value.toLowerCase();
			Consts.setDownloadedItemsFilter(filterValue);
		}
		const sorted = Consts.FILTERED_DOWNLOADED_ITEMS.sort(current.sortFunction);
		if (current.reverse)
			sorted.reverse();
		return sorted;
	}
	get currentOption() {
		return this.state.sortOptions.find(ele => ele.active);
	}
});