/**
 * Created with IntelliJ IDEA.
 * User: avitzur
 * Date: 17/12/14
 * Time: 18:33
 * To change this template use File | Settings | File Templates.
 */
function CardDataObject(userData, stockData, component) {
    var me = this;

    me.isNewCard = false; //This is true for a new component, is used to introduce the component with animation
    me.isRemovedCard = false; //This is true for a removed component, is used to delete the component with animation

    //These are calculated by the order and size of the cards
    me.row;
    me.column;

    me.userData = userData;

    me.width = userData.width; //In cell count
    me.height = userData.height; //In cell count

    me.prevWidth = me.width;
    me.prevHeight = me.height;

    me.symbol = userData.symbol;
    me.isCandleChart = userData.isCandleChart;
    me.view = userData.view;

    me.cardType = userData.cardType || CardDataObject.CARD_TYPES.Regular;

    me.data = stockData;
    me.statsData = {};
    me.news = [];
    me.component = component; //The component must have a strict set of functions (like DrawComponent, setExternalDiv, setData, etc.) todo: specify the functions precisely!

    me.indexToCompare = userData.indexToCompare;
    me.comparedIndexStockData = undefined;

    me.hasBeenSqueezed; //After opening the left panel, the widest cards get squeezed.

    //Externally set params (for the divs we need to set this as soon as the corresponding div is ready)
    me.wrapperDiv;  //for layout
    me.borderDiv; //For border for drop/resize hints
    me.innerDiv; //for borders and effects
    me.contentDiv; //the actual component

    me.currentColumnCount; //The number of columns that fit in the current screen size

    me.isBGState = false; //Check if we're in a middle of a resize/drag action in the grid, in which case don;t draw the path strokes
    me.isResizeState = false; //Is this the card being resized
    me.cardElement; //This is the card element object representing this data.

    me.isMiddleOfEdit = false;

    //Data calls state
    me.drawCount = 0;
    me.hasDataFetched = false;
}

CardDataObject.prototype.getIsSummary = function () {
    var me = this;
    return me.cardType == CardDataObject.CARD_TYPES.Aggregate;
};

CardDataObject.prototype.setView = function (view) {
    var me = this;
    me.view = view;
    me.userData.view = view;
};

CardDataObject.prototype.setRange = function (range) {
    var me = this;
    me.userData.timeRange = range;
};

CardDataObject.prototype.setCurrentColumnCount = function (columnCountInput) {
    var me = this;
    me.currentColumnCount = columnCountInput;
    //The width and start column cannot exceed the column count of the given screen
    me.column = Math.min(me.column, columnCountInput);
    var width = Math.min(me.width, columnCountInput);

    if (width != me.width) {
        me.hasBeenSqueezed = true;
    } else {
        me.hasBeenSqueezed = false;
    }

    me.setWidth(width);
};

CardDataObject.prototype.setIndexToCompare = function (indexSymbol) {
    var me = this;
    me.userData.indexToCompare = indexSymbol;
    me.indexToCompare = indexSymbol;
};

CardDataObject.prototype.setIsCandleChart = function (boolean) {
    var me = this;
    me.userData.isCandleChart = boolean;
    me.isCandleChart = boolean;
};

CardDataObject.prototype.setWidth = function (widthInput) {
    var me = this;
    me.prevWidth = me.width;
    me.width = widthInput;
    me.userData.width = widthInput;
};

CardDataObject.prototype.setHeight = function (heightInput) {
    var me = this;
    me.prevHeight = me.height;
    me.height = heightInput;
    me.userData.height = heightInput;
};

//Returns true if it's possible to add
CardDataObject.prototype.addWidth = function (amount) {
    var me = this;
    var expectedWidth = me.width + amount;
    var isPossible = (amount != 0 && expectedWidth > 0 && expectedWidth <= me.currentColumnCount);
    if (isPossible) {
        me.setWidth(expectedWidth);
    }

    return isPossible;
};

CardDataObject.prototype.addHeight = function (amount) {
    var me = this;
    var expectedHeight = me.height + amount;
    var isPossible = (amount != 0);
    if (isPossible) {
        me.setHeight(expectedHeight);
    }

    return isPossible;
};

CardDataObject.prototype.setAsNewCard = function () {
    var me = this;
    me.isNewCard = true;
};

CardDataObject.prototype.setAsRemovedCard = function () {
    var me = this;
    me.drawCount = 0;
    me.isRemovedCard = true;
};

CardDataObject.prototype.updatePersonalData = function () {
    var me = this;
    var component = me.component;
    if (component.updatePersonalData) {
        component.updatePersonalData();
    }
};

CardDataObject.prototype.getStatsData = function () {
    var me = this;
    me.statsData = SymbolToStats[me.symbol];
    return me.statsData;
};

/**Global Functions****/
CardDataObject.sortHelper = function (cardData1, cardData2, sortBy, sortDirection) {
    var retValue = 0;

    if (cardData1.cardType == CardDataObject.CARD_TYPES.Aggregate) {
        retValue = 1;
    } else if (cardData2.cardType == CardDataObject.CARD_TYPES.Aggregate) {
        retValue = -1;
    } else {
        var stockData1 = cardData1.data;
        var stockData2 = cardData2.data;
        var todayChange1 = stockData1.getChangePercentage();
        var todayChange2 = stockData2.getChangePercentage();
        var totalGain1 = stockData1.getTotalGainPercentage();
        var totalGain2 = stockData2.getTotalGainPercentage();


        switch (sortBy) {
            case SORT_BY_OPTIONS.TODAY_CHANGE:
                retValue = compareValuesForSort(todayChange1, todayChange2, sortDirection, cardData1.symbol, cardData2.symbol);
                break;
            case SORT_BY_OPTIONS.TOTAL_GAIN:
                retValue = compareValuesForSort(totalGain1, totalGain2, sortDirection, cardData1.symbol, cardData2.symbol);
                break;
        }
    }

    return retValue;
};

//Array prototypes to make it a [column, row] object
Array.prototype.column = function () {
    return this[0];
};

Array.prototype.row = function () {
    return this[1];
};

Array.prototype.setColumn = function (numInput) {
    this[0] = numInput;
};

Array.prototype.setRow = function (numInput) {
    this[1] = numInput;
};

CardDataObject.CARD_TYPES = {
    Regular: 0,
    Aggregate: 1
};