import React, { Component } from "react";

export default class AnimeDetails extends Component {
    render() {
        let { animeEntry } = this.props.location.state || {};
        console.log(animeEntry);
        return (
            <div></div>
        );
    }
}