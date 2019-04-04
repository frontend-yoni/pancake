/**
 * Created by yoni_ on 11/27/2015.
 */
var noStatsGlobal = true; //API is down

var WAKE_UP_INTERVAL = 1000 * 60 * 30;
var CURRENT_DATA_REFRESH_INTERVAL = 1000 * 10;
var HISTORIC_DATA_REFRESH_INTERVAL = 5 * CURRENT_DATA_REFRESH_INTERVAL;

var RealTimeFetchHistoryTimer;
var RealTimeFetchCurrentTimer;
var IsRealTimeFetchTimerActive;

var CurrencyTypeSymbolsList;
var StockTypeSymbolsList;
var GotAllTodayStocks;
var GotAllTodayCurrencies;

function createNewCardDataBySymbol(symbol, width, height) {
    var userData = createUserDataForNewCard(symbol, width, height);
    var stockData = {};

    var component = new SimpleView();
    var cardData = new CardDataObject(userData, stockData, component);
    component.setData(cardData);
    return cardData;
}

function createNewSummaryCard(width, height) {
    var userData = new UserCardDataObject("", width, height);
    userData.cardType = CardDataObject.CARD_TYPES.Aggregate;
    var component = new AggrView();
    var cardData = new CardDataObject(userData, {}, component);
    return cardData;
}

function createUserDataForNewCard(symbol, width, height) {
    var userData = new UserCardDataObject(symbol, width, height, RestAPIs.TIME_RANGE.M3, undefined, "", SimpleView.VIEWS.LIVE);
    return userData;
}

function stopRealTimeDataRefresh() {
    if (IsRealTimeFetchTimerActive) {
        clearInterval(RealTimeFetchHistoryTimer);
        clearInterval(RealTimeFetchCurrentTimer);
        IsRealTimeFetchTimerActive = false;
    }
}

function activateRealTimeFetchTimer() {
    if (!IsRealTimeFetchTimerActive) {
        clearInterval(RealTimeFetchHistoryTimer);
        clearInterval(RealTimeFetchCurrentTimer);
        RealTimeFetchHistoryTimer = setInterval(refreshAllDataHistory, HISTORIC_DATA_REFRESH_INTERVAL);
        RealTimeFetchCurrentTimer = setInterval(refreshAllDataCurrent, CURRENT_DATA_REFRESH_INTERVAL);
        IsRealTimeFetchTimerActive = true;
    }
}

/**Asyc***/
function saveUserData() {
    updateUserDBDataByCurrentState();
    //todo: revive signin
    if (UserID) {
        var restAPIs = RestAPIs.getInstance();
        restAPIs.saveUserData(UserID, UserDBData);
    }
}

function logout() {
    var restAPIs = RestAPIs.getInstance();
    createCookie(0);
    location.reload(true);

    var callback = function () {
    };
    restAPIs.logout(callback);

}

function fetchDataForTitleIndex(indexSymbol) {
    var restAPIs = RestAPIs.getInstance();
    restAPIs.getStocksHistoryData(indexSymbol, RestAPIs.TIME_RANGE.M3, onSuccess);

    function onSuccess(stockData) {
        var indexComponent = IndexDataComponent.getInstance();
        indexComponent.setIndexData(stockData);
    }
}

function fetchDataForNewCard(symbol, range, cardData) {
    var restAPIs = RestAPIs.getInstance();
    restAPIs.getStocksHistoryData(symbol, range, onSuccess);

    function onSuccess(stockData) {
        var cardElement = cardData.cardElement;

        cardData.data = stockData;
        cardData.hasDataFetched = true;

        redrawForLiveAndStats(cardData);

        addDataToStockList(stockData);
        checkIfGotAllDataAndReact();
    }
}

function fetchDataForListOnly(symbol) {
    var restAPIs = RestAPIs.getInstance();
    restAPIs.getStocksHistoryData(symbol, RestAPIs.TIME_RANGE.M3, addDataToStockList);
}


