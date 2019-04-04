/**
 * Created by avitzur on 1/4/2016.
 */
function SelectSymbolSearchBox() {
    var me = this;
    /**CONSTANTS***/
    //Keys
    var ENTER_KEY_CODE = 13;
    var UP_KEY_CODE = 38;
    var DOWN_KEY_CODE = 40;
    //Style
    var BG_COLOR = "#FFFFFF";
    var BORDER_COLOR = "#c9cbcd";
    var BG_COLOR_SELECTED = "#f2f5f8";
    var BORDER_COLOR_SELECTED = "#B4B6B8";
    var FONT_COLOR_SELECTED = "#68696b";
    //Layout
    var DEFAULT_HEIGHT = 20;

    /**Externally Set***/
    //Structure
    var externalDiv;
    //Util
    var papaCompareSection;
    var respondToSymbolSelected;
    //Layout
    var width;
    var height = DEFAULT_HEIGHT;
    var bgColor = BG_COLOR;
    var bgColorSelected = BG_COLOR_SELECTED;
    //State
    var isCurrency;
    var dropDownIndex;
    //Data
    var excludeSymbols;
    var drillSymbol;
    var seriesColor;


    /**Internally Set***/
    //Structure
    var papaDiv;
    var inputElement;
    var dropButton;
    var optionsWindowDiv;
    //State
    var searchText = "";
    var externallyFocused;
    //Utils
    var optionsComponent = new StockAutoCompleteList();
    var shapeUtil = ShapesUtil.getInstance();
    var recentlySelectedList = [];
    //State
    var selectedSymbol;
    var isShowFullList;

    /**Public Function**/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.drawComponent = function () {
        performConstruct();
    };

    this.setPromptMessage = function () {
        resetPromptMessage();
    };

    this.setOptionsCount = function(count){
        optionsComponent.setOptionsCount(count);
    };

    this.setSelectedSymbol = function (symbol) {
        selectedSymbol = symbol;
        if (selectedSymbol) {
            inputElement.node().value = selectedSymbol;
            markAsSelected();
        }
    };

    this.focus = function () {
        externallyFocused = true;
        inputElement.node().focus();
    };

    this.setMainSymbol = function (symbolInput, isShort) {
        drillSymbol = symbolInput;
        excludeSymbols = [drillSymbol];
        isCurrency = getIsCurrency(drillSymbol);
        optionsComponent.setIsCurrency(isCurrency);
        resetPromptMessage(isShort);
    };

    this.setExcludeSymbols = function (symbolList) {
        excludeSymbols = symbolList;
    };

    this.setBGColors = function (regularColor, selectedColor) {
        bgColor = regularColor;
        bgColorSelected = selectedColor;
    };

    this.setPapaCompareSection = function (papaCompareSectionInput) {
        papaCompareSection = papaCompareSectionInput;
    };

    this.setFunctions = function (respondToSymbolSelectedFunc) {
        respondToSymbolSelected = respondToSymbolSelectedFunc;
        papaCompareSection = {
            respondToSymbolSelected: respondToSymbolSelected
        };
    };

    this.setLayout = function (widthInput, heightInput) {
        width = widthInput;
        height = heightInput;
    };

    this.clearSelection = function () {
        clearSelection();
    };

    this.setSeriesColor = function (color) {
        seriesColor = color;
    };

    this.getSelectedSymbol = function () {
        return selectedSymbol;
    };

    this.getDropDownIndex = function () {
        return dropDownIndex;
    };

    this.setDropDownIndex = function (index) {
        dropDownIndex = index;
    };

    /***Construct***/
    function performConstruct() {
        clearSlate(externalDiv);
        papaDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                left: 0,
                height: height + "px",
                width: width + "px"
            });

        inputElement = papaDiv.append("input")
            .attr("type", "text")
            .style({
                position: "absolute",
                top: 0 + "px",
                left: 0 + "px",
                width: width + "px",
                height: height + "px",
                "padding-left": 5 + "px",
                "padding-right": 20 + "px",
                "box-sizing": "border-box",
                "border-radius": 2 + "px",
                border: "1px solid " + BORDER_COLOR,
                "border-width": "1px",
                background: bgColor
            })
            .on("input", onInput)
            .on("focus", onFocus)
            .on("mousedown", onInputMouseDown)
            .on("keyup", onKeyUp);

        dropButton = papaDiv.append("div")
            .style({
                position: "absolute",
                top: 0 + "px",
                right: 0 + "px",
                width: height + "px",
                height: height + "px",
                cursor: "pointer"
            })
            .on("mousedown", onInputMouseDown)
            .on("click", onDropClick);

        var iconSize = height * 0.4;
        iconSize = iMath.min(iconSize, 10);
        var iconTop = (height - iconSize) / 2;
        var dropIcon = dropButton.append("div")
            .style({
                position: "absolute",
                top: iconTop + "px",
                right: iconTop + "px",
                width: iconSize + "px",
                height: iconSize + "px"
            });
        shapeUtil.createTriangle(dropIcon, iconSize, iconSize, shapeUtil.DIRECTION.BOTTOM, "#555555");

        optionsWindowDiv = papaDiv.append("div")
            .style({
                position: "absolute",
                top: height + 5 + "px",
                left: 0 + "px",
                width: width + 30 + "px",
                border: "1px solid black",
                background: "white",
                display: "none",
                "z-index": 2
            })
            .on(StockAutoCompleteList.STOCK_SOLECTES_EVENT, onOptionSelected)
            .on(StockAutoCompleteList.HIDE_EVENT, onListHide);
        optionsComponent.setExternalDiv(optionsWindowDiv.node());
    }

    function resetPromptMessage(isShort) {
        if (isCurrency) {
            inputElement.attr("placeholder", "Search a Currency");
        } else {
            inputElement.attr("placeholder", "Search a Stock");
        }

        if (isShort) {
            inputElement.attr("placeholder", "Search");
        }
    }

    /**Actions!**/
    function showList(dontFilter) {
        searchText = inputElement.node().value;
        optionsComponent.showList();
        if (searchText.length > 0 && !dontFilter) {
            optionsComponent.setSearchText(searchText);
            optionsComponent.drawComponent();
        } else {
            optionsComponent.fillDefaultOptionsList(false, excludeSymbols);
        }
    }

    function activateEnter() {
        searchText = inputElement.node().value;
        var isOptionsOpen = optionsWindowDiv.style("display") != "none";
        var isKeyFocused = optionsComponent.getFocusedIndex();

        if (isOptionsOpen && (isKeyFocused || searchText)) {
            optionsComponent.selectKeyFocusedOption();
        } else {
            clearSelection();
            papaCompareSection.respondToSymbolSelected(null, me);
            inputElement.node().blur();
            optionsComponent.hideList();
        }
    }

    function clearSelection() {
        selectedSymbol = undefined;
        inputElement.node().value = "";
        unmarkAsSelected();
    }

    function unmarkAsSelected() {
        inputElement.style({
            background: bgColor,
            "border-color": BORDER_COLOR_SELECTED,
            color: "initial",
            "font-weight": "normal"
        });
    }

    function markAsSelected() {
        inputElement.style({
            background: bgColorSelected,
            "border-color": BORDER_COLOR_SELECTED,
            color: FONT_COLOR_SELECTED,
            "font-weight": 700
        });
        inputElement.node().value = selectedSymbol;

        if (seriesColor) {
            inputElement.style("color", seriesColor);
        }
    }

    function disableSelectionAfterInput() {
        selectedSymbol = undefined;
        unmarkAsSelected();
        papaCompareSection.respondToSymbolSelected(null, me);
    }

    /**Event Listener***/
    function onInput() {
        if (inputElement.node().value != searchText) {
            showList();
            if (searchText != selectedSymbol){
                disableSelectionAfterInput();
            }
        }
    }

    function onKeyUp() {
        searchText = inputElement.node().value;
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

    function onInputMouseDown() {
        optionsComponent.isOptionClicked = true;
    }

    function onFocus() {
        unmarkAsSelected();
        if (!externallyFocused) {
            showList(isShowFullList);
        }

        isShowFullList = false;
        externallyFocused = false;
    }

    function onListHide() {
        if (selectedSymbol && selectedSymbol == inputElement.node().value) {
            markAsSelected();
        }
    }

    function onOptionSelected() {
        selectedSymbol = d3.event.detail.data;
        inputElement.node().value = selectedSymbol;
        papaCompareSection.respondToSymbolSelected(selectedSymbol, me);

        selectedSymbol = d3.event.detail.data;
        markAsSelected();
    }

    function onDropClick() {
        optionsComponent.isOptionClicked = true;
        isShowFullList = true;

        if (optionsWindowDiv.style("display") != "none") {
            optionsComponent.hideList();
        } else {
            inputElement.node().focus();
        }

    }

}