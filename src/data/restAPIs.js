function RestAPIs() {
    //CONSTANTS
    var TIME_RANGE = RestAPIs.TIME_RANGE;

    /**Public functions***/
    this.getStocksHistoryData = function (symbol, range, callBack) {
        return getStocksHistoryData(symbol, range, callBack);
    };

    this.getStats = function (symbol, callBack, errorCallBack) {
        return getStats(symbol, callBack, errorCallBack);
    };

    this.getIndexHistoryDataToCompare = function (indexSymbol, range, mainDataList, callBack) {
        return getIndexHistoryDataToCompare(indexSymbol, range, mainDataList, callBack);
    };

    this.getNews = function (symbol, callBack) {
        return getNews(symbol, callBack);
    };

    this.saveUserData = function (userID, fullUserDBDataObject, callback) {
        return saveUserData(userID, fullUserDBDataObject, callback);
    };

    this.getUserData = function (userID, callback) {
        return getUserData(userID, callback);
    };

    this.logout = function (callback) {
        return logout(callback);
    };

    this.getHistoryDataForDrill = function (symbol, periodicity, callBack) {
        return getHistoryDataForDrill(symbol, periodicity, callBack);
    };

    this.getDrillHistoryDataToCompare = function (compareSymbol, periodicity, mainDataList, callBack) {
        return getDrillHistoryDataToCompare(compareSymbol, periodicity, mainDataList, callBack);
    };

    this.getHistoryByYahooRangeStr = function (symbol, rangeStr, callBack) {
        return getHistoryByYahooRangeStr(symbol, rangeStr, callBack);
    };

    this.updateStockDataWithProperMock = function(range, symbol){
        return updateStockDataWithProperMock(range, symbol);
    };

    /**Actual functions***/
    function getStocksHistoryData(symbol, range, callBack) {
        var rangeStr = getYahooRangeStr(range);
        var url = createURLBySymbolAndRange(symbol, rangeStr);
        yahooDataRestCall(url, callBack, range, symbol, rangeStr);
    }

    function getIndexHistoryDataToCompare(indexSymbol, range, mainDataList, callBack) {
        var rangeStr = getYahooRangeTextForComparableCall(range, mainDataList);
        var url = createURLBySymbolAndRange(indexSymbol, rangeStr);
        yahooDataRestCall(url, callBack, range, indexSymbol, rangeStr);
    }

    function getStats(symbol, callBack, errorCallBack) {
        yahooStatsRestCall(symbol, callBack, errorCallBack);
    }

    function getNews(symbol, callBack) {
        yahooNewsRestCall(symbol, callBack);
    }

    function yahooStatsRestCall(symbol, callBack, errorCallBack) {
        /*var url = createStatsURLBySymbolAndRange(symbol);

         $.ajax({
         url: url,
         dataType: "json",
         method: "GET",
         symbol: symbol,
         callBack: callBack,
         errorCallBack: errorCallBack,
         success: onSuccess,
         error: onError
         });*/

        function onSuccess() {
            var stats = setStatsBySymbolGlobal(symbol);
            callBack(stats, symbol);
        }

        requestAnimationFrame(onSuccess);

        /*function onError() {
         console.log("Error");
         if (this.errorCallBack) {
         this.errorCallBack();
         }
         }*/
    }

    function yahooNewsRestCall(symbol, callBack) {

        if (!callBack) {
            callBack = function (data) {
                console.log(JSON.stringify(data));
            }
        }
        function onSuccess() {
            var newsDataList = generateMockNews(symbol);
            callBack(newsDataList);
        }

        requestAnimationFrame(onSuccess);
    }

    function yahooDataRestCall(url, callBack, range, symbol, rangeStr) {
        /*var isIntraDay = getIsIntraDayRaneStr(rangeStr);
         $.ajax({
         url: url,
         dataType: "jsonp",
         callBack: callBack,
         range: range,
         symbol: symbol,
         isIntraDay: isIntraDay,
         success: onSuccess,
         error: onError
         });


         function onSuccess(data, status) {
         var timeRange = this.range;
         var stockData;
         if (this.isIntraDay) {
         stockData = getStockDataFromYahooObjectIntraDay(data, timeRange, this.symbol);
         updateCurrentDataByHistory(stockData);
         } else {
         stockData = getStockDataFromYahooObject(data, timeRange, this.symbol);
         }

         this.callBack(stockData);
         }

         function onError() {
         console.log("Error");
         }*/

        var stockData = updateStockDataWithProperMock(range, symbol);

        callBack(stockData);
    }

    function updateStockDataWithProperMock(range, symbol) {
        var dailyHistory = {};
        dailyHistory.series = generateFullYearDataPoints(symbol);
        var stockData = getStockDataFromYahooObject(dailyHistory, range, symbol);
        fillStockDataCurrentInfo(dailyHistory.series, stockData);
        setStatsBySymbolGlobal(symbol);

        if (range == TIME_RANGE.D1) {
            var minutesHistory = {};
            minutesHistory.series = generate5DaysDataPoints(symbol);
            stockData = getStockDataFromYahooObject(minutesHistory, range, symbol);
        }
        if (range == TIME_RANGE.D5) {
            var minutesHistory = {};
            minutesHistory.series = generateTrimmed5Days(symbol);
            stockData = getStockDataFromYahooObject(minutesHistory, range, symbol);
        }
        if (range == TIME_RANGE.Y5) {
            var monthsHistory = {};
            monthsHistory.series = generate5YearsDataPoints(symbol);
            stockData = getStockDataFromYahooObject(monthsHistory, range, symbol);
        }
        if (range == TIME_RANGE.MAX) {
            var quarterHistory = {};
            quarterHistory.series = generate40YearsDataPoints(symbol);
            stockData = getStockDataFromYahooObject(quarterHistory, range, symbol);
        }
        return stockData;
    }

    function saveUserData(userID, fullUserDBDataObject, callback) {
        if (!callback) {
            callback = function () {
            };
        }
        $.post('/saveUserState', {id: userID, state: fullUserDBDataObject}, function (data) {
            callback(data);
        });
    }

    function getUserData(userID, callback) {
        $.post('/getUserState', {id: userID}, function (data) {
            callback(data);
        });
    }

    function logout(callback) {
        $.get('/logout', function (data) {
            callback(data);
        });
    }

    //Inner Card Analyze
    function getHistoryByYahooRangeStr(symbol, rangeStr, callBack) {
        var url = createURLBySymbolAndRange(symbol, rangeStr);
        yahooDrillHistoryRestCall(url, callBack, symbol, rangeStr);
    }

    //Drill
    function getHistoryDataForDrill(symbol, periodicity, callBack) {
        var rangeStr = getYahooRangeTextForDrill(periodicity);
        var url = createURLBySymbolAndRange(symbol, rangeStr);
        yahooDrillHistoryRestCall(url, callBack, symbol, rangeStr);
    }

    function getDrillHistoryDataToCompare(compareSymbol, periodicity, mainDataList, callBack) {
        periodicity = getActualPeriodicityForDrill(periodicity, mainDataList);
        var rangeStr = getYahooRangeTextForDrill(periodicity);
        var url = createURLBySymbolAndRange(compareSymbol, rangeStr);
        yahooDrillHistoryRestCall(url, callBack, compareSymbol, rangeStr);
    }


    function yahooDrillHistoryRestCall(url, callBack, symbol, rangeStr) {
        var isIntraDay = getIsIntraDayRaneStr(rangeStr);
        /* $.ajax({
         url: url,
         dataType: "jsonp",
         callBack: callBack,
         symbol: symbol,
         isIntraDay: isIntraDay,
         success: onSuccess,
         error: onError
         });*/

        if (rangeStr == "5d") {
            var minutesHistory = {};
            minutesHistory.series = generateTrimmed5Days(symbol);
            onSuccess(minutesHistory);
        }
        if (rangeStr == "20d" || rangeStr == "30d") {
            var minutesHistory = {};
            minutesHistory.series = generateTrimmed20Days(symbol);
            onSuccess(minutesHistory);
        }
        if (rangeStr == "1y") {
            var minutesHistory = {};
            minutesHistory.series = generateFullYearDataPoints(symbol);
            onSuccess(minutesHistory);
        }
        if (rangeStr == "3y") {
            var minutesHistory = {};
            minutesHistory.series = generate3YearsDataPoints(symbol);
            onSuccess(minutesHistory);
        }

        if (rangeStr == "10y") {
            var minutesHistory = {};
            minutesHistory.series = generate10YearsDataPoints(symbol);
            onSuccess(minutesHistory);
        }

        if (rangeStr == "20y") {
            var minutesHistory = {};
            minutesHistory.series = generate20YearsDataPoints(symbol);
            onSuccess(minutesHistory);
        }

        if (rangeStr == "70y") {
            var minutesHistory = {};
            minutesHistory.series = generate40YearsDataPoints(symbol);
            onSuccess(minutesHistory);
        }


        function onSuccess(yahooObj) {
            var historyDataList;
            if (isIntraDay) {
                callBack(yahooObj.series, symbol);
            } else {
                historyDataList = convertYahooSeriesToHistoryData(yahooObj, symbol);
                var stockData = SymbolToData[symbol];

                if (stockData && stockData.value != undefined) {
                    addTodaysDataPointToHistoryChart(stockData, historyDataList);
                    callBack(historyDataList, symbol);
                } else {
                    addTodaysDataPointToCompareStock(symbol, historyDataList, callBack);
                }

            }
        }

        function onError() {
            console.log("Error");
        }
    }

    function getTodaysDataForCompareList(symbol, historyDataList, callBack) {
        var url = createURLBySymbolAndRange(symbol, "1d");
        $.ajax({
            url: url,
            dataType: "jsonp",
            callBack: callBack,
            symbol: symbol,
            historyDataList: historyDataList,
            success: onSuccess,
            error: onError
        });

        function onSuccess(yahooObj, status) {
            var yahooSeries = yahooObj.series;
            var todayYahooPoint = yahooSeries[yahooSeries.length - 1];
            todayYahooPoint = preProcessYahooPoint(todayYahooPoint, this.symbol);
            var todayDataPoint = convertYahooPointByDate(todayYahooPoint, getDateByYahooDataTimeStamp(todayYahooPoint));

            historyDataList.push(todayDataPoint);

            this.callBack(historyDataList, this.symbol);
        }

        function onError() {
            console.log("Error");
        }
    }

    function addTodaysDataPointToCompareStock(symbol, historyDataList, callBack) {
        var lastPointDate = historyDataList[historyDataList.length - 1].date;
        var isCurrency = getIsCurrency(symbol);
        var currentTradeDayRange = getCurrentTradeDayStartAndEndTime(isCurrency);
        var currentTradeDayStartTime = currentTradeDayRange[0];

        if (currentTradeDayStartTime > lastPointDate || (isCurrency && currentTradeDayRange[1] > lastPointDate)) {
            getTodaysDataForCompareList(symbol, historyDataList, callBack);
        } else {
            callBack(historyDataList, symbol);
        }
    }

    /**Call Utils***/


    //Also fill the SymbolToData global object
    function getStockDataFromYahooObjectIntraDay(yahooObj, range, symbol) {
        var stockData = getStockDataBySymbolGlobal(symbol);
        var historyData = convertYahooSeriesToIntradayHistoryData(yahooObj, symbol);

        attachHistoricDataToProperArray(stockData, historyData, range);

        return stockData;
    }

    function updateCurrentDataByHistory(stockData) {
        var todayData = stockData.todayData;
        var lastPoint = todayData[todayData.length - 1];
        var currentValue = lastPoint.close;

        stockData.value = currentValue;
        stockData.high = iMath.max(currentValue, stockData.high);
        stockData.low = iMath.min(currentValue, stockData.low);
    }

    function convertYahooSeriesToIntradayHistoryData(yahooObj, symbol) {
        var historyData = [];
        var historyPoint;
        var series = preProcessYahooSeries(yahooObj.series, symbol);

        var firstPoint;
        var midPoint;
        var lastPoint;

        var i = 0;
        var addAmount = 0;
        while (i < series.length) {
            firstPoint = series[i];
            midPoint = series[i];
            lastPoint = series[i];

            addAmount = 1;
            if (i + 1 < series.length && isSameDayByYahooObj(firstPoint, series[i + 1])) {
                midPoint = series[i + 1];
                lastPoint = series[i + 1];
                addAmount++;
            }
            if (i + 2 < series.length && isSameDayByYahooObj(firstPoint, series[i + 2])) {
                lastPoint = series[i + 2];
                addAmount++;
            }

            i += addAmount;

            historyPoint = aggregatePoints(firstPoint, midPoint, lastPoint);
            historyData.push(historyPoint);
        }
        return historyData;
    }

    function isSameDayByYahooObj(firstPoint, secondPoint) {
        var firstDate = new Date(firstPoint.Timestamp * 1000);
        var secondDate = new Date(secondPoint.Timestamp * 1000);

        var isIt = isSameTradingDay(firstDate, secondDate);
        return isIt;
    }

    function aggregatePoints(firstPoint, midPoint, lastPoint) {
        var historyPoint = new HistoryDataPoint();

        historyPoint.open = firstPoint.open;
        historyPoint.high = iMath.max(firstPoint.high, midPoint.high, lastPoint.high);
        historyPoint.low = iMath.min(firstPoint.low, midPoint.low, lastPoint.low);
        historyPoint.close = lastPoint.close;
        historyPoint.volume = firstPoint.volume + midPoint.volume + lastPoint.volume;

        historyPoint.date = getDateByYahooDataTimeStamp(lastPoint);

        return historyPoint;
    }

    function fillStockDataCurrentInfo(historyData, stockData) {
        var lastPoint = historyData[historyData.length - 1];
        var prevPoint = historyData[historyData.length - 2];
        stockData.date = lastPoint.date;
        stockData.value = lastPoint.close;
        stockData.open = lastPoint.open;
        stockData.high = lastPoint.high;
        stockData.low = lastPoint.low;
        stockData.volume = lastPoint.volume;
        stockData.prevClose = prevPoint.close;
    }

    function getStockDataFromYahooObject(yahooObj, range, symbol) {
        var stockData = getStockDataBySymbolGlobal(symbol);
        var historyData = convertYahooSeriesToHistoryData(yahooObj, symbol);

        attachHistoricDataToProperArray(stockData, historyData, range);


        return stockData;
    }

    function convertYahooSeriesToHistoryData(yahooObj, symbol) {
        var historyData = [];
        var historyPoint;
        var series = preProcessYahooSeries(yahooObj.series, symbol);
        var yahooPoint;
        var date;

        for (var i = 0; i < series.length; i++) {
            yahooPoint = series[i];

            date = getDateByYahooDataDateString(yahooPoint);
            historyPoint = convertYahooPointByDate(yahooPoint, date);
            historyData.push(historyPoint);
        }

        return historyData;
    }

    function convertYahooPointByDate(yahooPoint, date) {
        var historyPoint = new HistoryDataPoint();
        historyPoint.close = yahooPoint.close;
        historyPoint.open = yahooPoint.open;
        historyPoint.low = yahooPoint.low;
        historyPoint.high = yahooPoint.high;
        historyPoint.volume = yahooPoint.volume;
        historyPoint.date = date;
        return historyPoint;
    }

    function preProcessYahooSeries(yahooSeries, symbol) {
        var isCurrency = getIsCurrency(symbol);
        var isStrongCurrency = getIsStrongCurrency(symbol);
        var shouldReverseValue = (isCurrency && !isStrongCurrency);
        if (shouldReverseValue) {
            var yahooPoint;
            for (var i = 0; i < yahooSeries.length; i++) {
                yahooPoint = yahooSeries[i];
                yahooPoint.close = 1 / yahooPoint.close;
                yahooPoint.open = 1 / yahooPoint.open;
                yahooPoint.low = 1 / yahooPoint.low;
                yahooPoint.high = 1 / yahooPoint.high;
            }
        }
        if (isCurrency) {
            for (var i = 0; i < yahooSeries.length; i++) {
                yahooPoint = yahooSeries[i];
                yahooPoint.low = iMath.min(yahooPoint.open, yahooPoint.low, yahooPoint.high, yahooPoint.close);
                yahooPoint.high = iMath.max(yahooPoint.open, yahooPoint.low, yahooPoint.high, yahooPoint.close);
            }
        }


        return yahooSeries;
    }

    function preProcessYahooPoint(yahooPoint, symbol) {
        var isCurrency = getIsCurrency(symbol);
        var isStrongCurrency = getIsStrongCurrency(symbol);
        var shouldReverseValue = (isCurrency && !isStrongCurrency);
        if (shouldReverseValue) {
            yahooPoint.close = 1 / yahooPoint.close;
            yahooPoint.open = 1 / yahooPoint.open;
            yahooPoint.low = 1 / yahooPoint.low;
            yahooPoint.high = 1 / yahooPoint.high;
        }
        if (isCurrency) {
            yahooPoint.low = iMath.min(yahooPoint.open, yahooPoint.low, yahooPoint.high, yahooPoint.close);
            yahooPoint.high = iMath.max(yahooPoint.open, yahooPoint.low, yahooPoint.high, yahooPoint.close);
        }

        return yahooPoint;
    }

    /**String Utils***/

    /**Data Utils***/
    function attachHistoricDataToProperArray(stockData, historicDataArray, range) {
        switch (range) {
            case TIME_RANGE.D1:
            case TIME_RANGE.D5:
                stockData.setIntraDayData(historicDataArray);
                break;

            case TIME_RANGE.M1:
            case TIME_RANGE.M3:
            case TIME_RANGE.Y1:
                stockData.dailyData = historicDataArray;
                break;

            case TIME_RANGE.Y5:
                stockData.monthlyData = historicDataArray;
                break;

            case TIME_RANGE.MAX:
                stockData.quarterlyData = historicDataArray;
                break;
        }

        if (range != TIME_RANGE.D1 && range != TIME_RANGE.D5) {
            addTodaysDataPointToHistoryChart(stockData, historicDataArray);
        }
    }

    function addTodaysDataPointToHistoryChart(stockData, historicDataArray) {


    }

    function getDateByYahooDataTimeStamp(yahooDataPoint) {
        var date = yahooTimeStampToDate(yahooDataPoint.Timestamp);
        return date;
    }

    function getDateByYahooDataDateString(yahooDataPoint) {
        var date = new Date(yahooDataPoint.date);
        return date;
    }

    //For intra day
    function yahooTimeStampToDate(yahooTimeStamp) {
        var retDate = new Date(yahooTimeStamp * 1000);
        return retDate;
    }

    //For all except intra day
    function yahooStringToDate(yahooDateStr) {
        var retDate;
        var year = yahooDateStr.slice(0, 4);
        var month = yahooDateStr.slice(4, 6) - 1;
        var day = yahooDateStr.slice(6, 8);
        retDate = new Date(year, month, day, 23, 59, 59);
        return retDate;
    }

    /**Params Utils***/
    function getIsIntraDayRaneStr(rangeStr) {
        var isIt = (rangeStr.indexOf("d") >= 0);
        return isIt;
    }

    function getYahooRangeTextForDrill(periodicity) {
        var rangeStr;
        switch (periodicity) {
            case PERIODICITY.INTRA_DAY:
                rangeStr = "30d";
                break;
            case PERIODICITY.DAILY:
                rangeStr = "3y";
                break;
            case PERIODICITY.WEEKLY:
                rangeStr = "10y";
                break;
            case PERIODICITY.MONTHLY:
                rangeStr = "20y";
                break;
            case PERIODICITY.QUARTERLY:
                rangeStr = "70y";
                break;
        }
        return rangeStr;
    }

    function getYahooRangeTextForComparableCall(range, dataList) {
        var periodicity = getPeriodicityGlobal(range, dataList);
        var rangeStr = "1d";
        switch (range) {
            case TIME_RANGE.D1:
            case TIME_RANGE.D5:
                rangeStr = "5d";
                break;
            case TIME_RANGE.M1:
            case TIME_RANGE.M3:
            case TIME_RANGE.Y1:
                rangeStr = "1y";
                break;
            case TIME_RANGE.Y5:
                rangeStr = "11y";
                if (periodicity == PERIODICITY.DAILY) {
                    rangeStr = "1y";
                } else if (periodicity == PERIODICITY.WEEKLY) {
                    rangeStr = "10y";
                }
                break;
            case TIME_RANGE.MAX:
                rangeStr = "70y";
                if (periodicity == PERIODICITY.MONTHLY) {
                    rangeStr = "20y";
                } else if (periodicity == PERIODICITY.DAILY) {
                    rangeStr = "1y";
                } else if (periodicity == PERIODICITY.WEEKLY) {
                    rangeStr = "10y";
                }
                break;
        }
        return rangeStr;
    }

    function createURLBySymbolAndRange(symbol, rangeStr) {
        var querySymbol = symbol;
        var isCurrency = getIsCurrency(symbol);
        if (isCurrency) {
            var isStrongCurrency = getIsStrongCurrency(symbol);
            if (isStrongCurrency) {
                querySymbol = symbol + "USD=X";
            } else {
                querySymbol = symbol + "=X";
            }
        }

        var url = "http://chartapi.finance.yahoo.com/instrument/1.0/" + querySymbol + "/chartdata;type=quote;range=" + rangeStr + "/json";
        return url;
    }

    function createStatsURLBySymbolAndRange(symbol) {
        var querySymbol = symbol;
        var isCurrency = getIsCurrency(symbol);
        if (isCurrency) {
            querySymbol = symbol + "USD=X";
        }

        var url = "http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.quotes where symbol='" + querySymbol + "'&env=http://datatables.org/alltables.env&format=json";
        return url;
    }

    function createNewsURLBySymbolAndRange(symbol) {
        var querySymbol = symbol;
        var isCurrency = getIsCurrency(symbol);
        if (isCurrency) {
            querySymbol = symbol + "USD=X";
        }

        var url = "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=http://finance.yahoo.com/rss/headline?s=" + querySymbol + "&num=-1";
        return url;
    }

    function getYahooRangeStr(range) {
        var rangeStr = "1d";
        switch (range) {
            case TIME_RANGE.D1:
            case TIME_RANGE.D5:
                rangeStr = "5d";
                break;
            case TIME_RANGE.M1:
            case TIME_RANGE.M3:
            case TIME_RANGE.Y1:
                rangeStr = "1y";
                break;
            case TIME_RANGE.Y5:
                rangeStr = "11y";
                break;
            case TIME_RANGE.MAX:
                rangeStr = "70y";
                break;
        }
        return rangeStr;
    }
}


//Global
RestAPIs.getInstance = function () {
    if (!RestAPIs.instance) {
        RestAPIs.instance = new RestAPIs();
    }

    return RestAPIs.instance;
};

RestAPIs.TIME_RANGE = {
    "D1": 1,
    "D5": 7,
    "M1": 30,
    "M3": 90,
    "Y1": 365,
    "Y5": 1825,
    "MAX": 14600
};