function fetchIndexDataToCompare(indexSymbol, range, mainDataList, cardData) {
    var restAPIs = RestAPIs.getInstance();
    restAPIs.getIndexHistoryDataToCompare(indexSymbol, range, mainDataList, onSuccess);

    function onSuccess(indexStockData) {
        var cardElement = cardData.cardElement;

        cardData.comparedIndexStockData = indexStockData;
        cardData.setIndexToCompare(indexStockData.symbol);
        cardData.hasDataFetched = true;
        cardElement.redrawIfReady(SimpleView.VIEWS.LIVE);
    }
}

function fetchStockAndIndexDataByRange(stockSymbol, indexSymbol, range, cardData) {
    var stockData;
    var indexStockData;

    var cardElement = cardData.cardElement;

    var restAPIs = RestAPIs.getInstance();
    restAPIs.getStocksHistoryData(stockSymbol, range, onStockSuccess);
    restAPIs.getStocksHistoryData(indexSymbol, range, onIndexSuccess);

    function onStockSuccess(stockDataInput) {
        stockData = stockDataInput;

        cardData.data = stockData;
        cardData.hasDataFetched = true;
        redrawLiveCardIfDataReady();
    }

    function onIndexSuccess(indexStockDataInput) {
        indexStockData = indexStockDataInput;

        cardData.comparedIndexStockData = indexStockData;
        cardData.setIndexToCompare(indexStockData.symbol);
        redrawLiveCardIfDataReady();
    }


    function redrawLiveCardIfDataReady() {
        if (indexStockData && stockData) {
            cardElement.redrawIfReady(SimpleView.VIEWS.LIVE);
        }
    }
}

function fetchStockListHoverCardForNewCard(symbol, range, onSuccess) {
    var restAPIs = RestAPIs.getInstance();
    restAPIs.getStocksHistoryData(symbol, range, onSuccess);
}

/***Stats**/
function fetchStatsForCard(cardData) {
    callFunc();
    setTimeout(callFunc, 0);

    function onSuccess(statsData) {
        var cardElement = cardData.cardElement;

        cardData.data = getStockDataBySymbolGlobal(cardData.symbol);
        cardData.hasDataFetched = true;
        noStatsGlobal = false;

        cardElement.redrawIfReady(SimpleView.VIEWS.STATS);
    }

    function onError() {
        var cardElement = cardData.cardElement;
        cardData.hasDataFetched = true;
        noStatsGlobal = true;

        cardElement.redrawIfReady(SimpleView.VIEWS.STATS);
    }

    function callFunc() {
        var symbol = cardData.symbol;
        restAPIs.getStats(symbol, onSuccess, onError);
    }
}

function fetchDataForCardByState(cardData) {
    var view = cardData.view;
    switch (view) {
        case SimpleView.VIEWS.LIVE:
            fetchDataForNewCard(cardData.symbol, cardData.userData.timeRange, cardData);
            break;
        case SimpleView.VIEWS.STATS:
            fetchStatsForCard(cardData);
            break;
        case SimpleView.VIEWS.NEWS:
            fetchNewsForCard(cardData);
            break;
    }
}

/**News***/
function fetchNewsForCard(cardData) {
    function onSuccess() {
        var cardElement = cardData.cardElement;
        var newsDataList = generateMockNews(cardData.symbol);
        cardData.news = newsDataList;
        cardData.hasDataFetched = true;
        cardElement.redrawIfReady(SimpleView.VIEWS.NEWS);
    }

    requestAnimationFrame(onSuccess);
}

function addDataToStockList(stockData) {
    var stockList = StockListContainer.getInstance();
    stockList.addNewData(stockData);
}

function refreshAllDataHistory() {
    fetchInitialDataOnLoad();
}

function refreshAllDataCurrent() {
    var restAPIs = RestAPIs.getInstance();
    arrangeSymbolsToCallByType();

    if (!GotAllTodayStocks) {
        fetchCurrentDataForStocks(restAPIs);
    }
    if (!GotAllTodayCurrencies) {
        fetchCurrentDataForCurrency(restAPIs);
    }
}

