import React, { ChangeEvent, Component, KeyboardEvent } from "react";
import { FormControl } from "react-bootstrap";
import styles from "../css/components/ChangableText.module.css";
import CloseButton from "./CloseButton";

export interface ChangableTextProps {
    text: string;
    onChange?: (value: string) => void;
    removeButton?: boolean;
    removeButtonTooltipText?: string;
};

export default class ChangableText extends Component<ChangableTextProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>> {

    state = {
        isChanging: false,
        text: this.props.text
    };
    startText = this.props.text;

    render() {
        let props = { ...this.props };
        delete props.text;
        delete props.onChange;
        delete props.onClick;
        delete props.removeButton;
        delete props.removeButtonTooltipText;
        if (this.state.isChanging)
            return (
                <span style={{ position: "relative" }}
                    onBlur={() => this.onBlur()}>
                    <FormControl type="text" value={this.state.text}
                        className={styles.inputElement}
                        style={{ width: ChangableText.widhtOfText(this.state.text, "16px") + "px" }}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => this.onTextChange(e)}
                        autoFocus={true}
                        onKeyDown={(e: KeyboardEvent) => this.onKeyPress(e)} />
                    <CloseButton style={{ right: "7px", top: "-2px", display: this.props.removeButton === false ? "none" : "" }} tooltipText={this.props.removeButtonTooltipText} toolTipPlacement="top" onClick={() => this.deleteText()} />
                </span>
            );
        if (this.state.text)
            return (
                <span {...props} onClick={e => {
                    this.props.onClick && this.props.onClick(e);
                    this.setState({ text: (e.target as HTMLInputElement).innerHTML });
                    this.startTextChange();
                }} className={styles.textWrapper}>{this.state.text}</span>
            );
        return (
            <span {...props} onClick={e => {
                this.props.onClick && this.props.onClick(e);
                this.setState({ text: (e.target as HTMLInputElement).innerHTML });
                this.startTextChange();
            }} className={styles.textWrapper}>{this.props.text}</span>
        );
    }

    onTextChange(e: ChangeEvent<HTMLInputElement>) {
        this.setState({
            text: e.target.value
        });
    }

    onKeyPress(e: KeyboardEvent) {
        if (e.key === "Enter")
            this.submitText();
    }

    onBlur() {
        setImmediate(() => {
            if (!this.deleted)
                this.submitText();
        });
    }

    submitText() {
        this.setState({
            isChanging: false
        });
        if (this.props.onChange && this.state.text !== this.startText)
            this.props.onChange(this.state.text);
    }

    startTextChange() {
        this.setState({ isChanging: true });
    }

    static widhtOfText(text: string, fontSize: string = "1em") {
        let tmp = document.createElement("span");
        tmp.append(new Text(text));
        (tmp as any).style = `font-size: ${fontSize}; width: fit-content; position: fixed; white-space: pre;`;
        document.body.append(tmp);
        let width = tmp.offsetWidth;
        tmp.remove();
        return width;
    }
    deleted = false;
    deleteText() {
        // eslint-disable-next-line
        this.state.text = "";
        this.deleted = true;
        this.submitText();
    }

}