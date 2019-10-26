import React, { Component } from "react";
import { Button, Navbar as BootstrapNavbar, NavDropdown, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import Consts from "../../classes/Consts";
import User from "../../classes/User";
import ChooseDirectoryText from "../../components/ChooseDirectoryText";
import SearchBar from "../../components/SearchBar";
import { ReactComponent as SettingsIcon } from "../../icons/settings.svg";
import CustomMiddleClick from "../../jsHelpers/CustomMiddleClick";
import { checkScrollSpeed } from "../../utils/general";


export default class NavBar extends Component {

    state = {
        theme: Consts.CURRENT_THEME,
        visible: true
    }

    chooseFolder(val: string) {
        Consts.setDownloadsFolder(val);
        (window as any).reloadPage();
    }

    componentDidMount() {
        window.addEventListener("scroll", () => {
            let scrollSpeed = checkScrollSpeed();
            if (scrollSpeed > 5 && this.state.visible && window.scrollY > 90)
                this.setState({
                    visible: false
                })
            else if ((scrollSpeed < -10 || window.scrollY < 90) && !this.state.visible)
                this.setState({
                    visible: true
                })
        });
        for (const theme of Consts.THEMES) {
            let style = document.createElement("style");
            style.dataset.theme = theme;
            fetch("./css/theme/bootstrap." + theme.toLowerCase().replace(" ", ".") + ".min.css").then(r => r.text()).then(text => {
                style.innerHTML = text;
                document.head.append(style);
                (style as any).disabled = style.dataset.theme !== Consts.CURRENT_THEME;
            });
        }
    }

    setMiddleClickToggle(value: boolean) {
        localStorage.setItem("middleClickToggle", value.toString());
        CustomMiddleClick[value ? "enable" : "disable"]();
    }

    getMiddleClickToggle() {
        return localStorage.getItem("middleClickToggle") === "true";
    }

    render() {
        this.setTheme(this.state.theme);
        return (
            <BootstrapNavbar bg="dark" fixed="top" variant="dark" expand="lg" style={{
                transition: "transform .3s",
                transform: this.state.visible ? "translateY(0)" : "translateY(-100%)"
            }}>
                <BootstrapNavbar.Brand to="/" as={Link}>Weeb Friendly</BootstrapNavbar.Brand>
                <Link to="/settings" className="mr-3">
                    <OverlayTrigger
                        placement="bottom"
                        overlay={<Tooltip id="goto-settings">Settings</Tooltip>}>
                        <SettingsIcon />
                    </OverlayTrigger>
                </Link>
                <BootstrapNavbar.Toggle aria-controls="basic-BootstrapNavbar-nav" />
                <BootstrapNavbar.Collapse id="basic-BootstrapNavbar-nav" className="justify-content-between">
                    <ChooseDirectoryText />
                    <Row className="mr-2">
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
                    </Row>
                </BootstrapNavbar.Collapse>
            </BootstrapNavbar>
        )
    }
    logout() {
        fetch("https://myanimelist.net/logout.php", {
            body: JSON.stringify({
                csrf_token: Consts.CSRF_TOKEN
            }),
            method: "POST"
        }).then(r => {
            Consts.setMALUser(new User());
            Consts.setCsrfToken('');
            this.setState({
                user: Consts.MAL_USER
            });
            (window as any).reloadPage();
        });
    }
    showLogin() {
        Consts.setWantsToLogin(true);
        (window as any).reloadPage();
    }
    setTheme(theme = Consts.CURRENT_THEME) {
        [...document.querySelectorAll("style[data-theme]")].forEach(ele => {
            (ele as any).disabled = (ele as any).dataset.theme !== theme;
        });
        Consts.setCurrentTheme(theme);
    }
}