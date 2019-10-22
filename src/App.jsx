import React, { Component } from 'react';
import { MemoryRouter, Route, Switch } from "react-router-dom";
import "./classes/AnimeStorage";
import "./classes/Consts";
import "./css/global/App.css";
import "./css/global/Forum.css";
import DownloadManager from './pages/global/DownloadManager';
import Login from './pages/global/Login';
import NavBar from './pages/global/NavBar';
import ToastMessage from './pages/global/ToastMessages';
import Watch from './pages/global/Watch';
import routerConfig from "./routerConfig";

export default class App extends Component {

  state = {
    showVideo: false,
    videoItem: null
  }

  router = React.createRef();

  componentDidMount() {
    window.setAppState = this.setState.bind(this);
    window.reloadPage = this.forceUpdate.bind(this);

    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("lastPathname", this.router.current.history.location.pathname);
    });

    window.addEventListener("keydown", e => {
      if (e.ctrlKey && e.code === "KeyR" && !e.shiftKey && !e.altKey) {
        sessionStorage.setItem("lastPathname", this.router.current.history.location.pathname);
        this.forceUpdate();
        e.preventDefault();
      }
    });

  }
  render() {
    // eslint-disable-next-line
    if (!this.state.showVideo) this.state.videoItem = null;
    return (
      <div>
        <MemoryRouter ref={this.router} initialEntries={[sessionStorage.getItem("lastPathname") || ""]} initialIndex={0}>
          <NavBar />
          <div style={{ marginTop: 70 }}>
            <Switch>
              {
                Object.entries(routerConfig).map(([thePath, TheComponent]) => {
                  return (
                    <Route path={thePath} component={TheComponent} key={thePath} />
                  )
                })
              }
            </Switch>
          </div>
        </MemoryRouter>
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
