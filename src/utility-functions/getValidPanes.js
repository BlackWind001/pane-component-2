import React from "react";
import { Pane } from "../Pane";

const getValidPanes = function (children, direction, handleMouseDown, updateRef) {
  const ValidPaneObjs = [];
  let validPaneIndex = 0;
  React.Children.toArray(children).forEach((child) => {
    // Check if the child is a Pane component.
    if (!child || child.type !== Pane) {
      return;
    }

    const { size, minSize, maxSize } = child.props;
    const validPaneObj = {};
    let paneRef = null;
    let currentIndex = validPaneIndex;

    const CloneChild = () => {
      const ref = React.useRef(null);
      const boundUpdateRef = updateRef.bind(null, currentIndex);
      paneRef = ref;
      return React.cloneElement(child, {
        ...child.props,
        ref,
        size,
        minSize,
        maxSize,
        direction: direction,
        onMouseDown: handleMouseDown.bind(null, currentIndex),
        isResizerInactive: validPaneIndex === 0 ? true : false,
        updateRef: boundUpdateRef
      });
    };

    validPaneObj.pane = <CloneChild />;
    validPaneObj.ref = paneRef;

    ValidPaneObjs.push(validPaneObj);
    validPaneIndex++;
  });

  return ValidPaneObjs;
};

export default getValidPanes;
