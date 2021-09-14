import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import './GenericDragInstance.scss';

function GenericDragInstance(props) {
    const [mainBoxSize, setMainBoxSize] = useState({ width: 50, height: 50 });
    const [mainBoxPos, setMainBoxPos] = useState({ x: 0, y: 0 });
    const nodeRef = useRef(null);
    const nodeRef1 = useRef(null);

    const handleMinorDrag = (e, ui) => {
        const { width, height } = mainBoxSize;
        setMainBoxSize(prevState => {
            return {
                ...prevState,
                width: width + ui.deltaX,
                height: height + ui.deltaY,
            }
        });
    };

    const handleMainDrag = (e, ui) => {
        //get main x and y positions
        const { x, y } = mainBoxPos;
        //set the main position to itself plus deltaX and deltaY which are the pixels you
        //  are dragging every iteration of the function(which is allot of times)
        setMainBoxPos({ ...mainBoxPos, x: x + ui.deltaX, y: y + ui.deltaY });
    };
    let mainBoxStyle = {
        width: `${mainBoxSize.width}px`,
        height: `${mainBoxSize.height}px`,
    };

    useEffect(() => {
        props.setCurrentPositions({ pos: { x: mainBoxPos.x, y: mainBoxPos.y }, size: { width: mainBoxSize.width, height: mainBoxSize.height } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mainBoxSize, mainBoxPos])


    return (
        <>
            <Draggable
                bounds="parent"
                onDrag={handleMainDrag}
                position={mainBoxPos}
                nodeRef={nodeRef}
            >
                <div className={props.type} id="main-box" style={mainBoxStyle} ref={nodeRef}></div>
            </Draggable>
            <Draggable
                nodeRef={nodeRef1}
                bounds="parent"
                onDrag={handleMinorDrag}
                position={{
                    x: mainBoxPos.x + mainBoxSize.width,
                    y: mainBoxPos.y + mainBoxSize.height,
                }}
            >
                <div className={props.type} id="minor-box" ref={nodeRef1}></div>
            </Draggable>
        </>
    );
}

export default GenericDragInstance;