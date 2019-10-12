import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./classes/AnimeStorage";
import "./classes/Consts";
import DownloadManager from './components/DownloadManager';
import Login from './components/Login';
import NavBar from './components/NavBar';
import ToastMessage from './components/ToastMessages';
import Watch from './components/Watch';
import "./css/GuydhtScrollbar.css";
import routerConfig from "./routerConfig";

export default class App extends Component {
  state = {
    showVideo: false,
    videoItem: null
  }
  componentDidMount() {
    window.setAppState = this.setState.bind(this);
    window.reloadPage = this.forceUpdate.bind(this);
  }
  render() {
    // eslint-disable-next-line
    if (!this.state.showVideo) this.state.videoItem = null;
    return (
      <div className="guydht-scrollbar">
        <BrowserRouter>
          <NavBar />
          <div style={{ marginTop: 70 }}>
            <Switch>
              {
                Object.entries(routerConfig).map(([thePath, theComponent]) => {
                  return (
                    <Route exact path={thePath} component={theComponent} key={thePath} />
                  )
                })
              }
            </Switch>
          </div>
        </BrowserRouter>
        <Login />
        {
          this.state.showVideo &&
          <Watch downloadedItem={this.state.videoItem} />
        }
        <DownloadManager />
        <ToastMessage />
      </div>
    )
  }
}
