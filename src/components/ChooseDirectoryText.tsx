import React, { Component } from "react";
import { Button, Dropdown, Form, FormControl } from "react-bootstrap";
import Consts from "../classes/Consts";

const fs = window.require("fs"),
    path = window.require("path");

export default class ChooseDirectoryText extends Component {
    static SEARCH_INPUT_TIMEOUT = 250;

    state = {
        displayEntries: true,
        entries: [],
        loading: false,
        loadingText: "",
        changeFolder: false
    };
    textInput = React.createRef<any>();
    menu = React.createRef<any>();

    handleEnterPress() {
        let entries = this.state.entries;
        if (entries.length)
            this.selectDirectory(entries[0]);
    }

    setDownloadsFolder(folderPath: string) {
        Consts.setDownloadsFolder(folderPath);
        this.setState({ changeFolder: false });
    }

    render() {
        const onFocus = () => {
            this.setState({
                displayEntries: true
            });
        },
            onBlur = () => {
                setTimeout(() => {
                    if (!this.textInput.current.parentNode.contains(document.activeElement)) {
                        this.setState({
                            loading: false,
                            loadingText: "",
                            displayEntries: false
                        });
                        this.setDownloadsFolder(this.textInput.current.value);
                        if(this.textInput.current && this.textInput.current.value !== Consts.DOWNLOADS_FOLDER)
                            window.location.reload();
                    }
                });
            };
        if (this.state.changeFolder)
            return (
                <Form onFocus={onFocus} onBlur={onBlur}>
                    <FormControl
                        type="text" placeholder="Search" className="mr-sm-2"
                        onChangeCapture={(e: any) => this.searchDirectory(e.target.value)}
                        onKeyDown={(e: any) => e.key === "Enter" && this.handleEnterPress()}
                        defaultValue={Consts.DOWNLOADS_FOLDER}
                        ref={this.textInput}
                        autoFocus={true}
                        tabIndex={0} />
                    <Dropdown style={{ position: "relative" }} show={true} >
                        {
                            (this.state.entries.length && this.state.displayEntries) ?

                                <Dropdown.Menu ref={this.menu}
                                    style={{ position: "absolute", maxHeight: "30vh", overflowY: "auto", width: "100%" }} >
                                    {
                                        this.state.entries.map((entry: string, i: number) => {
                                            return (
                                                <Dropdown.Item
                                                    onClick={(e: any) => this.selectDirectory(entry)}
                                                    onKeyDown={(e: any) => e.key === "Enter" && this.selectDirectory(entry)}
                                                    key={i} eventKey={String(i)}>
                                                    {entry}
                                                </Dropdown.Item>
                                            )
                                        })
                                    }
                                </Dropdown.Menu> : ""
                        }
                    </Dropdown>
                </Form >
            )
        return (
            <Button onClick={() => this.setState({ changeFolder: true })}>
                Downloads Folder
            </Button>
        )
    }
    searchDirectory(val: string) {
        let parentDir = path.posix.dirname(val),
            basename = path.posix.basename(val);

        const handleReadDir = (_: any, files: string[]) => {
            if (files)
                files = files.filter(ele => {
                    return ele.toLowerCase().includes(basename.toLowerCase());
                }).slice(0, 50);
            this.setState({
                entries: files || []
            });
        }
        let maybeLegal = path.posix.resolve(val);
        fs.stat(maybeLegal, (_: any, stats: any) => {
            if (stats && stats.isDirectory()) {
                basename = "";
                fs.readdir(val, handleReadDir);
            }
            else
                fs.readdir(parentDir, handleReadDir);
        });
    }
    async selectDirectory(directory: string) {
        let basename = path.posix.dirname(this.textInput.current.value),
            maybeLegal = path.posix.resolve(this.textInput.current.value);
        fs.stat(maybeLegal, (_: any, stats: any) => {
            if (stats && stats.isDirectory())
                basename = maybeLegal;
            this.textInput.current.value = path.posix.resolve(basename, directory) + "/";
            this.searchDirectory(this.textInput.current.value);
        });
    }
}