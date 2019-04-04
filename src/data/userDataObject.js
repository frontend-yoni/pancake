/**
 * Created by avitzur on 11/16/2015.
 */
function UserCardDataObject(symbol, width, height, timeRange, isCandleChart, indexToCompare, view, cardType) {
    var me = this;

    //Public properties
    me.symbol = symbol;
    me.width = width;
    me.height = height;
    me.timeRange = RestAPIs.TIME_RANGE.Y1;
    me.isCandleChart = isCandleChart;
    me.indexToCompare = indexToCompare;
    me.view = view;
    me.cardType = cardType || CardDataObject.CARD_TYPES.Regular;

    if (timeRange) {
        me.timeRange = timeRange;
    }

    if (isCandleChart === undefined){
        me.isCandleChart = UserDBData.isCandleChart;
    }
}

function UserStockDataObject(symbol, qty, cost) {
    var me = this;

    //Public properties
    me.symbol = symbol;
    me.qty = qty;
    me.cost = cost;
}

function UserPortfolioSummary(){
    var me = this;
    //Public properties
    me.isInitialized;
    me.totalValue;
    me.todayChange;
    me.totalGain;
    me.todayChangePercentage;
    me.totalGainPercentage;
    me.orderedSymbolList = []; //This one is used to maintain consistency in Pie chart order
}

/*****
 * Each user has the following params:
 * List<UserCardDataObject>   The cards of the user.
 * List<UserStockDataObject>  All the stocks the user has and his investment in them
 * UserPortfolioSummary The live summary of the portfolio
 * isCandleChart The default chart type of new cards
 * isShowVolume Should show volume on Dashboard. (Drill always shows)
 * ******/

function FullUserDBDataObject() {
    var me = this;
    me.stockList = [];
    me.cardList = [];
    me.summary = new UserPortfolioSummary();
    me.isCandleChart;
    me.isShowVolume = true;
}