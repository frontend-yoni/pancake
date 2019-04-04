/**
 * Created by yoni_ on 2/19/2016.
 */
function UltimateChartDataManager() {
    /**CONSTANTS***/
    var REFRESH_INTERVAL = 1000 * 50;
    /**Timer****/
    var RealTimeFetchHistoryTimer;
    var IsRealTimeFetchTimerActive;

    /**Externally set***/
    //Params
    var symbolList;
    var rangeStr;
    var indicatorParams;
    //Util
    var chartPapa;

    /**Internally set***/
    //Data
    var symbolToDataList;
    var dataLists;

    //State

    //Util
    var restAPIs = new RestAPIs();


    /**Public Functions***/
    this.setPapa = function (chartInput) {
        chartPapa = chartInput;
    };

    this.setParams = function (symbolListInput, rangeInput, indicatorParamsInput) {
        symbolList = symbolListInput;
        rangeStr = rangeInput;
        indicatorParams = indicatorParamsInput;

        symbolToDataList = {};
        stopRealTimeDataRefresh();
        activateRealTimeFetchTimer();
    };

    this.getProfitDataList = function (symbol, originalDataList) {
        return getProfitDataList(symbol, originalDataList);
    };

    this.fetchAllData = function () {
        fetchAllData();
    };

    /**Server Calls***/
    function fetchAllData() {
        symbolToDataList = {};
        for (var i = 0; i < symbolList.length; i++) {
            restAPIs.getHistoryByYahooRangeStr(symbolList[i], rangeStr, onDataFetched);
        }
    }

    function onDataFetched(dataList, symbol) {
        symbolToDataList[symbol] = dataList;
        var gotAll = hasRetrievedAllData();
        if (gotAll) {
            calculateDataLists();
            stopTimeIfNeeded();
            drawChart();
        }
    }

    function onDataFetchedForPeriodicalCall(dataList, symbol) {
        if (!getIsMiddleOfCardActionGlobal()) {
            onDataFetched(dataList, symbol);
        }
    }

    function drawChart() {
        chartPapa.setData(dataLists);
        chartPapa.drawProperChart();
    }

    /***Validation function***/
    function hasRetrievedAllData() {
        var symbol;
        var hasIt = true;
        for (var i = 0; i < symbolList.length; i++) {
            symbol = symbolList[i];
            hasIt = hasIt && symbolToDataList[symbol];
        }
        return hasIt;
    }

    /**Timer Functions***/
    function stopTimeIfNeeded() {
        var isMarketClosed = checkIfGotAllData();
        var isChartActive = chartPapa.getIsActive();
        if (!isChartActive || isMarketClosed) {
            stopRealTimeDataRefresh();
        }
    }

    function stopRealTimeDataRefresh() {
        // if (IsRealTimeFetchTimerActive) {
        //     clearInterval(RealTimeFetchHistoryTimer);
        //     IsRealTimeFetchTimerActive = false;
        // }
    }

    function activateRealTimeFetchTimer() {
        // if (!IsRealTimeFetchTimerActive) {
        //     clearInterval(RealTimeFetchHistoryTimer);
        //     RealTimeFetchHistoryTimer = setInterval(fetchAllDataPeriodicalCall, REFRESH_INTERVAL);
        //     IsRealTimeFetchTimerActive = true;
        // }
    }

    function fetchAllDataPeriodicalCall() {
        symbolToDataList = {};
        for (var i = 0; i < symbolList.length; i++) {
            restAPIs.getHistoryByYahooRangeStr(symbolList[i], rangeStr, onDataFetchedForPeriodicalCall);
        }
    }

    /***Data processing***/
    function checkIfGotAllData() {
        var isDone;
        var stockData = getStockDataBySymbolGlobal(symbolList[0]);
        isDone = stockData.getIsDoneAllCallsForToday();
        return isDone;
    }

    function calculateDataLists() {
        dataLists = [];
        var symbol;
        for (var i = 0; i < symbolList.length; i++) {
            symbol = symbolList[i];
            dataLists.push(symbolToDataList[symbol]);
        }
    }

    //Every period show the gain in within that period
    function getProfitDataList(symbol, originalDataList) {
        var profitList = [];
        var userData = SymbolToUserData[symbol];
        var cost = userData.cost;
        var qty = userData.qty;
        var initialValue = cost * qty;
        var dataPoint;
        for (var i = 0; i < originalDataList.length; i++) {
            dataPoint = createProfitDataPoint(initialValue, qty, originalDataList[i]);
            profitList.push(dataPoint);
        }

        return profitList;
    }

    function createProfitDataPoint(initialValue, qty, stockDataPoint) {
        var profitData = new HistoryDataPoint();
        profitData.date = stockDataPoint.date;


        var currentValue = (qty * stockDataPoint.close);
        var currentProfit = currentValue - initialValue;
        profitData.close = currentProfit;
        profitData.high = profitData.close;
        profitData.low = profitData.close;
        profitData.open = profitData.close;

        profitData.holdingsValue = currentValue;
        profitData.holdingsChange = (currentProfit / initialValue) * 100;
        return profitData;
    }
}