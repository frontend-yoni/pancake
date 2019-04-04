/**
 * Created by mizrasha on 06/12/2015.
 */
function IndexDataComponent() {
    var me = this;

    /**Constants**/
    var ROW_HEIGHT = 16;
    var TOTAL_ROW_WIDTH = 200;
    var INDEX_NAME_DIV_SIZE = 66;
    var FONT_SIZE = 12;
    var TREND_ICON_WIDTH = 10;
    var VALUE_WIDTH = 50;
    var CHANGE_WIDTH = 60;
    var PADDING_WIDTH = 0;
    var PAD_FROM_TRIANGLE = 5;
    var TRIANGLE_UP_COLOR = "green";
    var TRIANGLE_DOWN_COLOR = "red";

    /**Externally set***/
    var externalDiv;


    /**Internally set***/
    //Structure
    var indexesDiv;

    //Utils
    var nasdaqElementsObj = {};
    var snpElementsObj = {};
    var dowElementsObj = {};

    var shapeUtil = ShapesUtil.getInstance();

    var nasdaqData = {name: "NASDAQ", value: null, change: null};
    var snpData = {name: "S&P 500", value: null, change: null};
    var dowData = {name: "DOW", value: null, change: null};

    this.setExternalDiv = function (externalDivInput) {
        externalDiv = externalDivInput;
    };

    this.setIndexData = function (stockData) {
        setIndexData(stockData);
    };

    this.drawComponent = function () {
        drawComponent();
    };

    function drawComponent() {
        indexesDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                height: ROW_HEIGHT * 3 + "px",
                width: TOTAL_ROW_WIDTH + "px"
            });
        createRows();
        fetchData();
    }

    function createRows() {
        createNASDAQRow();
        createSNPRow();
        createDowRow();
    }

    function createNASDAQRow() {
        nasdaqElementsObj = createRow(nasdaqData.name, 0);
    }

    function createSNPRow() {
        snpElementsObj = createRow(snpData.name, 1);
    }

    function createDowRow() {
        dowElementsObj = createRow(dowData.name, 2);
    }


    function createRow(name, placeNumber) {
        var elementsObj = {};
        elementsObj.rowDiv = indexesDiv.append("div")
            .style({
                position: "absolute",
                height: ROW_HEIGHT + "px",
                width: "100%",
                top: ROW_HEIGHT * placeNumber + "px",
                display: "none"
            })
            .attr({
                "name": name + "Row"
            });

        elementsObj.nameP = elementsObj.rowDiv.append("p")
            .style({
                position: "absolute",
                height: ROW_HEIGHT + "px",
                width: INDEX_NAME_DIV_SIZE + "px",
                "font-size": FONT_SIZE + "px",
                "white-space": "nowrap",
                overflow: "hidden",
                "text-overflow": "ellipsis",
                margin: 0
            })
            .text(name);

        elementsObj.arrowDiv = elementsObj.rowDiv.append("div")
            .style({
                position: "absolute",
                top: 3 + "px",
                left: PADDING_WIDTH + INDEX_NAME_DIV_SIZE + "px",
                width: TREND_ICON_WIDTH + "px"
            });

        elementsObj.valueP = elementsObj.rowDiv.append("p")
            .style({
                position: "absolute",
                left: PADDING_WIDTH + INDEX_NAME_DIV_SIZE + TREND_ICON_WIDTH + PAD_FROM_TRIANGLE + "px",
                width: VALUE_WIDTH + "px",
                "font-size": FONT_SIZE + "px",
                "white-space": "nowrap",
                overflow: "hidden",
                "text-overflow": "ellipsis",
                "font-weight": "bold",
                margin: 0
            });

        elementsObj.changeP =  elementsObj.rowDiv.append("p")
            .style({
                position: "absolute",
                left: 3 * PADDING_WIDTH + INDEX_NAME_DIV_SIZE + TREND_ICON_WIDTH + VALUE_WIDTH + "px",
                width: CHANGE_WIDTH + "px",
                "font-size": FONT_SIZE + "px",
                "white-space": "nowrap",
                overflow: "hidden",
                "text-overflow": "ellipsis",
                "font-weight": "bold",
                color: "white",
                "text-align": "center",
                margin: 0
            });

        return elementsObj;
    }


    function getChange(change) {
        var formattedChange = formatNiceNumber(change);
        if (change > 0) {
            formattedChange = "+" + formattedChange;
        }
        return formattedChange + "%";
    }

    function createTriangle(change, triangleDiv) {
        var direction;
        var color;
        if(change > 0) {
            direction = shapeUtil.DIRECTION.TOP;
            color = TRIANGLE_UP_COLOR;
        }
        else {
            direction = shapeUtil.DIRECTION.BOTTOM;
            color = TRIANGLE_DOWN_COLOR;
        }
        clearSlate(triangleDiv);
        shapeUtil.createTriangle(triangleDiv, 8, 8, direction, color);
    }

    /**Data processing***/
    function setIndexData(stockData) {
        var value = stockData.value;
        var change = (stockData.value - stockData.prevClose) * 100 / stockData.prevClose;

        var indexSymbol = stockData.symbol;
        if (indexSymbol == DOW_INDEX_SYMBOL) {
            setDowValueAndChange(value, change);
        } else if (indexSymbol == NASDAQ_INDEX_SYMBOL) {
            setNASDAQValueAndChange(value, change);
        } else {
            setSNPValueAndChange(value, change);
        }
    }

    function setNASDAQValueAndChange(value, change) {
        setValueAndChange(value, change, nasdaqElementsObj);
    }

    function setSNPValueAndChange(value, change) {
        setValueAndChange(value, change, snpElementsObj);
    }

    function setDowValueAndChange(value, change) {
        setValueAndChange(value, change, dowElementsObj);
    }

    function setValueAndChange(value, change, elementObj) {
        var valueText = formatNiceNumber(value);
        elementObj.valueP.text(valueText);

        var changeText = getChange(change);

        elementObj.changeP.text(changeText);
        var changeBGColor;
        if(change >= 0) {
            changeBGColor = TRIANGLE_UP_COLOR;
        }
        else{
            changeBGColor = TRIANGLE_DOWN_COLOR;
        }
        elementObj.changeP.style("background", changeBGColor);


        elementObj.rowDiv.style("display", "");

        createTriangle(change, elementObj.arrowDiv);
    }

    /**Server calls*****/
    function fetchData() {
        fetchDataForTitleIndex(DOW_INDEX_SYMBOL);
        fetchDataForTitleIndex(NASDAQ_INDEX_SYMBOL);
        fetchDataForTitleIndex(SNP_INDEX_SYMBOL);
    }
}

IndexDataComponent.getInstance = function () {
    if (!IndexDataComponent.instance) {
        IndexDataComponent.instance = new IndexDataComponent();
    }

    return IndexDataComponent.instance;
};
