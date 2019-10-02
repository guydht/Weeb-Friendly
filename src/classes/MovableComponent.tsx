import React, { Component } from "react";
import styles from "./css/Movable.module.css";

interface MovableComponentProps {
    movable?: boolean;
    resizable?: boolean;
    onDragStart?(e: React.MouseEvent): any;
    onDragFinish?(e: MouseEvent, didMoveInGesture: boolean): any;
    onDragMove?(e: MouseEvent): any;
    onResizeStart?(e: React.MouseEvent, direction: Directions): any;
    onResizeFinish?(e: MouseEvent, didMoveInGesture: boolean, direction: Directions): any;
    onResizeMove?(e: MouseEvent, direction: Directions): any;
    [key: string]: any;
}

enum Directions {
    nw,
    n,
    ne,
    e,
    se,
    s,
    sw,
    w
}

export default class MovableComponent extends Component<MovableComponentProps> {

    static defaultProps: MovableComponentProps = {
        movable: false,
        resizable: false
    }
    private element = React.createRef<HTMLDivElement>();

    render() {
        let { movable, resizable } = this.props,
            props: any = { ...this.props };
        for (let prop of ['movable', 'resizable', 'onDragStart', 'onDragFinish', 'onDragMove', 'ref',
            'onMouseDown', 'className', 'onResizeStart', 'onResizeFinish', 'onResizeMove'])
            delete props[prop];
        return (
            <div className={`${styles.container} ${movable ? 'movable' : ''} ${resizable ? 'resizable' : ''} ${this.props.className || ""}`}
                {...props}
                ref={this.element}
                onMouseDown={e => this.onMovableMouseDown(e)}>
                {this.props.resizable && <div className={styles.directions}>
                    <div onMouseDown={e => this.onResizableMouseDown(e, Directions.nw)} className={styles.nw}></div>
                    <div onMouseDown={e => this.onResizableMouseDown(e, Directions.n)} className={styles.n}></div>
                    <div onMouseDown={e => this.onResizableMouseDown(e, Directions.ne)} className={styles.ne}></div>
                    <div onMouseDown={e => this.onResizableMouseDown(e, Directions.e)} className={styles.e}></div>
                    <div onMouseDown={e => this.onResizableMouseDown(e, Directions.se)} className={styles.se}></div>
                    <div onMouseDown={e => this.onResizableMouseDown(e, Directions.s)} className={styles.s}></div>
                    <div onMouseDown={e => this.onResizableMouseDown(e, Directions.sw)} className={styles.sw}></div>
                    <div onMouseDown={e => this.onResizableMouseDown(e, Directions.w)} className={styles.w}></div>
                </div>}
                {this.props.children}
            </div>
        )
    }
    private onResizableMouseDown(e: React.MouseEvent, direction: Directions) {
        if (e.button !== 0)
            return;
        let didMoveInGesture = false,
            startX = e.screenX,
            startY = e.screenY,
            startPosX = 0,
            startPosY = 0,
            startPosWidth = 0,
            startPosHeight = 0;
        if (this.element.current) {
            let rect = this.element.current.getBoundingClientRect();
            startPosX = rect.left;
            startPosY = rect.top;
            startPosWidth = rect.width;
            startPosHeight = rect.height;
        }
        const onMouseMove = (e: MouseEvent) => {
            if (this.element.current) {
                didMoveInGesture = true;
                switch (direction) {
                    case Directions.nw:
                        this.element.current.style.width = `${startPosWidth + startX - (e.screenX || 0)}px`;
                        this.element.current.style.height = `${startPosHeight + startY - (e.screenY || 0)}px`;
                        this.element.current.style.left = `${Math.max(0, startPosX - startX + (e.screenX || 0))}px`;
                        this.element.current.style.top = `${Math.max(0, startPosY - startY + (e.screenY || 0))}px`;
                        break;
                    case Directions.n:
                        this.element.current.style.height = `${startPosHeight + startY - (e.screenY || 0)}px`;
                        this.element.current.style.top = `${Math.max(0, startPosY - startY + (e.screenY || 0))}px`;
                        break;
                    case Directions.ne:
                        this.element.current.style.width = `${startPosWidth - startX + (e.screenX || 0)}px`;
                        this.element.current.style.height = `${startPosHeight + startY - (e.screenY || 0)}px`;
                        this.element.current.style.top = `${Math.max(0, startPosY - startY + (e.screenY || 0))}px`;
                        break;
                    case Directions.e:
                        this.element.current.style.width = `${startPosWidth - startX + (e.screenX || 0)}px`;
                        break;
                    case Directions.se:
                        this.element.current.style.width = `${startPosWidth - startX + (e.screenX || 0)}px`;
                        this.element.current.style.height = `${startPosHeight - startY + (e.screenY || 0)}px`;
                        break;
                    case Directions.s:
                        this.element.current.style.height = `${startPosHeight - startY + (e.screenY || 0)}px`;
                        break;
                    case Directions.sw:
                        this.element.current.style.height = `${startPosHeight - startY + (e.screenY || 0)}px`;
                        this.element.current.style.left = `${Math.max(0, startPosX - startX + (e.screenX || 0))}px`;
                        this.element.current.style.width = `${startPosWidth + startX - (e.screenX || 0)}px`;
                        break;
                    case Directions.w:
                        this.element.current.style.left = `${Math.max(0, startPosX - startX + (e.screenX || 0))}px`;
                        this.element.current.style.width = `${startPosWidth + startX - (e.screenX || 0)}px`;
                }
                let currentHeight = Number(this.element.current.style.height!.replace("px", "")),
                    currentWidth = Number(this.element.current.style.width!.replace("px", ""));
                if (Number(this.element.current.style.top!.replace("px", "")) + currentHeight > window.innerHeight)
                    this.element.current.style.top = `${window.innerHeight - currentHeight}px`;
                if (Number(this.element.current.style.left!.replace("px", "")) + currentWidth > window.innerWidth)
                    this.element.current.style.left = `${window.innerWidth - currentWidth}px`;
                e.stopPropagation();
                if (this.props.onResizeMove)
                    this.props.onResizeMove(e, direction);
            }
        }
        const onMouseUp = (e: MouseEvent) => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            if (this.props.onResizeFinish)
                this.props.onResizeFinish(e, didMoveInGesture, direction);
            e.stopPropagation();
        }
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        e.stopPropagation();
        if (this.props.onResizeStart)
            this.props.onResizeStart(e, direction);
    }
    private onMovableMouseDown(e: React.MouseEvent) {
        if (e.button !== 0)
            return;
        let didMoveInGesture = false,
            startX = e.screenX,
            startY = e.screenY,
            startPosX = 0,
            startPosY = 0;
        if (this.element.current) {
            let rect = this.element.current.getBoundingClientRect();
            startPosX = rect.left;
            startPosY = rect.top;
        }
        const onMouseMove = (e: MouseEvent) => {
            if (this.element.current) {
                didMoveInGesture = true;
                this.element.current.style.left = `${Math.max(0, startPosX - startX + (e.screenX || 0))}px`;
                this.element.current.style.top = `${Math.max(0, startPosY - startY + (e.screenY || 0))}px`;
                let currentHeight = this.element.current.clientHeight,
                    currentWidth = this.element.current.clientWidth;
                if (Number(this.element.current.style.top!.replace("px", "")) + currentHeight > window.innerHeight)
                    this.element.current.style.top = `${window.innerHeight - currentHeight}px`;
                if (Number(this.element.current.style.left!.replace("px", "")) + currentWidth > window.innerWidth)
                    this.element.current.style.left = `${window.innerWidth - currentWidth}px`;
                if (this.props.onDragMove)
                    this.props.onDragMove(e);
                else
                    e.stopPropagation();
            }
        }
        const onMouseUp = (e: MouseEvent) => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            if (this.props.onDragFinish)
                this.props.onDragFinish(e, didMoveInGesture);
            else
                e.stopPropagation();
        }
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        if (this.props.onDragStart)
            this.props.onDragStart(e);
        else
            e.stopPropagation();
    }
}