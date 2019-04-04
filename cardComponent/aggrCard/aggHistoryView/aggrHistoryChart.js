/**
 * Created by avitzur on 4/24/2016.
 */
function AggrHistoryChart() {
    var me = this;
    /***CONSTANTS***/

    /***Externally Set****/
    //Structure
    var externalDiv;
    //Util
    var papaComponent;

    /***Internally Set****/
    //Data
    var aggrHistoryData;
    //State
    var isZoomState;
    //Component
    var barChart = new LineChartPure();
    //Util
    var dataManager = AggrDataManager.getInstance();
    var zoomUtil = new ZoomUtil();

    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.redraw = function () {
        redraw();
    };

    this.setPapaComponent = function (papaComponentI) {
        papaComponent = papaComponentI;
    };

    /***Inner Public Functions***/
    this.zoomToArea = function (trackStartIndex, trackEndIndex) {
        zoomUtil.zoomToArea(trackStartIndex, trackEndIndex);
    };

    this.cancelZoom = function () {
        if (isZoomState) {
            zoomUtil.cancelZoom();
            drawComponent();
        }
    };

    this.shiftTimeLine = function (shiftAmount) {
        zoomUtil.shiftTimeLine(shiftAmount);
    };

    this.shiftPage = function (shiftDirection) {
        zoomUtil.shiftPage(shiftDirection);
    };

    this.setIsZoomState = function (isZoomStateI) {
        isZoomState = isZoomStateI;
        barChart.setIsZoomState(isZoomState, zoomUtil.getIsLeftButtonVisible(), zoomUtil.getIsRightButtonVisible());
    };

    this.setIsMiddleOfZoom = function (boolean) {
        barChart.setIsMiddleOfZoom(boolean);
    };

    this.clearState = function () {
        barChart.clearState();
    };

    this.hideTips = function () {

    };

    this.positionIndicatorTips = function (trackStartIndex, isAreaCovered, trackEndIndex) {

    };

    this.drawProperChart = function () {
        drawComponent();
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        if (dataManager.getHasAllData()) {
            zoomUtil.setPapaChart(me, externalDiv);
            prepData();


            var mainDataList = zoomUtil.getVisibleMainList();

            barChart.setIsBarChart(true);

            barChart.setIsPastPage(zoomUtil.getIsPastPage());
            barChart.setAsZoomable(me, true);
            barChart.setExternalDiv(externalDiv.node());
            barChart.setIsCandleChart(false);
            barChart.setIsShowVolume(false);

            barChart.setData(mainDataList, RestAPIs.TIME_RANGE.Y1, "");
            barChart.setBaseLineValue(0);
            barChart.setDataSecondary([], undefined);

            barChart.drawComponent();

            barChart.setIsZoomState(zoomUtil.getIsZoomState(), zoomUtil.getIsLeftButtonVisible(), zoomUtil.getIsRightButtonVisible());
        } else {
            dataManager.getHistoryDataIfNeeded();
        }
    }

    /**Draw*****/
    function redraw() {

    }

    /***Data Prep***/
    function prepData() {
        aggrHistoryData = [];

        var holdingsList = UserDBData.summary.orderedSymbolList;

        var symbol;
        var profitDataLists = [];
        var profitList;
        for (var i = 0; i < holdingsList.length; i++) {
            symbol = holdingsList[i];
            profitList = getProfitDataList(symbol, SymbolToData[symbol].dailyData);
            profitDataLists.push(profitList);
        }
        setCommonLengthByPadding(profitDataLists);

        var profitListsByDate = [];
        for (var i = 0; i < profitDataLists[0].length; i++) {
            profitListsByDate[i] = [];
            for (var j = 0; j < profitDataLists.length; j++) {
                profitListsByDate[i].push(profitDataLists[j][i]);
            }
        }

        var aggrDataPoint;
        for (var i = 0; i < profitListsByDate.length; i++) {
            aggrDataPoint = aggregateProfitPoints(profitListsByDate[i]);
            aggrHistoryData.push(aggrDataPoint);
        }

        zoomUtil.setData(aggrHistoryData, [aggrHistoryData], [], []);
    }

    function setCommonLengthByPadding(profitDataLists){
        var longestList = getLongestDataList(profitDataLists);
        for (var i = 0; i < profitDataLists.length; i++) {
            addPastPadding(longestList, profitDataLists, i);
        }
    }

    function getLongestDataList(profitDataLists) {
        var longestList;
        var maxLength = 0;
        var length;
        for (var i = 0; i < profitDataLists.length; i++) {
            length  = profitDataLists[i].length;
            if (length >= maxLength){
                maxLength = length;
                longestList = profitDataLists[i];
            }
        }
        return longestList;
    }

    function addPastPadding(longestList, profitDataLists, listIndex){
        var totalLength = longestList.length;
        var origList = profitDataLists[listIndex];
        var startValue = origList[0];
        var pastList = [];

        var dataPoint;
        for (var i = 0; i < totalLength - origList.length; i++) {
            dataPoint = startValue.clone();
            dataPoint.date = longestList[i].date;
            pastList.push(dataPoint);
        }

        profitDataLists[listIndex] = pastList.concat(origList);
    }


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

    function aggregateProfitPoints(profitPoints) {
        var totalProfit = 0;
        var totalValue = 0;
        var totalChange = 0;

        for (var i = 0; i < profitPoints.length; i++) {
            totalValue += profitPoints[i].holdingsValue;
            totalProfit += profitPoints[i].close;
        }
        var initialValue = totalValue - totalProfit;
        totalChange = (totalProfit / initialValue) * 100;

        //Create Object
        var profitData = new HistoryDataPoint();
        profitData.date = profitPoints[0].date;

        profitData.close = totalProfit;
        profitData.high = profitData.close;
        profitData.low = profitData.close;
        profitData.open = profitData.close;

        profitData.holdingsValue = totalValue;
        profitData.holdingsChange = totalChange;

        return profitData;
    }
}