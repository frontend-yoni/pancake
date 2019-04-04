/**
 * Created by avitzur on 12/1/2015.
 */
function ChartFrameUtil() {
    //CONSTANTS
    //Layout
    var YAXIS_AREA_WIDTH = 70;
    var XAXIS_TEXT_WIDTH = 70;
    var XAXIS_FIRST_TICK_PIXEL = 70;
    var CANVAS_PAD_FROM_EDGE = 5;
    var MIN_DISTANCE_BETWEEN_TICKS_Y = 70;
    var MIN_DISTANCE_BETWEEN_TICKS_X = 70;
    var FONT_SIZE = 11;
    var TEXT_HEIGHT = FONT_SIZE * 1.2;
    var VERY_SHORT_CHART_WIDTH = 160;
    //Color
    var BG_LINE_COLOR = "#e5e5e5";
    var AXIS_TEXT_COLOR = "#ababab";

    //Structure
    //(Externally set)
    var bgGroup;
    var yAxisArea;
    var xAxisArea;

    //Layout
    //(Externally set)
    var canvasHeight;
    var canvasWidth;
    //(Internally set)
    var drawAreaWidth;
    var drawAreaHeight;
    var pagingMidPixel;

    //Utils
    //(Internally set)
    var yAxisTickPixels;
    var xAxisTickPixels;
    //(Externally set)
    var xAxis;
    var yAxis;

    //Data
    //(Externally set)
    var dataList;
    var startDate;
    var endDate;
    var range;
    var doesnRepresentArea;
    var valueUnitsChar;
    var isCurrency;

    //State
    //(Externally set)
    var isCompareChart;
    var isDarkBackground;
    var baseLineY;
    var hasBaseLine;
    var isPastPage; //It's a past page in a zoom state
    var isDrillMode;
    var isBarChart;
    //(Internally set)
    var periodicity;
    var isVeryShortWidth;


    /****Public functions****/
    this.setStructureElements = function (bgGroupInput, yAxisAreaInput, xAxisAreaInput) {
        bgGroup = bgGroupInput;
        yAxisArea = yAxisAreaInput;
        xAxisArea = xAxisAreaInput;
    };

    this.setUtils = function (xAxisInput, yAxisInput) {
        xAxis = xAxisInput;
        yAxis = yAxisInput;

        drawAreaHeight = (yAxis.startPixel - yAxis.endPixel);
        drawAreaWidth = (xAxis.endPixel - xAxis.startPixel);
    };

    this.setLayoutParams = function (canvasHeightInput, canvasWidthInput) {
        canvasHeight = canvasHeightInput;
        canvasWidth = canvasWidthInput;
        isVeryShortWidth = (canvasWidth <= VERY_SHORT_CHART_WIDTH);
    };

    this.setIsBarChart = function (boolean) {
        isBarChart = boolean;
    };

    this.setData = function (dataListInput, rangeInput, isItAreaInput, symbol) {
        dataList = dataListInput;
        range = rangeInput;
        doesnRepresentArea = isItAreaInput;
        periodicity = getPeriodicityGlobal(range, dataList);

        startDate = dataList[0].date;
        endDate = dataList[dataList.length - 1].date;
        if (range == RestAPIs.TIME_RANGE.D1) {
            endDate = getTodayTradingEndTime(dataList, symbol);
        }
    };

    this.setStates = function (isCurrencyInput, isDarkBackgroundInput, baseLineYInput, hasBaseLineInput, valueUnitsInput) {
        isDarkBackground = isDarkBackgroundInput;
        baseLineY = baseLineYInput;
        hasBaseLine = hasBaseLineInput;
        valueUnitsChar = valueUnitsInput;
        isCurrency = isCurrencyInput;
    };

    this.setIsPastPage = function (boolean, isDrillModeInput) {
        isPastPage = boolean;
        isDrillMode = isDrillModeInput;
    };

    this.addMiniChartFrame = function (topYPixel, miniChartHeight, minValue, maxValue) {
        addMiniChartFrame(topYPixel, miniChartHeight, minValue, maxValue);
    };

    this.getPagingMidPixel = function () {
        return pagingMidPixel;
    };

    this.drawComponent = function () {
        isCompareChart = (canvasHeight - yAxis.startPixel < TEXT_HEIGHT / 2);
        if (isCompareChart) {
            drawAreaHeight = canvasHeight;
        }
        calculateYAxisTicks();
        if (!isBarChart) {
            calculateXAxisTicks();
        } else {
            calculateXAxisTicksForBarChart();
        }

        drawYAxisBGLines();

        if (!isDarkBackground) {
            drawXAxisTicks();
        }

        drawYAxisTexts();
        drawXAxisTexts();

        calulatePagingButtonPosition();
    };

    /****Public functions End.****/

    /****Preparation calculations****/
    function calculateYAxisTicks() {
        yAxisTickPixels = [];
        var numberOfTicks = iMath.floor(drawAreaHeight / MIN_DISTANCE_BETWEEN_TICKS_Y) - 1;
        numberOfTicks = iMath.max(0, numberOfTicks);
        var distanceBetweenTicks = iMath.floor(drawAreaHeight / (numberOfTicks + 1));
        var tickPixel = distanceBetweenTicks;
        for (var i = 0; i < numberOfTicks; i++) {
            yAxisTickPixels.push(tickPixel);
            tickPixel += distanceBetweenTicks;
        }
    }

    function calculateXAxisTicks() {
        xAxisTickPixels = [];
        xAxisTickPixels.push(XAXIS_FIRST_TICK_PIXEL);
        var inBetweenTicksArea = canvasWidth - XAXIS_FIRST_TICK_PIXEL - XAXIS_TEXT_WIDTH / 2;
        var numberOfTicks = iMath.floor(inBetweenTicksArea / MIN_DISTANCE_BETWEEN_TICKS_X) - 1;
        numberOfTicks = iMath.max(0, numberOfTicks);
        var distanceBetweenTicks = iMath.floor(inBetweenTicksArea / (numberOfTicks + 1));

        var tickPixel = XAXIS_FIRST_TICK_PIXEL + distanceBetweenTicks;
        for (var i = 0; i < numberOfTicks; i++) {
            xAxisTickPixels.push(tickPixel);
            tickPixel += distanceBetweenTicks;
        }

        if (isDrillMode) {
            xAxisTickPixels[0] = xAxis.startPixel;
        }

        xAxisTickPixels.push(canvasWidth - CANVAS_PAD_FROM_EDGE);
    }

    function calculateXAxisTicksForBarChart() {
        xAxisTickPixels = [];
        var innerTicksAreaWidth = xAxis.endPixel - xAxis.startPixel - XAXIS_TEXT_WIDTH * 1.5;
        var innerTickCount = iMath.floor(innerTicksAreaWidth / MIN_DISTANCE_BETWEEN_TICKS_X) - 1;
        var numberOfTicks = innerTickCount + 2;
        numberOfTicks = iMath.min(dataList.length, numberOfTicks);
        var distanceBetweenTicks = iMath.ceil(dataList.length / numberOfTicks);

        var tickIndex = 0;
        var tickPixel = xAxis.scale(0);
        xAxisTickPixels.push(tickPixel);

        for (var i = 1; i < numberOfTicks - 1; i++) {
            tickIndex = i * distanceBetweenTicks;
            tickPixel = xAxis.scale(tickIndex);
            if (tickIndex < dataList.length - 1 && tickPixel < xAxis.endPixel - 1.5 * XAXIS_TEXT_WIDTH){
                xAxisTickPixels.push(tickPixel);
            }
        }
        xAxisTickPixels.push(xAxis.endPixel);
    }

    function calulatePagingButtonPosition() {
        var numberOfTicks = iMath.floor(drawAreaHeight / MIN_DISTANCE_BETWEEN_TICKS_Y) - 1;
        numberOfTicks = iMath.max(0, numberOfTicks);
        var distanceBetweenTicks = iMath.floor(drawAreaHeight / (numberOfTicks + 1));

        if (numberOfTicks % 2 == 0) {
            pagingMidPixel = drawAreaHeight / 2;
        } else {
            pagingMidPixel = distanceBetweenTicks * iMath.floor(numberOfTicks / 2) + distanceBetweenTicks / 2;
        }
    }

    /****Preparation calculations End.****/

    /**Draw Stuff*****/
    function drawYAxisBGLines() {
        drawYAxisBGLine(0);

        if (!isDarkBackground) {
            for (var i = 0; i < yAxisTickPixels.length; i++) {
                drawYAxisBGLine(yAxisTickPixels[i]);
            }
            if (!isCompareChart) {
                drawYAxisBGLine(yAxis.startPixel);
            }
        }

        drawYAxisBGLine(canvasHeight);
    }

    function drawXAxisTicks() {
        for (var i = 0; i < xAxisTickPixels.length; i++) {
            drawXAxisTick(xAxisTickPixels[i]);
        }
    }

    function drawXAxisTick(xPixel) {
        var yStart = canvasHeight;
        var yEnd = canvasHeight + 6;

        var line = bgGroup.append("line")
            .attr({
                x1: xPixel,
                y1: yStart,
                x2: xPixel,
                y2: yEnd
            })
            .style({
                "fill": "none",
                "stroke-width": 1 + "px",
                "stroke": BG_LINE_COLOR
            });
    }

    function drawYAxisTexts() {
        addYAxisText(-CANVAS_PAD_FROM_EDGE, yAxis.maxValue);

        var currentTop;
        var tickPixel;
        var value;
        var textElement;

        var notTooCloseToLine;
        for (var i = 0; i < yAxisTickPixels.length; i++) {
            tickPixel = yAxisTickPixels[i];
            value = yAxis.oppositeScale(tickPixel);

            //if too close to base line, don't draw
            notTooCloseToLine = !hasBaseLine || iMath.abs(baseLineY - tickPixel) > 10;
            if (notTooCloseToLine) {
                currentTop = tickPixel - TEXT_HEIGHT / 2;
                textElement = addYAxisText(currentTop, value);
            }
        }
        if (!isCompareChart) {
            var tickPixel = yAxis.startPixel;
            notTooCloseToLine = !hasBaseLine || iMath.abs(baseLineY - tickPixel) > 10;
            if (notTooCloseToLine) {
                addYAxisText(tickPixel - TEXT_HEIGHT / 2, yAxis.minValue);
            }
        } else {
            addYAxisText(canvasHeight - TEXT_HEIGHT / 2, yAxis.minValue);
        }
    }

    function drawXAxisTexts() {
        var currentLeft;
        var tickPixel;
        var tickTime;
        var textElement;

        var lastPosition = canvasWidth - XAXIS_TEXT_WIDTH;
        if (isVeryShortWidth) {
            xAxisTickPixels[0] -= 4;
            lastPosition += 7;
        }
        if (isBarChart){
            lastPosition = iMath.min(lastPosition, xAxis.endPixel - XAXIS_TEXT_WIDTH / 2);
        }

        for (var i = 0; i < xAxisTickPixels.length - 1; i++) {
            tickPixel = xAxisTickPixels[i];
            tickTime = getDateByXPixel(tickPixel);
            currentLeft = tickPixel - XAXIS_TEXT_WIDTH / 2;
            textElement = addXAxisText(currentLeft, tickTime);
            if (isDrillMode && i == 0) {
                textElement.style("left", 25 + "px");
                pronounceXAxisText(textElement);
            }
        }

        tickTime = endDate;
        textElement = addXAxisText(lastPosition, tickTime);
        textElement.style({
            "text-align": "right"
        });



        if (isDrillMode) { //This means we're a drill chart
            pronounceXAxisText(textElement);
        }
    }

    function getDateByXPixel(xPixel) {
        var date;
        var index = iMath.round(xAxis.oppositeScale(xPixel));
        var lastIndex = dataList.length - 1;
        if (index <= lastIndex && dataList[index]) {
            date = dataList[index].date;
        } else {
            var lastTimeStampWithData = dataList[lastIndex].date.getTime();
            var dateTime = lastTimeStampWithData + (index - lastIndex) * StockData.DAILY_DATA_INTERVAL;
            date = new Date(dateTime);
        }


        return date;
    }

    function drawYAxisBGLine(yPixel) {
        var xStart = xAxis.startPixel - 10;
        var xEnd = canvasWidth - CANVAS_PAD_FROM_EDGE;

        if (isBarChart){
            xStart = 30;
        }

        var roundY = iMath.floor(yPixel);
        if (yPixel >= roundY + 0.5) {
            yPixel = roundY + 0.5;
        } else {
            yPixel = roundY;
        }


        var line = bgGroup.append("rect")
            .attr({
                x: xStart,
                y: yPixel,
                width: xEnd - xStart,
                height: 1
            })
            .style({
                "fill": BG_LINE_COLOR,
                "stroke": "none"
            });
    }

    function addYAxisText(topPixel, value) {
        var background = "rgba(255,255,255,0.5)";
        var color = AXIS_TEXT_COLOR;
        if (isDarkBackground) {
            background = "rgba(0, 0, 0, 0.5)";
            color = "#FFFFFF";
        }

        var textElement = yAxisArea.append("p")
            .style({
                position: "absolute",
                "pointer-events": "none",
                left: 0 + "px",
                top: topPixel + "px",
                "font-size": FONT_SIZE + "px",
                background: background,
                color: color,
                margin: 0
            });
        var textStr = formatNiceNumber(value, isCurrency);
        if (valueUnitsChar) {
            textStr += valueUnitsChar;
        }
        textElement.text(textStr);

        return textElement;
    }

    function addXAxisText(leftPixel, time) {
        var textElement = xAxisArea.append("p")
            .style({
                position: "absolute",
                left: leftPixel + "px",
                bottom: -2 + "px",
                width: XAXIS_TEXT_WIDTH + "px",
                "text-align": "center",
                "font-size": FONT_SIZE + "px",
                color: AXIS_TEXT_COLOR,
                margin: 0
            });
        var textStr = getDateStringByParams(time, periodicity, doesnRepresentArea);
        textElement.text(textStr);
        return textElement;
    }

    function pronounceXAxisText(textElement) {
        textElement.style({
            color: "#000000",
            "font-weight": "bold",
            "font-size": FONT_SIZE + 2 + "px",
            bottom: -4 + "px"
        })
    }

    /**Draw Stuff End.*****/

    /***Extra Mini Charts***/
    function addMiniChartFrame(topYPixel, miniChartHeight, minValue, maxValue) {
        drawYAxisBGLine(topYPixel);

        if (miniChartHeight > 30) {
            addYAxisText(topYPixel + 3, maxValue);
            addYAxisText(topYPixel + miniChartHeight - FONT_SIZE - 3, minValue);
        }

    }
}