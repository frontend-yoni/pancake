/**
 * Created by avitzur on 12/31/2015.
 */
function DrillChartArea() {
    var me = this;
    /**CONSTANTS***/
    var DEFAULT_PERIODICITY = PERIODICITY.INTRA_DAY;
    var TOP_AREA_HEIGHT = 20;
    var PAD_FROM_TOP_AREA = 3;
    /**Externally Set***/
    //Structure
    var externalDiv;
    //Data
    var symbol;
    //State
    var isReadyToDraw;

    /**Internally Set***/
    //Structure
    var topAreaDiv;
    var chartDiv;
    //Data

    //State
    var periodicity = DEFAULT_PERIODICITY;
    var isCandleChart;
    var compareSymbol;
    //Data
    var historyDataList;
    //(Compare)
    var historyDataListSecondary;
    //Utils
    var topActionBar = new DrillChartTop();
    var chartComponent = new ZoomableChart();
    var restAPIs = RestAPIs.getInstance();

    /**Public Function**/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.setSymbolAndDraw = function (symbolInput) {
        symbol = symbolInput;
        topActionBar.setMainSymbol(symbol);
        fetchDataAndDrawUltimate();
    };

    this.firstCall = function (symbolInput) {
        clearSlate(chartDiv);
        symbol = symbolInput;

        isReadyToDraw = false;
        compareSymbol = undefined;
        periodicity = DEFAULT_PERIODICITY;
        isCandleChart = true;

        topActionBar.firstCall(symbol);
        fetchDataAndRedraw();
    };

    this.respondToReadyToDraw = function () {
        isReadyToDraw = true;
        tryToDrawChart();
    };

    this.setIsCandleAndRedraw = function (boolean) {
        isCandleChart = boolean;
        chartComponent.setIsCandleAndRedraw(isCandleChart);
    };

    this.fetchDataAndDrawUltimate = function () {
        fetchDataAndDrawUltimate();
    };

    this.fetchDataAndRedraw = function () {
        fetchDataAndRedraw();
    };

    this.drawComponent = function () {
        performConstruct();
    };

    this.cleaSlate = function () {
        clearSlate(chartDiv);
    };

    this.respondToCompareSelection = function () {
        respondToCompareSelection()
    };

    this.showIndicator = function (overlayIndicatorsParams, extraChartsIndicatorsParams) {
        chartComponent.showIndicator(overlayIndicatorsParams, extraChartsIndicatorsParams);
    };

    this.hideIndicator = function () {
        chartComponent.hideIndicator();
    };

    this.cancelZoom = function () {
        chartComponent.cancelZoom();
    };

    this.redrawByRealTimeDataRefresh = function (dataList1, dataList2) {
        redrawByRealTimeDataRefresh(dataList1, dataList2);
    };

    this.getCompareSymbol = function () {
        return topActionBar.getCompareSymbol();
    };

    this.getPeriodicity = function () {
        return topActionBar.getPeriodicity();
    };

    /***Construct***/
    function performConstruct() {
        clearSlate(externalDiv);

        topAreaDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                height: TOP_AREA_HEIGHT + "px",
                left: 0,
                right: 0
            });

        topActionBar.setExternalDiv(topAreaDiv);
        topActionBar.setPapa(me);
        topActionBar.drawComponent();

        chartDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: TOP_AREA_HEIGHT + PAD_FROM_TOP_AREA + "px",
                bottom: 0 + "px",
                left: 0,
                right: 0
            })
            .attr("name", "DrillChart");

    }

    function drawChart() {
        var range = getRangeByPeriodicity();

        chartComponent.setToolBar(topActionBar);
        chartComponent.setExternalDiv(chartDiv.node());
        chartComponent.setIsCandleChart(isCandleChart);
        chartComponent.setData(historyDataList, range, symbol);
        chartComponent.setDataSecondary([], undefined);
        chartComponent.drawComponent();
    }

    function drawComparableChart() {
        var range = getRangeByPeriodicity();

        chartComponent.setData(historyDataList, range, symbol);
        chartComponent.setDataSecondary(historyDataListSecondary, compareSymbol);
        chartComponent.drawComponent();
    }

    function redrawByRealTimeDataRefresh(dataList1, dataList2) {
        historyDataList = dataList1;
        historyDataListSecondary = dataList2;
        chartComponent.updateByLiveData(historyDataList, historyDataListSecondary);
    }

    /***Fetch data and draw****/
    function fetchDataAndRedraw() {
        historyDataList = undefined;
        periodicity = topActionBar.getPeriodicity();
        restAPIs.getHistoryDataForDrill(symbol, periodicity, onDataFetched);
    }

    function fetchCompareDataAndRedraw() {
        historyDataListSecondary = undefined;
        periodicity = topActionBar.getPeriodicity();
        compareSymbol = topActionBar.getCompareSymbol();
        if (compareSymbol) {
            restAPIs.getDrillHistoryDataToCompare(compareSymbol, periodicity, historyDataList, onCompareDataFetched);
        } else if (historyDataList) {
            drawChart();
        }
    }

    function alignPeriodicityForCompareAndRetry() {
        var mainPeriodicity = getActualPeriodicityForDrill(periodicity, historyDataList);
        var secondaryPeriodicity = getActualPeriodicityForDrill(periodicity, historyDataListSecondary);
        var commonPeriodicity = iMath.min(mainPeriodicity, secondaryPeriodicity);

        topActionBar.setPeriodicityManually(commonPeriodicity);
        fetchDataAndDrawUltimate();
    }

    function fetchDataAndDrawUltimate() {
        historyDataList = undefined;
        historyDataListSecondary = undefined;
        periodicity = topActionBar.getPeriodicity();
        compareSymbol = topActionBar.getCompareSymbol();

        restAPIs.getHistoryDataForDrill(symbol, periodicity, onDataFetched);
        if (compareSymbol) {
            restAPIs.getHistoryDataForDrill(compareSymbol, periodicity, onCompareDataFetched);
        }
    }

    function onDataFetched(dataList) {
        historyDataList = dataList;
        tryToDrawChart();
    }

    function onCompareDataFetched(dataList) {
        historyDataListSecondary = dataList;
        tryToDrawChart();
    }

    function tryToDrawChart() {
        if (isReadyToDraw) {
            if (!compareSymbol && historyDataList) {
                drawChart();
            }
            if (compareSymbol && historyDataList && historyDataListSecondary) {
                var canCompare = checkIfGotAllDataToCompare();
                if (canCompare) {
                    drawComparableChart();
                } else {
                    alignPeriodicityForCompareAndRetry();
                }
            }
        }
    }

    //Only draw the compare chart if the secondary (index) data has the same periodicity
    //Otherwise recall to get data by the correct periodicity
    function checkIfGotAllDataToCompare() {
        var mainPeriodicity = getActualPeriodicityForDrill(periodicity, historyDataList);
        var secondaryPeriodicity = getActualPeriodicityForDrill(periodicity, historyDataListSecondary);

        var isIt = (mainPeriodicity == secondaryPeriodicity);
        return isIt;
    }

    /**Respond to changes***/
    function respondToCompareSelection() {
        fetchCompareDataAndRedraw();
    }

    /****State related calculations****/
    function getRangeByPeriodicity() {
        var retRange = RestAPIs.TIME_RANGE.D5;
        switch (periodicity) {
            case PERIODICITY.DAILY:
                retRange = RestAPIs.TIME_RANGE.Y1;
                break;
            case PERIODICITY.WEEKLY:
            case PERIODICITY.MONTHLY:
                retRange = RestAPIs.TIME_RANGE.Y5;
                break;
            case PERIODICITY.QUARTERLY:
                retRange = RestAPIs.TIME_RANGE.MAX;
                break;
        }

        return retRange;
    }
}