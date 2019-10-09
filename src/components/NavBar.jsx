import React, { Component } from "react";
import { Button, Nav, Navbar as BootstrapNavbar, NavDropdown } from "react-bootstrap";
import User from "../classes/User";
import Consts from "../classes/Consts";
import ChooseDirectoryText from "./ChooseDirectoryText";
import SearchBar from "./SearchBar.tsx";



export default class NavBar extends Component {
    constructor() {
        super();
        for (let theme of Consts.THEMES) {
            let beforeTheme = new Set(document.querySelectorAll("style"));
            require("../css/bootstrap." + theme.toLowerCase().replace(" ", ".") + ".min.css");
            let themeStyles = [...document.querySelectorAll("style")].filter(ele => !beforeTheme.has(ele));
            beforeTheme = new Set(document.querySelectorAll("style"));
            themeStyles.forEach(ele => ele.dataset.theme = theme);
        }
    }

    state = {
        theme: Consts.CURRENT_THEME
    }

    chooseFolder(val) {
        Consts.setDownloadsFolder(val);
        this.props.reloadParent();
    }

    render() {
        // eslint-disable-next-line
        this.setTheme(this.state.theme);
        return (
            <BootstrapNavbar>
                <BootstrapNavbar.Brand href="#">Weeb Friendly</BootstrapNavbar.Brand>
                <BootstrapNavbar.Toggle aria-controls="basic-BootstrapNavbar-nav" />
                <BootstrapNavbar.Collapse id="basic-BootstrapNavbar-nav">
                    <ChooseDirectoryText reloadParent={this.props.reloadParent}/>
                    <Nav className="mr-auto" />
                    <NavDropdown title={this.state.theme + " Theme"} id="basic-nav-dropdown">
                        {Consts.THEMES.map(theme => {
                            return (
                                <NavDropdown.Item key={theme} onClick={() => this.setState({ theme })}>{theme}</NavDropdown.Item>
                            )
                        })}
                    </NavDropdown>
                    <SearchBar />
                    {Consts.MAL_USER.isLoggedIn ?
                        <Button className="ml-2" onClick={() => this.logout()}>
                            Log Out
                    </Button> :
                        <Button className="ml-2" onClick={() => this.showLogin()}>
                            Login
                        </Button>}
                </BootstrapNavbar.Collapse>
            </BootstrapNavbar>
        )
    }
    logout() {
        Consts.setMALUser(new User());
        this.setState({
            user: Consts.MAL_USER
        })
        this.props.reloadParent();
    }
    showLogin() {
        Consts.setWantsToLogin(true);
        this.props.reloadParent();
    }
    setTheme(theme = Consts.CURRENT_THEME) {
        [...document.querySelectorAll("style[data-theme]")].forEach(ele => {
            ele.disabled = ele.dataset.theme !== theme;
        });
        Consts.setCurrentTheme(theme);
    }
}