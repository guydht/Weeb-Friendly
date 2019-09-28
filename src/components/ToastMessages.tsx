import React, { Component } from "react";
import { Toast } from "react-bootstrap";

declare type toast = {
    body: string,
    title: string,
    opacity?: number,
    id?: string
}
function uuid() {
    // eslint-disable-next-line
    return ((1e7).toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
        // eslint-disable-next-line
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export default class ToastMessage extends Component {
    static DEFAULT_TOAST_TIMEOUT = 3500;
    static TOAST_FADE_DURATION = 300;

    state: { toasts: toast[] } = {
        toasts: []
    }
    componentDidMount() {
        (window as any).displayToast = this.displayToast.bind(this);
    }
    render() {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: "5vh",
                    right: 0,
                    zIndex: 9999999
                }}
            >
                {this.state.toasts.map((toast, i) => {
                    return (
                        <Toast onClose={() => this.fadeToastOut(toast)} key={toast.body + toast.title + i} style={{ transition: `opacity ${ToastMessage.TOAST_FADE_DURATION}ms`, opacity: toast.opacity }}>
                            <Toast.Header>
                                <strong className="mr-auto">{toast.title}</strong>
                            </Toast.Header>
                            <Toast.Body>{toast.body}.</Toast.Body>
                        </Toast>
                    )
                })}
            </div>
        );
    }
    getToastIndex(toast: toast): number {
        if (toast.id)
            return this.state.toasts.findIndex(ele => ele.id === toast.id);
        return this.state.toasts.findIndex(ele => ele.title === toast.title && ele.body === toast.body);
    }
    displayToast(toast: toast, timeout: number = ToastMessage.DEFAULT_TOAST_TIMEOUT) {
        //for persistent toast just pass null through "timeout" variable.
        toast.id = uuid();
        this.setState({
            toasts: this.state.toasts.concat({ ...toast, opacity: 1 })
        });
        if (timeout)
            setTimeout(() => this.fadeToastOut(toast), timeout);
    }
    fadeToastOut(toast: toast) {
        let toasts = this.state.toasts;
        toasts[this.getToastIndex(toast)].opacity = 0;
        this.setState({});
        setTimeout(() => {
            this.state.toasts.splice(this.getToastIndex(toast), 1);
            this.setState({});
        }, ToastMessage.TOAST_FADE_DURATION);
    }
};