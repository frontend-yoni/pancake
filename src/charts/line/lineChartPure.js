/**
 * Created by avitzur on 1/6/2016.
 */
function LineChartPure() {
    var me = this;
    var PAGE_BUTTON_MAX_SIZE = 32;

    //Structure
    var externalDiv;
    var parentDiv;
    var pageButtonLeft;
    var pageButtonRight;

    //Layout params
    var parentDivWidth;
    var parentDivHeight;
    var pageButtonSize;

    //Style
    var colors;

    //State
    var isBarChart;
    var isDarkBG;
    var showHoveredContent;
    var isCandleChart; //Boolean
    var isPastPage;
    var isZoomState;
    var isZoomButtonOnBottom;

    //Data
    var range;
    var historicDataArray;
    var baseLineValue;
    var prevClose;
    var symbol;
    //(Compare)
    var isCompareState;
    var allDataLists;
    var symbolList;

    //Utils
    var lineChartObject = new LineChartCore();
    var barChartObject;
    var chartObject = lineChartObject;
    var shapeUtil = ShapesUtil.getInstance();
    var comparableChartObject;
    var papaChart;

    /***Public functions**/
    this.setExternalDiv = function (divInput) {
        externalDiv = d3.select(divInput);
    };

    this.setIsBarChart = function(boolean){
        isBarChart = boolean;
        if (boolean){
            if (!barChartObject){
                barChartObject = new BarChartCore();
            }
            chartObject = barChartObject;
        }else{
            chartObject = lineChartObject;
        }
    };

    this.setData = function (dataArray, rangeInput, symbolInput, prevCloseInput, showHoveredContentInput) {
        showHoveredContent = showHoveredContentInput;
        symbol = symbolInput;
        prevClose = prevCloseInput;

        historicDataArray = dataArray;
        range = rangeInput;
    };

    this.setBaseLineValue = function(num){
        chartObject.setBaseLineValue(num);
    };

    this.setColors = function (colorArray) {
        colors = colorArray;
    };

    this.setDataSecondary = function (dataArray, symbolInput) {
        allDataLists = [historicDataArray, dataArray];
        symbolList = [symbol, symbolInput];

        isCompareState = (symbolInput != undefined);
    };

    this.setAllSecondaryData = function (dataLists, symbolListInput) {
        allDataLists = dataLists;
        symbolList = symbolListInput;

        isCompareState = true;
    };

    this.setIsDarkBackground = function (boolean) {
        isDarkBG = boolean;
        chartObject.setIsDarkBackground(isDarkBG);
    };

    this.setIsCandleChart = function (boolean) {
        isCandleChart = boolean;
    };

    this.redrawChart = function (overlayObjects, extraChartObjects) { //This will always be non-compare chart. (called when switching between line and candle)
        redrawChart(overlayObjects, extraChartObjects);
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.hideLinePath = function () {
        if (!isCompareState) {
            hideRegularChartLine();
        } else {
            hideComparableChartLines();
        }
    };

    this.restoreLinePath = function () {
        if (!isCompareState) {
            chartObject.restoreLinePath();
        } else if (comparableChartObject) {
            comparableChartObject.restoreLinePath();
        }
    };

    this.clearState = function () {
        if (chartObject) {
            chartObject.clearState();
        }
        if (comparableChartObject) {
            comparableChartObject.clearState();
        }
    };

    this.setIsPastPage = function (boolean, isDrillMode) {
        isPastPage = boolean;
        if (!isCompareState) {
            chartObject.setIsPastPage(isPastPage, isDrillMode);
        } else if (comparableChartObject) {
            comparableChartObject.setIsPastPage(isPastPage, isDrillMode);
        }
    };

    this.getExtraBottomPad = function () {
        var bottomPad;
        if (!isCompareState) {
            bottomPad = chartObject.getExtraBottomPad();
        } else if (comparableChartObject) {
            bottomPad = 0;
        }
        return bottomPad;
    };

    this.drawChartWithIndicators = function (overlayObjects, extraChartObjects) {
        drawChartWithIndicators(overlayObjects, extraChartObjects);
    };

    this.setIsShowVolume = function (boolean) {
        chartObject.setIsShowVolume(boolean);
    };

    this.setAsZoomable = function (zoomableChartInput, isOnBottom) {
        papaChart = zoomableChartInput;
        isZoomButtonOnBottom = isOnBottom;
        chartObject.setAsZoomable(papaChart, isZoomButtonOnBottom);
        if (comparableChartObject) {
            comparableChartObject.setPapaChart(papaChart);
        }
    };

    this.setPapaChart = function (zoomableChartInput) {
        papaChart = zoomableChartInput;
    };

    this.setIsMiddleOfZoom = function (boolean) {
        chartObject.setIsMiddleOfZoom(boolean);
    };

    this.setIsShowVolume = function (boolean) {
        chartObject.setIsShowVolume(boolean);
    };

    this.setIsZoomState = function (boolean, isLeftButtonVisible, isRightButtonVisible) {
        isZoomState = boolean;
        chartObject.setIsZoomState(isZoomState);
        if (comparableChartObject) {
            comparableChartObject.setIsZoomState(isZoomState);
        }

        if (pageButtonLeft) {
            readjustPageButtonVisibility(isLeftButtonVisible, isRightButtonVisible);
        }
    };

    /**Construction**/
    function drawComponent() {
        performConstruct();

        if (!isCompareState) {
            drawRegularChart();
        } else {
            drawComparableChart();
        }
    }

    function drawChartWithIndicators(overlayObjects, extraChartObjects) {
        performConstruct();
        drawRegularChart(overlayObjects, extraChartObjects);
    }

    function redrawChart(overlayObjects, extraChartObjects) {
        if (parentDiv) {
            chartObject.setChartType(isCandleChart);

            if (overlayObjects === undefined) {
                chartObject.drawComponent();
            } else {
                chartObject.drawChartWithIndicators(overlayObjects, extraChartObjects);
            }
        }
    }

    function performConstruct() {
        var externalDivDOM = externalDiv.node();
        clearSlate(externalDiv);

        parentDivHeight = externalDivDOM.clientHeight;
        parentDivWidth = externalDivDOM.clientWidth;
        calculatePageButtonSize();

        parentDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: 0 + "px",
                height: parentDivHeight + "px",
                width: parentDivWidth + "px"
            });
    }

    function calculatePageButtonSize(){
        var containerSize = iMath.min(parentDivHeight, parentDivWidth);
        pageButtonSize = containerSize * 0.15;
        pageButtonSize = iMath.min(PAGE_BUTTON_MAX_SIZE, pageButtonSize);
    }


    function createPagingButtons() {
        createLeftButton();
        createRightButton();
    }

    function createLeftButton() {
        pageButtonLeft = createPageButton(true);
        pageButtonLeft.on("click", onShiftLeft);
    }

    function createRightButton() {
        pageButtonRight = createPageButton(false);
        pageButtonRight.on("click", onShiftRight);
    }

    function createPageButton(isLeft) {
        var buttonTop = 25;
        if (!isCompareState) {
            buttonTop += chartObject.getPagingMidPixel() - pageButtonSize / 2;
        } else {
            buttonTop += comparableChartObject.getPagingMidPixel() - pageButtonSize / 2;
        }

        var buttonHorizontalPad = 0;
        var button = parentDiv.append("div")
            .style({
                position: "absolute",
                display: "none",
                top: buttonTop + "px",
                width: pageButtonSize + "px",
                height: pageButtonSize + "px",
                border: "3px solid",
                background: "#FFFFFF",
                "border-radius": "50%",
                cursor: "pointer"
            })
            .classed("ZOOM_CHART_PAGE_BUTTON_CLASS", true);

        var iconSize = iMath.floor(pageButtonSize / 2) + 1;
        var iconDiv = button.append("div")
            .style({
                position: "absolute",
                top: pageButtonSize / 2 - iconSize / 2 + "px",
                width: iconSize + "px",
                height: iconSize + "px"
            });

        var pad = iMath.floor(pageButtonSize / 5);
        if (isLeft) {
            button.style("left", buttonHorizontalPad + "px");
            iconDiv.style("left", pad + "px");
            shapeUtil.createTriangle(iconDiv, iconSize, iconSize, shapeUtil.DIRECTION.LEFT);
        } else {
            button.style("right", buttonHorizontalPad + "px");
            iconDiv.style("right", pad + "px");
            shapeUtil.createTriangle(iconDiv, iconSize, iconSize, shapeUtil.DIRECTION.RIGHT);
        }

        return button;
    }

    /**State change**/

    function hideComparableChartLines() {
        if (comparableChartObject) { //Sometimes you drag before creating the chart
            comparableChartObject.hideLinePath();
        }
    }

    function hideRegularChartLine() {
        if (chartObject) {
            chartObject.hideLinePath();
        }
    }

    function drawRegularChart(overlayObjects, extraChartObjects) {
        chartObject.setExternalDiv(parentDiv.node());
        chartObject.setChartType(isCandleChart);

        if (range == RestAPIs.TIME_RANGE.D1) {
            baseLineValue = prevClose;
        } else {
            baseLineValue = undefined;
        }

        chartObject.setData(symbol, historicDataArray, range, baseLineValue);

        if (overlayObjects == undefined) {
            chartObject.drawComponent();
        } else {
            chartObject.drawChartWithIndicators(overlayObjects, extraChartObjects);
        }

        createPagingButtons();
    }

    function drawComparableChart() {
        if (!comparableChartObject) {
            comparableChartObject = new CompareChartCore();
        }
        if (colors) {
            comparableChartObject.setColors(colors);
        }

        comparableChartObject.setPapaChart(papaChart);
        comparableChartObject.setIsZoomState(isZoomState);
        chartObject.clearState();
        comparableChartObject.setExternalDiv(parentDiv.node());

        var symbolText;
        var symbolTextList = [];
        for (var i = 0; i < symbolList.length; i++) {
            symbolText = symbolList[i];
            if (indexToName[symbolText]) {
                symbolText = indexToName[symbolText];
            }
            symbolTextList.push(symbolText);
        }

        comparableChartObject.setData(allDataLists, range, symbolTextList);
        comparableChartObject.drawComponent();

        createPagingButtons();
    }

    function readjustPageButtonVisibility(leftVisible, rightVisible) {
        if (leftVisible) {
            pageButtonLeft.style("display", "");
        } else {
            pageButtonLeft.style("display", "none");
        }

        if (rightVisible) {
            pageButtonRight.style("display", "");
        } else {
            pageButtonRight.style("display", "none");
        }
    }

    /**Event Listener***/
    function onShiftLeft() {
        papaChart.shiftPage(-1);
    }

    function onShiftRight() {
        papaChart.shiftPage(1);
    }
}