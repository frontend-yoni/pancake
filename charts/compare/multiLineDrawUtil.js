/**
 * Created by avitzur on 2/18/2016.
 */
function MultiLineDrawUtil() {
    var me = this;

    /***Constants***/
    //Style
    var MAIN_SERIES_AREA_FILL_COLOR = "#DDF2F5";
    var SERIES_BORDER_COLOR = "#FFFFFF";
    //Layout
    var STROKE_WIDTH = 2;

    /***Externally set***/
    //Data
    var dataLists;
    var yAxis;
    var xAxis;
    //Structure
    var seriesGroup;
    var areaFillGroup;
    var hoverGroup;
    //Style
    var colors;
    //Layout
    var paddingFromEdges;
    //State
    var isPastPage; //It's a past page in a zoom state

    /****Internally set****/
    //Structure
    var areaFillPath;
    var pathElements = [];
    var pathBorderElements = [];
    var pointElements = [];

    /**Public Functions***/
    this.setLayoutParams = function (paddingFromEdgesInput, colorsInput) {
        paddingFromEdges = paddingFromEdgesInput;
        colors = colorsInput;
    };

    this.setData = function (dataListsInput, xAxisInput, yAxisInput) {
        dataLists = dataListsInput;
        xAxis = xAxisInput;
        yAxis = yAxisInput;
    };

    this.setParentGroups = function (seriesGroupInput, areaFillGroupInput, hoverGroupInput) {
        seriesGroup = seriesGroupInput;
        areaFillGroup = areaFillGroupInput;
        hoverGroup = hoverGroupInput;
    };

    this.setIsPastPage = function (boolean) {
        isPastPage = boolean;
    };

    this.drawComponent = function () {
        performConstruct();
    };

    this.hideLinePath = function () {
        hideLinePath();
    };

    this.restoreLinePath = function () {
        restoreLinePath();
    };

    this.hideEndPoints = function () {
        for (var i = 0; i < pointElements.length; i++) {
            pointElements[i].style("visibility", "hidden");
        }
    };


    this.showEndPoints = function () {
        if (!isPastPage) {
            for (var i = 0; i < pointElements.length; i++) {
                pointElements[i].style("visibility", "visible");
            }
        }
    };

    /**Construct***/
    function performConstruct() {
        pathBorderElements = [];
        pathElements = [];
        pointElements = [];

        var dataList;
        var color;
        for (var i = 0; i < dataLists.length; i++) {
            dataList = dataLists[i];
            color = colors[i];
            createSeriesAndPoint(dataList, color);
        }

        createAreaFill();
    }

    function createSeriesAndPoint(dataList, color) {
        if (dataList.length > 0 && dataList[dataList.length - 1].close != undefined) {
            createSeries(dataList, color);
            createPoint(dataList, color);
        } else {
            //nothing
        }

    }

    function createAreaFill() {
        var areaPathStr = getLineAeaFillPath(dataLists[0], xAxis, yAxis, paddingFromEdges);
        areaFillPath = areaFillGroup.append("path")
            .attr({
                d: areaPathStr
            })
            .style({
                fill: MAIN_SERIES_AREA_FILL_COLOR
            });
    }

    function createSeries(list, color) {
        var pathStr = getLineSeriesPath(list, xAxis, yAxis);
        var pathElement = seriesGroup.append("path")
            .attr({
                d: pathStr
            })
            .style({
                fill: "none",
                "stroke-width": STROKE_WIDTH + 2 + "px",
                stroke: SERIES_BORDER_COLOR
            });

        var pathBorderElement = seriesGroup.append("path")
            .attr({
                d: pathStr
            })
            .style({
                fill: "none",
                "stroke-width": STROKE_WIDTH + "px",
                stroke: color
            });

        pathElement.push(pathElement);
        pathBorderElement.push(pathBorderElement);
    }

    function createPoint(dataList, color) {
        var lastDataPoint = hoverGroup.append("circle")
            .style({
                "stroke-width": 1,
                stroke: "white",
                fill: color
            }).attr({
                r: 5
            });

        if (!isPastPage) {
            positionPoint(lastDataPoint, dataList);
        } else {
            lastDataPoint.style("visibility", "hidden");
        }


        pointElements.push(lastDataPoint);
    }

    function positionPoint(pointElement, dataList) {
        var lastIndex = (dataList.length - 1);

        var lastPoint = dataList[lastIndex];
        var closeValue = lastPoint.close;

        var x = xAxis.scale(lastIndex);
        var y = yAxis.scale(closeValue);
        pointElement.attr({
            cx: x,
            cy: y
        });

    }

    /**State Change***/
    function hideLinePath() {
        for (var i = 0; i < pathElements.length; i++) {
            pathElements[i].style("visibility", "hidden");
            pathBorderElements[i].style("visibility", "hidden");
        }
    }

    function restoreLinePath() {
        for (var i = 0; i < pathElements.length; i++) {
            pathElements[i].style("visibility", "visible");
            pathBorderElements[i].style("visibility", "visible");
        }
    }
}