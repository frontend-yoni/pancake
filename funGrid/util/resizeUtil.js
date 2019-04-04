/**
 * Created with IntelliJ IDEA.
 * User: avitzur
 * Date: 25/12/14
 * Time: 14:09
 * To change this template use File | Settings | File Templates.
 */
function ResizeUtil() {

    //CONSTANTS
    //Style
    var CLONE_SHADOW = "0 1px 20px 0 rgba(0,0,0,0.15), inset 0 -1px 0 0 rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.5), 0 0 0 1px rgba(0,0,0,0.16)";
    var CLONE_ID_SUFFIX = "_CLONE_";
    //Enum
    var RESIZE_DIRECTION_TYPE = {"right": 0, "bottom": 1, "both": 2};
    //Events
    var RESIZE_STAR_EVENT = "startingToResize";
    var RESIZE_END_EVENT = "finishedResize";
    var RESIZE_MOVE_EVENT = "resizeProgressing";
    var RESIZE_ANIMATION_END_EVENT = "resizeAnimationEnd";
    //Classes
    var REMOVE_FROM_RESIZE_CLONE = "removeFromResizeCloneClass";
    //Animation
    var DEFAULT_SHIFT_ANIMATION_DURATION = 500;

    //Structure Elements
    var body = d3.select("body");
    //Structure Elements (Externally set)
    var rightResizeHitArea;
    var bottomResizeHitArea;
    var middleResizeHitArea;
    var resizingCardDiv;
    var canvasDiv;

    //State params (externally set)
    var shiftCoordinates;
    var shiftSize;
    var shiftAnimationDuration = DEFAULT_SHIFT_ANIMATION_DURATION;

    //State params (internally set)
    var isResizing;
    var resizeDirection;
    var originalWidth;
    var originalHeight;
    var mouseStartCoordinates;
    var currentMouseCoordinates;
    var cursorType;
    //State elements
    var resizingCardClone;

    //Layout
    //Externally set
    var minWidth = 200;
    var minHeight = 200;

    //State data object
    var resizeState = {"width": 0, "height": 0};

    //Utils
    var usefulUIService = UsefulUIUtil.getInstance();
    var animationUtil = AnimateCardUtil.getInstance();
    var papaResizeService;


    //public properties
    this.RESIZE_DIRECTION_TYPE = RESIZE_DIRECTION_TYPE;
    this.RESIZE_STAR_EVENT = RESIZE_STAR_EVENT;
    this.RESIZE_END_EVENT = RESIZE_END_EVENT;
    this.RESIZE_MOVE_EVENT = RESIZE_MOVE_EVENT;
    this.RESIZE_ANIMATION_END_EVENT = RESIZE_ANIMATION_END_EVENT;
    this.REMOVE_FROM_RESIZE_CLONE = REMOVE_FROM_RESIZE_CLONE;
    //End.

    //Public functions
    this.setResizingCardDiv = function (wrapperDiv) {
        resizingCardDiv = wrapperDiv;
    };

    this.setCanvasDiv = function (divInput) {
        canvasDiv = divInput;
    };

    this.setPapaResizeService = function (resizeService) {
        papaResizeService = resizeService;
    };

    this.setRightResizeHitArea = function (divElement) {
        rightResizeHitArea = divElement;
    };

    this.setBottomResizeHitArea = function (divElement) {
        bottomResizeHitArea = divElement;
    };

    this.setMiddleResizeHitArea = function (divElement) {
        middleResizeHitArea = divElement;
    };

    this.updateClone = function(cardData){
        updateClone(cardData);
    };

    this.enableResize = function () {
        enableResize();
    };

    this.setShiftCoordinatesAndSize = function (coordinatesArray, sizeArray) {
        shiftCoordinates = coordinatesArray;
        shiftSize = sizeArray;
    };

    this.setShiftAnimationDuration = function (duration) {
        shiftAnimationDuration = duration;
    };

    this.setMinWidth = function (minInput) {
        minWidth = minInput;
    };

    this.setMinHeight = function (minInput) {
        minHeight = minInput;
    };
    
    this.getIsResizing = function(){
        return isResizing;
    };
    //End.

    //Main functions
    function enableResize() {
        rightResizeHitArea.on("mousedown.resizeService", onMouseDownHitArea);
        bottomResizeHitArea.on("mousedown.resizeService", onMouseDownHitArea);
        middleResizeHitArea.on("mousedown.resizeService", onMouseDownHitArea);
    }

    function attachMoveEvents() {
        body.on("mousemove.resizeService", onMouseMoveBody);
        body.on("mouseup.resizeService", onMouseUpBody);
    }

    function removeMoveEvents() {
        body.on("mousemove.resizeService", null);
        body.on("mouseup.resizeService", null);
    }

    //End.


    //Event listeners
    function onMouseDownHitArea() {
        var event = d3.event;
        var target = event.currentTarget;
        var d3Target = d3.select(target);

        isResizing = true;
        shiftCoordinates = null; //nullify the shiftCoordinates from the previous resize
        attachMoveEvents();

        resizeDirection = +d3Target.attr("resizeDirection");

        originalWidth = resizingCardDiv.node().clientWidth;
        originalHeight = resizingCardDiv.node().clientHeight;

        createClonedElement();

        mouseStartCoordinates = [event.clientX, event.clientY];

        papaResizeService.hide();

        setCursorType();
        activateConcealer();

        dispatchEventByNameAndData(resizingCardDiv, RESIZE_STAR_EVENT);
    }

    function onMouseMoveBody() {
        if (isResizing) {
            var event = d3.event;
            currentMouseCoordinates = [event.clientX, event.clientY];

            requestAnimationFrame(respondToMove);
        }
    }

    function onMouseUpBody() {
        if (isResizing) {
            resizeDone();
        }
    }

    //End.

    /****Utility functions***/
    function resizeDone() {
        initializeCursorType();
        isResizing = false;
        removeMoveEvents();
        dispatchEventByNameAndData(resizingCardDiv, RESIZE_END_EVENT);

        if (shiftCoordinates) {
            performShiftAnimation();
        } else {
            respondToResizeComplete();
        }

        function performShiftAnimation() {
            var cloneStyle = resizingCardClone.node().style;
            var prevTop = +cloneStyle.top.replace("px", "");
            var prevLeft = +cloneStyle.left.replace("px", "");
            var prevWidth = +cloneStyle.width.replace("px", "");
            var prevHeight = +cloneStyle.height.replace("px", "");

            var shiftLeft = shiftCoordinates[0];
            var shiftTop = shiftCoordinates[1];
            var shiftWidth = shiftSize[0];
            var shiftHeight = shiftSize[1];


            animationUtil.runCloneReturn(resizingCardClone,
                prevWidth, prevHeight, prevTop, prevLeft, shiftWidth, shiftHeight, shiftTop, shiftLeft, shiftAnimationDuration);

            resizingCardClone.on(animationUtil.CLONE_RETURN_COMPLETE_EVENT, respondToResizeComplete);
        }
    }

    function respondToMove(){
        var xDiff = currentMouseCoordinates[0] - mouseStartCoordinates[0];
        var yDiff = currentMouseCoordinates[1] - mouseStartCoordinates[1];

        var widthDiff = 0;
        var heightDiff = 0;
        if (resizeDirection == RESIZE_DIRECTION_TYPE.both || resizeDirection == RESIZE_DIRECTION_TYPE.right) {
            widthDiff = xDiff;
        }
        if (resizeDirection == RESIZE_DIRECTION_TYPE.both || resizeDirection == RESIZE_DIRECTION_TYPE.bottom) {
            heightDiff = yDiff;
        }
        resizeState.width = originalWidth + widthDiff;
        resizeState.height = originalHeight + heightDiff;

        resizeState.width = Math.max(minWidth - 20, resizeState.width);
        resizeState.height = Math.max(minHeight - 20, resizeState.height);

        resizingCardClone.style({
            "width": resizeState.width + "px",
            "height": resizeState.height + "px"
        });

        setCursorType();
        dispatchEventByNameAndData(resizingCardDiv, RESIZE_MOVE_EVENT, resizeState);
    }

    function createClonedElement() {
        var clonedHtmlElement = resizingCardDiv.node().cloneNode(true);
        resizingCardClone = d3.select(clonedHtmlElement)
            .attr("name", "resizingCardClone")
            .style({
                overflow: "hidden"
            })
            .classed("gridWrapperComponent", false); //Cancels ":Hover" CSS

        removeOpacity(); //when resizing the innerDiv becomes half transparent, but the clone shouldn't

        resetClipPathIDsForClone(resizingCardClone);

        resizingCardClone.selectAll("." + REMOVE_FROM_RESIZE_CLONE)
            .remove();

        appendClone();
    }

    function removeOpacity(){
        var innerDiv = resizingCardClone.select("." + GridCard.INNER_DIV_CLASS); //when resizing the innerDiv becomes half transparent, but the clone shouldn't
        innerDiv.style("opacity", 1);
        innerDiv.style("overflow", "hidden");
    }

    function appendClone() {
        canvasDiv.node().appendChild(resizingCardClone.node());
    }

    function respondToResizeComplete() {
        canvasDiv.node().removeChild(resizingCardClone.node());
        removeConcealer();
        dispatchEventByNameAndData(resizingCardDiv, RESIZE_ANIMATION_END_EVENT);
    }

    function setCursorType() {
        switch (resizeDirection) {
            case RESIZE_DIRECTION_TYPE.right:
                cursorType = "w-resize";
                break;
            case RESIZE_DIRECTION_TYPE.bottom:
                cursorType = "n-resize";
                break;
            case RESIZE_DIRECTION_TYPE.both:
                cursorType = "se-resize";
                break;
        }

        body.style({
            "cursor": cursorType
        });
    }

    function initializeCursorType() {
        body.style({
            "cursor": "default"
        });
    }

    function updateClone(cardData){
        updateInnerDivOfCardClone(cardData.innerDiv.node(), resizingCardClone, REMOVE_FROM_RESIZE_CLONE);
        removeOpacity(); //when resizing the innerDiv becomes half transparent, but the clone shouldn't
        resizingCardClone.select("." + GridCard.INNER_DIV_CLASS)
            .style({
                "box-shadow": CLONE_SHADOW
            });
    }
    //End.

    //UI Changes
    function activateConcealer() { //Cover the screen to make sure no mouse event are triggers while resizing
        usefulUIService.enableBlockingDiv(cursorType);
    }

    function removeConcealer() {
        usefulUIService.disableBlockingDiv();
    }

    //End.
}

ResizeUtil.getInstance = function () {
    if (!ResizeUtil.instance) {
        ResizeUtil.instance = new ResizeUtil();
    }

    return ResizeUtil.instance;
};