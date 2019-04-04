/**
 * Created by yoni_ on 2/20/2016.
 */
function ZoomUtil() {
    /**Constants****/
    var ZOOM_ANIMATION_DURATION = 250;
    /***Externally set***/
    //Structure
    var papaDiv;
    //Data
    var fullDataList;
    var fullCompareLists;
    var overlayObjects;
    var extraChartObjects;
    //Chart
    var papaChart;

    /***Internally set***/
    //Data
    var totalPointCount;
    //Count
    var visiblePointsCount;
    var scrollZoomCount;
    //State
    var isZoomState;
    var startIndex;
    var endIndex;

    /**Public Functions****/
    this.setPapaChart = function (papaInput, divD3) {
        papaChart = papaInput;
        papaDiv = divD3;
    };

    this.setData = function (fullDataListInput, fullCompareListsInput, overlayObjectsInput, extraChartObjectsInput, cancelZoom) {
        fullDataList = fullDataListInput;
        fullCompareLists = fullCompareListsInput;
        overlayObjects = overlayObjectsInput;
        extraChartObjects = extraChartObjectsInput;

        totalPointCount = fullDataList.length;
        if (cancelZoom || startIndex == undefined) {
            cancelZoomState();
        }
    };

    this.getVisibleCompareLists = function () {
        return getVisibleCompareLists();
    };

    this.getVisibleMainList = function () {
        return trimVisibleList(fullDataList);
    };

    this.trimIndicators = function () {
        trimIndicators();
    };

    this.getIsZoomState = function () {
        return isZoomState;
    };

    this.getIsLeftButtonVisible = function () {
        return isZoomState && (startIndex > 0);
    };

    this.getIsRightButtonVisible = function () {
        return isZoomState && (endIndex < fullDataList.length - 1);
    };

    this.getIsPastPage = function () {
        var isIt = (isZoomState && endIndex != fullDataList.length - 1);
        return isIt;
    };

    this.zoomToArea = function (trackStartIndex, trackEndIndex) {
        zoomToArea(trackStartIndex, trackEndIndex);
    };

    this.cancelZoom = function () {
        cancelZoomState();
    };

    this.shiftTimeLine = function (shiftAmount) {
        shiftTimeLine(shiftAmount);
    };

    this.shiftPage = function (shiftDirection) {
        shiftPage(shiftDirection);
    };

    this.getZoomdedDataList = function () {

    };

    /**State****/
    function cancelZoomState() {
        isZoomState = false;
        initializeIndexes();
        papaChart.setIsZoomState(isZoomState);
    }

    function zoomToArea(rangeStart, rangeEnd) {
        var prevStart;
        var prevEnd;
        if (isZoomState) {
            prevStart = startIndex;
            prevEnd = endIndex;

            startIndex += rangeStart;
            endIndex = startIndex + (rangeEnd - rangeStart);
        } else {
            prevStart = 0;
            prevEnd = fullDataList.length - 1;

            startIndex = rangeStart;
            endIndex = rangeEnd;
        }

        isZoomState = true;
        papaChart.clearState();
        papaChart.setIsZoomState(isZoomState);

        animateZoom(prevStart, startIndex, prevEnd, endIndex);

        visiblePointsCount = (endIndex - startIndex + 1);
    }

    function animateZoom(prevStart, newStart, prevEnd, newEnd) {
        papaChart.setIsMiddleOfZoom(true);

        papaDiv.transition()
            .duration(ZOOM_ANIMATION_DURATION)
            .ease("linear")
            .tween("pook", function (d) {
                var startInterpolate = d3.interpolate(prevStart, newStart);
                var endInterpolate = d3.interpolate(prevEnd, newEnd);
                return function (t) {
                    startIndex = startInterpolate(t);
                    endIndex = endInterpolate(t);
                    papaChart.drawProperChart();
                    if (t == 1) {
                        papaChart.setIsMiddleOfZoom(false);
                    }
                }
            });
    }

    /***Data***/
    function trimVisibleList(dataList) {
        initializeIndexes();


        var listLength = dataList.length;
        var shiftAmount = totalPointCount - listLength;
        var actualStart = iMath.max(startIndex - shiftAmount, 0);
        var actualEnd = endIndex - shiftAmount;

        var trimmedArray = [];

        if (actualEnd >= 0){
            trimmedArray = dataList.slice(actualStart, actualEnd + 1);
        }


        return trimmedArray;
    }

    function getVisibleCompareLists() {
        var visibleLists = [];
        var trimList;
        for (var i = 0; i < fullCompareLists.length; i++) {
            trimList = trimVisibleList(fullCompareLists[i]);
            visibleLists.push(trimList);
        }
        return visibleLists;
    }

    function trimIndicators() {
        for (var i = 0; i < overlayObjects.length; i++) {
            trimToVisibleOnlyOverlay(overlayObjects[i]);
        }
        for (var i = 0; i < extraChartObjects.length; i++) {
            trimToVisibleOnlyExtraChart(extraChartObjects[i]);
        }
    }

    function trimToVisibleOnlyOverlay(overlayDataObj) {
        var lists = overlayDataObj.prevData;
        for (var i = 0; i < lists.length; i++) {
            overlayDataObj.data[i] = calculateVisibleIndicatorSingle(lists[i]);
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


    function calculateVisibleIndicatorSingle(indicatorDataList) {
        initializeIndexes();

        var visibleList = indicatorDataList.slice(startIndex, endIndex + 1);
        return visibleList;
    }

    function calculateVisibleIndicatorMACD(prevLists) {
        initializeIndexes();

        var visibleList0 = prevLists[0].slice(startIndex, endIndex + 1);
        var visibleList1 = prevLists[1].slice(startIndex, endIndex + 1);
        var visibleList2 = prevLists[2].slice(startIndex, endIndex + 1);

        var visibleLists = [visibleList0, visibleList1, visibleList2];
        return visibleLists;
    }

    function initializeIndexes() {
        if (!isZoomState && fullDataList) {
            startIndex = 0;
            endIndex = fullDataList.length - 1;
            totalPointCount = fullDataList.length;
        }
    }

    /***Shift Timeline***/
    function shiftTimeLine(shiftAmount, dontDraw) {
        startIndex += shiftAmount;
        startIndex = iMath.max(0, startIndex);
        startIndex = iMath.min(fullDataList.length - 1 - visiblePointsCount, startIndex);

        endIndex += shiftAmount;
        endIndex = iMath.max(visiblePointsCount - 1, endIndex);
        endIndex = iMath.min(fullDataList.length - 1, endIndex);

        if (!dontDraw){
            papaChart.drawProperChart();
        }
    }

    function shiftPage(shiftDirection){
        var shiftAmount = shiftDirection * visiblePointsCount;
        var prevStart = startIndex;
        var prevEnd = endIndex;
        shiftTimeLine(shiftAmount, true);

        animateZoom(prevStart, startIndex, prevEnd, endIndex);
    }
}