/**
 * Created by avitzur on 9/17/2015.
 */
function DragAndDropService() {
    //Constants
    //Layout
    var GRIP_AREA_TOP = -5;
    var GRIP_AREA_HEIGHT = 43; //Well the whole tile is the hit area
    var GRIP_HANDLE_HEIGHT = 6;
    var GRIP_HANDLE_WIDTH = 50;
    var GRIP_HANDLE_OVERLAP = 5;
    var GRIP_TOP_RADIUS = 5;
    var GRIP_BG_COLOR = "#eeeeee";
    var GRIP_ICON_COLOR = "#777777";
    var GRIP_ICON_WIDTH = 16;
    //Color
    var RESIZE_LINE_COLOR = "#020202";
    //Style
    var REGULAR_GRIP_SHADOW = "rgba(0, 0, 0, 0.15) 0px -2px 4px 0px";

    //Structure elements
    var gripAreaDiv;
    var gripHitAreaDiv;
    var gripHandleDiv;
    //Structure elements (externally set)
    var canvasDiv;
    //Objects
    var cardDataObject;
    //Utils
    var dragAndDropUtil = DragAndDropUtil.getInstance();


    //public properties
    this.DRAG_STAR_EVENT = dragAndDropUtil.DRAG_STAR_EVENT;
    this.DROP_EVENT = dragAndDropUtil.DROP_EVENT;
    this.DRAG_MOVE_EVENT = dragAndDropUtil.DRAG_MOVE_EVENT;
    this.DROP_ANIMATION_END = dragAndDropUtil.DROP_ANIMATION_END;
    this.ELEMENTS_TO_REMOVE_CLASS = dragAndDropUtil.ELEMENTS_TO_REMOVE_CLASS;
    this.DRAG_FIRST_MOVE = dragAndDropUtil.DRAG_FIRST_MOVE;
    //End.

    /*Public functions*/
    this.createElements = function () {
        createElements();
    };

    this.attachToCard = function (cardObject) {
        attachToCard(cardObject);
    };

    this.hide = function () {
        hide();
    };

    this.show = function () {
        show();
    };

    this.setCanvasDiv = function (divHTML) {
        canvasDiv = d3.select(divHTML);
        dragAndDropUtil.setCanvasDiv(canvasDiv);
    };

    this.setPapaFunGrid = function (funGridInput) {
        dragAndDropUtil.setPapaFunGrid(funGridInput);
    };

    this.setScrollDiv = function (d3Div) {
        dragAndDropUtil.setScrollDiv(d3Div);
    };

    this.setDropCoordinates = function (arrayInput) {
        dragAndDropUtil.setDropCoordinates(arrayInput);
    };

    this.getCardDataObject = function () {
        return cardDataObject;
    };
    /*End.*/

    /*UI Visualizations */
    function attachToCard(cardObjectInput) {
        cardDataObject = cardObjectInput;
        var innerDivHTML = cardDataObject.innerDiv.node();
        innerDivHTML.appendChild(gripAreaDiv.node());

        show();
        dragAndDropUtil.setDraggedCardWrapperDiv(cardDataObject.wrapperDiv);
    }

    function show() {
        gripAreaDiv.style({
            display: ""
        });
    }

    function hide() {
        gripAreaDiv.style({
            display: "none"
        });
    }

    function createElements() {
        var gripAreaDivHTML = document.createElement("div");  //This one will be detached and reattached to the focused div
        gripAreaDiv = d3.select(gripAreaDivHTML);

        var resizeUtil = ResizeUtil.getInstance();
        gripAreaDiv.style({
            position: "absolute",
            overflow: "visible",
            width: "100%",
            height: GRIP_AREA_HEIGHT + "px",
            top: GRIP_AREA_TOP + "px",
            display: "none"
        })
            .classed(resizeUtil.REMOVE_FROM_RESIZE_CLONE, true);


        gripHitAreaDiv = gripAreaDiv.append("div")
            .style({
                position: "relative",
                height: GRIP_AREA_HEIGHT + "px",
                width: "100%",
                cursor: "pointer",
                margin: "auto"
            });

        gripHandleDiv = gripHitAreaDiv.append("div")
            .style({
                position: "relative",
                height: GRIP_HANDLE_HEIGHT + 1 + "px",
                width: GRIP_HANDLE_WIDTH + "px",
                background: GRIP_BG_COLOR,
                "border-radius": GRIP_TOP_RADIUS + "px " + GRIP_TOP_RADIUS + "px 0 0",
                "box-shadow": REGULAR_GRIP_SHADOW,
                margin: "auto"
            })
            .classed(dragAndDropUtil.GRIP_HANDEL_CLASS, true);

        //Grip Icon
        gripHitAreaDiv.append("div")
            .style({
                position: "relative",
                top: -2 + "px",
                height: 1 + "px",
                width: GRIP_ICON_WIDTH + "px",
                background: GRIP_ICON_COLOR,
                margin: "auto"
            });
        gripHitAreaDiv.append("div")
            .style({
                position: "relative",
                top: -1 + "px",
                height: 1 + "px",
                width: GRIP_ICON_WIDTH + "px",
                background: GRIP_ICON_COLOR,
                margin: "auto"
            });
        gripHitAreaDiv.append("div")
            .style({
                position: "relative",
                top: 0 + "px",
                height: 1 + "px",
                width: GRIP_ICON_WIDTH + "px",
                background: GRIP_ICON_COLOR,
                margin: "auto"
            });

        dragAndDropUtil.setGripDiv(gripHitAreaDiv);
        dragAndDropUtil.enableDrag();
    }

    /*End.*/

}

DragAndDropService.getInstance = function () {
    if (!DragAndDropService.instance) {
        DragAndDropService.instance = new DragAndDropService();
    }

    return DragAndDropService.instance;
};