function fetchDataForAllNonLiveCards() {
    var cardData;
    for (var i = 0; i < CardDataList.length; i++) {
        cardData = CardDataList[i];
        if (cardData.view != SimpleView.VIEWS.LIVE) {
            fetchDataForCardByState(cardData);
        }
    }
}

function fetchInitialDataOnLoad() {
    var range = RestAPIs.TIME_RANGE.Y1;
    var restAPIs = RestAPIs.getInstance();
    arrangeSymbolsToCallByType();

    /*if (!GotAllTodayStocks) {
     fetchInitialDataForStocks(range, restAPIs);
     }
     if (!GotAllTodayCurrencies) {
     fetchInitialDataForCurrency(range, restAPIs);
     }*/

    fetchInitialDataForStocks(range, restAPIs);
}

function fetchInitialDataForStocks(range, restAPIs) {
    for (var i = 0; i < StockTypeSymbolsList.length; i++) {
        restAPIs.getStocksHistoryData(StockTypeSymbolsList[i], range, initialStockDataLoadOnSuccess);
    }
    restAPIs.getStocksHistoryData(DOW_INDEX_SYMBOL, range, initialIndexDataLoadOnSuccess);
    restAPIs.getStocksHistoryData(SNP_INDEX_SYMBOL, range, initialIndexDataLoadOnSuccess);
    restAPIs.getStocksHistoryData(NASDAQ_INDEX_SYMBOL, range, initialIndexDataLoadOnSuccess);

    /*if (StockTypeSymbolsList.length == 0) {
     checkIfGotAllDataAndReact();
     }*/
}

function fetchInitialDataForCurrency(range, restAPIs) {
    for (var i = 0; i < CurrencyTypeSymbolsList.length; i++) {
        restAPIs.getStocksHistoryData(CurrencyTypeSymbolsList[i], range, initialStockDataLoadOnSuccess);
    }
}

function fetchCurrentDataForStocks(restAPIs) {
    for (var i = 0; i < StockTypeSymbolsList.length; i++) {
        restAPIs.getStocksHistoryData(StockTypeSymbolsList[i], RestAPIs.TIME_RANGE.D1, currentStockDataLoadOnSuccess);
        // restAPIs.getStats(StockTypeSymbolsList[i], currentStockDataLoadOnSuccess);
    }
}

function fetchCurrentDataForCurrency(restAPIs) {
    for (var i = 0; i < CurrencyTypeSymbolsList.length; i++) {
        restAPIs.getStocksHistoryData(CurrencyTypeSymbolsList[i], RestAPIs.TIME_RANGE.D1, currentStockDataLoadOnSuccess);
        // restAPIs.getStats(CurrencyTypeSymbolsList[i], currentStockDataLoadOnSuccess);
    }
}

function initialStockDataLoadOnSuccess(stockData) {
    updateCardsAndListByStockData(stockData);

    checkIfGotAllDataAndReact()
}

function initialIndexDataLoadOnSuccess(indexStockData) {
    //todo: do something
}

function currentStockDataLoadOnSuccess(stockData) {
    updateCardsAndListByStockData(stockData);
    updateTotalPortfolioDataGlobal();
}


function checkIfGotAllDataAndReact() {
    var hasFetchedAll = true;
    var symbol;
    for (var i = 0; i < SymbolList.length; i++) {
        symbol = SymbolList[i];
        if (!SymbolToData[symbol] || SymbolToData[symbol].value == undefined) {
            hasFetchedAll = false;
        }
    }

    if (hasFetchedAll) {
        var stockDataList = getValuesFromMapGlobal(SymbolToData);
        reactToFetchedAll(stockDataList);
    }
}

function reactToFetchedAll(stockDataList) {
    var shouldRefresh = getShouldRefreshRealTime(stockDataList);
    if (!shouldRefresh) {
        stopRealTimeDataRefresh();
    } else {
        activateRealTimeFetchTimer();
    }
    initTotalPortfolioDataGlobal();
}

