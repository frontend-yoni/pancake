/**
 * Created by yoni_ on 3/26/2016.
 */
/**
 * Created by Jonathan on 9/25/2015.
 */
function BarChartCore() {
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
    var ZOOM_BUTTON_WIDTH = 52;

    //Data
    var dataList;
    var symbol;
    var cardData;
    var range;
    //(Internally set)
    var periodicity;

    //Structure
    var externalDiv;
    var parentDiv;
    var yAxisArea;
    var xAxisArea;
    var mainSVG;
    var interactiveDiv;
    var topTooltipArea;
    var bottomTooltipArea;
    var body;
    //(SVG Content)
    var defsTag;
    var bgGroup;
    var mainBarsGroup;
    var concealerBarsGroup;
    var baseLineGroup;
    var coverAreaFillG;
    var trackLineG;
    //Extras
    var zoomButton;


    //Layout params
    var parentDivHeight;
    var parentDivWidth;
    var dashboardCanvasHeight;
    var dashboardCanvasWidth;
    var baseLineY;
    var singlePeriodWidth;

    //State
    //(Track Line)
    var trackStartIndex;
    var trackEndIndex;
    var isAreaCovered;
    //Zoom State
    var isPastPage; //It's a past page in a zoom state
    var isZoomable;

    //Utils
    var chartMarkUtil = new BarChartMarkUtil();
    var topTipUtil = new ChartTopTooltip();
    var bottomTipUtil = new BottomDateTooltip();
    var interactiveComponent = new InteractiveComponent(me);
    var frameUtil = new ChartFrameUtil();
    var drawUtil = new BarDrawUtil();

    var yAxis;
    var xAxis;

    var papaZoomChart; //Externally set

    /**Public properties**/
    me.CHART_CANVAS_TOP_POSITION = TOP_TOOLTIP_AREA_HEIGHT - 5;

    /**Public functions**/
    this.setExternalDiv = function (divInput) {
        externalDiv = d3.select(divInput);
    };

    this.setData = function (symbolInput, dataListInput, rangeInput) {
        symbol = symbolInput;
        dataList = dataListInput;
        range = rangeInput;
        periodicity = getPeriodicityGlobal(range, dataList);
    };

    this.setCardData = function (cardDataInput) {
        cardData = cardDataInput;
    };

    this.drawComponent = function () {
        if (dataList && dataList.length > 0) {
            drawComponent();
        }
    };

    this.hideLinePath = function () {
        if (concealerBarsGroup) {
            concealerBarsGroup.style("display", "none");
        }
    };

    this.restoreLinePath = function () {
        if (concealerBarsGroup) {
            concealerBarsGroup.style("display", "");
        }
    };

    this.clearState = function () {
        interactiveComponent.clearState();
        bottomTipUtil.clearState();
    };

    this.setIsPastPage = function (boolean, isDrillMode) {
        isPastPage = boolean;
        frameUtil.setIsPastPage(isPastPage, isDrillMode);
    };

    this.setIsZoomState = function (boolean) {
        interactiveComponent.setIsZoomState(boolean);
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

    this.setChartType = function (isCandleChartInput) { //Just to be compatible with LineChartCore API
    };
    this.setIsShowVolume = function (boolean) { //Just to be compatible with LineChartCore API
    };
    this.setIsDarkBackground = function (boolean) {//Just to be compatible with LineChartCore API
    };
    this.setBaseLineValue = function (num) {//Just to be compatible with LineChartCore API
    };


    /*Structure component*/
    function drawComponent() {
        body = d3.select("body");

        performConstruct();
        updateDrawUtil();

        crateSolidBaseLine(baseLineGroup, 0, yAxis, CANVAS_LEFT_PAD_FROM_EDGE - CANVAS_PAD_FROM_EDGE, dashboardCanvasWidth - CANVAS_PAD_FROM_EDGE);

        drawFrameWork();
        prepChartMarkUtil();
        prepTips();

        drawLineSeries();

        if (isZoomable) {
            createZoomButton();
        }

        prepInteractivePart();
    }

    function prepTips() {
        topTipUtil.setIsBarChart(true);
        topTipUtil.setData(dataList, 0, false);
        bottomTipUtil.setData(dataList, xAxis, 0, periodicity);

        topTipUtil.createTopTip(topTooltipArea, false);
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
        bgGroup = mainSVG.append("g");

        coverAreaFillG = mainSVG.append("g");
        mainBarsGroup = mainSVG.append("g");
        concealerBarsGroup = mainSVG.append("g");
        baseLineGroup = mainSVG.append("g");
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
    }

    function drawFrameWork() {
        frameUtil.setIsBarChart(true);
        frameUtil.setData(dataList, range, false, symbol);
        frameUtil.setLayoutParams(dashboardCanvasHeight, dashboardCanvasWidth);
        frameUtil.setStructureElements(bgGroup, yAxisArea, xAxisArea);
        frameUtil.setUtils(xAxis, yAxis);

        frameUtil.drawComponent();
    }

    function prepInteractivePart() {
        interactiveComponent.setIsBarChart(true);
        interactiveComponent.setExternalDiv(interactiveDiv);
        interactiveComponent.setData(xAxis, dataList);

        interactiveComponent.initPoints();

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
            bottom: BOTTOM_TOOLTIP_AREA_HEIGHT + 5 + "px",
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
        if (papaZoomChart && isZoomable && isAreaCovered) {
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


    //UI changes

    function prepChartMarkUtil() {
        chartMarkUtil.setParentGroups(coverAreaFillG);
        chartMarkUtil.setData(dataList, xAxis, yAxis);
        chartMarkUtil.setLayoutParams(CANVAS_PAD_FROM_EDGE);
        chartMarkUtil.drawComponent();
    }

    function drawLineSeries() {
        drawUtil.setPapaGroups(mainBarsGroup, concealerBarsGroup);
        drawUtil.setData(dataList, xAxis, yAxis, symbol, range);
        drawUtil.setLayoutParams(CANVAS_PAD_FROM_EDGE);
        drawUtil.drawComponent();
    }

    /***Frame****/

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
        topTipUtil.positionTopTip(trackStartIndex, tipX, isAreaCovered, trackEndIndex, false);
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
    function updateDrawUtil() {
        var minValue = 0;
        var maxValue = 0;

        var close;
        for (var i = 0; i < dataList.length; i++) {
            close = dataList[i].close;
            minValue = iMath.min(minValue, close);
            maxValue = iMath.max(maxValue, close);
        }

        var valuePad = (maxValue - minValue) * 0.05;
        maxValue += valuePad;
        if (minValue - valuePad >= 0) {
            minValue -= valuePad;
        }

        var numberOfDatePoints = dataList.length;

        singlePeriodWidth = (dashboardCanvasWidth - 2 * CANVAS_PAD_FROM_EDGE) / numberOfDatePoints;
        var startX = CANVAS_LEFT_PAD_FROM_EDGE + singlePeriodWidth / 2;
        var endX = (dashboardCanvasWidth - 2 * CANVAS_PAD_FROM_EDGE) - singlePeriodWidth / 2;

        xAxis = new AxisObject(0, numberOfDatePoints - 1, startX, endX);
        var yAxisBottomPixel = dashboardCanvasHeight - CANVAS_PAD_FROM_EDGE;
        if (minValue == 0){
            yAxisBottomPixel = dashboardCanvasHeight;
        }
        yAxis = new AxisObject(minValue, maxValue, yAxisBottomPixel, CANVAS_PAD_FROM_EDGE);

        baseLineY = yAxis.scale(0);
    }

    /***Event Listeners***/
    function onZoomClick() {
        papaZoomChart.zoomToArea(trackStartIndex, trackEndIndex);
    }
}