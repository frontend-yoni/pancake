/**
 * Created by yoni_ on 1/29/2016.
 */
function DrillDataManager() {
    var me = this;
    /**Timer****/
    var RealTimeFetchHistoryTimer;
    var RealTimeFetchCurrentTimer;
    var IsRealTimeFetchTimerActive;

    /**Constants****/
    var CURRENT_DATA_REFRESH_INTERVAL = 1000 * 10;
    var HISTORIC_DATA_REFRESH_INTERVAL = 5 * CURRENT_DATA_REFRESH_INTERVAL;

    /***Externally set****/
    //Component
    var papaWindow;
    var drillChart;
    //Data
    var stockData;

    /***Internally Set***/
    //Utils
    var restAPIs = RestAPIs.getInstance();
    //Data
    var mainHistoryDataList;
    var compareHistoryDataList;
    //State
    var periodicity;


    /**Public functions****/
    this.setStockData = function (stockDataInput) {
        stockData = stockDataInput;
        stopRealTimeDataRefresh();
        activateRealTimeFetchTimer();
    };

    this.setExternalComponents = function (papaWindowInput, chart) {
        papaWindow = papaWindowInput;
        drillChart = chart;
    };

    /**Timer Functions***/
    function stopRealTimeDataRefresh() {
        /*if (IsRealTimeFetchTimerActive) {
            clearInterval(RealTimeFetchHistoryTimer);
            clearInterval(RealTimeFetchCurrentTimer);
            IsRealTimeFetchTimerActive = false;
        }*/
    }

    function activateRealTimeFetchTimer() {
        /*if (!IsRealTimeFetchTimerActive) {
            clearInterval(RealTimeFetchHistoryTimer);
            clearInterval(RealTimeFetchCurrentTimer);
            RealTimeFetchHistoryTimer = setInterval(fetchHistoryData, HISTORIC_DATA_REFRESH_INTERVAL);
            RealTimeFetchCurrentTimer = setInterval(fetchCurrentData, CURRENT_DATA_REFRESH_INTERVAL);
            IsRealTimeFetchTimerActive = true;
        }*/
    }

    /**Data calls***/
    function fetchHistoryData() {
        periodicity = drillChart.getPeriodicity();
        restAPIs.getHistoryDataForDrill(stockData.symbol, periodicity, respondToHistoryDataFetch);
    }

    function fetchCompareData() {
        var compareSymbol = drillChart.getCompareSymbol();
        restAPIs.getDrillHistoryDataToCompare(compareSymbol, periodicity, mainHistoryDataList, respondToCompareDataFetch);
    }

    function fetchCurrentData() {
        papaWindow.refetchStats();
    }

    /**Data received****/
    function respondToHistoryDataFetch(dataList, dataSymbol) {
        if (stockData.symbol == dataSymbol && periodicity == drillChart.getPeriodicity()) {
            var isMarketClosed = checkIfGotAllData(mainHistoryDataList, dataList);
            if (!isMarketClosed) {
                mainHistoryDataList = dataList;
                tryToDraw();
            } else {
                stopRealTimeDataRefresh();
            }
        }

        //Inner function
        function tryToDraw() {
            if (drillChart.getCompareSymbol()) {
                fetchCompareData();
            } else {
                redrawChart();
            }
        }
    }


    function respondToCompareDataFetch(dataList, dataSymbol) {
        if (drillChart.getCompareSymbol() == dataSymbol  && periodicity == drillChart.getPeriodicity()) {
            compareHistoryDataList = dataList;
            redrawChart();
        }
    }

    function redrawChart() {
        drillChart.redrawByRealTimeDataRefresh(mainHistoryDataList, compareHistoryDataList);
    }

    /***Data processing***/
    function checkIfGotAllData(prevDataList, newDataList) {
        var isDone;
        if (!prevDataList || prevDataList.length == 0) {
            isDone = false;
        } else {
            isDone = stockData.getIsDoneAllCallsForToday();
        }
        return isDone;
    }
}