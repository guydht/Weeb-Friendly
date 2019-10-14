import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./classes/AnimeStorage";
import "./classes/Consts";
import DownloadManager from './pages/global/DownloadManager';
import Login from './pages/global/Login';
import NavBar from './pages/global/NavBar';
import ToastMessage from './pages/global/ToastMessages';
import Watch from './pages/global/Watch';
import routerConfig from "./routerConfig";
import "./classes/Consts";

const fs = window.require("fs");
let globalStyles = fs.readdirSync("./src/css/global/");
globalStyles.forEach(global => {
  import("./css/global/" + global);
});

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
          <div style={{ marginTop: 77 }}>
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
