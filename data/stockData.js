/**
 * Created by avitzur on 11/16/2015.
 */
function StockData() {
    var me = this;

    //Public properties
    me.symbol;
    me.date;
    me.value;
    me.open;
    me.high;
    me.low;
    me.volume;
    me.prevClose;

    me.isCurrency;
    me.intraDayData = []; //This is of 5 days
    me.dailyData = [];
    me.monthlyData = [];   //Sometimes the API returns weekly instead
    me.quarterlyData = []; //Sometimes the API returns weekly/monthly instead
    me.todayData = []; //Only today, based on intraDayData

    //Session state
    me.prevChangePercentage;

    /**Setters***/
    me.setIntraDayData = function (dataArray) {
        me.intraDayData = dataArray;

        setCurrentDataBasedOnIntraDay(me);
    };

    me.setValue = function (valueInput) {
        me.prevChangePercentage = me.getChangePercentage();
        if (valueInput != me.value) {
            me.value = valueInput;
        }
    };

    //Make sure there are no more blinks of value change on the screen
    me.alignPrevChange = function () {
        me.prevChangePercentage = me.getChangePercentage();
    };

    /**Getters***/
    me.getChange = function () {
        return me.value - me.prevClose
    };

    me.getChangePercentage = function () {
        var retResult;
        if (me.prevClose) {
            retResult = (me.getChange() / me.prevClose) * 100;
        } else {
            retResult = 0;
        }
        return retResult;
    };

    me.getPrevChangePercentage = function () {
        return me.prevChangePercentage;
    };

    me.getTotalValue = function () {
        var userData = getUserDataBySymbolGlobal(me.symbol);
        return me.value * userData.qty;
    };

    me.getYesterdayTotalValue = function () {
        var userData = getUserDataBySymbolGlobal(me.symbol);
        return me.prevClose * userData.qty;
    };

    me.getOriginalTotalValue = function () {
        var userData = getUserDataBySymbolGlobal(me.symbol);
        return userData.cost * userData.qty;
    };

    me.getTotalGain = function () {
        return me.getTotalValue() - me.getOriginalTotalValue();
    };

    me.getTotalGainPercentage = function () {
        var retResult;
        if (me.getOriginalTotalValue()) {
            retResult = (me.getTotalGain() / me.getOriginalTotalValue()) * 100;
        } else {
            retResult = 0;
        }
        return retResult;
    };
}


/**Static functions**/
StockData.getIsWeekly = function (dataList) {
    var isIt = false;
    if (dataList && dataList.length > 2) {
        var distance = dataList[2].date.getTime() - dataList[1].date.getTime();
        isIt = (distance > DAY_TIME_STAMP * 5 && distance < DAY_TIME_STAMP * 12);
    }
    return isIt;
};

StockData.getIsMonthly = function (dataList) {
    var isIt = false;
    if (dataList.length > 2) {
        var distance = dataList[2].date.getTime() - dataList[1].date.getTime();
        isIt = (distance > DAY_TIME_STAMP * 12 && distance < DAY_TIME_STAMP * 40);
    }
    return isIt;
};

/**Global Data**/
function HistoryDataPoint(date, close, open, high, low, volume, holdingsChange, holdingsValue) {
    var me = this;

    //Public properties
    me.date = date;
    me.close = close;
    me.open = open;
    me.high = high;
    me.low = low;
    me.volume = volume;

    me.holdingsChange = holdingsChange; //This is for profit bar chart. 
    me.holdingsValue = holdingsValue;
}

StockData.NUMBER_OF_POINTS_IN_A_DAY = 29;
StockData.DAILY_DATA_INTERVAL = 1000 * 60 * 15;
StockData.NUMBER_OF_POINTS_IN_A_DAY_CURRENCY = 41;

StockData.getNumberOfPointsInADay = function (symbol) {
    var isCurrency = getIsCurrency(symbol);
    var pointNum = StockData.NUMBER_OF_POINTS_IN_A_DAY;
    if (isCurrency) {
        pointNum = StockData.NUMBER_OF_POINTS_IN_A_DAY_CURRENCY;
    }
    return pointNum;
};

StockData.prototype.getIsDoneAllCallsForToday = function () {
    var stockData = this;
    var isCurrency = getIsCurrency(stockData.symbol);
    var isDone;


    var todayData = stockData.todayData;

    if (todayData.length > 0) {
        var startTime = todayData[0].date.getTime();
        //Some times the market closes ahead of time, so this is the way to prevent too many calls many hours later.
        var maxPointsCount = StockData.getNumberOfPointsInADay(stockData.symbol);
        var endTime = startTime + (maxPointsCount - 1) * StockData.DAILY_DATA_INTERVAL;
        var nowTime = new Date().getTime();
        if (!isCurrency) {
            isDone = (nowTime > endTime);
            if (!isDone) {
                isDone = (todayData.length == maxPointsCount);
            }
        } else {
            isDone = (nowTime - startTime >= DAY_TIME_STAMP);
        }
    }


    return isDone;
};

HistoryDataPoint.prototype.clone = function(){
    var cloneObj = new HistoryDataPoint(this.date, this.close, this.open, this.high, this.low, this.volume, this.holdingsChange, this.holdingsValue);
    return cloneObj;
};