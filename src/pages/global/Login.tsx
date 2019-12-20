import React, { Component } from "react";
import { Alert, Button, FormControl, InputGroup, Modal, Spinner } from "react-bootstrap";
import Consts from "../../classes/Consts";
import User from "../../classes/User";
import MALUtils from "../../utils/MAL";



export default class Login extends Component<{ username?: string, password?: string }> {
    static Alert_SHOW_TIMEOUT = 2000;

    state = {
        isLoggedIn: Consts.MAL_USER.isLoggedIn,
        loading: false,
        errorMessage: null,
        successMessage: null
    };

    username = "";
    password = "";

    userInput = React.createRef<HTMLInputElement & FormControl>();
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
                Consts.setCsrfToken(html.querySelector("meta[name='csrf_token']")!.getAttribute("content")!);
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
                            defaultValue={this.props.username || ""}
                            onKeyDown={(e: React.KeyboardEvent) => this.listenToEnter(e)}
                            onChange={this.setUsername.bind(this)} />
                    </InputGroup>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text>
                                MAL Pass:
                        </InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl placeholder="Password" type="password"
                            defaultValue={this.props.password || ""}
                            onKeyDown={(e: React.KeyboardEvent) => this.listenToEnter(e)}
                            onChange={this.setPassword.bind(this)} />
                    </InputGroup>
                </Modal.Body>
                <Alert variant="danger"
                    className="mx-3"
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
    listenToEnter(e: React.KeyboardEvent) {
        if (e.keyCode === 13)
            this.tryLogin()
    }
    setPassword(event: React.FormEvent) {
        this.password = (event.target as HTMLInputElement).value;
    }
    setUsername(event: React.FormEvent) {
        this.username = (event.target as HTMLInputElement).value;
    }
    checkInput() {
        return !!this.password && !!this.username;
    }
    unknownError(error: string) {
        this.errorMessage(`Something went wrong while trying to reach MyAnimeList
        Here's what we know:
        ${error}`);
    }
    errorMessage(errorMessage: string) {
        this.setState({ errorMessage, loading: false });
    }
    async tryLogin() {
        if (this.state.successMessage)
            return;
        if (!this.checkInput())
            return this.errorMessage("Invalid Input!");
        if (this.state.loading)
            return this.errorMessage("Still Loading!");
        this.setState({ loading: true });
        const response = await MALUtils.login(this.username, this.password);
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
                successMessage: "Login Successful! Now fetching your Anime List......",
                loading: true
            });
            Consts.setMALUser(new User(this.username, this.password, undefined, true));
            MALUtils.getUserAnimeList(Consts.MAL_USER).then(() => {
                this.setState({
                    loading: false,
                    successMessage: "Fetched List Successfully!"
                });
                Consts.setMALUser(Consts.MAL_USER);
                setTimeout(() => {
                    (window as any).reloadPage();
                }, Login.Alert_SHOW_TIMEOUT / 2);
            });
        }
    }
}
