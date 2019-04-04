/**
 * Created by avitzur on 9/17/2015.
 */
function ResizeService() {
    var me = this;
    //Constants

    //Layout
    var RESIZE_CIRCLE_RADIUS = 5;
    var RESIZE_HIT_AREA_WIDTH = 12;
    var TOP_LEFT_PAD = 15;
    var LINE_LENGTH = 100;
    //Color
    var RESIZE_LINE_COLOR = "#020202";
    //Class
    var RESIZE_AREA_CLASS = "resizeAreaClass";

    //Structure elements
    var body = d3.select("body");
    var resizeAreaDiv;
    var rightResizeLine;
    var middleResizeCircle;
    var bottomResizeLine;
    var rightResizeHitArea;
    var bottomResizeHitArea;
    var middleResizeHitArea;
    //Structure elements (externally set)
    var canvasDiv;

    //State
    var resizeCardData;

    //Utils
    var resizeUtil = ResizeUtil.getInstance();

    //public properties
    this.RESIZE_STAR_EVENT = resizeUtil.RESIZE_STAR_EVENT;
    this.RESIZE_END_EVENT = resizeUtil.RESIZE_END_EVENT;
    this.RESIZE_MOVE_EVENT = resizeUtil.RESIZE_MOVE_EVENT;
    this.RESIZE_ANIMATION_END_EVENT = resizeUtil.RESIZE_ANIMATION_END_EVENT;
    this.REMOVE_FROM_RESIZE_CLONE = resizeUtil.REMOVE_FROM_RESIZE_CLONE;
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

    this.setCanvasDiv = function (divHTML) {
        canvasDiv = d3.select(divHTML);
        resizeUtil.setCanvasDiv(canvasDiv);
    };

    this.updateClone = function (cardData) {
        resizeUtil.updateClone(cardData);
    };

    this.setShiftCoordinatesAndSize = function (coordinatesArray, sizeArray) {
        resizeUtil.setShiftCoordinatesAndSize(coordinatesArray, sizeArray);
    };
    /*End.*/

    /*UI Visualizations */
    function attachToCard(cardObject) {
        resizeCardData = cardObject;
        var innerDivHTML = cardObject.innerDiv.node();
        innerDivHTML.appendChild(resizeAreaDiv.node());

        resizeAreaDiv.style({
            display: "",
            right: 0 + "px",
            bottom: 0 + "px"
        });

        setSize();
        resizeUtil.setResizingCardDiv(cardObject.wrapperDiv);
    }

    function hide() {
        resizeAreaDiv.style({
            display: "none"
        });
    }

    function createElements() {
        var resizeAreaDivHTML = document.createElement("div");  //This one will be detached and reattached to the focused div
        resizeAreaDiv = d3.select(resizeAreaDivHTML);

        var dragUtil = DragAndDropUtil.getInstance();
        resizeAreaDiv.style({
            position: "absolute",
            overflow: "visible",
            width: 0,
            display: "none"
        }).classed(resizeUtil.REMOVE_FROM_RESIZE_CLONE, true)
            .classed(RESIZE_AREA_CLASS, true)
            .classed(dragUtil.ELEMENTS_TO_REMOVE_CLASS, true);


        middleResizeCircle = resizeAreaDiv.append("div")
            .style({
                position: "absolute",
                height: RESIZE_CIRCLE_RADIUS * 2 + "px",
                width: RESIZE_CIRCLE_RADIUS * 2 + "px",
                background: RESIZE_LINE_COLOR,
                "border-radius": "50%"
            });

        middleResizeCircle.style({
            bottom: -RESIZE_CIRCLE_RADIUS + "px",
            left: -RESIZE_CIRCLE_RADIUS + "px"
        });

        rightResizeHitArea = resizeAreaDiv.append("div")
            .style({
                position: "absolute",
                width: RESIZE_HIT_AREA_WIDTH + RESIZE_CIRCLE_RADIUS + "px",
                right: -RESIZE_HIT_AREA_WIDTH + "px",
                bottom: 0,
                cursor: "w-resize"
            }).attr({
                "resizeDirection": resizeUtil.RESIZE_DIRECTION_TYPE.right
            });

        bottomResizeHitArea = resizeAreaDiv.append("div")
            .style({
                position: "absolute",
                height: RESIZE_HIT_AREA_WIDTH + RESIZE_CIRCLE_RADIUS + "px",
                top: -5 + "px",
                right: 0,
                cursor: "n-resize"
            }).attr({
                "resizeDirection": resizeUtil.RESIZE_DIRECTION_TYPE.bottom
            });

        middleResizeHitArea = resizeAreaDiv.append("div")
            .style({
                position: "absolute",
                height: 18 + "px",
                width: 16 + "px",
                top: -14 + "px",
                right: -6 + "px",
                cursor: "se-resize"
            }).attr({
                "resizeDirection": resizeUtil.RESIZE_DIRECTION_TYPE.both
            });


        rightResizeLine = rightResizeHitArea.append("div")
            .style({
                position: "absolute",
                width: 2 + "px",
                height: LINE_LENGTH + "px",
                bottom: 10 + "px",
                right: 6 + "px",
                "border-right": "2px dashed " + RESIZE_LINE_COLOR
            });

        bottomResizeLine = bottomResizeHitArea.append("div")
            .style({
                position: "absolute",
                height: 2 + "px",
                width: LINE_LENGTH + "px",
                right: 10 + "px",
                bottom: 6 + "px",
                "border-bottom": "2px dashed " + RESIZE_LINE_COLOR
            });


        resizeUtil.setPapaResizeService(me);
        resizeUtil.setBottomResizeHitArea(bottomResizeHitArea);
        resizeUtil.setRightResizeHitArea(rightResizeHitArea);
        resizeUtil.setMiddleResizeHitArea(middleResizeHitArea);

        resizeUtil.enableResize();
    }

    /*End.*/

    /***Updates***/
    function setSize() {
        var wrapperDivHTML = resizeCardData.wrapperDiv.node();
        var width = +wrapperDivHTML.style.width.replace("px", "");
        var height = +wrapperDivHTML.style.height.replace("px", "");
        bottomResizeHitArea.style("width", width + "px");
        rightResizeHitArea.style("height", height + "px");
    }
}

ResizeService.getInstance = function () {
    if (!ResizeService.instance) {
        ResizeService.instance = new ResizeService();
    }

    return ResizeService.instance;
};
