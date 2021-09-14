import React, { useEffect, useState } from 'react'
import { observer } from "mobx-react-lite";
import { useDrag } from "react-dnd";
import { DRAGGABLE_ITEMS_TYPE } from '../consts/consts';
import { Motion, spring } from "@serprex/react-motion";
import "./DraggableElement.scss";

const DraggableElement = ({ answer, index, isVisible }) => {

  const [dropElem, setDropElem] = useState(null)
  const [dragElem, setDragElem] = useState(null)
  useEffect(() => {

    const dropElem = document.getElementById(`drop-elem-${answer.userAnswerIndex}`)
    if (dropElem) {
      const dragElem = document.getElementById(`drag-elem-container-num-${index}`)
      setDropElem(dropElem.getBoundingClientRect())
      setDragElem(dragElem.getBoundingClientRect())
    }

  }, [answer.userAnswerIndex,index])

  const [{ isDragging }, dragRef] = useDrag({

    type: DRAGGABLE_ITEMS_TYPE.DRAGGABLE_ELEM,
    item: { index: index, dragRef: () => dragRef },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  function distanceBetweenElements() {
    const bodyRect = document.body.getBoundingClientRect();
    const dragOffsetRight = bodyRect.width - dragElem.right;
    let distanceX = bodyRect.width - dropElem.left - dragOffsetRight;

    const dragOffsetBottom = bodyRect.bottom - dragElem.bottom;
    let distanceY = bodyRect.bottom - dropElem.bottom - dragOffsetBottom;
    return { x: -distanceX, y: -distanceY }
  }
  return (
    <>
      {
        isVisible
          ?
          answer.userAnswerIndex === -2
            ?
            <span ref={dragRef} id={`drag-elem-container-num-${index}`} className="drag-elem-container" style={{ opacity: `${isDragging ? 0 : 1} ` }}>
              {"imagePath" in answer ? <img id="ddq-drag-img" src={answer.imagePath} alt="drag" /> : <span className="ddq-drag-label"  >{answer.label}</span>}
            </span>
            :
            <Motion defaultStyle={distanceBetweenElements()} style={{ x: spring(0, { stiffness: 50, damping: 26 }), y: spring(0, { stiffness: 50, damping: 26 }) }}>
              {style => {
                return (<span ref={dragRef} id={`drag-elem-container-num-${index}`} className="drag-elem-container" style={{ opacity: `${isDragging ? 0 : 1}`, zIndex: 7, transform: `translate(${style.x}px,${style.y}px)` }}>
                  {"imagePath" in answer ? <img id="ddq-drag-img" src={answer.imagePath} alt="drag" /> : <span className="ddq-drag-label"  >{answer.label}</span>}
                </span>)
              }}
            </Motion>
          :
          <span id={`drag-elem-container-num-${index}`} className="drag-elem-container" style={{ opacity: 0 }}>
            {"imagePath" in answer ? <img id="ddq-drag-img" src={answer.imagePath} alt="drag" /> : <span className="ddq-drag-label"  >{answer.label}</span>}
          </span>
      }
    </>
  )
}

export default observer(DraggableElement)
