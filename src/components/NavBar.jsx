import React, { Component } from "react";

import { Button, Nav, NavDropdown, Navbar as BootstrapNavbar } from "react-bootstrap";
import Consts from "../consts";
import SearchBar from "./SearchBar.tsx";


export default class NavBar extends Component {
    state = {
        theme: Consts.CURRENT_THEME,
        user: Consts.MAL_USER
    };
    render() {
        this.setTheme(this.state.theme);
        return (
            <BootstrapNavbar>
                <BootstrapNavbar.Brand href="#">Weeb Friendly</BootstrapNavbar.Brand>
                <BootstrapNavbar.Toggle aria-controls="basic-BootstrapNavbar-nav" />
                <BootstrapNavbar.Collapse id="basic-BootstrapNavbar-nav">
                    <Nav className="mr-auto" />
                    <NavDropdown title={this.state.theme + " Theme"} id="basic-nav-dropdown">
                        {Object.values(Consts.THEMES).map(theme => {
                            return (
                                <NavDropdown.Item key={theme} onClick={() => this.setState({ theme })}>{theme}</NavDropdown.Item>
                            )
                        })}
                    </NavDropdown>
                    <SearchBar />
                    {this.state.user.isLoggedOn ||
                        <Button className="ml-2" onClick={() => this.showLogin()}>
                            Login
                        </Button>}
                </BootstrapNavbar.Collapse>
            </BootstrapNavbar>
        )
    }
    showLogin(){
        Consts.WANTS_TO_LOGIN_TO_MAL = true;
        localStorage.setItem(Consts.WANTS_TO_LOGIN_TO_MAL_STORAGE_KEY, Consts.WANTS_TO_LOGIN_TO_MAL);
        this.props.reloadParent();
    }
    setTheme(theme = Consts.CURRENT_THEME) {
        require("../css/bootstrap." + theme.toLowerCase().replace(" ", ".") + ".min.css");
        document.querySelectorAll("style:not([data-theme])").forEach(ele => ele.dataset.theme = theme);
        [...document.querySelectorAll("style")].forEach(ele => {
            ele.disabled = ele.dataset.theme !== theme;
        });
        localStorage.setItem(Consts.THEME_STORAGE_KEY, theme);
        Consts.CURRENT_THEME = theme;
    }
}