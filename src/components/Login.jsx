import React, { Component } from "react";

import { Modal, InputGroup, FormControl, Button, Alert } from "react-bootstrap";

import Consts from "../consts";

export default class Login extends Component {
    state = {
        isLoggedOn: Consts.MAL_USER.isLoggedOn,
        loading: false,
        errorMessage: null,
        successMessage: null
    };
    static Alert_SHOW_TIMEOUT = 4000;
    componentWillUpdate() {
        // eslint-disable-next-line
        this.state.isLoggedOn = Consts.MAL_USER.isLoggedOn;
    }
    componentWillMount() {
        if (!Consts.CSRF_TOKEN) {
            fetch("https://myanimelist.net/login.php").then(r => r.text()).then(responseText => {
                let html = document.createElement("html");
                html.innerHTML = responseText;
                Consts.CSRF_TOKEN = html.querySelector("meta[name='csrf_token']").getAttribute("content");
                localStorage.setItem(Consts.CRSF_TOKEN_STORAGE_KEY, Consts.CSRF_TOKEN);
            }).catch(e => this.unknownError(e));
        }
    }
    render() {
        const tryLogin = () => {
            this.tryLogin();
        },
            handleClose = () => {
                Consts.setWantsToLogin(false);
                this.setState({ isLoggedOn: true });
            };
        if (!Consts.WANTS_TO_LOGIN_TO_MAL)
            // eslint-disable-next-line
            this.state.isLoggedOn = true;
        return (
            <Modal
                show={!this.state.isLoggedOn}
                onHide={handleClose}
                centered>
                <Modal.Header>
                    <Modal.Title>
                        Please Login To Myanimelist!
                        </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                            <InputGroup.Text>
                                MAL User:
                        </InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl placeholder="User"
                            onKeyDown={e => this.listenToEnter(e)}
                            onChange={this.setUsername.bind(this)} />
                    </InputGroup>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text>
                                MAL Pass:
                        </InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl placeholder="Password" type="password"
                            onKeyDown={e => this.listenToEnter(e)}
                            onChange={this.setPassword.bind(this)} />
                    </InputGroup>
                </Modal.Body>
                <Alert variant="danger"
                    className="mx-3"
                    onHide={() => this.alertHide()}
                    show={!!this.state.errorMessage}>
                    {this.state.errorMessage}
                </Alert>
                <Alert variant="success"
                    className="mx-3"
                    show={!!this.state.successMessage}>
                    {this.state.successMessage}
                </Alert>
                <Modal.Footer>
                    <Button
                        style={{ float: "right" }}
                        onClick={tryLogin}>
                        {this.state.loading ? "Loading..." : "Submit"}
                    </Button>
                    <Button
                        style={{ float: "left" }}
                        onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
    listenToEnter(e) {
        if (e.keyCode === 13)
            this.tryLogin()
    }
    setPassword(event) {
        this.password = event.target.value;
    }
    setUsername(event) {
        this.username = event.target.value;
    }
    checkInput() {
        return !!this.password && !!this.username;
    }
    unknownError(error) {
        this.errorMessage(`Something went wrong while trying to reach MyAnimeList
        Here's what we know:
        ${error}`);
    }
    errorMessage(errorMessage) {
        this.setState({ errorMessage });
    }
    alertHide() {
        if (this.state.errorMessage) {
            setTimeout(() => {
                this.setState({ errorMessage: null })
            }, Login.Alert_SHOW_TIMEOUT)
        }
    }
    tryLogin() {
        if (this.successMessage)
            return;
        if (!this.checkInput())
            return this.errorMessage("Invalid Input!");
        if (this.state.loading)
            return this.errorMessage("Still Loading!");
        this.setState({ loading: true });
        let formData = new FormData();
        formData.append('user_name', this.username);
        formData.append('password', this.password);
        formData.append('csrf_token', Consts.CSRF_TOKEN)
        formData.append('cookie', 1);
        formData.append('sublogin', 'Login');
        formData.append('submit', 1);
        fetch(Consts.MAL_LOGIN_URL, {
            method: "POST",
            body: formData
        }).then(async response => {
            if (response.redirected) {
                this.setState({
                    successMessage: "Login Successful!"
                });
                Consts.setMALUser({
                    isLoggedOn: true,
                    username: this.username,
                    passwrod: this.password
                });
                setTimeout(() => {
                    this.setState({
                        isLoggedOn: Consts.MAL_USER.isLoggedOn,
                        loading: false,
                        errorMessage: null
                    });
                    this.props.reloadParent();
                }, Login.Alert_SHOW_TIMEOUT);
            }
        }).catch(e => this.unknownError(e));
    }
}
