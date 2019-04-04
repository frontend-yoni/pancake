/**
 * Created by avitzur on 9/20/2015.
 */
function DragAndDropUtil() {
    var me = this;
    //CONSTANTS
    var DEFAULT_OPACITY = 1;
    //Classes
    var ELEMENTS_TO_REMOVE_CLASS = "dragElementsToRemove";
    var GRIP_HANDLE_CLASS = "dragServiceGripHandle";
    //Events
    var DRAG_STAR_EVENT = "startingToDrag";
    var DROP_EVENT = "draggableDivDropped";
    var DRAG_MOVE_EVENT = "draggableDivMoving";
    var DROP_ANIMATION_END = "dropAnimationEnd";
    var DRAG_FIRST_MOVE = "dragFirstMove";
    //Animation
    var DEFAULT_DROP_ANIMATION_DURATION = 400;
    //Style
    var REGULAR_GRIP_SHADOW = "rgba(0, 0, 0, 0.15) 0px -2px 4px 0px";
    var DRAGGING_GRIP_SHADOW = "rgba(0, 0, 0, 0.5) 0px -2px 2px 0px";
    var DRAGGING_CARD_SHADOW = "rgba(0, 0, 0, 0.5) 0px 0px 6px 1px";
    var REGULAR_CARD_SHADOW = "rgba(0,0,0,0.15) 1px 1px 1px 0px";

    //Structure Elements
    var draggedContainer;
    var mainClone;
    //Externally set
    var canvasDiv;
    var canvasDivHTML;
    var scrollDiv;
    var gripDiv;

    //State params (Externally set)
    var dropAnimationDuration = DEFAULT_DROP_ANIMATION_DURATION;
    var dropCoordinates;
    var dragCloneOpacity = DEFAULT_OPACITY;
    //State params (Internally set)
    var isFirstMove;
    var isDragging;
    var isMiddleOfDropAnimation = false;
    var draggedCardWrapperDiv;
    var mouseRelativeToCanvas = []; //Array of [x,y]
    var mouseOffset; //The offset of the mouse from the top-left coordinate of the dragged div
    var draggedDivCoordinates = []; //The current position of the dragged component (clone)
    var handleCoordinatesRelativeToCanvas = []; //The current position of the drag handle, by which the whole drag position is determined
    //Layout state
    var cardWidth;
    var canvasWidth;
    var canvasHeight;
    var mainDragCloneHeight;
    var canvasDivBoundingRect;
    var canvasDivClientLeft;
    var canvasDivClientTop;
    var mouseClientX;
    var mouseClientY;

    //Utils
    var usefulUIService = UsefulUIUtil.getInstance();
    var animationUtil = AnimateCardUtil.getInstance();
    var funGrid;


    //Public functions
    this.setGripDiv = function (d3Div) {
        gripDiv = d3Div;
    };

    this.setDraggedCardWrapperDiv = function (wrapperDiv) {
        draggedCardWrapperDiv = wrapperDiv;
    };

    this.setPapaFunGrid = function (funGridInput) {
        funGrid = funGridInput;
    };

    this.setCanvasDiv = function (d3Div) {
        canvasDiv = d3Div;
        canvasDivHTML = canvasDiv.node();
    };

    this.setScrollDiv = function (d3Div) {
        scrollDiv = d3Div;
    };

    this.getDraggedContainer = function () {
        return draggedContainer;
    };

    this.getMainDraggedClone = function () {
        return mainClone;
    };

    this.getDraggedCardWrapperDiv = function () {
        return draggedCardWrapperDiv;
    };

    this.setDropAnimationDuration = function (numInput) {
        dropAnimationDuration = numInput;
    };

    this.setDropCoordinates = function (arrayInput) {
        dropCoordinates = arrayInput;
    };

    this.enableDrag = function () {
        enableDrag();
    };

    this.getIsDragging = function(){
        return isDragging;
    };

    //End.

    //public properties
    this.DRAG_STAR_EVENT = DRAG_STAR_EVENT;
    this.DROP_EVENT = DROP_EVENT;
    this.DRAG_MOVE_EVENT = DRAG_MOVE_EVENT;
    this.DROP_ANIMATION_END = DROP_ANIMATION_END;
    this.ELEMENTS_TO_REMOVE_CLASS = ELEMENTS_TO_REMOVE_CLASS;
    this.DRAG_FIRST_MOVE = DRAG_FIRST_MOVE;
    this.GRIP_HANDEL_CLASS = GRIP_HANDLE_CLASS;
    //End.

    function enableDrag() {
        var draggedContainerHTML = document.createElement("div");
        draggedContainer = d3.select(draggedContainerHTML);
        draggedContainer.on(animationUtil.CLONE_RETURN_COMPLETE_EVENT, respondToDropComplete);
        gripDiv.on("mousedown", onMouseDownDragDiv);
    }

    function removeEventsFromBody() {
        scrollDiv.on("scroll.dragService", null);
        document.removeEventListener("mouseup", onMouseUpBody);
        document.removeEventListener("mousemove", onMouseMoveBody);
    }

    function attachEventsToBody() {
        scrollDiv.on("scroll.dragService", onScroll);
        document.addEventListener("mouseup", onMouseUpBody);
        document.addEventListener("mousemove", onMouseMoveBody);
    }

    //End.

    //Event listeners
    function onMouseDownDragDiv() {
        var event = d3.event;
        isFirstMove = true;

        if (!isMiddleOfDropAnimation) {  //In case we're in the middle of drop animation, disregard
            usefulUIService.enableBlockingDiv("pointer");
            dropCoordinates = null; //Initialize the drop coordinates from the previous session

            mouseOffset = d3.mouse(draggedCardWrapperDiv.node());
            calculateCanvasPosition();

            mouseClientX = event.clientX;
            mouseClientY = event.clientY;

            var coordinates = getPositionRelativeToContainer(canvasDivBoundingRect, canvasDivClientLeft, canvasDivClientTop, mouseClientX, mouseClientY);


            canvasWidth = canvasDivHTML.clientWidth;
            canvasHeight = canvasDivHTML.clientHeight;
            createClonedElement();
            updateCoordinates(coordinates);
            isDragging = true;

            attachEventsToBody();

            dispatchEventByNameAndData(draggedCardWrapperDiv, DRAG_STAR_EVENT);
        }
    }

    function onMouseMoveBody(e) {
        if (!isDragging) {
            removeEventsFromBody();
        } else {
            if (!e){
                e = event;
            }
            mouseClientX = e.clientX;
            mouseClientY = e.clientY;
            var coordinates = getPositionRelativeToContainer(canvasDivBoundingRect, canvasDivClientLeft, canvasDivClientTop, mouseClientX, mouseClientY);
            updateCoordinates(coordinates);


            if (isFirstMove) {
                draggedContainer.selectAll("." + ELEMENTS_TO_REMOVE_CLASS).remove();
                dispatchEventByNameAndData(draggedCardWrapperDiv, DRAG_FIRST_MOVE);
            } else {
                var x = 10; //todo: kill this!
            }
            isFirstMove = false;

            requestAnimationFrame(positionClone);
            funGrid.onDragMove(mouseRelativeToCanvas[0], mouseRelativeToCanvas[1]);
            // dispatchEventByNameAndData(draggedCardWrapperDiv, DRAG_MOVE_EVENT, mouseRelativeToCanvas);
        }
    }

    function onMouseUpBody() {
        if (!isDragging) {
            removeEventsFromBody();
        } else {
            isDragging = false;

            removeEventsFromBody();
            dispatchEventByNameAndData(draggedCardWrapperDiv, DROP_EVENT, mouseRelativeToCanvas);

            if (dropCoordinates) {
                performDropAnimation();
            } else {
                respondToDropComplete();
            }
        }
    }

    function onScroll() {
        if (isDragging) {
            calculateCanvasPosition();
            var coordinates = getPositionRelativeToContainer(canvasDivBoundingRect, canvasDivClientLeft, canvasDivClientTop, mouseClientX, mouseClientY);

            draggedDivCoordinates[1] = coordinates[1] - mouseOffset[1];
            requestAnimationFrame(positionClone);
        }
    }

    //End.

    //Animation
    function performDropAnimation() {
        isMiddleOfDropAnimation = true;
        var prevLeft = draggedDivCoordinates[0];
        var prevTop = draggedDivCoordinates[1];
        var dropLeft = dropCoordinates[0];
        var dropTop = dropCoordinates[1];

        animateDropForElement(draggedContainer, prevLeft, dropLeft, prevTop, dropTop);
    }

    function animateDropForElement(dropElement, prevLeft, dropLeft, prevTop, dropTop) {
        var width = +dropElement.style("width").replace("px", "");
        var height = +dropElement.style("height").replace("px", "");

        animationUtil.runCloneReturn(dropElement,
            width, height, prevTop, prevLeft, width, height, dropTop, dropLeft, dropAnimationDuration);
    }

    //End.

    //Utility functions
    function positionClone() {
        draggedContainer.style({
            "left": draggedDivCoordinates[0] + "px",
            "top": draggedDivCoordinates[1] + "px"
        });
    }

    function createClonedElement() {
        canvasDivHTML.appendChild(draggedContainer.node());

        var mainCloneHTML = draggedCardWrapperDiv.node().cloneNode(true);
        mainClone = d3.select(mainCloneHTML)
            .classed("gridWrapperComponent", false); //Cancels ":Hover" CSS

        mainClone.selectAll("." + ELEMENTS_TO_REMOVE_CLASS).remove();

        var canvasRect = canvasDiv.node().getBoundingClientRect();
        var divRect = draggedCardWrapperDiv.node().getBoundingClientRect();
        var leftRelativeToCanvas = divRect.left - canvasRect.left;
        var topRelativeToCanvas = divRect.top - canvasRect.top;
        var width = divRect.width;
        var height = divRect.height;

        var zIndexOnTopOfAll = UsefulUIUtil.blockingDivZIndex + 1;
        draggedContainer.style({
                opacity: dragCloneOpacity,
                position: "absolute",
                left: leftRelativeToCanvas + "px",
                top: topRelativeToCanvas + "px",
                height: height + "px",
                width: width + "px",
                "z-index": zIndexOnTopOfAll
            })
            .attr("name", "draggedContainer");

        mainDragCloneHeight = height;
        mainClone.style({
            position: "absolute",
            top: 0,
            left: 0
        });

        resetClipPathIDsForClone(mainClone);
        draggedContainer.node().appendChild(mainCloneHTML);
        cardWidth = draggedCardWrapperDiv.node().clientWidth;

        applyDragState();
    }

    function removeClone() {
        draggedContainer.remove();
        mainClone.remove();
    }

    function respondToDropComplete() {
        isMiddleOfDropAnimation = false;
        removeClone();
        usefulUIService.disableBlockingDiv();
        dispatchEventByNameAndData(draggedCardWrapperDiv, DROP_ANIMATION_END);
    }

    //End.

    //Layout
    function updateCoordinates(coordinatesRelativeToCanvas) {
        mouseRelativeToCanvas[0] = coordinatesRelativeToCanvas[0];
        mouseRelativeToCanvas[1] = coordinatesRelativeToCanvas[1];

        var x = mouseRelativeToCanvas[0] - mouseOffset[0];
        var y = mouseRelativeToCanvas[1] - mouseOffset[1];

        draggedDivCoordinates[0] = x;
        draggedDivCoordinates[1] = y;

        resetDraggedContainerWidth(cardWidth);
    }

    function resetDraggedContainerWidth(width) {
        draggedContainer.style({
            width: width + "px"
        });
    }

    //End.

    /**UI State Change**/
    function applyDragState() {
        var innerDivClone = mainClone.select("." + GridCard.INNER_DIV_CLASS);
        innerDivClone.style("box-shadow", DRAGGING_CARD_SHADOW);
        mainClone.select("." + GRIP_HANDLE_CLASS).style("box-shadow", DRAGGING_GRIP_SHADOW);
    }

    /**UI State Change End.**/

    //Calculate coordinates
    function getPositionRelativeToContainer(containerRect, containerClientLeft, containerClientTop, mouseClientX, mouseClientY) {
        var x = (mouseClientX - containerRect.left - containerClientLeft);
        var y = (mouseClientY - containerRect.top - containerClientTop);
        return [x, y];
    }

    function calculateCanvasPosition() {
        canvasDivBoundingRect = canvasDivHTML.getBoundingClientRect();
        canvasDivClientLeft = canvasDivHTML.clientLeft;
        canvasDivClientTop = canvasDivHTML.clientTop;
    }

    //End.

}

DragAndDropUtil.getInstance = function () {
    if (!DragAndDropUtil.instance) {
        DragAndDropUtil.instance = new DragAndDropUtil();
    }

    return DragAndDropUtil.instance;
};