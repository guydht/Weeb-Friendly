import React, { Component } from "react";
import { Button, FormCheck, Navbar as BootstrapNavbar, NavDropdown, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import Consts from "../../classes/Consts";
import User from "../../classes/User";
import ChooseDirectoryText from "../../components/ChooseDirectoryText";
import SearchBar from "../../components/SearchBar";
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
        for (let theme of Consts.THEMES) {
            let beforeTheme = new Set(document.querySelectorAll("style"));
            require("../../css/theme/bootstrap." + theme.toLowerCase().replace(" ", ".") + ".min.css");
            let themeStyles = [...document.querySelectorAll("style")].filter(ele => !beforeTheme.has(ele));
            beforeTheme = new Set(document.querySelectorAll("style"));
            themeStyles.forEach(ele => ele.dataset.theme = theme);
            themeStyles.forEach(ele => (ele as any).disabled = theme !== Consts.CURRENT_THEME);
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
                        <OverlayTrigger trigger="hover" placement="bottom" overlay={<Tooltip id="middleClickToggle">Toggle Middle Click</Tooltip>}>
                            <div className="my-auto">
                                <FormCheck
                                    type="switch"
                                    id="middleClickTogge"
                                    onChange={(e: React.ChangeEvent) => this.setMiddleClickToggle((e.target as HTMLInputElement).checked)}
                                    label="" custom />
                            </div>
                        </OverlayTrigger>
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
        Consts.setMALUser(new User());
        this.setState({
            user: Consts.MAL_USER
        });
        (window as any).reloadPage();
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