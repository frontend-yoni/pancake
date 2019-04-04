/**
 * Created by avitzur on 12/21/2015.
 */
function ListEntryDragService() {
    /***CONSTANTS***/
    var DROP_ANIMATION_DURATION = 300;
    /***Externally Set***/
    //Structure
    var canvasDiv;
    var scrollDiv;
    var canvasDivHTML;
    //State
    var opacity = 1;
    /***Internally Set***/
    var draggedDiv;
    //Structure Elements
    var body = d3.select("body");
    var draggedContainer;
    var mainClone;
    //Layout
    var canvasWidth;
    var canvasHeight;
    var cardWidth;
    //State
    var dropCoordinates;
    var canvasDivBoundingRect;
    var canvasDivClientLeft;
    var canvasDivClientTop;
    var mouseClientX;
    var mouseClientY;
    var mouseRelativeToCanvas = []; //Array of [x,y]
    var mouseOffset; //The offset of the mouse from the top-left coordinate of the dragged div
    var draggedDivCoordinates = []; //The current position of the dragged component (clone)
    var handleCoordinatesRelativeToCanvas = []; //The current position of the drag handle, by which the whole drag position is determined
    var mainDragCloneHeight;
    //State (Action)
    var isFirstDrag;
    var isMiddleOfAnimation;
    var isDragging;
    //Utils
    var usefulUIService = UsefulUIUtil.getInstance();
    var animationUtil = AnimateCardUtil.getInstance();
    var papaComponent; //must implement: OnDragMove. OnDragStart. OnDrop. OnDropAnimationEnd.


    /**Public Function***/
    this.setOpacity = function (opacityInput) {
        opacity = opacityInput;
    };

    this.setContainerDivs = function (canvasDivInput, scrollDivInput) {
        canvasDiv = canvasDivInput;
        canvasDivHTML = canvasDiv.node();
        scrollDiv = scrollDivInput;

        if (!draggedContainer) {
            var draggedContainerHTML = document.createElement("div");
            draggedContainer = d3.select(draggedContainerHTML);
            draggedContainer.on(animationUtil.CLONE_RETURN_COMPLETE_EVENT, onDropAnimationComplete);
        }
    };

    this.setAsDraggable = function (draggableDiv) {
        attachEventsToDraggableDiv(draggableDiv);
    };

    this.setPapaComponent = function (componentObj) {
        papaComponent = componentObj;
    };

    this.getMouseYRelativeToCanvas = function () {
        return mouseRelativeToCanvas[1];
    };

    this.getDraggedEntryDiv = function () {
        return draggedDiv;
    };


    /**UI State Change**/
    function applyDragState() {
        draggedContainer.style("box-shadow", "rgba(0,0,0,0.5) 0px 0px 3px 3px");
    }


    /***Event Management***/
    function removeEventsFromBody() {
        scrollDiv.on("scroll.ListEntryDragService", null);
        document.removeEventListener("mouseup", onMouseUpBody);
        document.removeEventListener("mousemove", onMouseMoveBody);
    }

    function attachEventsToBody() {
        scrollDiv.on("scroll.ListEntryDragService", onScroll);
        document.addEventListener("mouseup", onMouseUpBody);
        document.addEventListener("mousemove", onMouseMoveBody);
    }

    function attachEventsToDraggableDiv(draggableDiv) {
        draggableDiv.on("mousedown.draggableDiv", onMouseDownDragDiv);
    }

    /**Layout Calculations***/
    function calculateCanvasPosition() {
        canvasDivBoundingRect = canvasDivHTML.getBoundingClientRect();
        canvasDivClientLeft = canvasDivHTML.clientLeft;
        canvasDivClientTop = canvasDivHTML.clientTop;
    }

    function getPositionRelativeToContainer(containerRect, containerClientLeft, containerClientTop, mouseClientX, mouseClientY) {
        var x = (mouseClientX - containerRect.left - containerClientLeft);
        var y = (mouseClientY - containerRect.top - containerClientTop);
        return [x, y];
    }

    function updateCoordinates(coordinatesRelativeToCanvas) {
        mouseRelativeToCanvas[0] = coordinatesRelativeToCanvas[0];
        mouseRelativeToCanvas[1] = coordinatesRelativeToCanvas[1];

        var x = mouseRelativeToCanvas[0] - mouseOffset[0];
        var y = mouseRelativeToCanvas[1] - mouseOffset[1];

        x = iMath.min(x, canvasDivBoundingRect.width);
        y = iMath.min(y, canvasDivBoundingRect.top + canvasDivBoundingRect.height + 250);

        draggedDivCoordinates[0] = x;
        draggedDivCoordinates[1] = y;

        var cloneWidth = iMath.min(cardWidth, canvasDivBoundingRect.width - x);
        resetDraggedContainerWidth(cloneWidth);

        handleCoordinatesRelativeToCanvas[0] = mouseRelativeToCanvas[0];
        handleCoordinatesRelativeToCanvas[1] = y;
    }

    function resetDraggedContainerWidth(width) {
        draggedContainer.style({
            width: width + "px"
        });
    }

    /**Clone Management***/
    function positionClone() {
        draggedContainer.style({
            "left": draggedDivCoordinates[0] + "px",
            "top": draggedDivCoordinates[1] + "px"
        });
    }

    function createClonedElement() {
        canvasDivHTML.appendChild(draggedContainer.node());

        var draggedDivHTML = draggedDiv.node();

        var mainCloneHTML = draggedDivHTML.cloneNode(true);
        mainClone = d3.select(mainCloneHTML)
            .classed("gridWrapperComponent", false); //Cancels ":Hover" CSS
        mainClone.selectAll("." + ListEntryDragService.ELEMENTS_TO_REMOVE_CLASS).remove();

        var canvasRect = canvasDiv.node().getBoundingClientRect();
        var divRect = draggedDivHTML.getBoundingClientRect();
        var leftRelativeToCanvas = divRect.left - canvasRect.left;
        var topRelativeToCanvas = divRect.top - canvasRect.top;
        var width = divRect.width;
        var height = divRect.height;

        var zIndexOnTopOfAll = UsefulUIUtil.blockingDivZIndex + 1;
        draggedContainer.style({
            position: "absolute",
            left: leftRelativeToCanvas + "px",
            top: topRelativeToCanvas + "px",
            height: height + "px",
            width: width + "px",
            overflow: "hidden",
            "z-index": zIndexOnTopOfAll,
            opacity: opacity,
            cursor: "move"
        })
            .attr("name", "draggedContainer");

        mainDragCloneHeight = height;
        mainClone.style({
            position: "absolute",
            cursor: "move",
            top: 0,
            left: 0
        });

        resetClipPathIDsForClone(mainClone);

        draggedContainer.node().appendChild(mainCloneHTML);

        cardWidth = draggedDivHTML.clientWidth;
        mainClone.style("width", cardWidth + "px");

        applyDragState();
    }

    function respondToFirstMove() {
        createClonedElement();
    }

    function removeClone() {
        if (draggedContainer) {
            draggedContainer.remove();
        }
        if (mainClone) {
            mainClone.remove();
        }
    }

    /***Animation***/
    //Animation
    function performDropAnimation() {
        isMiddleOfAnimation = true;
        var dropDivBoundingRect = draggedDiv.node().getBoundingClientRect();
        var prevLeft = draggedDivCoordinates[0];
        var prevTop = draggedDivCoordinates[1];
        var dropLeft = dropDivBoundingRect.left;
        var dropTop = dropDivBoundingRect.top - canvasDivBoundingRect.top;

        draggedContainer.style("width", cardWidth + "px");
        animateDropForElement(draggedContainer, prevLeft, dropLeft, prevTop, dropTop);
    }

    function animateDropForElement(dropElement, prevLeft, dropLeft, prevTop, dropTop) {
        var width = +dropElement.style("width").replace("px", "");
        var height = +dropElement.style("height").replace("px", "");

        animationUtil.runCloneReturn(dropElement,
            width, height, prevTop, prevLeft, width, height, dropTop, dropLeft, DROP_ANIMATION_DURATION);
    }

    /**Event Listeners***/
    function onMouseDownDragDiv() {
        var event = d3.event;
        if (!isMiddleOfAnimation && !event[ListEntryDragService.NO_DRAG_CLASS]) {
            draggedDiv = d3.select(event.currentTarget);
            draggedDiv.style("cursor", "move");

            isFirstDrag = true;
            dropCoordinates = null; //Initialize the drop coordinates from the previous session
            isDragging = false;

            mouseOffset = d3.mouse(draggedDiv.node());
            calculateCanvasPosition();

            mouseClientX = event.clientX;
            mouseClientY = event.clientY;

            canvasWidth = canvasDivHTML.clientWidth;
            canvasHeight = canvasDivHTML.clientHeight;


            attachEventsToBody();
        }
    }


    function onMouseMoveBody(e) {
        draggedDiv.style("cursor", "move");
        if (!e) {
            e = event;
        }
        var newMouseX = e.clientX;
        var newMouseY = e.clientY;

        if (mouseClientX != newMouseX || mouseClientY != newMouseY) {
            mouseClientX = newMouseX;
            mouseClientY = newMouseY;
            isDragging = true;
            var coordinates = getPositionRelativeToContainer(canvasDivBoundingRect, canvasDivClientLeft, canvasDivClientTop, mouseClientX, mouseClientY);

            if (isFirstDrag) {
                usefulUIService.enableBlockingDiv("move");
                respondToFirstMove(coordinates);
                isFirstDrag = false;
                papaComponent.onDragStart();
            }
            updateCoordinates(coordinates);

            requestAnimationFrame(positionClone);

            papaComponent.onDragMove();
        }
    }

    function onMouseUpBody() {
        draggedDiv.style("cursor", null);
        usefulUIService.disableBlockingDiv();
        removeEventsFromBody();
        performDropAnimation();
    }

    function onDropAnimationComplete() {
        if (isDragging){
            papaComponent.onDropAnimationComplete();
        }
        removeClone();
        isMiddleOfAnimation = false;
    }

    function onScroll() {
        calculateCanvasPosition();
        var coordinates = getPositionRelativeToContainer(canvasDivBoundingRect, canvasDivClientLeft, canvasDivClientTop, mouseClientX, mouseClientY);
        var draggedY = coordinates[1] - mouseOffset[1];

        draggedY = iMath.min(draggedY, canvasDivBoundingRect.top + canvasDivBoundingRect.height + 250);

        draggedDivCoordinates[1] = draggedY;
        requestAnimationFrame(positionClone);
    }
}

ListEntryDragService.ELEMENTS_TO_REMOVE_CLASS = "ListDragElementsToRemove";
ListEntryDragService.NO_DRAG_CLASS = "NO_DRAG_CLASS";