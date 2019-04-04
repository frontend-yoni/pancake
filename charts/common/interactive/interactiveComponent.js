/**
 * Created by yoni_ on 2/5/2016.
 */
function InteractiveComponent(lineChartCore) {
    /***CONSTANTS***/
    var BAR_TRACK_LINE_COLOR = "#0059FF";
    var BAR_BG_HIGHLIGHT_COLOR = "#C6D9FD";
    /***Externally Set****/
    //Structure
    var externalDiv;
    var interactiveDiv;
    //Data
    var xAxis;
    var dataList;
    //Util
    var papaLineCore = lineChartCore;
    //State
    var isBarChart;

    /***Internally Set****/
    //Structure
    var body;

    //Layout
    var pixelAmountForSingleShift;

    //State
    var isMouseDown;
    var isAreaCovered;
    var isFreeze;
    var isShowingTip; //In case of data refresh, remember to show the tips
    //(zoom)
    var isMiddleOfZoomAnimation;
    var isZoomState;
    //(Mouse positions)
    var hoverIndex;
    var anchorIndex;
    var trackStartIndex;
    var trackEndIndex;
    //(Coordinates)
    var mouseX; //Relative to InteractionDiv
    var prevMouseX;

    //Utils
    var usefulUtil = UsefulUIUtil.getInstance();
    var trackLineUtil = new TrackLineUtil();

    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        interactiveDiv = divD3;
        attachEventsToDiv();
    };

    this.setData = function (xAxisInput, dataListInput) {
        xAxis = xAxisInput;
        dataList = dataListInput;
        trackLineUtil.setData(xAxis);

        pixelAmountForSingleShift = (xAxis.endPixel - xAxis.startPixel) / (xAxis.maxValue);
    };

    this.setIsBarChart = function (boolean) {
        if (boolean) {
            trackLineUtil.setTrackLineColor(BAR_TRACK_LINE_COLOR);
        }
    };

    this.initPoints = function () {
        trackLineUtil.initPoints();
    };

    this.addPointObject = function (yAxis, dataList, radius, color, lastDrawnPointInput) {
        trackLineUtil.addPointObject(yAxis, dataList, radius, color, lastDrawnPointInput);
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.clearState = function () {
        clearState();
    };

    this.setIsMiddleOfZoom = function (boolean) {
        isMiddleOfZoomAnimation = boolean;
    };

    this.setIsZoomState = function (boolean) {
        isZoomState = boolean;
        setCursorType();
    };

    this.shiftStartIndex = function (shiftAmount) {
        shiftStartIndex(shiftAmount);
    };

    this.shiftEndIndex = function (shiftAmount) {
        if (isAreaCovered) {
            shiftEndIndex(shiftAmount);
        } else {
            shiftStartIndex(shiftAmount)
        }
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        body = d3.select("body");

        prepTrackLine();
    }

    function prepTrackLine() {
        trackLineUtil.setExternalDiv(interactiveDiv);
        trackLineUtil.drawComponent();
    }

    /**Draw*****/
    function redraw() {
        restoreState();
    }

    /**Setup***/
    function attachEventsToDiv() {
        interactiveDiv.on("mousedown", onMouseDown)
            .on("mousemove", onMouseMove)
            .on("mouseleave", onMouseLeave);
    }

    function attachEventsToBody() {
        body.on("mousemove.lineChart", onMouseMove)
            .on("mouseup.lineChart", onMouseUp);
        interactiveDiv.on("mousemove", null);
    }

    function detachEventsToBody() {
        body.on("mousemove.lineChart", null)
            .on("mouseup.lineChart", null);
        interactiveDiv.on("mousemove", onMouseMove);
    }

    /***Data***/

    /**State changes**/
    function setCursorType() {
        var divCursorType = null;
        var bodyCursorType = null;
        if (!isFreeze) {
            divCursorType = "crosshair";
        }
        if (isMouseDown) {
            divCursorType = "col-resize";
            bodyCursorType = "col-resize";
        }

        if (isZoomState) {
            divCursorType = "move";
            if (isMouseDown) {
                bodyCursorType = "move";
            }
        }

        if (interactiveDiv) {
            interactiveDiv.style("cursor", divCursorType);
        }

        if (body) {
            body.style("cursor", bodyCursorType);
        }
    }

    function disableMouseSelection() {
        body.style({
            "-webkit-user-select": "none",
            "-moz-user-select": "none",
            "-ms-user-select": "none",
            "user-select": "none"
        });
    }

    function enableMouseSelection() {
        body.style({
            "-webkit-user-select": null,
            "-moz-user-select": null,
            "-ms-user-select": null,
            "user-select": null
        });
    }

    function switchToDragState() {
        setCursorType();
        disableMouseSelection();
        attachEventsToBody();
        if (isZoomState) {
            usefulUtil.enableBlockingDiv("move");
        } else {
            usefulUtil.enableBlockingDiv("col-resize");
        }
    }

    function revertDragState() {
        setCursorType();
        enableMouseSelection();
        detachEventsToBody();
        usefulUtil.disableBlockingDiv();
    }


    /***Move****/
    function respondToMove() {
        var hasActuallyMoved = (hoverIndex != anchorIndex);
        if (isMouseDown && hasActuallyMoved && !isZoomState) {
            isAreaCovered = true;
        }

        setCursorType();
        if (!isFreeze || isMouseDown) {
            alignTrackIndexesByMouse();
            reactToMove();
        }
    }

    /**Event Listeners**/
    function onMouseMove() {
        if (!isMiddleOfZoomAnimation) {
            mouseX = d3.mouse(interactiveDiv.node())[0];
            hoverIndex = xAxis.getPointIndexByMouseX(mouseX, dataList);
            requestAnimationFrame(respondToMove);
        }
    }

    function onMouseDown() {
        if (!isMiddleOfZoomAnimation) {
            mouseX = d3.mouse(interactiveDiv.node())[0];
            prevMouseX = mouseX;
            isMouseDown = true;

            var clickTarget = d3.event.target;
            var isGrip = (clickTarget.getAttribute("name") == "trackLine");

            if (isGrip && isAreaCovered && !isZoomState) {
                onGripMouseDown(clickTarget);
            } else {
                onRegularMouseDown();
            }


            switchToDragState();
            setCursorType();
        }
    }

    function onMouseUp() {
        if (!isMiddleOfZoomAnimation) {
            mouseX = d3.mouse(interactiveDiv.node())[0];
            isMouseDown = false;
            isFreeze = !isFreeze || isAreaCovered;

            if (!isZoomState) {
                manageFreezeState();
            } else {
                isFreeze = false;
            }

            revertDragState();
        }
    }

    function onGripMouseDown(trackLineHTML) {
        var trackPositionIndex = +trackLineHTML.getAttribute("index");
        hoverIndex = trackPositionIndex;

        if (trackPositionIndex == trackStartIndex) {
            anchorIndex = trackEndIndex;
        } else {
            anchorIndex = trackStartIndex;
        }
    }

    function onRegularMouseDown() {
        isAreaCovered = false;
        hoverIndex = xAxis.getPointIndexByMouseX(mouseX, dataList);
        anchorIndex = hoverIndex;
        alignTrackIndexesByMouse();
        reactToMove();

        papaLineCore.reactToTrackUnFreeze();
    }


    function onMouseLeave() {
        if (!isFreeze && !isMouseDown) {
            requestAnimationFrame(hideAll);
        }
    }

    //Helpers

    /**Event Listeners End**/

    /**Calculations***/
    function alignTrackIndexesByMouse() {
        if (isAreaCovered) {
            trackStartIndex = iMath.min(anchorIndex, hoverIndex);
            trackEndIndex = iMath.max(anchorIndex, hoverIndex);
        } else {
            trackStartIndex = hoverIndex;
        }
    }

    function alignTrackIndexesManually() {
        if (isAreaCovered) {
            var actualStart = iMath.min(trackStartIndex, trackEndIndex);
            trackEndIndex = iMath.max(trackStartIndex, trackEndIndex);
            trackStartIndex = actualStart;
        }
    }

    /**Positioning****/
    function shiftStartIndex(shiftAmount) {
        trackStartIndex += shiftAmount;
        trackStartIndex = iMath.max(0, trackStartIndex);
        trackStartIndex = iMath.min(dataList.length - 1, trackStartIndex);
        alignTrackIndexesManually();
        positionTrackLines();
    }

    function shiftEndIndex(shiftAmount) {
        trackEndIndex += shiftAmount;
        trackEndIndex = iMath.max(0, trackEndIndex);
        trackEndIndex = iMath.min(dataList.length - 1, trackEndIndex);
        alignTrackIndexesManually();
        positionTrackLines();
    }

    function positionTrackLines() {
        isShowingTip = true;
        if (isAreaCovered) {
            trackLineUtil.positionBothTrackLines(trackStartIndex, trackEndIndex);
        } else {
            trackLineUtil.positionTrackLine(trackStartIndex);
        }
        papaLineCore.reactToTrackMove(isAreaCovered, trackStartIndex, trackEndIndex);
    }

    /***Manage interactions***/
    function reactToMove() {
        if (!(isZoomState && isMouseDown)) {
            positionTrackLines();
        } else {
            shiftTimeLine();
        }
    }

    function shiftTimeLine() {
        hideAll();

        var shiftAmount;
        var moveAmount = iMath.abs(mouseX - prevMouseX);
        if (moveAmount > pixelAmountForSingleShift) {
            if (mouseX < prevMouseX) {
                shiftAmount = iMath.ceil(moveAmount / pixelAmountForSingleShift);
            } else {
                shiftAmount = -1 * iMath.ceil(moveAmount / pixelAmountForSingleShift);
            }
            prevMouseX = mouseX;

            papaLineCore.shiftTimeLine(shiftAmount);
        }
    }

    function clearState() {
        isFreeze = false;
        isAreaCovered = false;
        isShowingTip = false;
        isZoomState = false;
        hideAll();
    }

    function hideAll() {
        isShowingTip = false;
        trackLineUtil.hideAll();
        papaLineCore.reactToTrackHide();
    }

    function restoreState() {
        trackLineUtil.unFreeze();
        papaLineCore.reactToTrackUnFreeze();
        if (isFreeze) {
            trackLineUtil.freeze();
            papaLineCore.reactToTrackFreeze();
            reactToMove();
        } else if (isShowingTip) {
            reactToMove();
        }
        setCursorType();
    }

    function manageFreezeState() {
        if (isFreeze) {
            trackLineUtil.freeze();
            papaLineCore.reactToTrackFreeze();
        } else {
            trackLineUtil.unFreeze();
            papaLineCore.reactToTrackUnFreeze();
        }
    }
}