import React, { Component } from "react";

interface MovableComponentProps {
    movable?: boolean;
    resizable?: boolean;
    onDragStart?(e: React.MouseEvent): boolean | null;
    onDragFinish?(e: MouseEvent, didMoveInGesture: boolean): boolean | null;
    onDragMove?(e: MouseEvent): boolean | null;
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
        for (let prop of ['movable', 'resizable', 'onDragStart', 'onDragFinish', 'onDragMove'])
            delete props[prop];
        return (
            <div className={`${movable ? 'movable' : ''} ${resizable ? 'resizable' : ''}`}
                {...props}
                ref={this.element}
                onMouseDown={e => this.onMouseDown(e)}>
            </div>
        )
    }
    private x = 0;
    private y = 0;
    private onMouseDown(e: React.MouseEvent) {
        if (e.button !== 0)
            return;
        let didMoveInGesture = false,
            startX = e.screenX,
            startY = e.screenY,
            startPosX = 0,
            startPosY = 0;
        if (this.element.current) {
            startPosX = this.x;
            startPosY = this.y;
        }
        const onMouseMove = (e: MouseEvent) => {
            if (this.element.current) {
                didMoveInGesture = true;
                this.x = startPosX - startX + (e.screenX || 0);
                this.y = startPosY - startY + (e.screenY || 0);
                this.element.current.style.transform = `translate(${this.x}px, ${this.y}px)`;
                if (this.props.onDragMove)
                    this.props.onDragMove(e);
            }
        }
        const onMouseUp = (e: MouseEvent) => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            if (this.props.onDragFinish)
                this.props.onDragFinish(e, didMoveInGesture);
        }
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        if (this.props.onDragStart)
            this.props.onDragStart(e);
    }
}