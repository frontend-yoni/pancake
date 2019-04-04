/**
 * Created by avitzur on 11/16/2015.
 */
var SymbolToData = {};
var SymbolToStats = {};
var SymbolToUserData = {};
var CardDataList = [];
var SymbolList = [];
var UserDBData = {};
var UserID = 0;
var IS_TRADE_STATE = false; //todo: set to false!
//State
var DEFAULT_SELECT_OPTIONS = ["^DJI", "^GSPC", "^IXIC", "AAPL", "BA", "CSCO", "DIS", "GE", "GS", "IBM", "JNJ", "MSFT", "NKE",
    "PFE", "PG", "VZ", "WMT", "XOM", "AXP", "CMG", "JPM", "EBAY", "SNE", "TSLA"];

var CallsPerformed = []; //array of RestCallMetaDatas

/***Constant Types***/
var SORT_BY_OPTIONS = {
    TODAY_CHANGE: 0,
    TOTAL_GAIN: 1,
    ALPHABET: 2
};

var SORT_BY_DIRECTION = {
    ASCENDING: 0,
    DESCENDING: 1
};

var PERIODICITY = {
    INTRA_DAY: 0,
    DAILY: 1,
    WEEKLY: 2,
    MONTHLY: 3,
    QUARTERLY: 4
};
/***Constant Types End.***/

function RestCallMetaData() {
    this.callTime = new Date().getTime();
    this.symbol;
    this.range;
}

/**Functions***/
function getStockDataBySymbolGlobal(symbol) {
    var stockData;
    if (SymbolToData[symbol]) {
        stockData = SymbolToData[symbol];
    } else {
        stockData = new StockData();
        stockData.symbol = symbol;
        stockData.isCurrency = getIsCurrency(symbol);
        SymbolToData[symbol] = stockData;
    }
    return stockData;
}

function getStatsBySymbolGlobal(symbol) {
    if (!SymbolToStats[symbol]){
        SymbolToStats[symbol] = generateStatsMock(symbol);
    }
    return SymbolToStats[symbol];
}

function setStatsBySymbolGlobal(symbol) {
    var stats = getStatsMock(symbol);
    SymbolToStats[symbol] = stats;
    return stats;
}

function getUserDataBySymbolGlobal(symbol) {
    var userData;
    if (SymbolToUserData[symbol]) {
        userData = SymbolToUserData[symbol];
    } else {
        userData = new UserStockDataObject(symbol, 0, 0);
        SymbolToUserData[symbol] = userData;
    }
    return userData;
}

function getUserIDFromURL() {
    return getParameterByName("id");
}

function getIsUserActiveFromURL() {
    return getParameterByName("isActive");
}


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getSuggestionsToExcludeGlobal() {
    var exclude = SymbolList.concat("^DJI").concat("^GSPC").concat("^IXIC");
    return exclude;
}


function getIsMiddleOfCardActionGlobal() {
    var isIt = ResizeUtil.getInstance().getIsResizing() || DragAndDropUtil.getInstance().getIsDragging();
    return isIt;
}
/**Converters***/
function updateUserDBDataByCurrentState() {
    var stockList = [];
    var symbol;
    for (var i = 0; i < SymbolList.length; i++) {
        symbol = SymbolList[i];
        stockList.push(getUserDataBySymbolGlobal(symbol));
    }

    var cardList = [];
    var userCardData;
    for (var i = 0; i < CardDataList.length; i++) {
        userCardData = CardDataList[i].userData;
        cardList.push(userCardData);
    }
    UserDBData.stockList = stockList;
    UserDBData.cardList = cardList;
}

