import React, { Component } from 'react';
import { HashRouter, Route } from "react-router-dom";

import Login from './components/Login';

import routerConfig from "./routerConfig";
import NavBar from './components/NavBar';

import "./css/GuydhtScrollbar.css";


export default class App extends Component {
  render() {
    return (
      <div>
        <NavBar reloadParent={() => this.forceUpdate()} />
        <HashRouter>
          {
            Object.entries(routerConfig).map(([thePath, theComponent]) => {
              return (
                <Route exact path={thePath} component={theComponent} key={thePath} />
              )
            })
          }
        </HashRouter>
        <Login reloadParent={() => this.forceUpdate()} />
      </div>
    )
  }
}
