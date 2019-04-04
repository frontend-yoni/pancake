/**
 * Created by yoni_ on 4/23/2016.
 */
function AggrDataManager() {
    /**CONSTANTS**/
    var PIE_COLORS = ["#60BAE3", "#00A3D3", "#007790", "#92CBDB", "#65B6BF", "#0097A4", "#D1E2A9",
        "#9AC07E", "#608641", "#D8D0B9", "#B9A593", "#6E5E52", "#F8DDA1", "#DE873A", "#A12F35"];

    /**Public Functions***/
    this.calculatePieData = function () {
        return calculatePieData();
    };

    this.getHistoryDataIfNeeded = function(){
        getAllMissingDailyData();
    };

    this.getHasAllData = function(){
        var missingSymbols = getMissingSymbols();
        var hasAll = (missingSymbols.length == 0);
        return hasAll;
    };

    /***Pie Data***/
    function calculatePieData() {
        var arcDataList = [];
        var symbolList = UserDBData.summary.orderedSymbolList;
        var arcData;
        for (var i = 0; i < symbolList.length; i++) {
            arcData = createArcDataBySymbol(symbolList[i], i);
            arcDataList.push(arcData)
        }

        if (symbolList.length == 0) {
            var emptyArc = createEmptyArcData();
            arcDataList.push(emptyArc)
        }

        return arcDataList;
    }

    function createEmptyArcData() {
        var arcData = new ArcData("Empty", 0, 0, PIE_COLORS[0]);
        return arcData;
    }

    function createArcDataBySymbol(symbol, index) {
        var stockData = SymbolToData[symbol];
        var value = stockData.getTotalValue();
        var percent = (value / UserDBData.summary.totalValue) * 100;
        var color = PIE_COLORS[index % PIE_COLORS.length];
        var arcData = new ArcData(symbol, value, percent, color);

        return arcData;
    }

    /***Server Calls****/
    function getAllMissingDailyData() {
        var missingSymbols = getMissingSymbols();
        var restAPIs = RestAPIs.getInstance();
        for (var i = 0; i < missingSymbols.length; i++) {
            restAPIs.getStocksHistoryData(missingSymbols[i], RestAPIs.TIME_RANGE.Y1, updateCardsAndListByStockData);
        }
    }

    /***Server Response****/

    /***Server Calls Prep****/
    function getMissingSymbols() {
        var holdings = UserDBData.summary.orderedSymbolList;
        var missingSymbols = [];
        var symbol;
        for (var i = 0; i < holdings.length; i++) {
            symbol = holdings[i];
            if (getStockDataBySymbolGlobal(symbol).dailyData.length == 0) {
                missingSymbols.push(symbol);
            }
        }
        return missingSymbols;
    }
}

AggrDataManager.getInstance = function () {
    if (!AggrDataManager.instance) {
        AggrDataManager.instance = new AggrDataManager();
    }
    return AggrDataManager.instance;
};