function processInitialUserDBData(userDBData) {
    //Stocks
    SymbolList = [];
    SymbolToUserData = {};
    if (!userDBData.stockList) {
        userDBData.stockList = [];
    }
    var stockList = userDBData.stockList;
    var symbol;
    var stockData;
    for (var i = 0; i < stockList.length; i++) {
        stockData = stockList[i];
        symbol = stockData.symbol;
        SymbolToUserData[symbol] = stockData;
        SymbolList.push(symbol);

        stockData.cost = +stockData.cost;
        stockData.qty = +stockData.qty;
    }

    //Cards
    CardDataList = [];
    if (!userDBData.cardList) {
        userDBData.cardList = [];
    }
    var userCardList = userDBData.cardList;
    var cardData;
    var userCardData;
    for (var i = 0; i < userCardList.length; i++) {
        userCardData = userCardList[i];

        userCardData.height = +userCardData.height;
        userCardData.width = +userCardData.width;
        userCardData.isCandleChart = (userCardData.isCandleChart === true || userCardData.isCandleChart == "true");

        userCardData.timeRange = +userCardData.timeRange;
        userCardData.view = +userCardData.view;
        userCardData.cardType = +userCardData.cardType;

        if (isNaN(userCardData.view)) {
            userCardData.view = SimpleView.VIEWS.LIVE;
        }

        cardData = createCardDataByUserData(userCardList[i]);
        CardDataList.push(cardData);
    }

    userDBData.summary = new UserPortfolioSummary();
    userDBData.isCandleChart = (userDBData.isCandleChart == "true" || userDBData.isCandleChart === true);
    userDBData.isShowVolume = (userDBData.isShowVolume != "false" && userDBData.isShowVolume !== false);

}

function createCardDataByUserData(userCardData) {
    var cardData;
    var component = new SimpleView();

    if (userCardData.cardType == CardDataObject.CARD_TYPES.Aggregate) {
        component = new AggrView();
    }

    cardData = new CardDataObject(userCardData, {}, component);
    component.setData(cardData);
    return cardData;
}

/***Portfolio Calculation****/
function updateUserPortfolioSummary() {
    //Anchor
    var originalValue = 0;
    var yesterdayValue = 0;
    //Live
    var totalValue = 0;
    var summary = UserDBData.summary;
    var orderedSymbolList = summary.orderedSymbolList;
    calculateAllPortfolioData(summary);
    updateOrderedSymbolList(orderedSymbolList);

    /**Inner Functions****/
    function updateOrderedSymbolList(orderedSymbolList) {
        removeDeletedSymbols(orderedSymbolList);
        var symbol;
        var newAdditions = [];

        for (var i = 0; i < SymbolList.length; i++) {
            symbol = SymbolList[i];
            if (SymbolList.indexOf(symbol) > -1 && orderedSymbolList.indexOf(symbol) == -1 &&
                SymbolToUserData[symbol] && SymbolToUserData[symbol].qty > 0) {
                newAdditions.push(symbol);
            }
        }
        newAdditions.sort(sortHelper);

        for (var i = 0; i < newAdditions.length; i++) {
            orderedSymbolList.push(newAdditions[i]);
        }
    }

    function removeDeletedSymbols(orderedSymbolList) {
        var symbol;
        for (var i = orderedSymbolList.length - 1; i >= 0; i--) {
            symbol = orderedSymbolList[i];
            if (SymbolList.indexOf(symbol) == -1 || !SymbolToUserData[symbol] || !SymbolToUserData[symbol].qty > 0) {
                removeFromArrayByIndex(orderedSymbolList, i)
            }
        }
    }

    function calculateAllPortfolioData(summary) {
        calculateAnchorsValues(summary);
        var totalGain = totalValue - originalValue;
        var totalGainPercentage = (totalGain / originalValue) * 100;

        var todayChange = totalValue - yesterdayValue;
        var todayChangePercentage = (todayChange / yesterdayValue) * 100;

        if (isNaN(totalGainPercentage)) {
            totalGainPercentage = 0;
        }

        if (isNaN(todayChangePercentage)) {
            todayChangePercentage = 0;
        }

        summary.totalGain = totalGain;
        summary.todayChange = todayChange;
        summary.todayChangePercentage = todayChangePercentage;
        summary.totalGainPercentage = totalGainPercentage;
    }

    function calculateAnchorsValues(summary) {
        var symbol;
        var stockData;
        for (var i = 0; i < SymbolList.length; i++) {
            symbol = SymbolList[i];
            stockData = SymbolToData[symbol];
            if (stockData) {
                totalValue += stockData.getTotalValue();
                originalValue += stockData.getOriginalTotalValue();
                yesterdayValue += stockData.getYesterdayTotalValue();
            }
        }
        summary.totalValue = totalValue;
    }

    function sortHelper(symbol1, symbol2) {
        var totalValue1 = SymbolToData[symbol1].getTotalValue();
        var totalValue2 = SymbolToData[symbol2].getTotalValue();
        var retValue = 1;
        if (totalValue2 > totalValue1) {
            retValue = -1;
        }
        return retValue;
    }
}



