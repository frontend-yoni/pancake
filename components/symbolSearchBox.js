/**
 * Created by yoni_ on 11/27/2015.
 */
function SymbolSearchBox() {
    var ENTER_KEY_CODE = 13;
    var UP_KEY_CODE = 38;
    var DOWN_KEY_CODE = 40;
    //Constants
    var OPTION_LIST_TOP_PAD = 5;
    //Structure Elements
    var externalDiv;
    var searchBox;
    var optionBox;

    //Layout
    var fontSize;
    var parentHeight;

    //State
    var searchText;
    var dontShowDefaultSuggestions;

    //Util
    var optionsComponent = new StockAutoCompleteList();

    /**Public functions**/
    this.setExternalDiv = function (divHTML) {
        externalDiv = d3.select(divHTML);
    };

    this.setFontSize = function (num) {
        fontSize = num;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.activateSelection = function () {
        activateEnter();
    };

    this.focus = function () {
        searchBox.node().focus();
    };

    /**Construction**/
    function drawComponent() {
        performConstruct();
    }

    function performConstruct() {
        clearSlate(externalDiv);

        parentHeight = externalDiv.node().clientHeight;
        searchBox = externalDiv.append("input")
            .attr({
                "type": "text",
                "placeholder": "Search a Stock"
            })
            .style({
                width: "100%",
                height: "100%",
                "padding": 5 + "px",
                "padding-left": 8 + "px",
                "font-size": 16 + "px",
                "font-weight": 600,
                border: 0,
                background: "transparent"
            })
            .on("input", onInput)
            .on("focus", onFocus)
            .on("keyup", onKeyUp)
            .on("mousedown", onInputMouseDown);

        optionBox = externalDiv.append("div")
            .style({
                position: "absolute",
                width: "100%",
                border: "1px solid #999999",
                background: "white",
                top: parentHeight + OPTION_LIST_TOP_PAD + "px",
                left: 0,
                display: "none",
                "z-index": 1
            })
            .on(StockAutoCompleteList.STOCK_SOLECTES_EVENT, onOptionSelected);

        optionsComponent.setExternalDiv(optionBox.node());
    }

    /**Actions!**/
    function showList() {
        searchText = searchBox.node().value;
        optionsComponent.showList();

        if (searchText.length > 0) {
            optionsComponent.setSearchText(searchText);
            optionsComponent.drawComponent();
        } else {
            optionsComponent.fillDefaultOptionsList(true);
        }
    }

    function activateEnter() {
        searchText = searchBox.node().value;
        if (optionBox.style("display") != "none") {
            optionsComponent.selectKeyFocusedOption();
        }
    }

    /**Event Listener***/
    function onInput() {
        if (searchBox.node().value != searchText) {
            showList();
        }
    }

    function onKeyUp() {
        searchText = searchBox.node().value;
        switch (d3.event.keyCode) {
            case ENTER_KEY_CODE:
                activateEnter();
                break;

            case DOWN_KEY_CODE:
                optionsComponent.addKeyboardFocusIndex();
                break;

            case UP_KEY_CODE:
                optionsComponent.reduceKeyboardFocusIndex();
                break;
        }
    }

    function onFocus() {
        if (searchBox.node().value != "" || !dontShowDefaultSuggestions) {
            showList();
        }

        dontShowDefaultSuggestions = false;
    }

    function onInputMouseDown() {
        optionsComponent.isOptionClicked = true;
    }

    function onOptionSelected() {
        var prevValue = searchBox.node().value;
        searchBox.node().value = "";

        if (prevValue != "") {
            dontShowDefaultSuggestions = true;
            searchBox.node().focus();
        }
    }
}

SymbolSearchBox.getInstance = function () {
    if (!SymbolSearchBox.instance) {
        SymbolSearchBox.instance = new SymbolSearchBox();
    }

    return SymbolSearchBox.instance;
};