function getShouldRefreshRealTime(stockDataList) {
    /*var shouldRefresh;
     var detectedStock = false;
     var detectedCurrency = false;
     var stockData;
     var isCurrency;
     GotAllTodayCurrencies = true;
     GotAllTodayStocks = true;

     for (var i = 0; (i < stockDataList.length && (!detectedCurrency || !detectedStock)); i++) {
     stockData = stockDataList[i];
     isCurrency = getIsCurrency(stockData.symbol);
     if (isCurrency) {
     detectedCurrency = true;

     //Some times the market closes ahead of time, so this is the way to prevent too many calls many hours later.
     GotAllTodayCurrencies = stockData.getIsDoneAllCallsForToday();
     } else {
     detectedStock = true;

     //Some times the market closes ahead of time, so this is the way to prevent too many calls many hours later.
     GotAllTodayStocks = stockData.getIsDoneAllCallsForToday();
     }
     }
     shouldRefresh = (!GotAllTodayCurrencies || !GotAllTodayStocks);
     return shouldRefresh;*/
    return false;
}

/**Asyc End***/

/**Prep data for call****/
function arrangeSymbolsToCallByType() {
    CurrencyTypeSymbolsList = [];
    StockTypeSymbolsList = [];

    var symbol;
    for (var i = 0; i < SymbolList.length; i++) {
        symbol = SymbolList[i];
        if (getIsCurrency(symbol)) {
            CurrencyTypeSymbolsList.push(symbol);
        } else {
            StockTypeSymbolsList.push(symbol);
        }
    }
}


/**Inform the world***/
function informActionToSave() {
    saveUserData();
    initTotalPortfolioDataGlobal();
}

function updateCardsAndListByStockData(stockData) {
    var cardDataArray = getCardsBySymbolGlobal(stockData.symbol);
    var summaryCards = getSummaryCardsGlobal();

    cardDataArray = cardDataArray.concat(summaryCards);

    for (var i = 0; i < cardDataArray.length; i++) {
        setInitialStockDataToCard(cardDataArray[i], stockData);
    }
    addDataToStockList(stockData);
}

function setInitialStockDataToCard(cardData, stockData) {
    cardData.data = stockData;
    cardData.hasDataFetched = true;
    if (!cardData.isMiddleOfEdit) {
        redrawForLiveAndStats(cardData);
    }
}

function updatePortfolioDataGlobal(symbol) {
    var cardData;

    //Update Grid
    for (var i = 0; i < CardDataList.length; i++) {
        cardData = CardDataList[i];
        if (symbol == cardData.symbol) {
            cardData.updatePersonalData();
        }
    }

    //Update List
    var stockData = SymbolToData[symbol];
    var stockList = StockListContainer.getInstance();
    stockList.addNewData(stockData);
    stockList.updateHoverCardPortfolioSection();
}

function updateTotalPortfolioDataGlobal() {
    if (UserDBData.summary.isInitialized) {
        updateUserPortfolioSummary();
        ExtraStuffComponent.getInstance().updateByNewData();
        updateSummaryCards();
    }
}

function initTotalPortfolioDataGlobal() {
    UserDBData.summary.isInitialized = true;
    updateTotalPortfolioDataGlobal();
}

function updateSummaryCards() {
    var cardData;
    for (var i = 0; i < CardDataList.length; i++) {
        cardData = CardDataList[i];
        if (cardData.cardType == CardDataObject.CARD_TYPES.Aggregate) {
            cardData.cardElement.redrawIfReady();
        }
    }
}
/**Inform the world End**/

