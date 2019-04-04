/**
 * Created by avitzur on 1/3/2016.
 */
/**
 * Created by yoni_ on 1/2/2016.
 */
function DrillCompareSection() {
    var me = this;
    /**CONSTANTS***/
    //Class
    var DRILL_FREQUENCY_BUTTON_CLASS = "DRILL_FREQUENCY_BUTTON_CLASS";
    //Layout
    var TOP_AREA_HEIGHT = 20;
    var FILED_NAME_FONT_SIZE = 14;
    var INDEX_FONT_SIZE = 12;
    var INDEX_BUTTON_WIDTH = 65;
    var SEARCH_SYMBOL_WIDTH = 140;
    //COLOR
    var SELECTED_STRIP_COLOR = "rgb(255, 178, 109)";

    /**Externally Set***/
    //Structure
    var externalDiv;
    //Util
    var chartComponent;
    var papaChartTop;
    //Data
    var drillSymbol;
    //State
    var hasPlaceForFullCompare = true;

    /**Internally Set***/
    //Structure
    var cancelIndexButton;
    var serachSymbolDiv;
    var selectedStrip;
    //(index)
    var snpButton;
    var dowButton;
    var nasdaqButton;
    //State
    var compareSymbol;
    //Utils
    var indexSymbolToButton;
    var selectSymbolComponent = new SelectSymbolSearchBox();

    //State
    var isCurrency;
    var compareSymbol;


    /**Public Function**/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.drawComponent = function () {
        performConstruct();
    };

    this.setExternalComponents = function (chartComponentInput, papaChartTopInput) {
        chartComponent = chartComponentInput;
        papaChartTop = papaChartTopInput;
    };

    this.firstCall = function (symbolInput) {
        respondToNewSymbol(symbolInput);
        selectCompareButtonBySymbol(undefined);
    };

    this.getCompareSymbol = function () {
        return compareSymbol;
    };

    this.respondToSymbolSelected = function (symbol) {
        respondToSymbolSelected(symbol);
    };

    this.clearState = function () {
        clearState();
    };

    this.setMainSymbol = function (symbolInput) {
        respondToNewSymbol(symbolInput);
    };

    this.setHasPlaceForFullCompare = function(boolean){
        hasPlaceForFullCompare = boolean;
        if (hasPlaceForFullCompare){
            showIndexButtons();
        }else{
            hideIndexButtons();
        }
    };

    /***Construct***/
    function performConstruct() {
        clearSlate(externalDiv);

        var textP = externalDiv.append("p")
            .style({
                display: "inline-block",
                margin: 0,
                "margin-right": 5 + "px",
                height: TOP_AREA_HEIGHT + "px",
                "line-height": TOP_AREA_HEIGHT + "px",
                "font-size": FILED_NAME_FONT_SIZE + "px"
            })
            .text("Compare: ");

        selectedStrip =  externalDiv.append("div")
            .style({
                position: "absolute",
                top: -3 + "px",
                height: 2 + "px",
                background: SELECTED_STRIP_COLOR
            })
            .attr("name", "selectedStrip");

        createIndexSection();
    }

    function createSelectSymbolSection() {
        serachSymbolDiv = externalDiv.append("div")
            .style({
                display: "inline-block",
                position: "absolute",
                "margin-top": 1 + "px",
                height: TOP_AREA_HEIGHT + "px"
            });
        selectSymbolComponent.setExternalDiv(serachSymbolDiv);
        selectSymbolComponent.setPapaCompareSection(me);
        selectSymbolComponent.setLayout(SEARCH_SYMBOL_WIDTH, TOP_AREA_HEIGHT);
        selectSymbolComponent.drawComponent();
    }

    function createIndexSection() {
        indexSymbolToButton = {};
        snpButton = createCompareButtonOption("S&P 500", SNP_INDEX_SYMBOL);
        dowButton = createCompareButtonOption("DOW", DOW_INDEX_SYMBOL);
        nasdaqButton = createCompareButtonOption("NASDAQ", NASDAQ_INDEX_SYMBOL);

        createSelectSymbolSection();

        cancelIndexButton = createCompareButtonOption("X", "");
        cancelIndexButton.style({
            "width": 20 + "px",
            "font-family": "sans-serif",
            position: "relative",
            top: 1 + "px",
            "margin-left": SEARCH_SYMBOL_WIDTH + 5 + "px"
        });
        cancelIndexButton.attr("title", "Cancel");

        selectCompareButtonBySymbol(compareSymbol);
    }

    function createCompareButtonOption(textStr, symbol) {
        var button = externalDiv.append("p")
            .style({
                display: "inline-block",
                margin: 0,
                "margin-right": 5 + "px",
                "text-align": "center",
                width: INDEX_BUTTON_WIDTH + "px",
                height: TOP_AREA_HEIGHT - 2 + "px",
                "line-height": TOP_AREA_HEIGHT - 2 + "px",
                "font-size": INDEX_FONT_SIZE + "px",
                "border-radius": 2 + "px"
            })
            .classed(DRILL_FREQUENCY_BUTTON_CLASS, true)
            .text(textStr)
            .datum(symbol)
            .on("click", onCompareClick);

        indexSymbolToButton[symbol] = button;
        return button;
    }

    function resetIndexVisibility() {
        if (isCurrency || !hasPlaceForFullCompare) {
            hideIndexButtons();
            unmarkIndexButtons();
        } else {
            showIndexButtons();
        }
    }

    /**UI Changes**/
    function showCancel() {
        cancelIndexButton.style("visibility", "visible");
    }

    function hideCancel() {
        cancelIndexButton.style("visibility", "hidden");
    }

    function markCompareButton(symbol) {
        var button = indexSymbolToButton[symbol];
        if (button) {
            button.classed(SELECTED_BUTTON_CLASS, true);
        }
    }

    function unmarkCompareButton(symbol) {
        var button = indexSymbolToButton[symbol];
        if (button) {
            button.classed(SELECTED_BUTTON_CLASS, false);
        }else if (selectSymbolComponent.getSelectedSymbol()){
            selectSymbolComponent.clearSelection();
        }
    }

    function unmarkIndexButtons(){
        nasdaqButton.classed(SELECTED_BUTTON_CLASS, false);
        dowButton.classed(SELECTED_BUTTON_CLASS, false);
        snpButton.classed(SELECTED_BUTTON_CLASS, false);
    }

    function positionSelectedStrip(){
        if (!compareSymbol){
            selectedStrip.style("display", "none");
        }else {
            var left;
            var width;

            var button = indexSymbolToButton[compareSymbol];
            if (button){
                width = INDEX_BUTTON_WIDTH;
                left = button.node().offsetLeft;
            }else{
                left = serachSymbolDiv.node().offsetLeft;
                width = SEARCH_SYMBOL_WIDTH;
            }

            selectedStrip.style({
                left: left + "px",
                width: width + "px",
                display: ""
            });
        }
    }

    /**Action Changes***/
    function selectCompareButtonBySymbol(symbol) {
        if (compareSymbol) {
            unmarkCompareButton(compareSymbol)
        }
        compareSymbol = symbol;
        if (!compareSymbol) {
            clearState(true);
        } else {
            showCancel();
            markCompareButton(compareSymbol);
            papaChartTop.hideChartSelection();
        }

        positionSelectedStrip();
    }

    function respondToSymbolSelected(symbol) {
        selectCompareButtonBySymbol(symbol);
        chartComponent.respondToCompareSelection();
        papaChartTop.respondToCompareSelection();
    }

    function clearState(calledFromWithin) {
        compareSymbol = undefined;
        hideCancel();
        papaChartTop.showChartSelection();
        if (!calledFromWithin || selectSymbolComponent.getSelectedSymbol()){ //In case this was called by the user typing gibrish, leave the gibrish
            selectSymbolComponent.clearSelection();
        }
        unmarkIndexButtons();
        positionSelectedStrip();
    }

    function clearStateAndInformPapa() {
        clearState();
        chartComponent.respondToCompareSelection();
    }

    function respondToNewSymbol(newSymbol) {
        var prevIsCurrency = isCurrency;

        drillSymbol = newSymbol;
        isCurrency = getIsCurrency(drillSymbol);
        selectSymbolComponent.setMainSymbol(drillSymbol);
        resetIndexVisibility();

        if (prevIsCurrency != isCurrency){
            clearStateAndInformPapa();
        }

    }

    function hideIndexButtons(){
        nasdaqButton.style("display", "none");
        dowButton.style("display", "none");
        snpButton.style("display", "none");
    }

    function showIndexButtons(){
        nasdaqButton.style("display", "inline-block");
        dowButton.style("display", "inline-block");
        snpButton.style("display", "inline-block");
    }


    /***Event Listener***/
    function onCompareClick() {
        var target = d3.event.target;
        var clickedSymbol = d3.select(target).datum();
        if (compareSymbol == clickedSymbol) { //Second click is like cancel
            clickedSymbol = "";
        }
        selectCompareButtonBySymbol(clickedSymbol);

        chartComponent.respondToCompareSelection();
        papaChartTop.respondToCompareSelection();
    }

}