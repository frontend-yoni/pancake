/**
 * Created by Jonathan on 9/26/2015.
 */
function LineChartContainer() {
    var me = this;

    var TIME_RANGE = RestAPIs.TIME_RANGE;
    var ZOOM_ANIMATION_DURATION = 250;
    //Layout Constant
    var COMPARABLE_SECTION_HEIGHT = 20;
    var MIN_WIDTH_FOR_RANGE_BUTTONS_ON_LEFT = 250;
    var MIN_HEIGHT_FOR_RANGE_BUTTONS_ON_TOP = 200;
    var RIGHT_RANGE_BUTTONS_WIDTH_DEFAULT = 30;
    var BOTTOM_RANGE_BUTTONS_HEIGHT_DEFAULT = 20;
    var RIGHT_RANGE_BUTTONS_TOP_PADDING_DEFAULT = 2;
    var RANGE_BUTTONS_VERTICAL_PAD = 5;
    var RANGE_BUTTONS_LEFT_PAD = 10;
    var CHART_TYPE_BUTTON_AREA_HEIGHT = 20;
    var CHART_BUTTON_HEIGHT = 16;
    var COMPARE_FONT_SIZE = 11;
    //Class
    var DRILL_FREQUENCY_BUTTON_CLASS = "DRILL_FREQUENCY_BUTTON_CLASS";
    //Structure
    var externalDiv;
    var parentDiv;
    var rangeButtonsArea;
    var chartArea;
    var chartTypeButtonsArea;
    var compareSectionDiv;
    var cancelCompareButton;

    //Layout params
    var parentDivWidth;
    var parentDivHeight;
    var chartAreaWidth;
    var chartAreaHeight;
    var rangeButtonsHeight;
    var rangeButtonsWidth;
    var rangeButtonsTop;
    var chartBottom;
    var chartRight;

    //State
    var isDarkBG;
    var isRangeButtonOnBottom;
    var showHoveredContent;
    var isCandleChart; //Boolean
    var comparedIndexSymbol;
    //(Zoom)
    var isZoomState;
    var zoomStartIndex;
    var zoomEndIndex;
    var visiblePointsCount;

    //Data
    var stockData;
    var stockDataSecondary;
    var range;
    var historicDataArray;
    var historicDataArraySecondary;
    var cardData; //Only in case it's in a grid card. (Not a hover card on the left list)
    var fullDataAray;

    //Utils
    var chartObject = new LineChartPure();
    var rangeButtonsUtil = new TimeRangeSelector();
    var chartTypeButtons = new ChartButtonsComponent();
    var indexSymbolToButton;

    /***Public functions**/
    this.setExternalDiv = function (divInput) {
        externalDiv = d3.select(divInput);
    };

    this.setData = function (stockDataInput, rangeInput, showHoveredContentInput) {
        showHoveredContent = showHoveredContentInput;

        stockData = stockDataInput;

        if (rangeInput != range) {
            isZoomState = false;
        }

        range = rangeInput;
        rangeButtonsUtil.setSelectedButton(range);

        fullDataAray = getFullDataArrayByRange(stockData, range);
    };

    this.setDataSecondary = function (stockDataInput) {
        stockDataSecondary = stockDataInput;
    };

    this.setCardData = function (cardDataInput) {
        cardData = cardDataInput;
        isCandleChart = cardData.isCandleChart;
        comparedIndexSymbol = cardDataInput.indexToCompare;
    };

    this.presetChartType = function (isCandleInput) {
        isCandleChart = isCandleInput;
    };

    this.setIsDarkBackground = function (boolean) {
        isDarkBG = boolean;
        chartObject.setIsDarkBackground(isDarkBG);
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.hideLinePath = function () {
        chartObject.hideLinePath();
    };

    this.restoreLinePath = function () {
        chartObject.restoreLinePath();
    };

    this.clearState = function () {
        chartObject.clearState();
    };

    this.getRange = function () {
        return range;
    };

    this.getIndexToCompare = function () {
        return comparedIndexSymbol;
    };

    this.zoomToArea = function (trackStartIndex, trackEndIndex) {
        zoomToArea(trackStartIndex, trackEndIndex);
    };

    this.cancelZoom = function () {
        cancelZoom();
    };

    this.shiftTimeLine = function (shiftAmount) {
        shiftTimeLine(shiftAmount);
    };

    this.resetChartTypeAndRedraw = function (isCandleInput) {
        resetChartTypeAndRedraw(isCandleInput);
    };

    this.setIsShowVolume = function(isShowVolume){
        chartObject.setIsShowVolume(isShowVolume);
    };

    this.redrawChartByVolumeVisibility = function(){
        redrawChartByVolumeVisibility();
    };

    this.hideTips = function () {
    };

    this.positionIndicatorTips = function (trackStartIndex, isAreaCovered, trackEndIndex) {
    };

    /**Construction**/
    function drawComponent() {
        performConstruct();
    }

    function redrawChartByVolumeVisibility() {
        chartObject.setIsShowVolume(UserDBData.isShowVolume);
        chartObject.redrawChart();
    }

    function redrawChart() {
        chartObject.setIsCandleChart(isCandleChart);
        chartObject.redrawChart();
    }

    function performConstruct() {
        var externalDivDOM = externalDiv.node();
        clearSlate(externalDiv); //Clear slate

        parentDivHeight = externalDivDOM.clientHeight;
        parentDivWidth = externalDivDOM.clientWidth;
        calculateMainLayoutParams();

        parentDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: 0 + "px",
                height: parentDivHeight + "px",
                width: parentDivWidth + "px",
                "-webkit-user-select": "none",
                "-moz-user-select": "none",
                "-ms-user-select": "none",
                "user-select": "none"
            });

        chartArea = parentDiv.append("div")
            .style({
                position: "absolute",
                right: chartRight + "px",
                bottom: chartBottom + "px",
                height: chartAreaHeight + "px",
                width: chartAreaWidth + "px"
            });

        chartTypeButtonsArea = parentDiv.append("div")
            .style({
                position: "absolute",
                top: chartAreaHeight - CHART_BUTTON_HEIGHT + "px",
                height: CHART_BUTTON_HEIGHT + "px",
                width: chartAreaWidth + "px"
            })
            .attr("name", "chartTypeButtonsArea")
            .on(ChartButtonsComponent.CHART_TYPE_SELECTED_EVENT, onChertTypeSelected);

        chartTypeButtons.setExternalDiv(chartTypeButtonsArea);
        chartTypeButtons.setButtonHeight(16);
        chartTypeButtons.setIsCandleSelected(isCandleChart);
        chartTypeButtons.drawComponent();

        if (comparedIndexSymbol) {
            chartTypeButtonsArea.style("display", "none");
        }

        var isComparable = !getIsCurrency(stockData.symbol) && !isDarkBG;
        if (isComparable) {
            createCompareSection();
        }

        rangeButtonsArea = parentDiv.append("div")
            .style({
                position: "absolute",
                right: 0 + "px",
                height: rangeButtonsHeight + "px",
                width: rangeButtonsWidth + "px"
            });

        if (isRangeButtonOnBottom) {
            rangeButtonsArea.style({
                bottom: 0 + "px"
            });
        } else {
            rangeButtonsArea.style({
                top: rangeButtonsTop + "px"
            });
        }

        rangeButtonsUtil.setPapa(me);
        rangeButtonsUtil.createButtonsArea(rangeButtonsArea, !isRangeButtonOnBottom, rangeButtonsWidth, rangeButtonsHeight);
        if (isZoomState) {
            rangeButtonsUtil.applyShadow();
        }

        if (!comparedIndexSymbol) {
            drawRegularChart();
        } else {
            drawComparableChartIfPossible();
        }

    }

    function createCompareSection() {
        compareSectionDiv = parentDiv.append("div")
            .style({
                position: "absolute",
                top: 2 + "px",
                left: 0 + "px",
                height: COMPARABLE_SECTION_HEIGHT + "px",
                width: "100%",
                "font-size": COMPARE_FONT_SIZE + "px",
                "text-align": "center"
            });

        var pillar = compareSectionDiv.append("div")
            .style({
                height: "100%",
                width: 0,
                "vertical-align": "middle",
                display: "inline-block"
            });

        var titleP = compareSectionDiv.append("p")
            .style({
                margin: 0,
                "vertical-align": "middle",
                display: "inline-block",
                "padding-right": 3 + "px",
                color: "#333333",
                cursor: "default"
            })
            .text("COMPARE ")
            .attr("title", "Compare to index");


        indexSymbolToButton = {};
        var snpButton = createCompareButtonOption("S&P 500", SNP_INDEX_SYMBOL);
        var dowButton = createCompareButtonOption("DOW", DOW_INDEX_SYMBOL);
        var nasdaqButton = createCompareButtonOption("NASDAQ", NASDAQ_INDEX_SYMBOL);

        cancelCompareButton = createCompareButtonOption("X", "");
        cancelCompareButton.attr("title", "Cancel");

        if (parentDivWidth < 220) {
            titleP.text("COMP ");
            compareSectionDiv.style("font-size", COMPARE_FONT_SIZE - 1 + "px");
        }

        selectComparableButtonBySymbol(comparedIndexSymbol);
    }

    function createCompareButtonOption(textStr, symbol) {
        var button = compareSectionDiv.append("p")
            .style({
                margin: 0,
                "padding": 3 + "px",
                "padding-top": 2 + "px",
                "padding-bottom": 2 + "px",
                "margin-left": 1 + "px",
                "margin-right": 1 + "px",
                "vertical-align": "middle",
                "box-sizing": "border-box",
                display: "inline-block"
            })
            .classed("CompareButtonOptionClass", true)
            .classed(DRILL_FREQUENCY_BUTTON_CLASS, true)
            .text(textStr)
            .datum(symbol)
            .on("click", onCompareClick);

        indexSymbolToButton[symbol] = button;
        return button;
    }

    /**Preparation calculations**/
    function calculateMainLayoutParams() {
        calculateRangeButtonLayout();
        chartBottom = 0;
        chartRight = 0;
        chartAreaHeight = parentDivHeight;
        chartAreaWidth = parentDivWidth;
        if (isRangeButtonOnBottom) {
            chartBottom = rangeButtonsHeight + RANGE_BUTTONS_VERTICAL_PAD;
            chartAreaHeight -= chartBottom;
        } else {
            chartRight = rangeButtonsWidth + RANGE_BUTTONS_LEFT_PAD;
            chartAreaWidth -= chartRight;
        }
    }

    function calculateIsRangeButtonsOnBottom() {
        if (parentDivHeight >= MIN_HEIGHT_FOR_RANGE_BUTTONS_ON_TOP || parentDivWidth <= MIN_WIDTH_FOR_RANGE_BUTTONS_ON_LEFT) {
            isRangeButtonOnBottom = true;
        } else {
            isRangeButtonOnBottom = false;
        }
    }

    function calculateRangeButtonLayout() {
        calculateIsRangeButtonsOnBottom();
        if (isRangeButtonOnBottom) { //on top
            rangeButtonsWidth = parentDivWidth;
            rangeButtonsHeight = BOTTOM_RANGE_BUTTONS_HEIGHT_DEFAULT;
        } else { //on left
            rangeButtonsTop = RIGHT_RANGE_BUTTONS_TOP_PADDING_DEFAULT;
            rangeButtonsWidth = RIGHT_RANGE_BUTTONS_WIDTH_DEFAULT;
            rangeButtonsHeight = parentDivHeight - rangeButtonsTop;
            if (parentDivHeight > 120 && parentDivWidth > 200) {
                rangeButtonsTop = chartObject.CHART_CANVAS_TOP_POSITION - 10;
                rangeButtonsHeight = 125;
            }
        }
    }

    function getFullDataArrayByRange(stockDataInput) {
        var dataArray = getProperDataListByRange(stockDataInput, range);

        var nowTime = new Date().getTime();
        var monthTime = 1000 * 60 * 60 * 24 * 31;
        switch (range) {
            case TIME_RANGE.M1:
                dataArray = calculateHistoryDataByStartDate(nowTime - monthTime, dataArray);
                break;

            case TIME_RANGE.M3:
                dataArray = calculateHistoryDataByStartDate(nowTime - monthTime * 3, dataArray);
                break;

            case TIME_RANGE.Y5:
                dataArray = calculateHistoryDataByStartDate(nowTime - monthTime * 12 * 5, dataArray);
                break;
        }
        return dataArray;
    }

    function calculateProperHistoricData(stockDataInput) {
        var dataArray = getFullDataArrayByRange(stockDataInput);
        if (isZoomState) {
            dataArray = dataArray.slice(zoomStartIndex, zoomEndIndex + 1);
        }

        return dataArray;
    }

    function calculateHistoryDataByStartDate(startTime, dataArray) {
        var lastIndex = dataArray.length - 1;

        var currentIndex = lastIndex;
        var startIndex;
        var dataPoint;

        while (!startIndex && currentIndex >= 0) {
            dataPoint = dataArray[currentIndex];
            if (dataPoint.date.getTime() < startTime) {
                startIndex = currentIndex;
            }
            currentIndex--;
        }

        if (currentIndex == 0) {
            startIndex = 0;
        }

        var retArray = dataArray.slice(startIndex, lastIndex + 1);
        return retArray;
    }

    /**State change**/
    function drawRegularChart() {
        chartObject.setAsZoomable(me, true);
        chartObject.setExternalDiv(chartArea.node());
        chartObject.setIsCandleChart(isCandleChart);

        historicDataArray = calculateProperHistoricData(stockData);

        chartObject.setData(historicDataArray, range, stockData.symbol, stockData.prevClose, showHoveredContent);
        chartObject.setDataSecondary([], undefined);
        chartObject.drawComponent();

        chartTypeButtonsArea.style("display", "");
    }

    function drawComparableChartIfPossible() {
        if (stockDataSecondary) {
            var secondaryDataList = getProperDataListByRange(stockDataSecondary, range);

            //Make sure there's data for the last point
            if (secondaryDataList && secondaryDataList[secondaryDataList.length - 1].close != undefined) {
                drawComparableChart();
            } else {
                performCompare();//Go get the data!
            }
        } else {
            performCompare(); //Go get the data!
        }
    }

    function drawComparableChart() {
        chartObject.setPapaChart(me);
        chartObject.setIsZoomState(isZoomState);
        chartObject.setExternalDiv(chartArea.node());

        historicDataArray = calculateProperHistoricData(stockData);
        historicDataArraySecondary = calculateProperHistoricData(stockDataSecondary);

        var mainPeriodicity = getPeriodicityGlobal(range, historicDataArray);
        var secondaryPeriodicity = getPeriodicityGlobal(range, historicDataArraySecondary);

        //Only draw the compare chart if the secondary (index) data has the same periodicity
        //Otherwise recall to get data by the correct periodicity
        if (mainPeriodicity == secondaryPeriodicity) {
            chartObject.setData(historicDataArray, range, stockData.symbol, stockData.prevClose, showHoveredContent);
            chartObject.setDataSecondary(historicDataArraySecondary, stockDataSecondary.symbol);

            chartObject.drawComponent();
        } else {
            performCompare();
        }

        chartTypeButtonsArea.style("display", "none");
    }

    function drawProperChart() {
        if (!isZoomState || zoomEndIndex == fullDataAray.length - 1) {
            chartObject.setIsPastPage(false);
        } else {
            chartObject.setIsPastPage(true);
        }

        if (!comparedIndexSymbol) {
            drawRegularChart();
        } else {
            drawComparableChartIfPossible();
        }
    }

    /***Action!**/
    function performCompare() {
        if (!comparedIndexSymbol) {
            drawRegularChart();
        } else {
            if (!historicDataArray) {
                historicDataArray = calculateProperHistoricData(stockData);
            }

            var compareEventData = {
                range: range,
                indexSymbol: comparedIndexSymbol,
                dataList: historicDataArray
            };

            dispatchEventByNameAndData(parentDiv, LineChartContainer.COMPAE_CLICK_EVENT, compareEventData);
        }
    }

    function resetChartTypeAndRedraw(isCandleInput) {
        isCandleChart = isCandleInput;
        chartTypeButtons.setIsCandleSelected(isCandleChart);
        chartTypeButtons.drawComponent();
        if (!comparedIndexSymbol) {
            redrawChart();
        }
    }

    /***Zoom***/
    function cancelZoom() {
        chartObject.clearState();
        isZoomState = false;
        drawProperChart();

        rangeButtonsUtil.removeShadow();

        visiblePointsCount = fullDataAray.length;
    }

    function zoomToArea(startIndex, endIndex) {
        var prevStart;
        var prevEnd;
        if (isZoomState) {
            prevStart = zoomStartIndex;
            prevEnd = zoomEndIndex;

            zoomStartIndex += startIndex;
            zoomEndIndex = zoomStartIndex + (endIndex - startIndex);
        } else {
            prevStart = 0;
            prevEnd = fullDataAray.length - 1;

            zoomStartIndex = startIndex;
            zoomEndIndex = endIndex;
        }

        isZoomState = true;
        chartObject.clearState();
        chartObject.setIsZoomState(isZoomState);

        animateZoom(prevStart, zoomStartIndex, prevEnd, zoomEndIndex);

        visiblePointsCount = (zoomEndIndex - zoomStartIndex + 1);

        rangeButtonsUtil.applyShadow();
    }

    function animateZoom(prevStart, newStart, prevEnd, newEnd) {
        chartObject.setIsMiddleOfZoom(true);

        parentDiv.transition()
            .duration(ZOOM_ANIMATION_DURATION)
            .ease("linear")
            .tween("pook", function (d) {
                var startInterpolate = d3.interpolate(prevStart, newStart);
                var endInterpolate = d3.interpolate(prevEnd, newEnd);
                return function (t) {
                    zoomStartIndex = startInterpolate(t);
                    zoomEndIndex = endInterpolate(t);
                    drawProperChart();
                    if (t == 1) {
                        chartObject.setIsMiddleOfZoom(false);
                    }
                }
            });
    }

    /***Shift Timeline***/
    function shiftTimeLine(shiftAmount) {
        zoomStartIndex += shiftAmount;
        zoomStartIndex = iMath.max(0, zoomStartIndex);
        zoomStartIndex = iMath.min(fullDataAray.length - 1 - visiblePointsCount, zoomStartIndex);

        zoomEndIndex += shiftAmount;
        zoomEndIndex = iMath.max(visiblePointsCount - 1, zoomEndIndex);
        zoomEndIndex = iMath.min(fullDataAray.length - 1, zoomEndIndex);

        drawProperChart();
    }

    /**UI change**/
    function markCompareButton(symbol) {
        var button = indexSymbolToButton[symbol];
        button.classed(SELECTED_BUTTON_CLASS, true);
    }

    function unmarkCompareButton(symbol) {
        var button = indexSymbolToButton[symbol];
        button.classed(SELECTED_BUTTON_CLASS, false);
    }

    function showCancel() {
        cancelCompareButton.style("visibility", "visible");
    }

    function hideCancel() {
        cancelCompareButton.style("visibility", "hidden");
    }

    function selectComparableButtonBySymbol(symbol) {
        if (comparedIndexSymbol) {
            unmarkCompareButton(comparedIndexSymbol)
        }
        comparedIndexSymbol = symbol;
        if (!comparedIndexSymbol) {
            hideCancel();
        } else {
            showCancel();
            markCompareButton(comparedIndexSymbol);
        }

        if (cardData) {
            cardData.setIndexToCompare(comparedIndexSymbol);
        }
    }

    /**Event Listeners***/
    function onChertTypeSelected() {
        isCandleChart = d3.event.detail.data;
        if (cardData) {
            cardData.setIsCandleChart(isCandleChart);
            informActionToSave();
        }
        redrawChart();
    }

    function onCompareClick() {
        var target = d3.event.target;
        var clickedSymbol = d3.select(target).datum();
        if (comparedIndexSymbol == clickedSymbol) { //Second click is like cancel
            clickedSymbol = "";
        }
        selectComparableButtonBySymbol(clickedSymbol);
        performCompare();
    }
}

LineChartContainer.COMPAE_CLICK_EVENT = "CompareClickEvent";