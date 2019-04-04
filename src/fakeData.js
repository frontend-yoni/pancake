/**
 * Created by Jonathan on 9/25/2015.
 */
var DATA_COUNT = 50;
var DAY = 1000 * 60 * 60 * 24;

var NUM_OF_ELEMENTS = 12;

var symbolOptions = ["MSFT", "GOOGL", "INTC", "AAPL", "FB", "YHOO", "HPQ", "HPE",
    "AIG", "GS", "JPM", "DIS", "IMPV", "SNE", "BBRY", "CDNS",
    "BAC", "IBM", "CCV", "GE", "TM", "F", "HMC", "MS"];

var mockValue = [55, 758, 34, 118, 105, 34, 12, 15, 63, 186, 66, 113];


function createFakeUserDBData() {
    var userCardList = [];
    var userStockList = [];

    pushToUserDataArrays("BCS", 2, 2);
    pushToUserDataArrays("EBAY", 3, 2);
    pushToUserDataArrays("GS", 1, 2);
    pushToUserDataArrays("MSFT", 2, 2);
    pushToUserDataArrays("AIG", 3, 1);
    pushToUserDataArrays("BBRY", 2, 2);

    pushToUserDataArrays("JPM", 3, 2);
    pushToUserDataArrays("INTC", 1, 2);
    pushToUserDataArrays("IBM", 2, 1);
    pushToUserDataArrays("AAPL", 3, 2, true, "", SimpleView.VIEWS.LIVE, RestAPIs.TIME_RANGE.Y1);

    pushToUserDataArrays("CDNS", 2, 2, false, "", SimpleView.VIEWS.STATS, RestAPIs.TIME_RANGE.M1);
    pushToUserDataArrays("GE", 3, 2, false, NASDAQ_INDEX_SYMBOL, SimpleView.VIEWS.LIVE, RestAPIs.TIME_RANGE.Y1);

    pushAggrCardToUserDataArrays(1, 1);

   /* pushAggrCardToUserDataArrays(2, 2);
    pushToUserDataArrays("IBM", 2, 1);*/

    var userDBData = new FullUserDBDataObject();
    userDBData.stockList = userStockList;
    userDBData.cardList = userCardList;

    return userDBData;

    /***Inner Functions***/
    function pushAggrCardToUserDataArrays(width, height){
        var userCardData = new UserCardDataObject("", width, height);
        userCardData.cardType = CardDataObject.CARD_TYPES.Aggregate;
        userCardList.push(userCardData);
    }

    function pushToUserDataArrays(symbol, width, height, isCandle, indexToCompare, view, range, cardType) {
        var userCardData = createMockUserCardData(symbol, width, height);
        var userStockData = createMockUserStockData(symbol);

        if (isCandle) {
            userCardData.isCandleChart = isCandle;
        }
        if (indexToCompare) {
            userCardData.indexToCompare = indexToCompare;
        }
        if (cardType){
            userCardData.cardType = cardType;
        }else{
            userCardData.cardType = CardDataObject.CARD_TYPES.Regular;
        }
        if (view) {
            userCardData.view = view;
        } else {
            userCardData.view = SimpleView.VIEWS.LIVE;
        }

        if (range) {
            userCardData.timeRange = range;
        }

        userCardList.push(userCardData);
        userStockList.push(userStockData);
    }

}


function createMockUserCardData(symbol, width, height) {
    var userCardData = new UserCardDataObject(symbol, width, height, RestAPIs.TIME_RANGE.M3);
    return userCardData;
}

function createMockUserStockData(symbol) {
    var userStockData = new UserStockDataObject(symbol, 0, 0);

    return userStockData;
}
/***More garbage****/