/***Data Manipulation**/
function setCurrentDataBasedOnIntraDay(stockData) {
    var todayAndPrevClose = getTodayDataFromIntraDay(stockData.intraDayData);
    var todayData = todayAndPrevClose.todayData;
    stockData.todayData = todayData;
    /*var todayAndPrevClose = getTodayDataFromIntraDay(stockData.intraDayData);
     var todayData = todayAndPrevClose.todayData;
     var prevClose = todayAndPrevClose.prevClose;

     var length = todayData.length;
     var firstData = todayData[0];
     var lastData = todayData[length - 1];

     var open = firstData.open;
     var value = lastData.close;
     var volume = 0;
     var high = open;
     var low = open;

     var dataPoint;
     for (var i = 0; i < length; i++) {
     dataPoint = todayData[i];
     high = iMath.max(high, dataPoint.high);
     low = iMath.min(low, dataPoint.low);
     volume += dataPoint.volume;
     }

     stockData.todayData = todayData;
     stockData.setValue(value);
     stockData.open = open;
     stockData.high = high;
     stockData.low = low;
     stockData.volume = volume;
     stockData.prevClose = prevClose;*/
}

function getTodayDataFromIntraDay(intraDayData) {
    var lastIndex = intraDayData.length - 1;

    var currentIndex = lastIndex;
    var startIndex;
    var dataPoint;
    var lastDataPoint = intraDayData[lastIndex];
    var lastPointDate = lastDataPoint.date;

    while (!startIndex && currentIndex >= 0) {
        dataPoint = intraDayData[currentIndex];
        if (!isSameTradingDay(dataPoint.date, lastPointDate)) {
            startIndex = currentIndex + 1;
        }
        currentIndex--;
    }

    if (currentIndex == 0) {
        startIndex = 0;
    }

    var todayData = intraDayData.slice(startIndex, lastIndex + 1);
    var prevClose = intraDayData[startIndex - 1].close;

    var retObject = {
        todayData: todayData,
        prevClose: prevClose
    };

    return retObject;
}

function updateStockDataByStatsData(statsData, symbol) {
    var stockData = getStockDataBySymbolGlobal(symbol);
    var intraDayData = stockData.intraDayData;

    var prevClose = +statsData.PreviousClose;
    var change = +statsData.Change;
    var open = +statsData.Open;
    var value = prevClose + change;
    var volume = +statsData.Volume;

    var todayData = stockData.todayData;
    if (change == 0 && todayData && todayData.length > 0) {
        var todayDataCount = todayData.length;
        var lastClosedIndex = intraDayData.length - 1 - todayDataCount;
        prevClose = intraDayData[lastClosedIndex].close;
        open = todayData[0].open;
        value = todayData[todayData.length - 1].close;

        volume = 0;
        for (var i = 0; i < todayData.length; i++) {
            volume += todayData[i].volume;
        }
    }


    var now = new Date();

    stockData.open = open;
    stockData.volume = volume;
    stockData.prevClose = prevClose;
    stockData.value = value;
    stockData.high = iMath.max(value, stockData.high);
    stockData.low = iMath.min(value, stockData.low);


    if (intraDayData && intraDayData.length > 0) {
        var intradayLast = intraDayData[intraDayData.length - 1];
        intradayLast.date = now;
        intradayLast.close = value;
        intradayLast.high = iMath.max(value, intradayLast.high);
        intradayLast.low = iMath.min(value, intradayLast.low);
    }

    updateLastHistoryDataPointByCurrentData(stockData.quarterlyData, stockData);
    updateLastHistoryDataPointByCurrentData(stockData.dailyData, stockData);
    updateLastHistoryDataPointByCurrentData(stockData.monthlyData, stockData);

    return stockData;
}

function updateLastHistoryDataPointByCurrentData(historyDataArray, stockData) {
    if (historyDataArray && historyDataArray.length > 0) {
        var lastPoint = historyDataArray[historyDataArray.length - 1];
        lastPoint.close = stockData.value;
        lastPoint.open = stockData.open;
        lastPoint.low = stockData.low;
        lastPoint.high = stockData.high;
        lastPoint.volume = stockData.volume;
        lastPoint.date = new Date();
    }
}

/***Data Manipulation End.**/

