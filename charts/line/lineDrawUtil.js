/**
 * Created by avitzur on 12/1/2015.
 */
function LineDrawUtil() {
    var me = this;
    //Constants
    var LINE_COLOR = "#178FB7";
    var AREA_FILL_COLOR = "#DDF2F5";

    var AREA_FILL_COLOR_DARK_BG = "#36648B";
    //Layout Constants
    var STROKE_WIDTH = 2;
    var INDICATOR_STROKE_WIDTH = 2;

    //Data
    //(Externally set)
    var dataList;

    //Utils
    //(Externally set)
    var yAxis;
    var xAxis;

    //Structure
    var seriesGroup;  //(Externally set)
    var areaFillGroup; //(Externally set)
    var indicatorsG; //(Externally set)
    var linePathElement;
    var areaFillPath;
    var lastDataPoint;
    var lineClipPathRect; //for animation
    //Structure (interactive part)

    //Layout
    var bottomExtraPadding;


    //State
    var isDarkBackground;
    var seriesFillColor = AREA_FILL_COLOR;
    var isPastPage; //It's a past page in a zoom state


    /**Public Functions***/
    this.setIsDarkBackground = function (boolean) {
        isDarkBackground = boolean;
        if (isDarkBackground) {
            seriesFillColor = AREA_FILL_COLOR_DARK_BG;
        }
    };

    this.setLayoutParams = function (bottomExtraPaddingInput) {
        bottomExtraPadding = bottomExtraPaddingInput;
    };

    this.setData = function (dataListInput, xAxisInput, yAxisInput) {
        dataList = dataListInput;
        xAxis = xAxisInput;
        yAxis = yAxisInput;
    };

    this.setParentGroups = function (seriesGroupInput, areaFillGroupInput, indicatorsGInput) {
        seriesGroup = seriesGroupInput;
        areaFillGroup = areaFillGroupInput;
        indicatorsG = indicatorsGInput;
    };

    this.drawComponent = function () {
        createLineSeries();
    };

    this.hideLinePath = function () {
        hideLinePath();
    };

    this.restoreLinePath = function () {
        restoreLinePath();
    };

    this.setIsPastPage = function (boolean) {
        isPastPage = boolean;
    };

    this.createIndicatorPath = function (indicatorDataList, color) {
        return createIndicatorPath(indicatorDataList, color);
    };

    this.createDottedIndicatorPath = function (indicatorDataList, color) {
        return createDottedIndicatorPath(indicatorDataList, color);
    };

    /**Construct***/
    function createLineSeries() {
        createSeriesPath();
        createAreaFill();
        if (!isPastPage) {
            createLastPoint();
        }
    }

    function createAreaFill() {
        var areaPathStr = getLineAeaFillPath(dataList, xAxis, yAxis, bottomExtraPadding);
        areaFillPath = areaFillGroup.append("path")
            .attr({
                d: areaPathStr
            })
            .style({
                fill: seriesFillColor
            });
    }

    function createSeriesPath() {
        var pathStr = getLineSeriesPath(dataList, xAxis, yAxis);
        linePathElement = seriesGroup.append("path")
            .attr({
                d: pathStr
            })
            .style({
                fill: "none",
                "stroke-width": STROKE_WIDTH + "px",
                stroke: LINE_COLOR
            });
    }

    function createDottedIndicatorPath(indicatorDataList, color) {
        return createIndicatorPath(indicatorDataList, color, true);
    }

    function createIndicatorPath(indicatorDataList, color, isDotted) {
        var pathStr = getIndicatorSeriesPath(indicatorDataList, xAxis, yAxis);
        var pathElement = indicatorsG.append("path")
            .attr({
                d: pathStr
            })
            .style({
                fill: "none",
                "stroke-width": INDICATOR_STROKE_WIDTH + "px",
                stroke: color
            });

        if (isDotted) {
            pathElement.attr({
                "stroke-dasharray": "5, 3",
                opacity: 0.6
            })
        }

        return pathElement;
    }

    function createLastPoint() {
        lastDataPoint = seriesGroup.append("circle")
            .style({
                display: "none",
                "stroke-width": 1,
                stroke: "white"
            }).attr({
                r: 4
            });

        var lastIndex = (dataList.length - 1);
        var lastPoint = dataList[lastIndex];
        var x = xAxis.scale(lastIndex);
        var y = yAxis.scale(lastPoint.close);

        lastDataPoint.style({
            display: "",
            fill: LINE_COLOR
        }).attr({
            cx: x,
            cy: y
        });
    }

    /**State Change***/
    function hideLinePath() {
        if (linePathElement) {
            linePathElement.style("visibility", "hidden");
        }
    }

    function restoreLinePath() {
        if (linePathElement) {
            linePathElement.style("visibility", "visible");
        }
    }
}
