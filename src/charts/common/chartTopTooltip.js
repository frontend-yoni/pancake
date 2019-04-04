/**
 * Created by yoni_ on 12/4/2015.
 */
/**
 * Created by Jonathan on 9/28/2015.
 */
function ChartTopTooltip() {
    var me = this;

    var iMath = Math;
    var BORDER_COLOR = "#999999";

    //Structure (Externally set)
    var topAreaDiv;
    //Structure (Internally set)
    var topTipDiv;
    var topTipP;
    var topTipChoopchik;
    //Specific for candle
    var openP;
    var highP;
    var lowP;
    var valueP;

    //Layout (Internally set)
    var topAreaWidth;
    var topAreaHeight;
    var topTipWidth;
    var topTipHeight;
    var normalTipWidth;
    var expandedTipWidth;

    //Data
    var dataList;
    var lastDrawnPoint;
    var baseLineValue;
    var isCurrency;

    //Sate
    var isTwoLine;
    var isBarChart;

    //Utils
    var shapeUtil = ShapesUtil.getInstance();

    //Constants
    //Layout Constants
    var REGULAR_WIDTH = 80;
    var EXPANDED_WIDTH = 120;
    var CANDLE_TOOLTIP_MINI_WIDTH = 190;
    var CANDLE_TOOLTIP_FULL_WIDTH = 350;
    var BAR_TOOLTIP_REGULAR_WIDTH = 190;
    var BAR_TOOLTIP_FULL_WIDTH = 190;

    /***Public Properties***/

    /***Public Functions***/
    this.setData = function (dataListInput, baseLineValueInput, isCurrencyInput) {
        dataList = dataListInput;
        baseLineValue = baseLineValueInput;
        isCurrency = isCurrencyInput;

        var lastDataPoint = dataList[dataList.length - 1];
        lastDrawnPoint = lastDataPoint.clone();
    };

    this.setIsBarChart = function (boolean) {
        isBarChart = boolean;
    };

    this.createTopTip = function (topAreaDivInput, isCandle) {
        createTopTip(topAreaDivInput, isCandle);
    };

    this.positionTopTip = function (dataIndex, tipX, isArea, endIndex, isCandle) {
        positionTopTip(dataIndex, tipX, isArea, endIndex, isCandle);
    };

    this.hideTip = function () {
        hideTip();
    };

    /**Creation***/
    function createTopTip(topAreaDivInput, isCandle) {
        topAreaDiv = topAreaDivInput;

        topAreaWidth = topAreaDiv.node().clientWidth;
        topAreaHeight = topAreaDiv.node().clientHeight;

        if (isCandle) {
            isTwoLine = (topAreaWidth < CANDLE_TOOLTIP_FULL_WIDTH);
            if (isTwoLine) {
                topTipWidth = CANDLE_TOOLTIP_MINI_WIDTH;
                topTipHeight = topAreaHeight + 16;
            } else {
                topTipWidth = CANDLE_TOOLTIP_FULL_WIDTH;
                topTipHeight = topAreaHeight;
            }
            expandedTipWidth = CANDLE_TOOLTIP_FULL_WIDTH;
        } else {
            topTipWidth = REGULAR_WIDTH;
            topTipHeight = topAreaHeight;
            expandedTipWidth = EXPANDED_WIDTH;
        }
        if (isBarChart) {
            topTipWidth = BAR_TOOLTIP_REGULAR_WIDTH;
            expandedTipWidth = BAR_TOOLTIP_FULL_WIDTH;
        }

        normalTipWidth = topTipWidth;

        topTipDiv = topAreaDiv.append("div")
            .style({
                position: "absolute",
                top: 1 + "px",
                "text-align": "center",
                "font-size": 12 + "px",
                height: topTipHeight + "px",
                width: topTipWidth + "px",
                border: "1px solid " + BORDER_COLOR,
                background: "#f1f1f1",
                "padding-top": 3 + "px",
                "box-sizing": "border-box",
                "z-index": ChartButtonsComponent.Z_INDEX,
                "pointer-events": "none",
                display: "none"
            });

        topTipP = topTipDiv.append("p")
            .style({
                "font-weight": "bold",
                margin: 0
            });

        topTipChoopchik = topTipDiv.append("div")
            .style({
                position: "absolute",
                top: topAreaHeight - 3 + "px",
                height: 8 + "px",
                width: 8 + "px"
            });

        if (isTwoLine) {
            topTipChoopchik.style("display", "none");
        }

        if (isCandle) {
            topTipP.style("display", "none");
            createCandleTipArea();
        }

        shapeUtil.createTriangle(topTipChoopchik, 8, 8, shapeUtil.DIRECTION.BOTTOM, "#f1f1f1", BORDER_COLOR, 1);
    }


    function createCandleTipArea() {
        if (isTwoLine) {
            createCandleTipAreaTwoLines();
        } else {
            createCandleTipAreaLongLine();
        }
    }

    function createCandleTipAreaTwoLines() {
        var topRow = topTipDiv.append("div")
            .style({});

        var secondRow = topTipDiv.append("div")
            .style({});

        createCandleTipAreaStructure(topRow, secondRow);
    }

    function createCandleTipAreaLongLine() {
        createCandleTipAreaStructure(topTipDiv, topTipDiv);
        openP.style("padding-right", 5 + "px");
    }

    function createCandleTipAreaStructure(topRow, secondRow) {
        var lowHighFieldP = createFieldP(topRow, "L/H");
        lowP = createValueP(topRow, 5, 2);
        var slash = createFieldP(topRow, "/");
        highP = createValueP(topRow, 2, 5);

        var openFieldP = createFieldP(topRow, "Open");
        openP = createValueP(topRow, 5, 0);

        var valueFieldP = createFieldP(secondRow, "Close");
        valueP = createValueP(secondRow, 5, 0);
    }

    function createFieldP(papa, text) {
        var filedP = papa.append("p")
            .style({
                display: "inline-block",
                margin: 0
            })
            .text(text);
        return filedP;
    }

    function createValueP(papa, padLeft, padRight) {
        var valueP = papa.append("p")
            .style({
                display: "inline-block",
                "font-weight": "bold",
                "padding-left": padLeft + "px",
                "padding-right": padRight + "px",
                margin: 0
            });

        return valueP;
    }

    /***Actions!***/

    function hideTip() {
        if (topTipDiv) {
            topTipDiv.style({
                display: "none"
            });
        }
    }

    function positionTopTip(dataIndex, tipX, isArea, endIndex, isCandle) {
        if (isCandle) {
            if (isArea) {
                positionCandleTipArea(tipX, dataIndex, endIndex);
            } else {
                positionCandleTipSingle(dataIndex, tipX);
            }
        } else if (!isBarChart){
            if (isArea) {
                positionRegularTipArea(tipX, dataIndex, endIndex);
            } else {
                positionRegularTipSingle(dataIndex, tipX);
            }
        }else{
            if (isArea) {
                positionBarTipArea(tipX, dataIndex, endIndex);
            } else {
                positionBarTipSingle(dataIndex, tipX);
            }
        }
    }

    function positionTopTipRegular(pointX, text, isExpanded, color) {
        var width = normalTipWidth;
        if (isExpanded) {
            width = expandedTipWidth;
        }
        positionTopTipX(pointX, width);

        topTipDiv.style({
            color: color
        });
        topTipP.text(text);
    }

    function positionTopTipForCandle(pointX) {
        positionTopTipX(pointX, topTipWidth);
        topTipDiv.style({
            color: "initial"
        });
    }

    function positionTopTipX(pointX, width) {
        var left = pointX - width / 2;
        left = iMath.max(left, 0);
        left = iMath.min(left, topAreaWidth - width);
        topTipDiv.style({
            left: left + "px",
            width: width + "px",
            display: ""
        });

        var choopchikLeft = pointX - left - 5;
        topTipChoopchik.style({
            left: choopchikLeft + "px"
        });
    }

    /**UI Helpers***/
    function positionBarTipSingle(dataIndex, tipX) {
        if (dataIndex < dataList.length) {
            var dataPoint = getProperDataPointValue(dataList, dataIndex, lastDrawnPoint);
            var change = dataPoint.close;
            var percentage = dataPoint.holdingsChange;
            var tipText = concatChangeAndPercentage(change, percentage, isCurrency);
            var color = getValueTextColor(change, 0);
            positionTopTipRegular(tipX, tipText, true, color);
        }
    }

    function positionBarTipArea(tipX, startIndex, endIndex) {
        var startDataPoint = getProperDataPointValue(dataList, startIndex, lastDrawnPoint);
        var endDataPoint = getProperDataPointValue(dataList, endIndex, lastDrawnPoint);
        var startValue = startDataPoint.holdingsValue;
        var endValue = endDataPoint.holdingsValue;
        var change = (endValue - startValue);
        var percentage = (change / startValue) * 100;
        var tipText = concatChangeAndPercentage(change, percentage, isCurrency);
        var color = getValueTextColor(change, 0);
        positionTopTipRegular(tipX, tipText, true, color);
    }

    function positionRegularTipSingle(dataIndex, tipX) {
        if (dataIndex < dataList.length) {
            var dataPoint = getProperDataPointValue(dataList, dataIndex, lastDrawnPoint);
            var close = dataPoint.close;
            var tipText = formatNiceNumber(close, isCurrency);
            var color = getValueTextColor(close, baseLineValue);

            positionTopTipRegular(tipX, tipText, false, color);
        }
    }

    function positionRegularTipArea(tipX, startIndex, endIndex) {
        var startDataPoint = getProperDataPointValue(dataList, startIndex, lastDrawnPoint);
        var endDataPoint = getProperDataPointValue(dataList, endIndex, lastDrawnPoint);
        var startValue = startDataPoint.close;
        var endValue = endDataPoint.close;
        var change = (endValue - startValue);
        var percentage = (change / startValue) * 100;
        var tipText = concatChangeAndPercentage(change, percentage, isCurrency);
        var color = getValueTextColor(change, 0);
        positionTopTipRegular(tipX, tipText, true, color);
    }

    function positionCandleTipArea(tipX, startIndex, endIndex) {
        var startData = getProperDataPointValue(dataList, startIndex, lastDrawnPoint);
        var endData = getProperDataPointValue(dataList, endIndex, lastDrawnPoint);

        var currentData = startData;
        var high = currentData.high;
        var low = currentData.low;
        for (var i = startIndex; i <= endIndex; i++) {
            currentData = dataList[i];
            high = iMath.max(high, currentData.high);
            low = iMath.min(low, currentData.low);
        }
        var open = startData.open;
        var close = endData.close;
        var startClose = startData.close;
        var change = (close - startClose);
        var percentage = (change / startClose) * 100;

        var closeText = concatChangeAndPercentage(change, percentage, isCurrency);
        var openText = formatNiceNumber(open, isCurrency);
        var highText = formatNiceNumber(high, isCurrency);
        var lowText = formatNiceNumber(low, isCurrency);
        var color = getValueTextColor(change, 0);

        positionCandleTipByParams(openText, highText, lowText, closeText, color, tipX);
    }

    function positionCandleTipSingle(dataIndex, tipX) {
        if (dataIndex < dataList.length) {
            var dataObj = getProperDataPointValue(dataList, dataIndex, lastDrawnPoint);

            var value = formatNiceNumber(dataObj.close, isCurrency);
            var color = getValueTextColor(dataObj.close, baseLineValue);

            var open = formatNiceNumber(dataObj.open, isCurrency);
            var high = formatNiceNumber(dataObj.high, isCurrency);
            var low = formatNiceNumber(dataObj.low, isCurrency);
            positionCandleTipByParams(open, high, low, value, color, tipX);
        }
    }

    function positionCandleTipByParams(open, high, low, close, color, tipX) {
        openP.text(open);
        highP.text(high);
        lowP.text(low);

        valueP.style({
            color: color
        }).text(close);

        positionTopTipForCandle(tipX);
    }


    /***Data***/
    function getProperDataPointValue(dataPointList, index, lastDrawnPointData) {
        var pointData = dataPointList[index];
        if (index == dataPointList.length - 1) {
            pointData = lastDrawnPointData;
        }
        return pointData;
    }

}
