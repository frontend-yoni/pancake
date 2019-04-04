/**
 * Created by avitzur on 12/1/2015.
 */

var BASE_LINE_COLOR = "#bcbcbc";
var SOLID_BASE_LINE_COLOR = "#000000";
/***Objects****/
function AxisObject(minValue, maxValue, startPixel, endPixel) {
    var me = this;
    me.minValue = minValue;
    me.maxValue = maxValue;
    me.startPixel = startPixel;
    me.endPixel = endPixel;
    me.scale;
    me.oppositeScale;

    me.scaleInner;
    me.oppositeScaleInner;
    updateMinMax(minValue, maxValue);


    /**For X axis that is date instead of index***/
    me.updateMinMax = function (newMin, newMax) {
        updateMinMax(newMin, newMax);
    };

    me.getPointIndexByMouseX = function(mouseX, dataList) { //mouseX Relative to SVG
        var index = me.oppositeScale(mouseX);
        index = iMath.round(index);
        index = iMath.max(0, index);
        index = iMath.min(dataList.length - 1, index);

        return index;
    };

    function updateMinMax(newMin, newMax) {
        minValue = newMin;
        maxValue = newMax;

        var scale = d3.scale.linear()
            .range([startPixel, endPixel])
            .domain([minValue, maxValue]);

        var oppositeScale = d3.scale.linear()
            .range([minValue, maxValue])
            .domain([startPixel, endPixel]);

        me.minValue = minValue;
        me.maxValue = maxValue;
        me.scaleInner = scale;
        me.oppositeScaleInner = oppositeScale;

        me.scale = function(value){
            var uglyNumber = me.scaleInner(value);
            return trimToTwoDecimalDigits(uglyNumber);
        };

        me.oppositeScale = function(value){
            var uglyNumber = me.oppositeScaleInner(value);
            return trimToTwoDecimalDigits(uglyNumber);
        };
    }

}


/***Draw Helpers****/
function getLineSeriesPath(dataList, xAxis, yAxis) {
    var pathArr = [];
    var pathStr;
    var firstIndex = 0;

    while (firstIndex < dataList.length && dataList[firstIndex].close == undefined) {
        firstIndex++;
    }

    var commandStr = "M" + getChartCoordinates(dataList, firstIndex, xAxis, yAxis);
    pathArr.push(commandStr);

    for (var i = firstIndex + 1; i < dataList.length; i++) {
        commandStr = "L" + getChartCoordinates(dataList, i, xAxis, yAxis);
        pathArr.push(commandStr);
    }
    pathStr = pathArr.join(" ");

    return pathStr;
}

function getIndicatorSeriesPath(dataList, xAxis, yAxis) {
    var pathArr = [];
    var pathStr;
    var firstIndex = 0;

    while (dataList[firstIndex] == undefined && firstIndex < dataList.length) {
        firstIndex++;
    }

    if (firstIndex < dataList.length) {
        var commandStr = "M" + getChartCoordinatesByValue(dataList[firstIndex], firstIndex, xAxis, yAxis);
        pathArr.push(commandStr);

        for (var i = firstIndex + 1; i < dataList.length; i++) {
            commandStr = "L" + getChartCoordinatesByValue(dataList[i], i, xAxis, yAxis);
            pathArr.push(commandStr);
        }
        pathStr = pathArr.join(" ");
    }
    return pathStr;
}

function getChartCoordinates(dataList, index, xAxis, yAxis) {
    var closeValue = dataList[index].close;
    return getChartCoordinatesByValue(closeValue, index, xAxis, yAxis);
}

function getChartCoordinatesByValue(value, index, xAxis, yAxis) {
    var x = getXPixelByDataPointGlobal(index, xAxis);
    var y = yAxis.scale(value);
    return x + "," + y;
}

function getXPixelByDataPointGlobal(index, xAxis) {
    var xPixel;
    xPixel = xAxis.scale(index);
    return xPixel;
}

function getLineAeaFillPath(dataList, xAxis, yAxis, paddingFromEdges) {
    var seriesPathCommand = getLineSeriesPath(dataList, xAxis, yAxis);
    var endX = xAxis.scale(dataList.length - 1);
    var bottomY = yAxis.startPixel + paddingFromEdges;
    var startX = xAxis.scale(0);
    var lineDownCommand = "L" + endX + "," + bottomY;
    var lineBackCommand = "L" + startX + "," + bottomY;
    var lineClose = "L" + startX + "," + 0;
    var pathStr = [seriesPathCommand, lineDownCommand, lineBackCommand, lineClose].join(" ");

    return pathStr;
}

/***Draw Elements****/
function crateChartBaseLine(seriesGroup, baseLineValue, xAxis, yAxis) {
    var yPixel = yAxis.scale(baseLineValue);
    var xStart = 0;
    var xEnd = xAxis.endPixel;
    var pathStr = [
        "M" + xStart + "," + yPixel,
        "L" + xEnd + "," + yPixel
    ].join(" ");

    var baseLinePath = seriesGroup.append("path")
        .attr({
            d: pathStr
        })
        .style({
            "stroke-width": 1.5 + "px",
            stroke: BASE_LINE_COLOR,
            "stroke-dasharray": "4,4",
            "stroke-linecap": "butt"
        });
}

function crateSolidBaseLine(baseLineG, baseLineValue, yAxis,  xStart, xEnd) {
    var yPixel = yAxis.scale(baseLineValue);
    var pathStr = [
        "M" + xStart + "," + yPixel,
        "L" + xEnd + "," + yPixel
    ].join(" ");

    var baseLinePath = baseLineG.append("path")
        .attr({
            d: pathStr
        })
        .style({
            "stroke-width": 1 + "px",
            stroke: BASE_LINE_COLOR
        });
}