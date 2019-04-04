/**
 * Created by yoni_ on 11/27/2015.
 */
function StockAutoCompleteList() {
    var me = this;

    //Constants
    //Constants Layout
    var MAX_SEARCH_BOX_HEIGHT = 430;
    var SYMBOL_FONT_SIZE = 14;
    var NAME_FONT_SIZE = 12;
    var PADDING_FROM_EDGE = 5;
    var VERTICAL_PAD = 5;
    //Constants Data
    var MAX_NUMBER_OF_OPTIONS = 10;
    //Constants Color
    var HOVERED_BG_COLOR = "#dddddd";
    var KEY_HOVERED_BG_COLOR = "#cccccc";
    var BOX_SHADOW = "rgba(0,0,0,0.3) 1px 1px 1px 1px";
    //Time
    var HIDE_DELAY = 500;

    //Structure elements
    var externalDiv;

    //Data
    var searchText;
    var optionsList;

    onNew();
    var symbolList = StockAutoCompleteList.SymbolList;

    //State
    var focusedEntry;
    var keyFocsuedEntry;
    var firstEntry;
    var symbolMatchCount;
    var keyBoardFocusIndex = undefined;
    var maxNumberOfOptions = MAX_NUMBER_OF_OPTIONS;

    //Utils
    var entryDivsList;

    //State
    var isCurrency;
    var clickNameSpace = "StockAutoCompleteList" + getUniqueIDGlobal();

    //Util
    var recentlySelectedList = [];

    //Help manage clicks on body (checks if the click was made on an option)
    me.isOptionClicked;

    /**Public functions**/
    this.setExternalDiv = function (divHTML) {
        externalDiv = d3.select(divHTML);
    };

    this.setSearchText = function (text) {
        keyBoardFocusIndex = undefined;
        searchText = text.trim();
    };

    this.setIsCurrency = function (boolean) {
        isCurrency = boolean;
        if (isCurrency == undefined) {
            isCurrency = false;
        }
    };

    this.setOptionsCount = function(count){
        maxNumberOfOptions = iMath.min(count, MAX_NUMBER_OF_OPTIONS);
    };

    this.getFocusedIndex = function(){
        return keyBoardFocusIndex;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.selectKeyFocusedOption = function () {
        selectKeyFocusedOption();
    };

    this.addKeyboardFocusIndex = function () {
        addKeyboardFocusIndex();
    };

    this.reduceKeyboardFocusIndex = function () {
        reduceKeyboardFocusIndex();
    };

    this.fillDefaultOptionsList = function (showUnique, excludeSymbols) {
        keyBoardFocusIndex = undefined;
        performConstruct();
        fillDefaultOptionsList(showUnique, excludeSymbols);
    };

    this.hideList = function(){
        hideList();
    };

    this.showList = function(){
        showList();
        me.isOptionClicked = false;
    };

    /**On First New**/
    function onNew() {
        if (!StockAutoCompleteList.SymbolList) {
            StockAutoCompleteList.SymbolList = Object.keys(nasdaqListings);
            StockAutoCompleteList.SymbolList = StockAutoCompleteList.SymbolList.concat(Object.keys(currencySymbols));
        }
    }

    /**Construction**/
    function drawComponent() {
        keyBoardFocusIndex = undefined;
        performConstruct();
        calculateOptionsList();
        createAllEntries();
    }

    function performConstruct() {
        externalDiv.style({
            overflow: "auto",
            "max-height": MAX_SEARCH_BOX_HEIGHT + "px",
            "box-shadow": BOX_SHADOW,
            display: ""
        });
        clearSlate(externalDiv);
    }

    function createAllEntries() {
        entryDivsList = [];
        var entryDiv;
        for (var i = 0; i < optionsList.length; i++) {
            entryDiv = createEntry(optionsList[i]);
            entryDivsList.push(entryDiv);
        }
        firstEntry = entryDivsList[0];
    }

    function addSuggestionText() {
        var suggestionP = externalDiv.append("p")
            .style({
                padding: PADDING_FROM_EDGE + "px",
                "padding-bottom": 2 + "px",
                margin: 0,
                "font-size": 12 + "px",
                "font-weight": "bold",
                "color": "#999999"
            })
            .text("Suggestions:")
    }

    function createEntry(symbol) {
        var name = getNameFromSymbol(symbol, true);

        var entryDiv = externalDiv.append("div")
            .style({
                overflow: "hidden",
                padding: PADDING_FROM_EDGE + "px",
                "padding-top": VERTICAL_PAD + "px",
                "padding-bottom": VERTICAL_PAD + "px",
                cursor: "pointer"
            })
            .attr("title", name)
            .datum(symbol)
            .on("mouseenter", onMouseEnter)
            .on("mouseleave", onMouseLeave)
            .on("mousedown", onEntryMouseDown)
            .on("click", onClick);

        var symbolP = entryDiv.append("p")
            .style({
                "font-size": SYMBOL_FONT_SIZE + "px",
                margin: 0
            })
            .text(symbol);

        var nameP = entryDiv.append("p")
            .style({
                "font-size": NAME_FONT_SIZE + "px",
                overflow: "hidden",
                margin: 0,
                "text-overflow": "ellipsis",
                "white-space": "nowrap"
            })
            .text(name);

        return entryDiv;
    }

    /**Construction End.**/

    /**Data Processing**/
    function calculateOptionsList() {
        optionsList = [];
        symbolMatchCount = 0;
        for (var i = 0; i < symbolList.length; i++) {
            evaluateSymbol(symbolList[i]);
        }
        if (optionsList.length > maxNumberOfOptions) {
            optionsList.splice(maxNumberOfOptions, optionsList.length);
        }
    }

    function isCorrectType(symbol) {
        var isOptionACurrency = getIsCurrency(symbol);
        var isIt = (isCurrency && isOptionACurrency) || (!isCurrency && !isOptionACurrency);
        return isIt;
    }

    //For perfect match add as first, then symbol matches, then name matches
    function evaluateSymbol(symbol) {
        var isOptionACurrency = getIsCurrency(symbol);

        if (isCurrency == undefined || (isCurrency && isOptionACurrency) || (!isCurrency && !isOptionACurrency)) {
            var name = getNameFromSymbol(symbol, true);
            var searchTextLowerCase = searchText.toLowerCase();
            var isPerfectMatch = (symbol.toLowerCase() == searchTextLowerCase);
            var isPerfectName = (name.toLowerCase() == searchTextLowerCase);

            if (isPerfectMatch) {
                addAsFirstToArray(optionsList, symbol);
                symbolMatchCount++;
            } else if (doesContainSubStr(symbol, searchText) || isPerfectName) {
                addToArrayByIndex(optionsList, symbol, symbolMatchCount);
                symbolMatchCount++;
            } else if (doesContainSubStr(name, searchText)) {
                optionsList.push(symbol);
            }
        }
    }

    /**Data Processing End.**/


    /**UI Changes**/
    function markAsHovered(entryDiv) {
        entryDiv.style({
            background: HOVERED_BG_COLOR
        })
    }

    function unmarkAsHovered(entryDiv) {
        entryDiv.style({
            background: "none"
        })
    }

    function markAsKeyHovered(entryDiv) {
        entryDiv.style({
            background: KEY_HOVERED_BG_COLOR
        })
    }

    function hideList() {
        externalDiv.style({
            display: "none"
        });
        removeEventFromBody();
    }

    function showList() {
        externalDiv.style({
            display: ""
        });
        attachEventToBody();
    }

    function fillDefaultOptionsList(showUnique, excludeSymbols) {
        if (!excludeSymbols){
            excludeSymbols = [];
        }

        optionsList = [];
        var counter = 0;
        var symbol;

        if (!showUnique) {
            for (var j = 0; j < SymbolList.length && counter < maxNumberOfOptions; j++) {
                symbol = SymbolList[j];
                if (isCorrectType(symbol) && (optionsList.indexOf(symbol) < 0) && excludeSymbols.indexOf(symbol) == -1) {
                    optionsList.push(symbol);
                    counter++;
                }
            }
        }

        for (var k = 0; k < DEFAULT_SELECT_OPTIONS.length && counter < maxNumberOfOptions; k++) {
            symbol = DEFAULT_SELECT_OPTIONS[k];
            if (isCorrectType(symbol) && (optionsList.indexOf(symbol) < 0) &&
                (SymbolList.indexOf(symbol) < 0) && excludeSymbols.indexOf(symbol) == -1) {
                optionsList.push(symbol);
                counter++;
            }
        }

        symbolMatchCount = optionsList.length;

        addSuggestionText();
        createAllEntries();
    }

    /**UI Changes End.**/

    /**Actions!**/
    function selectKeyFocusedOption() {
        if (optionsList.length > 0) {
            if (keyBoardFocusIndex == undefined) {
                keyBoardFocusIndex = 0;
            }

            var symbol = optionsList[keyBoardFocusIndex];
            markAsHovered(firstEntry);
            dispatchEventByNameAndData(externalDiv, StockAutoCompleteList.STOCK_SOLECTES_EVENT, symbol);
            hideList();
        }
    }

    function reduceKeyboardFocusIndex() {
        if (entryDivsList.length > 0) {
            updateKeyFocusedEntryIndexNumber(-1);
            setFocusedByIndex();
        }
    }

    function addKeyboardFocusIndex() {
        if (entryDivsList.length > 0) {
            updateKeyFocusedEntryIndexNumber(1);
            setFocusedByIndex();
        }

    }

    function updateKeyFocusedEntryIndexNumber(addAmount) {
        if (keyBoardFocusIndex == undefined) {
            if (addAmount > 0) {
                keyBoardFocusIndex = 0;
            } else {
                keyBoardFocusIndex = entryDivsList.length - 1;
            }
        } else {
            keyBoardFocusIndex += addAmount;
            if (keyBoardFocusIndex < 0) {
                keyBoardFocusIndex = entryDivsList.length + keyBoardFocusIndex;
            } else {
                keyBoardFocusIndex = keyBoardFocusIndex % entryDivsList.length;
            }
        }
    }

    function setFocusedByIndex() {
        if (keyFocsuedEntry) {
            if (!isSameEntry(focusedEntry, keyFocsuedEntry)) {
                unmarkAsHovered(keyFocsuedEntry);
            } else if (focusedEntry) {
                markAsHovered(focusedEntry);
            }
        }
        keyFocsuedEntry = entryDivsList[keyBoardFocusIndex];
        markAsKeyHovered(keyFocsuedEntry);
    }

    /**Actions! End.**/

    /**Event Manager***/
    function attachEventToBody() {
        d3.select("body")
            .on("mousedown." + clickNameSpace, onBodyMouseDown);
    }

    function removeEventFromBody() {
        d3.select("body")
            .on("mousedown." + clickNameSpace, null);
    }

    /**Event Listeners**/
    function onMouseEnter() {
        var d3Target = d3.select(d3.event.currentTarget);
        if (focusedEntry && !isSameEntry(focusedEntry, keyFocsuedEntry)) {
            unmarkAsHovered(focusedEntry);
        }

        focusedEntry = d3Target;
        if (!isSameEntry(focusedEntry, keyFocsuedEntry)) {
            markAsHovered(d3Target);
        }
    }

    function onMouseLeave() {
        if (!isSameEntry(focusedEntry, keyFocsuedEntry)) {
            unmarkAsHovered(focusedEntry);
        }
    }

    function onEntryMouseDown() {
        me.isOptionClicked = true;
    }

    function onClick() {
        var d3Target = d3.select(d3.event.currentTarget);
        var symbol = d3Target.datum();
        hideList();
        dispatchEventByNameAndData(externalDiv, StockAutoCompleteList.STOCK_SOLECTES_EVENT, symbol);

        if (recentlySelectedList.indexOf(symbol) < 0) {
            addAsFirstToArray(recentlySelectedList, symbol);
        }
    }

    function onBodyMouseDown() {
        if (!me.isOptionClicked) {
            hideList();
            dispatchEventByNameAndData(externalDiv, StockAutoCompleteList.HIDE_EVENT);
        }
        me.isOptionClicked = false;
    }

    /**Event Listeners End.**/

    /**General Utils**/
    function isSameEntry(entry1, entry2) {
        var areThey;
        if (!entry1 || !entry2) {
            areThey = false;
        } else {
            areThey = (entry1.node() == entry2.node());
        }

        return areThey;
    }

}

StockAutoCompleteList.SymbolList;
StockAutoCompleteList.HIDE_EVENT = "stockSelectorHideEvent";
StockAutoCompleteList.STOCK_SOLECTES_EVENT = "stockSelectedEvent";