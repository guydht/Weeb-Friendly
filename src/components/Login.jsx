import React, { Component } from "react";

import { Modal, InputGroup, FormControl, Button, Alert, Spinner } from "react-bootstrap";

import Consts from "../consts";
import User from "../classes/User";

export default class Login extends Component {
    static Alert_SHOW_TIMEOUT = 4000;

    state = {
        isLoggedIn: Consts.MAL_USER.isLoggedIn,
        loading: false,
        errorMessage: null,
        successMessage: null
    };
    userInput = React.createRef();
    componentDidMount() {
        if (this.userInput.current)
            this.userInput.current.focus()
    }
    componentDidUpdate() {
        // eslint-disable-next-line
        this.state.isLoggedIn = Consts.MAL_USER.isLoggedIn;
        if (!Consts.CSRF_TOKEN)
            fetch("https://myanimelist.net/asdasd").then(r => r.text()).then(responseText => {
                let html = document.createElement("html");
                html.innerHTML = responseText;
                Consts.setCsrfToken(html.querySelector("meta[name='csrf_token']").getAttribute("content"));
            });
        if (this.userInput.current)
            this.userInput.current.focus()
    }
    render() {
        const tryLogin = () => {
            this.tryLogin();
        },
            handleClose = () => {
                Consts.setWantsToLogin(false);
                this.setState({ isLoggedIn: false });
            };
        return (
            <Modal
                show={!this.state.isLoggedIn && Consts.WANTS_TO_LOGIN_TO_MAL}
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
                            ref={this.userInput}
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
                        {this.state.loading ? <div>Loading... <Spinner size="sm" animation="border" /></div> : "Submit"}
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
        this.setState({ errorMessage, loading: false });
    }
    alertHide() {
        if (this.state.errorMessage) {
            setTimeout(() => {
                this.setState({ errorMessage: null })
            }, Login.Alert_SHOW_TIMEOUT)
        }
    }
    async tryLogin() {
        if (this.state.successMessage)
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
            if (response.status !== 200) return this.errorMessage("Something went wrong while trying to log in..... Check MAL's status!");
            let responseText = await response.text();
            if (responseText.includes("Your username or password is incorrect.") || responseText.includes("Recover your account")) {
                this.setState({
                    errorMessage: "Couldn't sign in with the given credentials!",
                    loading: false
                });

                setTimeout(() => {
                    this.setState({
                        errorMessage: null
                    });
                }, Login.Alert_SHOW_TIMEOUT);
            }
            else if (responseText.includes("Too many failed login attempts. Please try to login again after several hours., or restart your router (change your ip)")) {
                this.setState({
                    errorMessage: "Too many failed login attempts..... Try again after several hours",
                    loading: false
                });

                setTimeout(() => {
                    this.setState({
                        errorMessage: null
                    });
                }, Login.Alert_SHOW_TIMEOUT);
            }
            else {
                this.setState({
                    successMessage: "Login Successful!",
                    loading: false
                });
                Consts.setMALUser(new User(this.username, this.password, undefined, true));
                setTimeout(() => {
                    this.props.reloadParent();
                    this.setState({
                        errorMessage: null,
                        successMessage: null
                    });
                }, Login.Alert_SHOW_TIMEOUT);
            }
        }).catch(e => this.unknownError(e));
    }
}
