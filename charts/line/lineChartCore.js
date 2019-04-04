/**
 * Created by Jonathan on 9/25/2015.
 */
function LineChartCore() {
    var me = this;
    var iMath = Math;

    //Constants

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
    var EXTRA_MINICHART_SIZE_RATIO = 0.2;

    //Data
    var dataList;
    var symbol;
    var cardData;
    var range;
    var baseLineValue;
    var hasBaseLine;
    //(Overlay)
    var overlayObjects;
    var overlayLists;
    var dottedOverlayList;
    var dottedOverlayColor;
    var overlayColors;
    //(Extra Mini Chart)
    var extraMiniChartsCount = 0;
    var extraChartObjects = [];

    //Externally set State
    var isDarkBackground;
    var isCandleChart;

    //Structure
    var externalDiv;
    var parentDiv;
    var yAxisArea;
    var xAxisArea;
    var mainSVG;
    var interactiveDiv;
    var baseLineBubbleDiv;
    var baseLineBubbleP;
    var topTooltipArea;
    var bottomTooltipArea;
    var body;
    //(SVG Content)
    var defsTag;
    var lineAreaFillG;
    var coverAreaFillG;
    var bgGroup;
    var candleStringGroup;
    var seriesGroup;
    var indicatorsG;
    var volumeGroup;
    var trackLineG;
    //Extras
    var zoomButton;


    //Layout params
    var parentDivHeight;
    var parentDivWidth;
    var dashboardCanvasHeight;
    var dashboardCanvasWidth;
    var baseLineY;
    //Chart padding stuff
    var volumeSectionHeight;
    var minChartHeight;
    var extraMiniChartsTotalHeight;

    //State
    var isShowVolume = UserDBData.isShowVolume;
    //(Track Line)
    var trackStartIndex;
    var trackEndIndex;
    var isAreaCovered;
    //Zoom State
    var isPastPage; //It's a past page in a zoom state
    var isZoomable;
    //Data state
    var periodicity;
    var isCurrency;
    var hasOverlay;
    //Text state
    var baseLineText = "previous close";

    //Utils
    var chartMarkUtil = new ChartMarkUtil();
    var topTipUtil = new ChartTopTooltip();
    var bottomTipUtil = new BottomDateTooltip();
    var interactiveComponent = new InteractiveComponent(me);
    var frameUtil = new ChartFrameUtil();
    var indicatorsUtil = IndicatorsUtil.getInstance();
    var mainMiniChart = new MainMiniChart;
    var volumeSectionUtil;
    var extraMiniCharts;

    var yAxis;
    var xAxis;

    var papaZoomChart; //Externally set

    /**Public properties**/
    me.CHART_CANVAS_TOP_POSITION = TOP_TOOLTIP_AREA_HEIGHT - 5;

    /**Public functions**/
    this.setExternalDiv = function (divInput) {
        externalDiv = d3.select(divInput);
    };

    this.setChartType = function (isCandleChartInput) {
        isCandleChart = isCandleChartInput;
        mainMiniChart.setChartType(isCandleChart);
        mainMiniChart.setIsPastPage(isPastPage);
    };

    this.setData = function (symbolInput, dataListInput, rangeInput, baseLineInput) {
        symbol = symbolInput;
        dataList = dataListInput;
        baseLineValue = baseLineInput;

        if (range != rangeInput) {
            interactiveComponent.clearState();
            bottomTipUtil.clearState();
        }
        range = rangeInput;
        hasBaseLine = (baseLineValue >= 0);
        periodicity = getPeriodicityGlobal(range, dataList);
        isCurrency = getIsCurrency(symbol);
    };

    this.setCardData = function (cardDataInput) {
        cardData = cardDataInput;
    };

    this.drawComponent = function () {
        extraMiniChartsCount = 0;
        extraChartObjects = [];
        overlayLists = [];
        if (dataList && dataList.length > 0) {
            drawComponent();
        }
    };

    this.setIsDarkBackground = function (boolean) {
        isDarkBackground = boolean;
        mainMiniChart.setIsDarkBackground(isDarkBackground);
    };

    this.hideLinePath = function () {
        //mainMiniChart.hideLinePath();
        if (volumeGroup) {
            volumeGroup.style("display", "none");
        }
        if (seriesGroup) {
            seriesGroup.style("display", "none");
        }
        if (indicatorsG) {
            indicatorsG.style("display", "none");
        }
    };

    this.restoreLinePath = function () {
        //mainMiniChart.restoreLinePath();
        if (volumeGroup) {
            volumeGroup.style("display", "");
        }
        if (seriesGroup) {
            seriesGroup.style("display", "");
        }
        if (indicatorsG) {
            indicatorsG.style("display", "");
        }
    };

    this.clearState = function () {
        interactiveComponent.clearState();
        bottomTipUtil.clearState();
    };

    this.setIsPastPage = function (boolean, isDrillMode) {
        isPastPage = boolean;
        mainMiniChart.setIsPastPage(isPastPage);
        frameUtil.setIsPastPage(isPastPage, isDrillMode);
    };

    this.setIsZoomState = function (boolean) {
        interactiveComponent.setIsZoomState(boolean);
    };

    this.drawChartWithIndicators = function (overlayObjectsInput, extraChartObjectsInput) {
        extraChartObjects = extraChartObjectsInput;
        overlayObjects = overlayObjectsInput;
        prepOverlayData();
        hasOverlay = (overlayLists.length > 0);
        extraMiniChartsCount = extraChartObjects.length;

        drawComponent(); //hasOverlay is set tp false here!!!
        if (overlayLists.length > 0) {
            mainMiniChart.attachIndicators(overlayLists, overlayColors, dottedOverlayList, dottedOverlayColor);
        }
    };

    this.setIsShowVolume = function (boolean) {
        isShowVolume = boolean;
    };

    this.setBaseLineValue = function (num) {
        baseLineValue = num;
        hasBaseLine = (baseLineValue >= 0);
    };

    this.getExtraBottomPad = function () {
        return volumeSectionHeight;
    };

    this.setAsZoomable = function (zoomableChartInput) {
        isZoomable = true;
        papaZoomChart = zoomableChartInput;
    };

    this.setIsMiddleOfZoom = function (boolean) {
        interactiveComponent.setIsMiddleOfZoom(boolean);
    };

    this.reactToTrackMove = function (isAreaCoveredInput, startIndex, endIndex) {
        trackStartIndex = startIndex;
        trackEndIndex = endIndex;
        isAreaCovered = isAreaCoveredInput;
        reactToTrackMove();
    };

    this.shiftTimeLine = function (shiftAmount) {
        papaZoomChart.shiftTimeLine(shiftAmount);
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

    this.getPagingMidPixel = function () {
        return frameUtil.getPagingMidPixel();
    };

    /*Structure component*/
    function drawComponent() {
        body = d3.select("body");

        performConstruct();
        updateDrawUtil();

        if (hasBaseLine) {
            crateChartBaseLine(seriesGroup, baseLineValue, xAxis, yAxis);
            positionBaseLineBubble();
        }

        drawFrameWork();
        prepChartMarkUtil();
        prepTips();

        drawLineSeries();

        if (isShowVolume) {
            drawVolumeSection();
        }

        //Extra Mini Charts
        if (extraMiniChartsCount > 0) {
            addAllExtraMiniCharts();
        }

        if (isZoomable) {
            createZoomButton();
        }

        prepInteractivePart();
    }

    function prepTips() {
        topTipUtil.setData(dataList, baseLineValue, isCurrency);
        bottomTipUtil.setData(dataList, xAxis, baseLineValue, periodicity);

        topTipUtil.createTopTip(topTooltipArea, isCandleChart);
        bottomTipUtil.createBottomTip(bottomTooltipArea);

        bottomTipUtil.setUtils(interactiveComponent);
    }

    function performConstruct() {
        var externalDivDOM = externalDiv.node();
        externalDiv.select("div").remove(); //Clear slate
        clearSlate(externalDiv);

        parentDivHeight = externalDivDOM.clientHeight;
        parentDivWidth = externalDivDOM.clientWidth;

        dashboardCanvasHeight = parentDivHeight - TOP_TOOLTIP_AREA_HEIGHT - BOTTOM_TOOLTIP_AREA_HEIGHT;
        dashboardCanvasWidth = parentDivWidth;

        calculateBottomPad();

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
            })
            .on(bottomTipUtil.ARROW_CLICKED_EVENT, undefined);


        mainSVG = parentDiv.append("svg")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: TOP_TOOLTIP_AREA_HEIGHT + "px",
                overflow: "visible",
                height: dashboardCanvasHeight + "px",
                width: dashboardCanvasWidth + "px"
            });

        defsTag = mainSVG.append("defs");
        lineAreaFillG = mainSVG.append("g");
        bgGroup = mainSVG.append("g");
        coverAreaFillG = mainSVG.append("g");
        candleStringGroup = mainSVG.append("g");
        seriesGroup = mainSVG.append("g");
        indicatorsG = mainSVG.append("g");
        volumeGroup = mainSVG.append("g");
        trackLineG = mainSVG.append("g");

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

        createBaseLineBubble();
    }

    function calculateBottomPad() {
        if (isShowVolume && !isCurrency) {
            volumeSectionHeight = dashboardCanvasHeight * EXTRA_MINICHART_SIZE_RATIO;
        } else {
            volumeSectionHeight = 0;
        }
    }

    function drawFrameWork() {
        frameUtil.setData(dataList, range, isCandleChart, symbol);
        frameUtil.setLayoutParams(dashboardCanvasHeight, dashboardCanvasWidth);
        frameUtil.setStates(isCurrency, isDarkBackground, baseLineY, hasBaseLine);
        frameUtil.setStructureElements(bgGroup, yAxisArea, xAxisArea);
        frameUtil.setUtils(xAxis, yAxis);

        frameUtil.drawComponent();
    }

    function createBaseLineBubble() {
        var bgColor = "#FFFFFF";
        var textColor = "#000000";

        if (isDarkBackground) {
            bgColor = "#333333";
            textColor = "#FFFFFF";
        }

        baseLineBubbleDiv = yAxisArea.append("div")
            .style({
                position: "absolute",
                height: BASE_LINE_BUBBLE_HEIGHT + "px",
                left: 0 + "px",
                "background-color": bgColor,
                display: "none"
            })
            .attr("title", baseLineText);

        baseLineBubbleP = baseLineBubbleDiv.append("p")
            .style({
                "font-size": FONT_SIZE + "px",
                left: 0 + "px",
                color: textColor,
                height: BASE_LINE_BUBBLE_HEIGHT + "px",
                "line-height": BASE_LINE_BUBBLE_HEIGHT + "px",
                margin: 0
            });
    }

    function prepInteractivePart() {
        interactiveComponent.setExternalDiv(interactiveDiv);
        interactiveComponent.setData(xAxis, dataList);

        interactiveComponent.initPoints();

        if (overlayLists) {
            for (var i = 0; i < overlayLists.length; i++) {
                interactiveComponent.addPointObject(yAxis, overlayLists[i], 4, overlayColors[i]);
            }
        }

        if (extraChartObjects) {
            var miniChart;
            for (var i = 0; i < extraChartObjects.length; i++) {
                miniChart = extraMiniCharts[i];
                interactiveComponent.addPointObject(miniChart.getYAxis(), miniChart.getMainDataList(), 4, miniChart.getColor());
            }
        }

        //Main point
        interactiveComponent.addPointObject(yAxis, dataList, 5);

        interactiveComponent.drawComponent();
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
            bottom: BOTTOM_TOOLTIP_AREA_HEIGHT + extraMiniChartsTotalHeight + 5 + "px",
            opacity: 0.7
        });


        hideZoomButton();
    }

    /***Zoom Positioning***/
    function hideZoomButton() {
        if (isZoomable) {
            zoomButton.style("display", "none");
        }
    }

    function positionZoomButton() {
        if (papaZoomChart && isZoomable && isAreaCovered && range != RestAPIs.TIME_RANGE.D1) {
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

    /***Volume***/
    function drawVolumeSection() {
        if (!volumeSectionUtil) {
            volumeSectionUtil = new VolumeSectionUtil();
        }
        var topPixel = dashboardCanvasHeight - volumeSectionHeight - extraMiniChartsTotalHeight;
        var bottomPixel = dashboardCanvasHeight - extraMiniChartsTotalHeight;
        volumeSectionUtil.setParams(dataList, xAxis, topPixel, bottomPixel);
        volumeSectionUtil.setGroup(volumeGroup);
        volumeSectionUtil.drawComponent();
    }

    //UI changes
    function positionBaseLineBubble() {
        var top = baseLineY - BASE_LINE_BUBBLE_HEIGHT / 2;
        top = iMath.max(0, top);
        var valueText = formatNiceNumber(baseLineValue, isCurrency);

        top = iMath.min(top, dashboardCanvasHeight - TEXT_HEIGHT / 2 - TEXT_HEIGHT - 2);
        top = iMath.max(top, -CANVAS_PAD_FROM_EDGE + TEXT_HEIGHT - 2);

        baseLineBubbleDiv.style({
            top: top + "px",
            display: "",
            cursor: "default"
        });
        baseLineBubbleP.text(valueText);
    }

    function prepChartMarkUtil() {
        chartMarkUtil.setParentGroups(coverAreaFillG, defsTag);
        chartMarkUtil.setData(dataList, xAxis, yAxis);
        chartMarkUtil.setIsDarkBackground(isDarkBackground);
        chartMarkUtil.setLayoutParams(CANVAS_PAD_FROM_EDGE + volumeSectionHeight);
        chartMarkUtil.drawComponent();
    }

    function drawLineSeries() {
        mainMiniChart.setPapaGroups(lineAreaFillG, candleStringGroup, seriesGroup, indicatorsG);
        mainMiniChart.setData(dataList, xAxis, yAxis, symbol, range);
        mainMiniChart.setLayoutParams(CANVAS_PAD_FROM_EDGE + volumeSectionHeight);
        mainMiniChart.drawComponent();


    }

    /***Extra Mini Charts****/
    function addAllExtraMiniCharts() {
        extraMiniCharts = [];
        for (var i = 0; i < extraMiniChartsCount; i++) {
            addExtraMiniChart(i);
        }
    }

    function addExtraMiniChart(index) {
        var extraChartDataObj = extraChartObjects[index];
        var topYPixel = dashboardCanvasHeight - (extraMiniChartsCount - index) * minChartHeight;
        var miniChart;

        var type = extraChartDataObj.paramsData.type;
        switch (type) {
            case IndicatorsUtil.TYPES.MFI:
                miniChart = createMFIChart(topYPixel, extraChartDataObj);
                break;
            case IndicatorsUtil.TYPES.MACD:
                miniChart = createMACDChart(topYPixel, extraChartDataObj);
                break;
        }


        extraMiniCharts.push(miniChart);
    }

    function createMACDChart(topYPixel, extraChartDataObj) {
        var minValue = 0;
        var maxValue = 0;

        var lists = extraChartDataObj.data;
        var value;
        var list;

        for (var i = 0; i < lists.length; i++) {
            list = lists[i];
            for (var j = 0; j < list.length; j++) {
                value = list[j];
                if (value != undefined) {
                    minValue = iMath.min(minValue, value);
                    maxValue = iMath.max(maxValue, value);
                }
            }
        }


        var miniChart = createGeneralMiniChart(topYPixel, extraChartDataObj, minValue, maxValue);
        return miniChart;
    }

    function createMFIChart(topYPixel, extraChartDataObj) {
        var minValue = 0;
        var maxValue = 100;

        var miniChart = createGeneralMiniChart(topYPixel, extraChartDataObj, minValue, maxValue);
        return miniChart;
    }

    function createGeneralMiniChart(topYPixel, extraChartDataObj, minValue, maxValue) {
        frameUtil.addMiniChartFrame(topYPixel, minChartHeight, minValue, maxValue);
        var miniChart = new IndicatorMiniChart();
        var miniYAxis = new AxisObject(minValue, maxValue, topYPixel + minChartHeight - 3, topYPixel + 3);

        miniChart.setData(dataList, extraChartDataObj, xAxis, miniYAxis);
        miniChart.setPapaGroups(seriesGroup);
        miniChart.drawComponent();
        return miniChart
    }

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

    /**Tips***/
    function positionTips() {
        var tipX = xAxis.scale(trackStartIndex);
        if (isAreaCovered) {
            tipX = (xAxis.scale(trackStartIndex) + xAxis.scale(trackEndIndex)) / 2;
        }
        positionBottomTip();
        positionTopTip(tipX);
        positionIndicatorTips();
    }

    function positionBottomTip() {
        if (trackStartIndex < dataList.length) {
            bottomTipUtil.positionBottomTip(trackStartIndex, isAreaCovered, trackEndIndex);
        }
    }

    function positionTopTip(tipX) {
        topTipUtil.positionTopTip(trackStartIndex, tipX, isAreaCovered, trackEndIndex, isCandleChart);
    }

    function hideTips() {
        topTipUtil.hideTip();
        bottomTipUtil.hideTip();
        if (papaZoomChart) {
            papaZoomChart.hideTips();
        }

    }

    function positionIndicatorTips() {
        if (papaZoomChart) {
            papaZoomChart.positionIndicatorTips(trackStartIndex, isAreaCovered, trackEndIndex);
        }
    }

    /***Data processing***/
    function prepOverlayData() {
        overlayLists = [];
        overlayColors = [];
        dottedOverlayList = [];

        var dataLists;
        var overlayObj;
        for (var i = 0; i < overlayObjects.length; i++) {
            overlayObj = overlayObjects[i];
            dataLists = overlayObj.data;

            overlayColors.push(overlayObj.paramsData.color);
            overlayLists.push(dataLists[0]);
            if (overlayObj.paramsData.type == IndicatorsUtil.TYPES.BB) {
                overlayColors.push(overlayObj.paramsData.color);
                overlayLists.push(dataLists[1]);
                dottedOverlayColor = overlayObj.paramsData.color;

                var list1 = dataLists[0];
                var list2 = dataLists[1];
                var midValue;
                for (var j = 0; j < list1.length; j++) {
                    if (list1[j] == undefined) {
                        midValue = undefined;
                    } else {
                        midValue = (list1[j] + list2[j]) / 2;
                    }
                    dottedOverlayList.push(midValue);
                }
            }


        }
    }

    function updateDrawUtil() {
        var firstData = dataList[0];
        var minValue = firstData.close;
        var maxValue = minValue;

        if (hasBaseLine) {
            minValue = baseLineValue;
            maxValue = minValue;
        }

        var close;
        var data;
        var low;
        var high;
        var date;
        for (var i = 0; i < dataList.length; i++) {
            data = dataList[i];
            close = data.close;
            low = data.low;
            high = data.high;
            date = data.date;
            minValue = iMath.min(low, minValue, close);
            maxValue = iMath.max(high, maxValue, close);
        }

        var valuePad = (maxValue - minValue) * 0.05;
        maxValue += valuePad;
        if (minValue - valuePad >= 0) {
            minValue -= valuePad;
        }

        var numberOfDatePoints = dataList.length;
        if (range == RestAPIs.TIME_RANGE.D1) {
            numberOfDatePoints = StockData.getNumberOfPointsInADay(symbol);
        }

        minChartHeight = dashboardCanvasHeight * EXTRA_MINICHART_SIZE_RATIO;
        extraMiniChartsTotalHeight = extraMiniChartsCount * minChartHeight;

        xAxis = new AxisObject(0, numberOfDatePoints - 1, CANVAS_LEFT_PAD_FROM_EDGE, dashboardCanvasWidth - CANVAS_PAD_FROM_EDGE);
        var yAxisBottomPixel = dashboardCanvasHeight - CANVAS_PAD_FROM_EDGE - volumeSectionHeight - extraMiniChartsTotalHeight;
        yAxis = new AxisObject(minValue, maxValue, yAxisBottomPixel, CANVAS_PAD_FROM_EDGE);

        if (hasBaseLine) {
            baseLineY = yAxis.scale(baseLineValue);
        }

        if (hasOverlay) {
            indicatorsUtil.updateYAxisByIndicators(overlayLists, yAxis);
        }
        hasOverlay = false;
    }

    /***Event Listeners***/
    function onZoomClick() {
        papaZoomChart.zoomToArea(trackStartIndex, trackEndIndex);
    }

    /**UI Helpers***/
    function getProperDate(date, index) {
        var isLastPoint = (index == dataList.length - 1);
        var doesRepresentRange = (isCandleChart && !isLastPoint); //The last point always represents up to one day! (ie. not a range!)
        return getDateStringByParams(date, periodicity, doesRepresentRange);
    }
}

LineChartCore.uniqueIDIndex = 0;