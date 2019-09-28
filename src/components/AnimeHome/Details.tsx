import React, { Component } from "react";
import Consts from "../../consts";
import { AnimeProps } from "../AnimePage";

export default class Details extends Component<AnimeProps> {

    state = {
        anime: this.props.anime,
        info: this.props.info
    };

    render() {
        console.log(Consts.MAL_USER.animeList.all[this.state.anime.malId!], this.state.anime.malId, { ...Consts.MAL_USER.animeList });
        return (
            <div></div>
        )
    }
}