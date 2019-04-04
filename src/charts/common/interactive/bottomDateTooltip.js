/**
 * Created by avitzur on 2/14/2016.
 */
/**
 * Created by yoni_ on 12/4/2015.
 */
/**
 * Created by Jonathan on 9/28/2015.
 */
function BottomDateTooltip() {
    var me = this;

    var iMath = Math;
    var BOTTOM_MOVE_ANIMATION_DURATION = 300;

    var ARROW_TYPE = {
        LEFT: 0,
        RIGHT: 1,
        LEFT_SECONDARY: 2,
        RIGHT_SECONDARY: 3
    };
    var ARROW_CLICKED_EVENT = "lineTrackerArrowClickEvent";

    var BORDER_COLOR = "#999999";

    //Structure (Externally set)
    var bottomAreaDiv;
    //Structure (Internally set)
    var bottomTipDiv;
    var bottomTipText;
    var rightArrow;
    var leftArrow;
    var rightArrowSecondary;
    var leftArrowSecondary;

    //Layout (Internally set)
    var bottomAreaWidth;
    var bottomAreaHeight;
    var bottomTipStartPixel = 35;

    //Data
    var xAxis;
    var dataList;
    var lastDrawnPoint;
    var baseLineValue;
    var periodicity;

    //Sate
    var isMouseOnTip;
    var bottomTipLeft;
    var bottomTipPrevLeft;
    //(Mouse position)

    //Utils
    var shapeUtil = ShapesUtil.getInstance();
    var interactiveComponent;

    //Constants
    //Layout Constants
    var BOTTOM_TIP_REGULAR_WIDTH = 96;
    var BOTTOM_TIP_EXPANDED_WIDTH = 190;
    var ARROW_SIZE = 8;


    /***Public Properties***/
    this.ARROW_CLICKED_EVENT = ARROW_CLICKED_EVENT;

    /***Public Functions***/
    this.setData = function (dataListInput, xAxisInput, baseLineValueInput, periodicityInput) {
        xAxis = xAxisInput;
        dataList = dataListInput;
        baseLineValue = baseLineValueInput;
        periodicity = periodicityInput;

        lastDrawnPoint = dataList[dataList.length - 1].clone();
    };

    this.setUtils = function (interactiveComponentInput) {
        interactiveComponent = interactiveComponentInput;
    };

    this.createBottomTip = function (bottomAreaDivInput) {
        createBottomTip(bottomAreaDivInput);
    };

    this.positionBottomTip = function (index1, isExpanded, index2) {
        positionBottomTip(index1, isExpanded, index2);
    };

    this.showArrows = function (isExpanded) {
        showArrows(isExpanded);
    };

    this.hideArrows = function () {
        hideArrows();
    };

    this.hideTip = function () {
        hideTip();
    };

    this.clearState = function () {
        clearState();
    };

    /**Creation***/
    function createBottomTip(bottomAreaDivInput) {
        bottomAreaDiv = bottomAreaDivInput;

        bottomAreaWidth = bottomAreaDiv.node().clientWidth;
        bottomAreaHeight = bottomAreaDiv.node().clientHeight;

        bottomTipDiv = bottomAreaDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                height: bottomAreaHeight + "px",
                width: BOTTOM_TIP_REGULAR_WIDTH + "px",
                border: "1px solid " + BORDER_COLOR,
                background: "#f1f1f1",
                "box-sizing": "border-box",
                "z-index": ChartButtonsComponent.Z_INDEX,
                display: "none"
            });
        bottomTipText = bottomTipDiv.append("p")
            .style({
                "font-size": 12 + "px",
                "text-align": "center",
                padding: 3 + "px",
                margin: 0
            });

        if (bottomTipPrevLeft) {
            bottomTipDiv.style("left", bottomTipPrevLeft + "px");
        }

        createArrows();
    }

    function createArrows() {
        rightArrow = createArrow(shapeUtil.DIRECTION.RIGHT, ARROW_TYPE.RIGHT);
        leftArrow = createArrow(shapeUtil.DIRECTION.LEFT, ARROW_TYPE.LEFT);
        rightArrowSecondary = createArrow(shapeUtil.DIRECTION.RIGHT, ARROW_TYPE.RIGHT_SECONDARY);
        leftArrowSecondary = createArrow(shapeUtil.DIRECTION.LEFT, ARROW_TYPE.LEFT_SECONDARY);
        rightArrow.style({
            right: 2 + "px"
        });
        leftArrow.style({
            left: 2 + "px"
        });
        rightArrowSecondary.style({
            left: 14 + "px"
        });
        leftArrowSecondary.style({
            right: 14 + "px"
        });
    }

    function createArrow(direction, arrowType) {

        var arrowSize = ARROW_SIZE;
        var bottom = (bottomAreaHeight - arrowSize) / 2 - 2;
        var arrowDiv = bottomTipDiv.append("div")
            .style({
                position: "absolute",
                bottom: bottom + "px",
                width: arrowSize + "px",
                height: arrowSize + "px",
                cursor: "pointer",
                display: "none"
            })
            .datum(arrowType)
            .on("click", onArrowClick);

        shapeUtil.createTriangle(arrowDiv, arrowSize, arrowSize, direction, "black");
        return arrowDiv;
    }

    /***Actions!***/
    function hideTip() {
        if (bottomTipDiv) {
            bottomTipDiv.style({
                display: "none"
            });
        }
    }

    function getDateText(index) {
        var dataPoint = dataList[index];
        if (index == dataList.length - 1) {
            dataPoint = lastDrawnPoint;
        }
        var retText = getDateStringByParams(dataPoint.date, periodicity, false);

        return retText;
    }

    function positionBottomTip(index1, isExpanded, index2) {
        var text;
        var width;
        var pointX;
        if (isExpanded) {
            pointX = (xAxis.scale(index1) + xAxis.scale(index2)) / 2;
            text = getDateText(index1) + " - " + getDateText(index2);
            width = BOTTOM_TIP_EXPANDED_WIDTH;
        } else {
            pointX = xAxis.scale(index1);
            text = getDateText(index1);
            width = BOTTOM_TIP_REGULAR_WIDTH;
        }

        var newLeft = pointX - width / 2;
        newLeft = iMath.max(newLeft, bottomTipStartPixel);
        newLeft = iMath.min(newLeft, bottomAreaWidth - width);

        bottomTipText.text(text);
        bottomTipLeft = newLeft;
        bottomTipDiv.style({
            width: width + "px",
            display: ""
        });
        bottomTipDiv.on("mouseenter", function () {
            onMouseEnterBottom();
        }).on("mouseleave", function () {
            onMouseLeaveBottom();
        });

        if (!isMouseOnTip) {
            moveBottomTip(newLeft);
        }
    }

    function moveBottomTip(left, isAnimated) {
        var prevLeft = bottomTipPrevLeft;
        if (!isAnimated) {
            bottomTipDiv.style({
                left: left + "px"
            });
        } else {
            bottomTipDiv.transition()
                .duration(BOTTOM_MOVE_ANIMATION_DURATION)
                .ease("cubic-out")
                .tween("pook", function (d) {
                    var leftInterpolate = d3.interpolate(prevLeft, left);
                    return function (t) {
                        var newLeft = leftInterpolate(t) + "px";
                        bottomTipDiv.style("left", newLeft);
                    }
                });
        }
        bottomTipPrevLeft = left;
        isMouseOnTip = false;
    }

    function showArrows(isExpanded) {
        rightArrow.style("display", "");
        leftArrow.style("display", "");
        if (isExpanded) {
            rightArrowSecondary.style("display", "");
            leftArrowSecondary.style("display", "");
        }
    }

    function hideArrows() {
        rightArrow.style("display", "none");
        leftArrow.style("display", "none");
        rightArrowSecondary.style("display", "none");
        leftArrowSecondary.style("display", "none");
    }

    /**Event Handlers**/
    function onMouseEnterBottom() {
        isMouseOnTip = true;
    }

    function onMouseLeaveBottom() {
        isMouseOnTip = false;
        moveBottomTip(bottomTipLeft, true);
    }

    /**UI Helpers**/
    function clearState() {
        isMouseOnTip = false;
    }

    /***Event Listener****/
    function onArrowClick() {
        var target = d3.event.target;
        var arrowType = d3.select(target).datum();
        var types = ARROW_TYPE;

        switch (arrowType) {
            case types.RIGHT:
                interactiveComponent.shiftEndIndex(1);
                break;
            case types.LEFT:
                interactiveComponent.shiftStartIndex(-1);
                break;
            case types.RIGHT_SECONDARY:
                interactiveComponent.shiftStartIndex(1);
                break;
            case types.LEFT_SECONDARY:
                interactiveComponent.shiftEndIndex(-1);
                break;
        }
    }

}
