import React, { Component } from 'react';
import { MemoryRouter, Route, Switch } from "react-router-dom";
import "./classes/AnimeStorage";
import "./classes/Consts";
import Consts from './classes/Consts';
import "./css/global/App.css";
import "./css/global/Forum.css";
import DownloadManager from './pages/global/DownloadManager';
import Login from './pages/global/Login';
import NavBar from './pages/global/NavBar';
import ToastMessage from './pages/global/ToastMessages';
import Watch from './pages/global/Watch';
import routerConfig from "./routerConfig";

window.addEventListener("keydown", disableAltKey);
window.addEventListener("keyup", disableAltKey);
function disableAltKey(e) {
  if (e.key === "Alt")
    e.preventDefault();
}

export default class App extends Component {

  state = {
    showVideo: false,
    videoItem: null,
    username: "",
    password: ""
  };

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
      else if (e.ctrlKey && e.shiftKey && !e.altKey && e.code === "KeyR")
        window.location.reload();
    });

    window.addEventListener("click", event => {
      const pressedLink = event.target?.href;
      if (pressedLink && new URL(pressedLink).protocol !== "file:") {
        event.preventDefault();
        window.open(pressedLink);
      }
    });

  }

  static loadLoginModal(username, password) {
    Consts.setWantsToLogin(true);
    window.setAppState({
      username,
      password
    });
  }

  render() {
    // eslint-disable-next-line
    if (!this.state.showVideo) this.state.videoItem = null;
    return (
      <div>
        <MemoryRouter ref={this.router} initialEntries={[sessionStorage.getItem("lastPathname") || ""]} initialIndex={0}>
          <NavBar />
          <div style={{ marginTop: 70, minHeight: "100vh" }}>
            <Switch>
              {
                Object.entries(routerConfig).map(([thePath, TheComponent]) => {
                  return (
                    <Route path={thePath} component={TheComponent} key={thePath} />
                  );
                })
              }
            </Switch>
          </div>
          {
            this.state.showVideo &&
            <Watch downloadedItem={this.state.videoItem} />
          }
          <Login username={this.state.username} password={this.state.password} />
          <DownloadManager />
          <ToastMessage />
        </MemoryRouter>
      </div>
    );
  }
}
