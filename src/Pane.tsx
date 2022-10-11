import React, { forwardRef, MouseEventHandler, MutableRefObject, useEffect } from "react";
import styled from "styled-components";
import getValidPanes from "./utility-functions/getValidPanes";

const StyledPaneContainer = styled.div`
  display: flex;
  ${(props) => {
    return `flex-direction: ${props.direction};`;
  }}
  ${(props) => {
    const dimension = props.direction === "row" ? "width" : "height";
    const { size, minSize, maxSize } = props;
    let dimensionsString = "";

    if (!size && !minSize && !maxSize) {
      return `
        flex-grow: 1;
      `;
    }

    size && (dimensionsString += `${dimension}: calc(${size} + 5px);`);
    minSize &&
      (dimensionsString += `min-${dimension}: calc(${minSize} + 5px);`);
    maxSize &&
      (dimensionsString += `max-${dimension}: calc(${maxSize} + 5px);`);

    return dimensionsString;
  }}
  overflow: hidden;

  & .resizer {
    ${(props) => {
      const dimension = props.direction === "row" ? "width" : "height";

      return `${dimension}: 5px;`;
    }}
    flex-grow: 0;
    flex-shrink: 0;
    background-color: gray;
    ${(props) => {
      const resizeType = props.direction === "row" ? "col" : "row";
      return `cursor: ${resizeType}-resize;`;
    }}
  }

  & .content {
    flex-grow: 1;
  }
`;

const Pane = forwardRef(function Pane(
  {
    direction,
    minSize,
    maxSize,
    size,
    children,
    onMouseDown,
    isResizerInactive,
    updateRef
  }: {
    direction: "row" | "column";
    minSize: string;
    maxSize: "string";
    size: string;
    children: React.ReactNode;
    onMouseDown: Function;
    isResizerInactive: undefined | boolean;
    updateRef: Function
  },
  ref
) {
  const handleMouseDown = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const axis = direction === "row" ? "X" : "Y";
    const mouseProperty = ("client" + axis) as 'clientX' | 'clientY';
    const initialMousePosition = event[mouseProperty];
    onMouseDown(ref, initialMousePosition);
  };
  const props = { direction, minSize, maxSize, size };
  const resizerProps: { onMouseDown?: MouseEventHandler } = {};

  // Update the ref in the parent
  useEffect(() => {
    updateRef(ref);
  });

  !isResizerInactive && (resizerProps.onMouseDown = handleMouseDown as MouseEventHandler<HTMLElement>);
  return (
    <StyledPaneContainer ref={ref} {...props}>
      <section className="resizer" {...resizerProps}></section>
      <section className="content">{children}</section>
    </StyledPaneContainer>
  );
});

const StyledPaneAreaContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  ${(props : { direction: 'row' | 'column' }) => {
    return `
    flex-direction: ${props.direction};
    /*overflow-${props.direction === "row" ? "x" : "y"}: hidden;*/
    `;
  }}
`;

function PaneArea(props: { direction: 'row' | 'column', children: React.ReactNode }) {
  const direction = props.direction || "row";
  const { children } = props;
  const paneAreaRef = React.useRef(null);
  const dimension = direction === "row" ? "width" : "height";
  const validPanes: any[] = [];
  const validPaneRefs: MutableRefObject<any[]> = React.useRef([]);

  const handleUpdateRef = function (index: number, ref: React.MutableRefObject<HTMLElement>) {
    validPaneRefs.current[index] = ref;
  };
  const handleMouseMove = function (
    targetPaneIndex: number,
    currentPane: React.MutableRefObject<HTMLElement>,
    initialMousePosition: number,
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) {
    const affectedPaneIndex = targetPaneIndex - 1;
    const affectedPane = affectedPaneIndex >= 0 && validPaneRefs.current[affectedPaneIndex];
    const axis = direction === "row" ? "X" : "Y";
    const currentMousePosition = event[("client" + axis) as 'clientX' | 'clientY'];


    if (!affectedPane) {
      return;
    }

    /**
     * We need to figure out the start and end values and also the required dimensions.
     * In case of a row PaneArea, the start value would `left` and the end value would
     * be `right`. And the `dimension` would be `width`.
     * In case of a column PaneArea, the start value would be `top` and the end value would
     * be `bottom`. And the `dimension` would be `height`.
     */
    const startValueId = direction === 'row' ? 'left' : 'top';
    const endValueId = direction === 'row' ? 'right' : 'bottom';

    const APValues = affectedPane.current.getBoundingClientRect();
    const CPValues = currentPane.current.getBoundingClientRect();

    const APStart = APValues[startValueId];
    const CPEnd = CPValues[endValueId];

    affectedPane.current.style[dimension] = `${currentMousePosition - APStart}px`;
    currentPane.current.style[dimension] = `${CPEnd - currentMousePosition}px`;

  };

  const handleMouseDown = function (
    targetPaneIndex: number,
    targetPaneRef: React.MutableRefObject<any>,
    initialMousePosition: number
  ) {
    const body = document.querySelector("body") as HTMLBodyElement;
    const boundMouseMove = handleMouseMove.bind(
      null,
      targetPaneIndex,
      targetPaneRef,
      initialMousePosition
    );

    body.addEventListener("mousemove", boundMouseMove);
    body.addEventListener(
      "mouseup",
      () => {
        body.removeEventListener("mousemove", boundMouseMove);
      },
      { once: true }
    );
  };

  validPaneRefs.current = [];
  getValidPanes(children, direction, handleMouseDown, handleUpdateRef).forEach((paneObj) => {
    validPanes.push(paneObj);
  });
  return (
    <StyledPaneAreaContainer ref={paneAreaRef} direction={direction}>
      {validPanes.map((validPane, index) => {
        return <React.Fragment key={index}>{validPane.pane}</React.Fragment>;
      })}
    </StyledPaneAreaContainer>
  );
}

export { PaneArea, Pane };
