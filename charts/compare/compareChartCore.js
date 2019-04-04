/**
 * Created by avitzur on 2/18/2016.
 */
function CompareChartCore() {
    var me = this;
    /****Constants****/
    var COLORS = ["#178FB7", "rgb(255, 178, 109)", "#800080", "#427242"];
    var SERIES_DRAW_DURATION_FULL = 600;
    var COVER_AREA_COLOR = "#B3E5E2";
    //Layout
    var XAXIS_AREA_HEIGHT = 18;
    var TOP_TOOLTIP_AREA_HEIGHT = 28;
    var BOTTOM_TOOLTIP_AREA_HEIGHT = 25;
    var CANVAS_PAD_FROM_EDGE = 5;
    var CANVAS_LEFT_PAD_FROM_EDGE = 35;
    var FONT_SIZE = 11;
    var TEXT_HEIGHT = FONT_SIZE * 1.2;
    var BASE_LINE_BUBBLE_HEIGHT = 13;
    var ZOOM_BUTTON_WIDTH = 52;

    /****Externally Set***/
    //Structure
    var externalDiv;
    //Data
    var dataLists;
    var range;
    var symbolList;
    //Style
    var colors = COLORS;

    /****Internally Set***/
    //Structure
    var parentDiv;
    var yAxisArea;
    var xAxisArea;
    var mainSVG;
    var topTooltipArea;
    var bottomTooltipArea;
    var interactiveDiv;
    //(SVG)
    var lineAreaFillG;
    var bgGroup;
    var seriesGroup;
    var hoverGroup;
    var defsTag;
    var coverAreaFillG;
    //Extras
    var zoomButton;

    //Layout
    var parentDivHeight;
    var parentDivWidth;
    var dashboardCanvasHeight;
    var dashboardCanvasWidth;
    //Data
    var dataListMain;
    var comparableLists;
    var periodicity;
    var minValue;
    var maxValue;
    //Sate
    //(Track Line)
    var trackStartIndex;
    var trackEndIndex;
    var isAreaCovered;
    //Zoom State
    var isPastPage; //It's a past page in a zoom state
    //Utils
    var papaChart;
    var dataManager = CompareDataManager.getInstance();
    var frameUtil = new ChartFrameUtil();
    var drawUtil = new MultiLineDrawUtil();
    var bottomTipUtil = new BottomDateTooltip();
    var interactiveComponent = new InteractiveComponent(me);
    var topTipUtil = new ComparableTopTip();
    var chartMarkUtil = new ChartMarkUtil();
    var xAxis;
    var yAxis;


    /***Public functions***/
    this.setExternalDiv = function (divInput) {
        externalDiv = d3.select(divInput);
    };

    this.setColors = function (colorArray) {
        colors = colorArray;
    };

    this.setData = function (dataListsInput, rangeInput, symbolListsInput) {
        if (dataListsInput && dataListsInput.length > 0 && dataListsInput[0].length > 0) {
            dataLists = dataListsInput;
            fillComparableLists();

            dataListMain = dataLists[0];
            if (range != rangeInput) {
                interactiveComponent.clearState();
                bottomTipUtil.clearState();
            }

            range = rangeInput;
            periodicity = getPeriodicityGlobal(range, dataListMain);

            symbolList = symbolListsInput;
        }
    };

    this.drawComponent = function () {
        if (dataListMain && dataListMain.length > 0) {
            drawComponent();
        }
    };

    this.hideLinePath = function () {
        if (seriesGroup) {
            seriesGroup.style("display", "none");
        }
    };

    this.restoreLinePath = function () {
        if (seriesGroup) {
            seriesGroup.style("display", "");
        }
    };

    this.clearState = function () {
        clearState();
    };

    this.setPapaChart = function (papaChartInput) {
        papaChart = papaChartInput;
    };

    this.setIsPastPage = function (boolean, isDrillMode) {
        isPastPage = boolean;
        drawUtil.setIsPastPage(isPastPage);
        frameUtil.setIsPastPage(isPastPage, isDrillMode);
    };


    this.setIsMiddleOfZoom = function (boolean) { //Just for consistency

    };

    this.reactToTrackMove = function (isAreaCoveredInput, startIndex, endIndex) {
        trackStartIndex = startIndex;
        trackEndIndex = endIndex;
        isAreaCovered = isAreaCoveredInput;
        reactToTrackMove();
    };

    this.reactToTrackFreeze = function () {
        reactToTrackFreeze();
    };

    this.reactToTrackUnFreeze = function () {
        reactToTrackUnFreeze();
    };

    this.reactToTrackHide = function () {
        reactToTrackHide();
    };

    this.setIsZoomState = function (boolean) {
        interactiveComponent.setIsZoomState(boolean);
    };

    this.shiftTimeLine = function (shiftTimeLine) {
        papaChart.shiftTimeLine(shiftTimeLine);
    };

    this.getPagingMidPixel = function () {
        return frameUtil.getPagingMidPixel();
    };

    /***Public functions End.***/

    /***Construction***/
    function drawComponent() {
        performConstruct();
        setAxisData();
        drawFrameWork();
        crateChartBaseLine(seriesGroup, 0, xAxis, yAxis);
        drawLineSeries();
        positionBaseLineBubble();

        prepChartMarkUtil();
        prepTips();
        prepInteractivePart();
    }

    function performConstruct() {
        var externalDivDOM = externalDiv.node();
        externalDiv.select("div").remove(); //Clear slate
        clearSlate(externalDiv);

        parentDivHeight = externalDivDOM.clientHeight;
        parentDivWidth = externalDivDOM.clientWidth;

        dashboardCanvasHeight = parentDivHeight - TOP_TOOLTIP_AREA_HEIGHT - BOTTOM_TOOLTIP_AREA_HEIGHT;
        dashboardCanvasWidth = parentDivWidth;

        parentDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: 0 + "px",
                height: parentDivHeight + "px",
                width: parentDivWidth + "px"
            });

        xAxisArea = parentDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                bottom: BOTTOM_TOOLTIP_AREA_HEIGHT - XAXIS_AREA_HEIGHT + "px",
                height: XAXIS_AREA_HEIGHT - 8 + "px",
                width: parentDivWidth + "px"
            })
            .attr("name", "xAxisArea");

        bottomTooltipArea = parentDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                bottom: 0 + "px",
                height: BOTTOM_TOOLTIP_AREA_HEIGHT - 5 + "px",
                width: parentDivWidth + "px"
            });


        mainSVG = parentDiv.append("svg")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: TOP_TOOLTIP_AREA_HEIGHT + "px",
                overflow: "visible",
                height: dashboardCanvasHeight + "px",
                width: dashboardCanvasWidth + "px"
            })
            .attr({
                draggable: "false"
            });

        defsTag = mainSVG.append("defs");
        lineAreaFillG = mainSVG.append("g");
        bgGroup = mainSVG.append("g");
        coverAreaFillG = mainSVG.append("g");
        seriesGroup = mainSVG.append("g");
        hoverGroup = mainSVG.append("g");

        yAxisArea = parentDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: TOP_TOOLTIP_AREA_HEIGHT + "px",
                height: dashboardCanvasHeight + "px"
            })
            .attr("name", "yAxisArea");


        topTooltipArea = parentDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: 0 + "px",
                height: TOP_TOOLTIP_AREA_HEIGHT - 8 + "px",
                width: parentDivWidth + "px"
            })
            .attr("name", "topTooltipArea");

        interactiveDiv = parentDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: TOP_TOOLTIP_AREA_HEIGHT + "px",
                overflow: "visible",
                height: dashboardCanvasHeight + "px",
                width: dashboardCanvasWidth + "px"
            })
            .attr({
                draggable: "false",
                name: "interactiveDiv"
            });

        createZoomButton();
    }

    function createZoomButton() {
        zoomButton = parentDiv.append("p")
            .style({
                position: "absolute",
                "text-align": "center",
                margin: 0,
                padding: 2 + "px",
                "font-size": 12 + "px",
                width: ZOOM_BUTTON_WIDTH + "px",
                "box-sizing": "border-box"
            })
            .text("Zoom!")
            .classed("zoomButtonClass", true)
            .on("click", onZoomClick);

        zoomButton.style({
            bottom: BOTTOM_TOOLTIP_AREA_HEIGHT + 5 + "px",
            opacity: 0.7
        });

        hideZoomButton();
    }

    function drawFrameWork() {
        frameUtil.setData(dataListMain, range, false, undefined);
        frameUtil.setLayoutParams(dashboardCanvasHeight, dashboardCanvasWidth);
        frameUtil.setStates(false, false, yAxis.scale(0), true, "%");
        frameUtil.setStructureElements(bgGroup, yAxisArea, xAxisArea);
        frameUtil.setUtils(xAxis, yAxis);

        frameUtil.drawComponent();
    }

    function drawLineSeries() {
        drawUtil.setParentGroups(seriesGroup, lineAreaFillG, hoverGroup);
        drawUtil.setData(comparableLists, xAxis, yAxis);
        drawUtil.setLayoutParams(CANVAS_PAD_FROM_EDGE, colors);
        drawUtil.drawComponent();
    }

    function positionBaseLineBubble() {
        var top = yAxis.scale(0) - BASE_LINE_BUBBLE_HEIGHT / 2;
        top = iMath.max(0, top);
        var bgColor = "#FFFFFF";
        var textColor = "#000000";

        top = iMath.min(top, dashboardCanvasHeight - TEXT_HEIGHT / 2 - TEXT_HEIGHT - 2);
        top = iMath.max(top, -CANVAS_PAD_FROM_EDGE + TEXT_HEIGHT - 2);

        var baseLineBubbleDiv = yAxisArea.append("div")
            .style({
                position: "absolute",
                height: BASE_LINE_BUBBLE_HEIGHT + "px",
                left: 0 + "px",
                top: top + "px",
                "background-color": bgColor
            });

        if (yAxis.minValue != 0) {
            var baseLineBubbleP = baseLineBubbleDiv.append("p")
                .style({
                    "font-size": FONT_SIZE + "px",
                    left: 0 + "px",
                    color: textColor,
                    height: BASE_LINE_BUBBLE_HEIGHT + "px",
                    "line-height": BASE_LINE_BUBBLE_HEIGHT + "px",
                    margin: 0
                })
                .text("0%");
        }
    }

    function prepTips() {
        bottomTipUtil.createBottomTip(bottomTooltipArea);
        bottomTipUtil.setData(dataListMain, xAxis, 0, periodicity);
        topTipUtil.createTopTip(topTooltipArea, symbolList, colors, periodicity);

        bottomTipUtil.setUtils(interactiveComponent);
    }

    function prepChartMarkUtil() {
        chartMarkUtil.setParentGroups(coverAreaFillG, defsTag);
        chartMarkUtil.setData(comparableLists[0], xAxis, yAxis, comparableLists);
        chartMarkUtil.setLayoutParams(CANVAS_PAD_FROM_EDGE);

        chartMarkUtil.setAreaColor(COVER_AREA_COLOR);
        chartMarkUtil.drawComponent();
    }

    function prepInteractivePart() {
        interactiveComponent.setExternalDiv(interactiveDiv);
        interactiveComponent.setData(xAxis, comparableLists[0]);
        interactiveComponent.initPoints();

        for (var i = comparableLists.length - 1; i >= 0; i--) {
            interactiveComponent.addPointObject(yAxis, comparableLists[i], 5, colors[i]);
        }

        interactiveComponent.drawComponent();
    }

    /**Prep Calculations***/
    function fillComparableLists() {
        dataLists = dataManager.alignDataListsByEditing(dataLists);
        comparableLists = dataManager.getComparableDataLists(dataLists);
    }

    function updateYAxisMinMax(comparableList) {
        var close;
        for (var i = 0; i < comparableList.length; i++) {
            close = comparableList[i].close;
            if (close != undefined) {
                minValue = iMath.min(minValue, close);
                maxValue = iMath.max(maxValue, close);
            }
        }
    }

    function calculateYAxisMinMax() {
        minValue = 0;
        maxValue = 0;
        for (var i = 0; i < comparableLists.length; i++) {
            updateYAxisMinMax(comparableLists[i]);
        }

        var valuePad = (maxValue - minValue) * 0.05;
        maxValue += valuePad;
        if (minValue - valuePad >= 0) {
            minValue -= valuePad;
        }
    }

    function setAxisData() {
        calculateYAxisMinMax();

        var numberOfDatePoints = dataListMain.length;
        if (range == RestAPIs.TIME_RANGE.D1) {
            numberOfDatePoints = StockData.getNumberOfPointsInADay(symbolList[0]);
        }
        xAxis = new AxisObject(0, numberOfDatePoints - 1, CANVAS_LEFT_PAD_FROM_EDGE, dashboardCanvasWidth - CANVAS_PAD_FROM_EDGE);
        yAxis = new AxisObject(minValue, maxValue, dashboardCanvasHeight - CANVAS_PAD_FROM_EDGE, CANVAS_PAD_FROM_EDGE);
    }

    function clearState() {
        bottomTipUtil.clearState();
        bottomTipUtil.hideTip();
        topTipUtil.hideTip();
        interactiveComponent.clearState();
    }

    /**Prep Calculations End.***/

    /***Interactions***/
    function reactToTrackMove() {
        positionZoomButton();
        positionTips();
        adjustCoverArea();
    }

    function reactToTrackFreeze() {
        bottomTipUtil.showArrows(isAreaCovered);
        adjustCoverArea();
    }

    function reactToTrackUnFreeze() {
        bottomTipUtil.hideArrows();
        chartMarkUtil.hideCoverArea();
    }

    function reactToTrackHide() {
        hideTips();
        chartMarkUtil.hideCoverArea();
    }

    function adjustCoverArea() {
        if (isAreaCovered) {
            chartMarkUtil.showCoverArea(trackStartIndex, trackEndIndex);
        } else {
            chartMarkUtil.hideCoverArea();
        }
    }

    /***Zoom Positioning***/
    function hideZoomButton() {
        zoomButton.style("display", "none");
    }

    function positionZoomButton() {
        if (papaChart && isAreaCovered && range != RestAPIs.TIME_RANGE.D1) {
            var x1 = xAxis.scale(trackStartIndex);
            var x2 = xAxis.scale(trackEndIndex);

            var midX = (x1 + x2) / 2;
            var buttonLeft = midX - ZOOM_BUTTON_WIDTH / 2;
            buttonLeft = iMath.min(dashboardCanvasWidth - CANVAS_PAD_FROM_EDGE - ZOOM_BUTTON_WIDTH, buttonLeft);
            buttonLeft = iMath.max(0, buttonLeft);

            zoomButton.style({
                display: "",
                left: buttonLeft + "px"
            });
        } else {
            hideZoomButton();
        }
    }

    /**Tips***/
    function positionTips() {
        var tipX = xAxis.scale(trackStartIndex);
        if (isAreaCovered) {
            tipX = (xAxis.scale(trackStartIndex) + xAxis.scale(trackEndIndex)) / 2;
        }
        positionBottomTip();
        positionTopTip(tipX);
        drawUtil.hideEndPoints();
    }

    function positionBottomTip() {
        if (trackStartIndex < dataListMain.length) {
            bottomTipUtil.positionBottomTip(trackStartIndex, isAreaCovered, trackEndIndex);
        }
    }

    function positionTopTip(tipX) {
        var valueList = createTipValueList();
        topTipUtil.positionTip(tipX, valueList, isAreaCovered);
    }

    function hideTips() {
        topTipUtil.hideTip();
        bottomTipUtil.hideTip();
        drawUtil.showEndPoints();
    }


    /**UI Helpers***/
    function getProperDate(date) {
        return getDateStringByParams(date, periodicity, false);
    }

    /***Calculations**/
    function calculatePercentage(startVal, endVal) {
        var percentage;
        if (startVal != undefined && endVal != undefined) {
            percentage = 100 * (endVal - startVal) / (startVal)
        }
        return percentage;
    }

    function createTipValueList() {
        var valueList = [];
        var compareList;
        var regularList;
        for (var i = 0; i < comparableLists.length; i++) {
            compareList = comparableLists[i];
            regularList = dataLists[i];
            valueList.push(getValueBySingleList(compareList, regularList));
        }
        return valueList;
    }

    function getValueBySingleList(compareList, regularList) {
        var value;

        if (compareList[trackStartIndex]) {
            if (!isAreaCovered) {
                value = compareList[trackStartIndex].close;
            } else {
                var startValue = regularList[trackStartIndex].close;
                var endValue = regularList[trackEndIndex].close;
                value = calculatePercentage(startValue, endValue);
            }
        }
        return value;
    }

    /***Event Listeners***/
    function onZoomClick() {
        papaChart.zoomToArea(trackStartIndex, trackEndIndex);
    }
}