/**Global Actions***/
function sortFromTitle(sortType, sortOrder) {
    var funGrid = FunGrid.getInstance();
    var stockListContainer = StockListContainer.getInstance();
    funGrid.sortCards(sortType, sortOrder);
    stockListContainer.sortAndRedraw(sortType, sortOrder);
    informActionToSave();
}
/**Global Actions***/

/**Data Utils***/
function compareValuesForSort(val1, val2, sortDirection, name1, name2) {
    var retValue = 0;
    if (val1 > val2) {
        retValue = 1;
    } else if (val1 < val2) {
        retValue = -1;
    }

    if (retValue == 0) {
        if (name1 > name2) {
            retValue = 1;
        } else {
            retValue = -1;
        }
    }

    if (sortDirection == SORT_BY_DIRECTION.DESCENDING) {
        retValue *= -1;
    }

    return retValue;
}

function createNewCardDataGlobal(symbol, width, height) {
    if (!width) {
        var defaultWidthHeight = getDefaultCardSizeGlobal();
        width = defaultWidthHeight[0];
        height = defaultWidthHeight[1];
    }
    var newCardData = createNewCardDataBySymbol(symbol, width, height);

    return newCardData;
}

function createSummaryCardDataGlobal(width, height) {
    if (!width) {
        var defaultWidthHeight = getDefaultCardSizeGlobal();
        width = defaultWidthHeight[0];
        height = defaultWidthHeight[1];
    }
    var newCardData = createNewSummaryCard(width, height);

    return newCardData;
}

function getDefaultCardSizeGlobal() {
    var width = UniversalCardSizeSection.selectedWidth;
    var height = UniversalCardSizeSection.selectedHeight;
    return [width, height];
}

function getCardsBySymbolGlobal(symbol) {
    var matchingCard = [];
    var cardData;
    for (var i = CardDataList.length - 1; i >= 0; i--) {
        cardData = CardDataList[i];
        if (cardData.symbol == symbol) {
            matchingCard.push(cardData);
        }
    }
    return matchingCard;
}

function getSummaryCardsGlobal() {
    var matchingCard = [];
    var cardData;
    for (var i = CardDataList.length - 1; i >= 0; i--) {
        cardData = CardDataList[i];
        if (cardData.getIsSummary()) {
            matchingCard.push(cardData);
        }
    }
    return matchingCard;
}

function getCardsByIndexToCompareGlobal(indexSymbol) {
    var matchingCard = [];
    var cardData;
    for (var i = CardDataList.length - 1; i >= 0; i--) {
        cardData = CardDataList[i];
        if (cardData.indexToCompare == indexSymbol) {
            matchingCard.push(cardData);
        }
    }
    return matchingCard;
}

function getIsFreshStateGlobal() {
    var isIt = (SymbolList.length < 1 && CardDataList.length < 1);
    return isIt;
}

function getCurrentTradeDayStartAndEndTime(isCurrency) {
    var todayData;
    var symbol;
    var isCorrectType;
    for (var i = 0; i < SymbolList.length; i++) {
        symbol = SymbolList[i];
        isCorrectType = (isCurrency && getIsCurrency(symbol));
        isCorrectType = isCorrectType || (!isCurrency && !getIsCurrency(symbol));
        if (isCorrectType && SymbolToData[symbol].todayData && SymbolToData[symbol].todayData.length > 0) {
            todayData = SymbolToData[symbol].todayData;
            break;
        }
    }
    var startTime = 0;
    var endTime = 0;
    if (todayData) {
        startTime = todayData[0].date;
        endTime = todayData[todayData.length - 1].date;
    }

    return [startTime, endTime];
}
/**Data Utils End.***/


/***Draw Util****/
function redrawForLiveAndStats(cardData) {
    var cardElement = cardData.cardElement;
    if (!cardData.view || cardData.view == SimpleView.VIEWS.LIVE || cardData.view == SimpleView.VIEWS.STATS) {
        cardElement.redrawIfReady(cardData.view);
    }
}