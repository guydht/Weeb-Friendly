import React, { Component } from 'react';
import { HashRouter, Route } from "react-router-dom";
import Login from './components/Login';
import NavBar from './components/NavBar';
import ToastMessage from './components/ToastMessages';
import Watch from './components/Watch';
import "./css/GuydhtScrollbar.css";
import routerConfig from "./routerConfig";
import DownloadManager from './components/DownloadManager';


export default class App extends Component {
  state = {
    showVideo: false,
    videoItem: null
  }
  componentDidMount() {
    window.setAppState = this.setState.bind(this);
    // window.consts = Consts;
  }
  render() {
    return (
      <div className="guydht-scrollbar">
        <HashRouter>
          <NavBar reloadParent={() => this.forceUpdate()} />
          {
            Object.entries(routerConfig).map(([thePath, theComponent]) => {
              return (
                <Route exact path={thePath} component={theComponent} key={thePath} />
              )
            })
          }
        </HashRouter>
        <Login reloadParent={() => this.forceUpdate()} />
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
