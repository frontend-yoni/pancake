/**
 * Created by avitzur on 12/3/2015.
 */
/**
 * Created by avitzur on 12/1/2015.
 */
function CandlesDrawUtil() {
    var me = this;
    var iMath = Math;
    /**CONSTANTS***/

    //Layout Constants
    var BEST_CANDLE_WIDTH = 10;
    var BEST_PAD_BETWEEN_CANDLES = 1;
    var MIN_CANDLE_WIDTH = 2;


    /***Externally set***/
    //Structure
    var candleBodyGroup;//(Externally set)
    var candleStringGroup;//(Externally set)
    var indicatorsG; //(Externally set)

    //Data
    var dataList;
    var yAxis;
    var xAxis;
    var candleCount;

    /***Internally set***/
    //Structure

    //Layout
    var paddingFromEdges;
    var candleWidth;

    //State

    var isDarkBackground;
    var isPapstPage;
    //Utils


    /**Public Functions***/
    this.setIsDarkBackground = function (boolean) {
        isDarkBackground = boolean;
    };

    this.setLayoutParams = function (paddingFromEdgesInput, candleCountInput) {
        paddingFromEdges = paddingFromEdgesInput;
        candleCount = candleCountInput;
    };

    this.setData = function (dataListInput, xAxisInput, yAxisInput) {
        dataList = dataListInput;
        xAxis = xAxisInput;
        yAxis = yAxisInput;
    };

    this.setParentGroups = function (seriesGroupInput, candleStringGroupInput, indicatorsGInput) {
        candleBodyGroup = seriesGroupInput;
        candleStringGroup = candleStringGroupInput;
        indicatorsG = indicatorsGInput;
    };

    this.drawComponent = function () {
        calculateCandleWidth();
        createAllCandles();
    };

    this.hideLinePath = function () {
        hideLinePath();
    };

    this.restoreLinePath = function () {
        restoreLinePath();
    };

    this.setIsPastPage = function (boolean) {
        isPapstPage = boolean;
    };

    this.createIndicatorPath = function(indicatorDataList, color){
        createIndicatorPath(indicatorDataList, color);
    };

    this.createDottedIndicatorPath = function(indicatorDataList, color){
        createIndicatorPath(indicatorDataList, color, true);
    };

    /**Construct***/
    function createAllCandles() {
        var currentData;
        for (var i = 0; i < dataList.length; i++) {
            currentData = dataList[i];
            createCandle(currentData, i);
        }
    }

    function createCandle(dataPoint, index) {
        var candleElement = new CandleStickElement();
        var x = xAxis.scale(index) - candleWidth / 2;
        var highY = yAxis.scale(dataPoint.high);
        var lowY = yAxis.scale(dataPoint.low);
        var openY = yAxis.scale(dataPoint.open);
        var closeY = yAxis.scale(dataPoint.close);

        candleElement.setIsDarkBackground(isDarkBackground);
        candleElement.setExternalGroup(candleBodyGroup, candleStringGroup);
        candleElement.setLayoutParams(candleWidth, highY, lowY, openY, closeY, x);

        candleElement.createCandle();
    }


    /**Calculations***/
    function calculateCandleWidth() {
        var canvasWidth = xAxis.endPixel - xAxis.startPixel + 2 * paddingFromEdges;
        if (!candleCount) {
            candleCount = dataList.length;
        }


        var maxWidthWithPad = iMath.floor(canvasWidth / candleCount);
        if (maxWidthWithPad >= BEST_CANDLE_WIDTH + BEST_PAD_BETWEEN_CANDLES) {
            candleWidth = BEST_CANDLE_WIDTH;
        } else if (maxWidthWithPad >= MIN_CANDLE_WIDTH + BEST_PAD_BETWEEN_CANDLES) {
            candleWidth = maxWidthWithPad - BEST_PAD_BETWEEN_CANDLES;
        } else {
            candleWidth = MIN_CANDLE_WIDTH;
        }

        candleWidth = trimToTwoDecimalDigits(candleWidth);
    }

    function createIndicatorPath(indicatorDataList, color, isDotted) {
        var pathStr = getIndicatorSeriesPath(indicatorDataList, xAxis, yAxis);
        var pathElement = indicatorsG.append("path")
            .attr({
                d: pathStr
            })
            .style({
                fill: "none",
                "stroke-width": 2 + "px",
                stroke: color
            });

        if (isDotted){
            pathElement.attr({
                "stroke-dasharray": "5, 3",
                opacity: 0.6
            })
        }
    }

    /**State Change***/
    function hideLinePath() {
        if (candleStringGroup) {
            candleStringGroup.style("visibility", "hidden");
        }
    }

    function restoreLinePath() {
        if (candleStringGroup) {
            candleStringGroup.style("visibility", "visible");
        }
    }
}
