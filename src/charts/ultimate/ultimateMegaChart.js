/**
 * Created by yoni_ on 2/19/2016.
 */
function UltimateMegaChart() {
    var me = this;
    /***CONSTANTS***/
    var MAIN_LINE_COLOR = "#178FB7";
    //Layout
    var CHART_BUTTON_HEIGHT = 16;
    var DATA_SELECTOR_HEIGHT = 30;
    var CHART_TOP = 0;
    var RANGE_SECTION_HEIGHT = 20;
    var CHART_BOTTOM = 25;
    var CHART_RIGHT = 40;
    /***Externally Set****/
    //Structure
    var externalDiv;
    //Params
    var mainSymbol;
    //Data
    var cardData;

    /***Internally Set****/
    //Structure
    var topAreaDiv;
    var chartArea;
    var rangeSelectorArea;
    var chartTypeButtonsArea;
    //Params
    var selectedView;
    var symbolList;
    var isCandle = true;
    var rangeStr;

    var overlayParams = [];
    var extraChartsParams = [];
    //Data
    var dataLists;
    var overlayObjects = [];
    var extraChartObjects = [];
    var profitDataList;
    //Layout
    var isRangeOnRight;
    var chartRight;
    var chartBottom;

    //Util
    var dataManager = new UltimateChartDataManager();
    var chartObject = new LineChartPure();
    var rangeObject = new RangeSelectorUltimate();
    var topBarObject = new ToolBarUltimate();
    var indicatorsUtil = IndicatorsUtil.getInstance();
    var chartTypeButtons = new ChartButtonsComponent();
    var zoomUtil = new ZoomUtil();

    /***Public Functions****/
    this.setExternalDiv = function (divHTML) {
        externalDiv = d3.select(divHTML);
    };

    this.repsondToHoldingsUpdate = function(){
      if (selectedView == ToolBarUltimate.VIEWS.Profit){
          updateParamsAndRedraw();
      }
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.setCardData = function (cardDataInput) {
        cardData = cardDataInput;
        topBarObject.setCardData(cardData);
    };

    this.setMainSymbol = function (symbolInput) {
        mainSymbol = symbolInput;
        if (!symbolList) {
            symbolList = [mainSymbol, "BRK-B"];
        }
    };

    this.redraw = function () {
        redraw();
    };

    this.hideLinePath = function () {
        chartObject.hideLinePath();
    };
    
    this.hideLinePathForHeavyCharts = function(){
        if (selectedView == ToolBarUltimate.VIEWS.Indicator && overlayObjects.length + extraChartsParams.length > 0){
            chartObject.hideLinePath();
        }
    };

    this.restoreLinePath = function () {
        chartObject.restoreLinePath();
    };

    this.resetChartTypeAndRedraw = function(isCandleInput){
        resetChartTypeAndRedraw(isCandleInput);
    };

    this.redrawChartByVolumeVisibility = function(){
        redrawChartByVolumeVisibility();
    };


    /***Inner Public Function***/
    this.updateParamsAndRedraw = function () {
        updateParamsAndRedraw();
    };

    this.updateParamsAndFetchData = function () {
        updateParamsAndFetchData();
    };

    this.clearAllCompare = function () {
        symbolList = [mainSymbol];
        dataLists = [dataLists[0]];

        updateParamsAndRedraw();
    };

    this.getIsActive = function () {
        var isActive = (cardData.view == SimpleView.VIEWS.STUDY);
        return isActive;
    };

    this.getMainSymbol = function () {
        return mainSymbol;
    };

    //Call after server call
    this.setData = function (dataListsInput) {
        dataLists = dataListsInput;
        updateDrawData();
    };

    this.setIsZoomState = function (isZoomState) {
        chartObject.setIsZoomState(isZoomState, zoomUtil.getIsLeftButtonVisible(), zoomUtil.getIsRightButtonVisible());

        if (isZoomState) {
            rangeObject.applyZoomShadow();
        } else {
            rangeObject.removeZoomShadow();
        }
    };

    this.setIsMiddleOfZoom = function (boolean) {
        chartObject.setIsMiddleOfZoom(boolean);
    };

    this.drawProperChart = function () {
        drawProperChart();
    };

    this.hideTips = function () {

    };

    this.positionIndicatorTips = function (trackStartIndex, isAreaCovered, trackEndIndex) {

    };

    this.clearState = function () {
        chartObject.clearState();
    };

    this.zoomToArea = function (trackStartIndex, trackEndIndex) {
        zoomUtil.zoomToArea(trackStartIndex, trackEndIndex);
    };

    this.cancelZoom = function () {
        zoomUtil.cancelZoom();
    };

    this.shiftTimeLine = function (shiftAmount) {
        zoomUtil.shiftTimeLine(shiftAmount);
    };

    this.shiftPage = function (shiftDirection) {
        zoomUtil.shiftPage(shiftDirection);
    };

    /**Construction*****/
    function drawComponent() {
        construct();

        if (!dataLists || !getIsMiddleOfCardActionGlobal()){
            updateParamsAndFetchData();
        }


        redraw();
    }

    function construct() {
        dataManager.setPapa(me);
        clearSlate(externalDiv);
        calculateLayout();

        chartArea = externalDiv.append("div")
            .style({
                position: "absolute",
                top: CHART_TOP + "px",
                bottom: chartBottom + "px",
                left: 0,
                right: chartRight + "px"
            });
        chartObject.setExternalDiv(chartArea.node());

        rangeSelectorArea = externalDiv.append("div")
            .style({
                position: "absolute",
                bottom: 0 + "px",
                right: 0
            });

        if (isRangeOnRight) {
            rangeSelectorArea.style({
                bottom: 22 + "px",
                width: 30 + "px"
            });
        } else {
            rangeSelectorArea.style({
                height: RANGE_SECTION_HEIGHT + "px",
                left: 0
            });
        }

        rangeObject.setPapa(me);
        rangeObject.setIsOnRight(isRangeOnRight);
        rangeObject.setExternalDiv(rangeSelectorArea);
        rangeObject.drawComponent();
        zoomUtil.setPapaChart(me, chartArea);

        topAreaDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 1 + "px",
                height: DATA_SELECTOR_HEIGHT + "px",
                visibility: "hidden",
                opacity: 0.8,
                left: 0,
                right: 0
            })
            .on("mouseenter", onTopMouseEnter)
            .on("mouseleave", onTopMouseLeave);
        topBarObject.setPapa(me);
        topBarObject.setExternalDiv(topAreaDiv);
        topBarObject.drawComponent();

        chartTypeButtonsArea = externalDiv.append("div")
            .style({
                position: "absolute",
                bottom: chartBottom + "px",
                height: CHART_BUTTON_HEIGHT + "px",
                left: 0,
                right: 0
            })
            .attr("name", "chartTypeButtonsArea")
            .on(ChartButtonsComponent.CHART_TYPE_SELECTED_EVENT, onChartTypeSelected);

        chartTypeButtons.setExternalDiv(chartTypeButtonsArea);
        chartTypeButtons.setButtonHeight(CHART_BUTTON_HEIGHT);
        chartTypeButtons.setIsCandleSelected(isCandle);
        chartTypeButtons.drawComponent();

        resetChartTypeButtonVisibility();
    }

    /**Draw**/
    function showTopBar() {
        topAreaDiv.style("visibility", "visible");
    }

    /**Params***/
    function updateParamsAndFetchData() {
        updateParams();
        dataManager.fetchAllData();
    }

    function updateParamsAndRedraw() {
        updateParams();
        updateDrawData();
        drawProperChart();
    }

    function updateParams() {
        selectedView = topBarObject.getSelectedView();
        rangeStr = rangeObject.getSelectedRangeStr();

        if (selectedView == ToolBarUltimate.VIEWS.Compare) {
            updateByCompare();
        } else {
            updateByIndicator();
        }
        dataManager.setParams(symbolList, rangeStr);

        resetChartTypeButtonVisibility();
    }

    function updateByIndicator() {
        symbolList = [mainSymbol];
        overlayParams = topBarObject.getOverlayParams();
        extraChartsParams = topBarObject.getExtraChartsParams();
    }

    function updateByCompare() {
        var compareSymbols = topBarObject.getCompareSymbols();
        var compareColors = topBarObject.getActiveColors();

        symbolList = [mainSymbol];
        symbolList = symbolList.concat(compareSymbols);
        var colors = [MAIN_LINE_COLOR];
        colors = colors.concat(compareColors);

        chartObject.setColors(colors);
    }

    /**Data****/
    function updateDrawData() {
        if (selectedView == ToolBarUltimate.VIEWS.Indicator) {
            calculateOverlayIndicatorData(overlayParams);
            calculateExtraChartIndicatorData(extraChartsParams);
        }
        if (selectedView == ToolBarUltimate.VIEWS.Profit){
            profitDataList = dataManager.getProfitDataList(mainSymbol, dataLists[0]);
            zoomUtil.setData(profitDataList, [profitDataList], [], []);
        }else{
            zoomUtil.setData(dataLists[0], dataLists, overlayObjects, extraChartObjects);
        }
    }

    function calculateOverlayIndicatorData(overlayParams) {
        overlayObjects = [];
        var currentDataList;
        var param;
        var overlayDataObj;
        var overlayDataLists;
        for (var i = 0; i < overlayParams.length; i++) {
            param = overlayParams[i];
            currentDataList = indicatorsUtil.produceIndicator(dataLists[0], param.type, param.period, param.stdev);
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

    function calculateExtraChartIndicatorData(extraChartParams) {
        extraChartObjects = [];
        var extraChartDataObj;
        for (var i = 0; i < extraChartParams.length; i++) {
            extraChartDataObj = indicatorsUtil.produceExtraChartIndicatorObject(dataLists[0], extraChartParams[i]);
            extraChartObjects.push(extraChartDataObj);
        }
    }

    /**Draw*****/
    function redraw() {
        if (dataLists) {
            drawProperChart();
        }
    }

    function drawProfitChart(){
        if (SymbolToUserData[mainSymbol].qty > 0){
            chartObject.setIsBarChart(true);
            var mainDataList = zoomUtil.getVisibleMainList();

            chartObject.setIsPastPage(zoomUtil.getIsPastPage());
            chartObject.setAsZoomable(me, true);
            chartObject.setExternalDiv(chartArea.node());
            chartObject.setIsCandleChart(false);
            chartObject.setIsShowVolume(false);

            chartObject.setData(mainDataList, rangeStr, symbolList[0]);
            chartObject.setBaseLineValue(0);
            chartObject.setDataSecondary([], undefined);

            chartObject.drawComponent();

            chartObject.setIsZoomState(zoomUtil.getIsZoomState(), zoomUtil.getIsLeftButtonVisible(), zoomUtil.getIsRightButtonVisible());
        }else{
            drawNoHoldingsMessage();
        }
    }

    function drawRegularChart() {
        chartObject.setIsBarChart(false);
        chartObject.setIsShowVolume(UserDBData.isShowVolume);
        var mainDataList = zoomUtil.getVisibleMainList();
        zoomUtil.trimIndicators();

        chartObject.setIsPastPage(zoomUtil.getIsPastPage());
        chartObject.setAsZoomable(me, true);
        chartObject.setExternalDiv(chartArea.node());
        chartObject.setIsCandleChart(isCandle);

        chartObject.setData(mainDataList, rangeStr, symbolList[0]);
        chartObject.setDataSecondary([], undefined);

        chartObject.drawChartWithIndicators(overlayObjects, extraChartObjects);

        chartObject.setIsZoomState(zoomUtil.getIsZoomState(), zoomUtil.getIsLeftButtonVisible(), zoomUtil.getIsRightButtonVisible());
        //chartTypeButtonsArea.style("display", "");
    }

    function drawComparableChart() {
        chartObject.setIsBarChart(false);

        var mainDataList = zoomUtil.getVisibleMainList();
        var compareLists = zoomUtil.getVisibleCompareLists();

        chartObject.setIsPastPage(zoomUtil.getIsPastPage());

        chartObject.setPapaChart(me);
        chartObject.setExternalDiv(chartArea.node());

        chartObject.setData(mainDataList, rangeStr, symbolList[0]);
        chartObject.setAllSecondaryData(compareLists, symbolList);

        chartObject.drawComponent();

        chartObject.setIsZoomState(zoomUtil.getIsZoomState(), zoomUtil.getIsLeftButtonVisible(), zoomUtil.getIsRightButtonVisible());
        //chartTypeButtonsArea.style("display", "none");
    }

    function drawProperChart() {
        showTopBar();

        switch (selectedView) {
            case ToolBarUltimate.VIEWS.Indicator:
                drawRegularChart();
                break;
            case ToolBarUltimate.VIEWS.Compare:
                drawComparableChart();
                break;
            case ToolBarUltimate.VIEWS.Profit:
                drawProfitChart();
                break;
        }
    }

    function drawNoHoldingsMessage(){
        clearSlate(chartArea);
        chartArea.append("p")
            .style({
                width: "100%",
                "text-align": "center",
                margin: 0,
                "margin-top": 40 + "px"
            })
            .text("No holdings yet.");

        chartArea.append("p")
            .style({
                width: "100%",
                "text-align": "center",
                "margin-top": 5 + "px",
                margin: 0
            })
            .text("Please click pencil icon to set portfolio data.");

    }

    /***Drawing Updates***/
    function  resetChartTypeAndRedraw(isCandleInput){
        isCandle = isCandleInput;
        chartTypeButtons.setIsCandleSelected(isCandle);
        chartTypeButtons.drawComponent();
        if (selectedView == ToolBarUltimate.VIEWS.Indicator){
            drawProperChart();
        }
    }

    function redrawChartByVolumeVisibility(){
        if (selectedView == ToolBarUltimate.VIEWS.Indicator){
            drawRegularChart();
        }
    }

    /**Layout calculation***/
    function calculateLayout() {
        if (cardData.height == 1 && cardData.width > 1) {
            isRangeOnRight = true;
            chartBottom = 0;
            chartRight = CHART_RIGHT;
        } else {
            isRangeOnRight = false;
            chartBottom = CHART_BOTTOM;
            chartRight = 0;
        }
    }

    /***UI State***/
    function resetChartTypeButtonVisibility() {
        if (selectedView != ToolBarUltimate.VIEWS.Indicator) {
            chartTypeButtonsArea.style("display", "none");
        } else {
            chartTypeButtonsArea.style("display", "");
        }
    }

    /***Event Listener***/
    function onTopMouseEnter() {
        topAreaDiv.style("opacity", 1);
    }

    function onTopMouseLeave() {
        topAreaDiv.style("opacity", 0.8);
    }

    function onChartTypeSelected() {
        isCandle = d3.event.detail.data;
        drawProperChart();
    }

}