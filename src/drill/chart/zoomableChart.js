/**
 * Created by avitzur on 1/5/2016.
 */
function ZoomableChart() {
    var me = this;
    var iMath = Math;
    /***CONSTANTS**/
    var ZOOM_CHART_PAGE_BUTTON_CLASS = "ZOOM_CHART_PAGE_BUTTON_CLASS";
    var ZOOM_PERCENTAGE = 0.035;
    var ZOOM_ANIMATION_DURATION = 350;
    //Layout
    var TOP_TOOLTIP_AREA_HEIGHT = 28;
    var MIN_DISTANCE_BETWEEN_TICKS_Y = 70;
    var YAXIS_AREA_WIDTH = 35;
    var NON_DATA_AREA_HEIGHT = 53;
    var PAGE_BUTTON_SIZE = 32;
    var MIN_POINT_COUNT = 25;

    /**Externally Set***/
    //Structure
    var externalDiv;

    //State
    var isDarkBG;
    var showHoveredContent;
    var isCandleChart = true; //Boolean
    var showIndicator;
    var overlayIndicatorParams;
    var extraChartIndicatorParams;

    //Data
    var range;
    var originalList;
    var originalListSecondary;
    var prevClose;
    var symbol;
    var symbolSecondary;

    /**Internally Set***/
    //Structure
    var chartDiv;
    var leftButton;
    var rightButton;
    var tooltipDiv;

    //Layout params
    var parentDivWidth;
    var parentDivHeight;

    //Data
    var totalPointCount;
    var visibleList;
    var visibleListSecondary;
    //(Overlay Indicators)
    var overlayObjects;
    //(Extra Chart Indicators)
    var extraChartObjects = [];
    //State
    var zoomAmount = 1;
    var visiblePointsCount;
    var startIndex;
    var endIndex;
    //(Prev)
    var prevSymbol;
    var prevDataLength;

    //Utils
    var chartObject = new LineChartPure();
    var shapeUtil = ShapesUtil.getInstance();
    var compareDataManager = CompareDataManager.getInstance();
    var indicatorsUtil = IndicatorsUtil.getInstance();
    var tooltipComponent = new MultiTooltipComponent();
    var topToolBar;

    /***Public functions**/
    this.setExternalDiv = function (divInput) {
        externalDiv = d3.select(divInput);
    };

    this.setToolBar = function (toolBarComponenet) {
        topToolBar = toolBarComponenet;
    };

    this.setData = function (dataArray, rangeInput, symbolInput, prevCloseInput, showHoveredContentInput) {
        showHoveredContent = showHoveredContentInput;
        symbol = symbolInput;
        prevClose = prevCloseInput;

        originalList = dataArray;
        range = rangeInput;

        var dataLength = dataArray.length;
        if (symbol != prevSymbol || dataLength != prevDataLength) {
            cancelZoomState();
        }

        prevSymbol = symbol;
        prevDataLength = dataLength;

        if (showIndicator) {
            calculateOverlayIndicatorData();
            calculateExtraChartIndicatorData();
        }
    };

    this.setDataSecondary = function (dataArray, symbolInput) {
        originalListSecondary = dataArray;
        symbolSecondary = symbolInput;

        var secondaryDataLength = originalListSecondary.length;
        var mainDataLength = originalList.length;
        if (secondaryDataLength && secondaryDataLength != mainDataLength) {
            var arr = compareDataManager.alignDataListsByEditing([originalList, originalListSecondary]);
            originalList = arr[0];
            originalListSecondary = arr[1];

            if (mainDataLength > secondaryDataLength) { //Data got shorter, disable zoom :(
                cancelZoomState();
            }
        }

        if (secondaryDataLength) {
            showIndicator = false;
        }
    };

    this.setIsCandleAndRedraw = function (boolean) {
        isCandleChart = boolean;
        symbolSecondary = "";
        chartObject.setIsCandleChart(isCandleChart);
        redrawChart();
    };

    this.setIsDarkBackground = function (boolean) {
        isDarkBG = boolean;
        chartObject.setIsDarkBackground(isDarkBG);
    };

    this.setIsCandleChart = function (boolean) {
        isCandleChart = boolean;
    };

    this.redrawChart = function () { //This will always be non-compare chart. (called when switching between line and candle)
        redrawChart();
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.updateByLiveData = function (dataList1, dataList2) {
        updateByLiveData(dataList1, dataList2);
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

    this.showIndicator = function (indicatorParamsInput, extraChartIndicatorParamsInput) {
        overlayIndicatorParams = indicatorParamsInput;
        extraChartIndicatorParams = extraChartIndicatorParamsInput;
        showIndicator = true;
        symbolSecondary = undefined;
        if (originalList) {
            calculateOverlayIndicatorData();
            calculateExtraChartIndicatorData();
            drawProperChart();
        }
    };

    this.hideIndicator = function () {
        showIndicator = false;
        if (originalList) {
            drawProperChart();
        }
    };

    this.zoomToArea = function (areaStartIndex, areaEndIndex) {
        zoomToArea(areaStartIndex, areaEndIndex);
    };

    this.cancelZoom = function () {
        cancelZoom();
    };

    this.shiftTimeLine = function (shiftAmount) {
        shiftTimeLine(shiftAmount);
    };

    this.hideTips = function () {
        tooltipDiv.style("display", "none");
    };

    this.positionIndicatorTips = function (trackStartIndex, isAreaCovered, trackEndIndex) {
        updateTooltip(trackStartIndex, isAreaCovered, trackEndIndex);
    };


    /**Construction**/
    function drawComponent() {
        performConstruct();
    }

    function redrawChart() {
        if (showIndicator) {
            chartObject.redrawChart(overlayObjects, extraChartObjects);
        } else {
            chartObject.redrawChart();
        }

    }

    function performConstruct() {
        var externalDivDOM = externalDiv.node();
        clearSlate(externalDiv);

        parentDivHeight = externalDivDOM.clientHeight;
        parentDivWidth = externalDivDOM.clientWidth;

        chartDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: 0 + "px",
                height: parentDivHeight + "px",
                width: parentDivWidth + "px"
            })
            .attr("name", "ZoomChartPapa")
            .on("mousewheel", onMouseWheel)
            .on("wheel", onMouseWheel);
        createZoomHint();

        createRightButton();
        createLeftButton();

        chartObject.setAsZoomable(me);
        chartObject.setExternalDiv(chartDiv.node());
        chartObject.setIsShowVolume(true);

        createTooltipDiv();
        drawProperChart();
    }

    function createZoomHint() {
        var hintTextP = externalDiv.append("p")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: 0 + "px",
                width: parentDivWidth + "px",
                height: TOP_TOOLTIP_AREA_HEIGHT + "px",
                "line-height": TOP_TOOLTIP_AREA_HEIGHT + "px",
                margin: 0,
                "text-align": "center",
                "font-size": 14 + "px",
                cursor: "default",
                color: "#cccccc"
            })
            .text("Scroll on chart to zoom. Or select range by drag and drop and then click zoom.");
    }

    function createTooltipDiv() {
        tooltipDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                "pointer-events": "none",
                left: YAXIS_AREA_WIDTH + 10 + "px",
                display: "none",
                top: TOP_TOOLTIP_AREA_HEIGHT + 4 + "px"
            })
            .attr("name", "ShaiTooltip");

        tooltipComponent.setExternalDiv(tooltipDiv);
    }

    /**Indicators***/
    function prepIndicatorsDataBeforeDraw() {
        for (var i = 0; i < extraChartObjects.length; i++) {
            trimToVisibleOnlyExtraChart(extraChartObjects[i]);
        }
        for (var i = 0; i < overlayObjects.length; i++) {
            trimToVisibleOnlyOverlay(overlayObjects[i]);
        }
    }

    //Extra Charts
    function calculateExtraChartIndicatorData() {
        extraChartObjects = [];
        var extraChartDataObj;
        for (var i = 0; i < extraChartIndicatorParams.length; i++) {
            extraChartDataObj = indicatorsUtil.produceExtraChartIndicatorObject(originalList, extraChartIndicatorParams[i]);
            extraChartObjects.push(extraChartDataObj);
        }
    }

    function trimToVisibleOnlyExtraChart(extraChartDataObj) {
        var type = extraChartDataObj.paramsData.type;
        switch (type) {
            case IndicatorsUtil.TYPES.MFI:
                extraChartDataObj.data = calculateVisibleIndicatorSingle(extraChartDataObj.prevData);
                break;
            case IndicatorsUtil.TYPES.MACD:
                extraChartDataObj.data = calculateVisibleIndicatorMACD(extraChartDataObj.prevData);
                break;
        }
    }

    //Overlay
    function calculateOverlayIndicatorData() {
        overlayObjects = [];
        var currentDataList;
        var param;
        var overlayDataObj;
        var overlayDataLists;
        for (var i = 0; i < overlayIndicatorParams.length; i++) {
            param = overlayIndicatorParams[i];
            currentDataList = indicatorsUtil.produceIndicator(originalList, param.type, param.period, param.stdev);
            overlayDataLists = [];

            if (param.type == IndicatorsUtil.TYPES.BB) {
                overlayDataLists.push(currentDataList[0]);
                overlayDataLists.push(currentDataList[1]);
            } else {
                overlayDataLists.push(currentDataList);
            }

            overlayDataObj = indicatorsUtil.createOverlayDataObject(param, overlayDataLists);
            overlayObjects.push(overlayDataObj)
        }
    }

    function trimToVisibleOnlyOverlay(overlayDataObj) {
        var lists = overlayDataObj.prevData;
        for (var i = 0; i < lists.length; i++) {
            overlayDataObj.data[i] = calculateVisibleIndicatorSingle(lists[i]);
        }
    }

    function calculateVisibleIndicatorSingle(indicatorDataList) {
        var visibleList = indicatorDataList.slice(startIndex, endIndex + 1);
        return visibleList;
    }

    function calculateVisibleIndicatorMACD(prevLists) {
        var visibleList0 = prevLists[0].slice(startIndex, endIndex + 1);
        var visibleList1 = prevLists[1].slice(startIndex, endIndex + 1);
        var visibleList2 = prevLists[2].slice(startIndex, endIndex + 1);

        var visibleLists = [visibleList0, visibleList1, visibleList2];
        return visibleLists;
    }

    /**Drawing**/
    function drawProperChart() {
        resetButtonsVisibility();
        if (!symbolSecondary || showIndicator) {
            drawRegularChart();
        } else {
            drawComparableChart();
        }

        initializeTooltip();
    }

    function updateByLiveData(dataList1, dataList2) {
        me.setData(dataList1, range, symbol, prevClose, showHoveredContent);
        var isRegular = (!symbolSecondary || showIndicator);
        if (isRegular) {
            drawRegularChart(true);
        } else {
            me.setDataSecondary(dataList2, symbolSecondary);
            drawComparableChart(true);
        }
    }

    function drawRegularChart(saveState) {
        calculateListsByZoomState();

        if (!saveState) {
            chartObject.clearState();
        }

        chartObject.setIsCandleChart(isCandleChart);
        chartObject.setData(visibleList, range, symbol, prevClose, showHoveredContent);
        chartObject.setDataSecondary([], undefined);

        if (showIndicator) {
            prepIndicatorsDataBeforeDraw();
            chartObject.drawChartWithIndicators(overlayObjects, extraChartObjects);
        } else {
            chartObject.drawComponent();
        }

        chartObject.setIsZoomState(zoomAmount != 1);
    }

    function drawComparableChart(saveState) {
        calculateListsByZoomState();

        if (!saveState) {
            chartObject.clearState();
        }

        chartObject.setData(visibleList, range, symbol, prevClose, showHoveredContent);
        chartObject.setDataSecondary(visibleListSecondary, symbolSecondary);
        chartObject.drawComponent();


        chartObject.setIsZoomState(zoomAmount != 1);
    }

    function createLeftButton() {
        leftButton = createPageButton(true);
        leftButton.on("click", shiftLeft);
    }

    function createRightButton() {
        rightButton = createPageButton(false);
        rightButton.on("click", shiftRight);
    }

    function createPageButton(isLeft) {
        var buttonTop = calculateButtonTop();
        var buttonHorizontalPad = 0;
        var button = externalDiv.append("div")
            .style({
                position: "absolute",
                top: buttonTop + "px",
                width: PAGE_BUTTON_SIZE + "px",
                height: PAGE_BUTTON_SIZE + "px",
                border: "3px solid",
                background: "#FFFFFF",
                "border-radius": "50%",
                cursor: "pointer"
            })
            .classed(ZOOM_CHART_PAGE_BUTTON_CLASS, true);

        var iconSize = 16;
        var iconDiv = button.append("div")
            .style({
                position: "absolute",
                top: PAGE_BUTTON_SIZE / 2 - iconSize / 2 + "px",
                width: iconSize + "px",
                height: iconSize + "px"
            });

        if (isLeft) {
            button.style("left", buttonHorizontalPad + "px");
            iconDiv.style("left", 6 + "px");
            shapeUtil.createTriangle(iconDiv, iconSize, iconSize, shapeUtil.DIRECTION.LEFT);
        } else {
            button.style("right", buttonHorizontalPad + "px");
            iconDiv.style("right", 6 + "px");
            shapeUtil.createTriangle(iconDiv, iconSize, iconSize, shapeUtil.DIRECTION.RIGHT);
        }

        return button;
    }

    /***State**/
    function cancelZoomState() {
        startIndex = 0;
        endIndex = originalList.length - 1;
        totalPointCount = originalList.length;
        zoomAmount = 1;
        if (topToolBar) {
            updateTitleAboutZoomState();
        }

    }

    function updateTitleAboutZoomState() {
        if (zoomAmount == 1) {
            topToolBar.removeZoomState();
        } else {
            topToolBar.applyZoomState();
        }
    }

    /***Layout calculation**/
    function calculateButtonTop() {
        var topPosition;
        var canvasHeight = (parentDivHeight - NON_DATA_AREA_HEIGHT) * 0.85;
        var numberOfTicks = iMath.floor(canvasHeight / MIN_DISTANCE_BETWEEN_TICKS_Y) - 1;
        var distanceBetweenTicks = canvasHeight / (numberOfTicks + 1);

        topPosition = TOP_TOOLTIP_AREA_HEIGHT;
        var numberOfAreas = numberOfTicks + 2; //2 since there's also the volume section
        if (numberOfAreas % 2 == 0) {
            topPosition += (distanceBetweenTicks * (numberOfAreas) / 2);
        } else {
            topPosition += (distanceBetweenTicks * (numberOfAreas + 1) / 2);
        }
        topPosition -= (distanceBetweenTicks / 2);
        topPosition -= PAGE_BUTTON_SIZE / 2;

        topPosition -= 5; //todo: make it better

        return topPosition;
    }

    /**Actions!**/
    function performZoom(zoomShift) {
        var canZoom;
        if (zoomShift > 0) {
            canZoom = (zoomAmount < 1);
        } else {
            canZoom = (zoomAmount > MIN_POINT_COUNT / totalPointCount);
        }

        if (canZoom) {
            chartObject.clearState();
            calculateZoomState(zoomShift);
            drawProperChart();
        } else {
            resetButtonsVisibility();
        }
    }

    function zoomToArea(areaStartIndex, areaEndIndex) {
        var prevStart = startIndex;
        var prevEnd = endIndex;

        if (zoomAmount != 1) {
            startIndex += areaStartIndex;
            endIndex = startIndex + (areaEndIndex - areaStartIndex);
        } else {
            startIndex = areaStartIndex;
            endIndex = areaEndIndex;
        }


        visiblePointsCount = (endIndex - startIndex);
        zoomAmount = visiblePointsCount / totalPointCount;

        animateZoom(prevStart, startIndex, prevEnd, endIndex);
    }

    function cancelZoom() {
        zoomAmount = 1;
        startIndex = 0;
        endIndex = totalPointCount;
        drawProperChart();
    }

    function animateZoom(prevStart, newStart, prevEnd, newEnd) {
        chartObject.setIsMiddleOfZoom(true);

        chartDiv.transition()
            .duration(ZOOM_ANIMATION_DURATION)
            .ease("linear")
            .tween("pook", function (d) {
                var startInterpolate = d3.interpolate(prevStart, newStart);
                var endInterpolate = d3.interpolate(prevEnd, newEnd);
                return function (t) {
                    startIndex = startInterpolate(t);
                    endIndex = endInterpolate(t);
                    drawProperChart();
                    if (t == 1) {
                        chartObject.setIsMiddleOfZoom(false);
                    }
                }
            });
    }

    /**Shift Time Line****/
    function shiftTimeLine(shiftAmount) {
        updateIndexesByShiftAmount(shiftAmount);
        drawProperChart();
    }

    function updateIndexesByShiftAmount(shiftAmount) {
        startIndex += shiftAmount;
        startIndex = iMath.max(0, startIndex);
        startIndex = iMath.min(totalPointCount - 1 - visiblePointsCount, startIndex);

        endIndex += shiftAmount;
        endIndex = iMath.max(visiblePointsCount - 1, endIndex);
        endIndex = iMath.min(totalPointCount - 1, endIndex);

    }

    /***Data Precessing***/
    function calculateZoomState(zoomShift) {
        zoomAmount += zoomShift * ZOOM_PERCENTAGE;

        var minZoom = (MIN_POINT_COUNT / totalPointCount);
        var maxZoom = 1;
        zoomAmount = iMath.max(minZoom, zoomAmount);
        zoomAmount = iMath.min(maxZoom, zoomAmount);

        visiblePointsCount = iMath.ceil(totalPointCount * zoomAmount);

        startIndex = endIndex - visiblePointsCount + 1;

        if (startIndex <= 0) {
            var extraPointsToAdd = -1 * startIndex;
            endIndex += extraPointsToAdd;
            endIndex = iMath.min(endIndex, totalPointCount - 1);
            startIndex = 0;
        }
    }

    function calculateListsByZoomState() {
        visibleList = originalList.slice(startIndex, endIndex + 1);
        visibleListSecondary = originalListSecondary.slice(startIndex, endIndex + 1);
    }

    /***Paging****/
    function resetButtonsVisibility() {
        var isPastPage = endIndex < totalPointCount - 1;
        if (isPastPage) {
            rightButton.style("display", "");
        } else {
            rightButton.style("display", "none");
        }
        chartObject.setIsPastPage(isPastPage, true);

        if (startIndex > 0) {
            leftButton.style("display", "");
        } else {
            leftButton.style("display", "none");
        }

        updateTitleAboutZoomState();
    }

    function shiftLeft() {
        chartObject.clearState();

        var prevStart = startIndex;
        var prevEnd = endIndex;

        /* startIndex = iMath.max(0, startIndex - visiblePointsCount);
         endIndex = startIndex + visiblePointsCount;
         endIndex = iMath.min(endIndex, totalPointCount - 1);*/

        updateIndexesByShiftAmount(-visiblePointsCount);

        animateZoom(prevStart, startIndex, prevEnd, endIndex);
    }

    function shiftRight() {
        chartObject.clearState();
        var prevStart = startIndex;
        var prevEnd = endIndex;

        /*startIndex = iMath.min(totalPointCount - MIN_POINT_COUNT, startIndex + visiblePointsCount);
         endIndex = startIndex + visiblePointsCount;
         endIndex = iMath.min(endIndex, totalPointCount - 1);*/

        updateIndexesByShiftAmount(visiblePointsCount);

        animateZoom(prevStart, startIndex, prevEnd, endIndex);
    }

    /**Tooltip****/
    function initializeTooltip() {
        if (showIndicator) {
            tooltipComponent.setData(overlayIndicatorParams.concat(extraChartIndicatorParams));
            tooltipComponent.drawComponent();
        }
    }

    function updateTooltip(trackStartIndex, isAreaCovered, trackEndIndex) {
        if (showIndicator) {
            tooltipDiv.style("display", "");
            var valueArray = cretaeValueTextArray(trackStartIndex);
            if (isAreaCovered) {
                var valueArray2 = cretaeValueTextArray(trackEndIndex);
                for (var i = 0; i < valueArray.length; i++) {
                    valueArray[i] = valueArray[i] + " | " + valueArray2[i];
                }
            }

            tooltipComponent.updateData(valueArray);
        }
    }

    function cretaeValueTextArray(dataIndex) {
        var array = [];
        var valueStr;
        for (var i = 0; i < overlayObjects.length; i++) {
            valueStr = indicatorsUtil.getValueString(overlayObjects[i], dataIndex);
            array.push(valueStr);
        }

        for (var i = 0; i < extraChartObjects.length; i++) {
            valueStr = indicatorsUtil.getValueString(extraChartObjects[i], dataIndex);
            array.push(valueStr);
        }

        return array;
    }


    /**Event Listener***/
    function onMouseWheel() {
        var delta = d3.event.deltaY || (d3.event.wheelDelta * -1);
        var directionIsForward = (delta > 0);
        if (directionIsForward) {
            performZoom(1);
        } else {
            performZoom(-1);
        }
    }

}