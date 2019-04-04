function StockListContainer() {
    var scrollManager = new DragAndDropScrollManager();

    var me = this;
    //Constants
    //Text
    var DETAIL_VIEW_HERE = "Click a stock for more info";
    //Layout Constants
    var HIDE_BUTTON_SIZE = 14;
    var HOVERED_CARD_HEIGHT = 335;
    var TITLE_HEIGHT = 42;
    var HEADER_HEIGHT = 25;
    var CARD_CONTENT_PADDING = 5;
    var HEADER_FONT_SIZE = 12;
    var REMOVE_ICON_SIZE = 16;
    var EXPAND_ICON_WIDTH = 24;
    var EXPAND_ICON_HEIGHT = 19;
    var ADD_ICON_SIZE = 18;
    var ADD_NEW_ENTRY_HEIGHT = 50;
    //Color Constants
    var TITLE_BG = "#333333";
    var HOVER_CARD_BG_GRADIENT = "linear-gradient(#000000, #333333)";
    var TITLE_BORDER_COLOR = "rgb(218, 222, 222)";
    var HIDE_BUTTON_COLOR = "#eeeeee";
    var LIST_BG_COLOR = "#F4F4F4";
    var HEADER_BG_COLOR = "#aaaaaa";
    var HEADER_FONT_COLOR = "#fefefe";
    var ADD_ENTRY_BORDER_COLOR = "rgb(218, 222, 222)";
    //Animation Constants
    var OPEN_CARD_DURATION = 300;

    //Structure Elements
    var externalDiv;
    var parentDiv;
    var titleDiv;
    var headerDiv;
    var contentDiv;
    var listDiv;
    var listContentDiv;
    var hoverCardDiv;
    var hoverCardContent;
    var emptyBottomPaddingDiv;
    var addNewEntryDiv;
    //List Header
    var listTitleName;
    var listTitleToday;
    var listTitleTotal;
    //Container Title
    var addButton;
    var removeButton;
    var expandButton;
    var drillTitlePElement;

    //Layout params
    var parentWidth;
    var parentHeight;
    var contentHeight;
    var cardWidth;
    var listWidth;

    //Data
    var symbolsList;
    var stockDataList;

    //UI Objects
    var stockList = new StockList();
    var hoverCard = new StockListHoverCard();
    var shapeUtil = ShapesUtil.getInstance();
    var revertActionService = RevertActionService.getInstance();
    var drillWindow = DrillWindow.getInstance();
    var addEntryUtil = new AddEntryUtil();
    var papaMainView;

    //State
    var isCardOpen;
    var isCardMidAnimation;
    var selectedStock;
    var newStockData;
    var titleSortBy;
    var titleSortDirection;
    var isDrillState;
    //Action state
    var removedSymbol;
    var removedIndex;
    var prevSymbolList;

    /**Public functions**/
    this.setExternalDiv = function (divHTML) {
        externalDiv = d3.select(divHTML);
    };

    this.setSymbolsList = function (stringList) {
        symbolsList = stringList;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.setSelectedStock = function (stockData) {
        setSelectedStock(stockData);
    };

    this.setPapaComponent = function (papaComponent) {
        papaMainView = papaComponent;
    };

    this.applyDrillState = function (symbol) {
        applyDrillState(symbol);
    };

    this.hideHoverCard = function () {
        hideHoverCard();
    };

    this.addEntry = function (symbol) {
        addToSymbolsList(symbol);
        stockList.addEntry(symbol);
        repositionHoverCard();
        alignListTilesPosition();

        if (isDrillState) {
            var stockData = getStockDataBySymbolGlobal(symbol);
            setSelectedStock(stockData);
        }
    };

    this.addNewData = function (stockData) {
        stockList.addNewData(stockData);
        newStockData = stockData;
        if (selectedStock && stockData.symbol == selectedStock.symbol) {
            setSelectedStock(stockData);
            stockList.setSelectedStockData(stockData);
        }
    };

    this.sortAndRedraw = function (sortType, sortDirection) {
        sortAndRedraw(sortType, sortDirection);
    };

    this.updateHoverCardPortfolioSection = function () {
        updateHoverCardPortfolioSection();
    };

    this.startFresh = function () {
        startFresh();
    };

    this.revertStartFresh = function () {
        revertStartFresh();
    };

    this.fadeAwayHoverCard = function () {
        fadeAwayHoverCard();
    };

    this.fadeBackHoverCard = function () {
        fadeBackHoverCard();
    };

    this.clearStates = function () {
        clearStates();
    };

    this.resetChartTypeAndRedraw = function(isCandleInput){
        if (isCardOpen){
            hoverCard.resetChartTypeAndRedraw(isCandleInput);
        }
    };

    this.redrawChartByVolumeVisibility = function(){
        if (isCardOpen){
            hoverCard.redrawChartByVolumeVisibility();
        }
    };

    /**Inner Public Functions***/
    this.completelyRemove = function (symbol) {
        completelyRemove(symbol);
    };

    this.executeInnerAddEntry = function(symbol){
        executeInnerAddEntry(symbol);
    };

    /**Construction***/
    function drawComponent() {
        isDrillState = false;
        fillStockDataList();
        performConstruct();
        if (isCardOpen) {
            openHoverCard(true);
        }
    }

    function performConstruct() {
        var externalDivDOM = externalDiv.node();
        externalDiv.select("div").remove(); //Clear slate

        parentHeight = externalDivDOM.clientHeight;
        parentWidth = externalDivDOM.clientWidth;
        contentHeight = parentHeight - TITLE_HEIGHT - HEADER_HEIGHT;

        parentDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: 0 + "px",
                height: parentHeight + "px",
                width: parentWidth + "px"
            });

        titleDiv = parentDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: 0 + "px",
                right: 0 + "px",
                height: TITLE_HEIGHT + "px",
                background: TITLE_BG
            });

        headerDiv = parentDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: TITLE_HEIGHT + "px",
                right: 0 + "px",
                height: HEADER_HEIGHT + "px",
                background: HEADER_BG_COLOR,
                color: HEADER_FONT_COLOR,
                "border-bottom": "1px solid " + TITLE_BORDER_COLOR,
                "box-sizing": "border-box",
                "font-size": HEADER_FONT_SIZE + "px"
            });

        contentDiv = parentDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: TITLE_HEIGHT + HEADER_HEIGHT + "px",
                right: 0 + "px",
                bottom: 0 + "px"
            })
            .attr("name", "ListContentPapaDiv");

        listDiv = contentDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: 0 + "px",
                right: 0 + "px",
                bottom: 0 + "px",
                "overflow-y": "auto",
                "overflow-x": "hidden",
                background: LIST_BG_COLOR,
                cursor: "default"
            });
        scrollManager.setScrollContainer(listDiv.node());


        listContentDiv = listDiv.append("div")
            .attr("name", "ListContentDiv");

        addNewEntryDiv = listDiv.append("div")
            .style({
                width: "100%",
                position: "relative",
                height: ADD_NEW_ENTRY_HEIGHT + "px",
                "border-bottom": "1px solid " + ADD_ENTRY_BORDER_COLOR
            })
            .attr("name", "ListAddNewEntryDiv");
        addEntryUtil.setExternalDiv(addNewEntryDiv);
        addEntryUtil.setPapaComponent(me)
        addEntryUtil.drawComponent();

        emptyBottomPaddingDiv = listDiv.append("div")
            .style({
                width: "100%",
                position: "relative",
                height: HOVERED_CARD_HEIGHT + "px"
            })
            .attr("name", "ListEmptyBottomPaddingDiv");
        fillBottomPaddingDiv();

        stockList.setExternalDiv(listContentDiv.node());
        stockList.setScrollDiv(listDiv);
        stockList.setSymbols(symbolsList);
        stockList.setStockListContainer(me);
        stockList.drawComponent();

        cardWidth = listDiv.node().clientWidth - 1; //-1 for shadow

        hoverCardDiv = contentDiv.append("div").style({
                position: "absolute",
                left: -cardWidth + "px",
                bottom: 0 + "px",
                width: cardWidth + "px",
                height: HOVERED_CARD_HEIGHT + "px",
                "box-shadow": "rgba(0,0,0,0.7) 1px -2px 3px",
                display: "none"
            })
            .attr("name", "hoverCardDiv");

        var hoverCardBG = hoverCardDiv.append("div").style({
            position: "absolute",
            left: 0 + "px",
            bottom: 0 + "px",
            right: 0 + "px",
            top: 0 + "px",
            "background-image": HOVER_CARD_BG_GRADIENT,
            opacity: 0.93
        });


        hoverCardContent = hoverCardDiv.append("div").style({
            position: "absolute",
            left: CARD_CONTENT_PADDING + "px",
            bottom: CARD_CONTENT_PADDING + "px",
            right: CARD_CONTENT_PADDING + "px",
            top: CARD_CONTENT_PADDING + "px"
        });

        hoverCard.setExternalDiv(hoverCardContent.node());
        hoverCard.setContainerPapa(me);

        fillHeader();

        fillTitleButtons();
    }

    function fillTitleButtons() {
        var removeIconPad = (TITLE_HEIGHT - REMOVE_ICON_SIZE) / 2 - 2;
        removeButton = titleDiv.append("div")
            .style({
                position: "absolute",
                top: removeIconPad + "px",
                right: removeIconPad + "px",
                height: REMOVE_ICON_SIZE + "px",
                width: REMOVE_ICON_SIZE + "px",
                cursor: "pointer"
            })
            .classed("iconButton", true)
            .attr("title", "Completely Remove Item")
            .on("click", onRemoveClick);

        shapeUtil.createGarbageCan(removeButton, REMOVE_ICON_SIZE, REMOVE_ICON_SIZE + 2, "#cccccc");

        var addIconPad = (TITLE_HEIGHT - ADD_ICON_SIZE) / 2 - 2;
        addButton = titleDiv.append("div")
            .style({
                position: "absolute",
                top: addIconPad + "px",
                right: removeIconPad + REMOVE_ICON_SIZE + removeIconPad + "px",
                height: ADD_ICON_SIZE + "px",
                width: ADD_ICON_SIZE + "px",
                cursor: "pointer"
            })
            .classed("iconButton", true)
            .attr("title", "Add Card")
            .on("click", onAddClick);

        shapeUtil.createPlusSign(addButton, ADD_ICON_SIZE, ADD_ICON_SIZE);

        expandButton = titleDiv.append("div")
            .style({
                position: "absolute",
                top: addIconPad + "px",
                right: removeIconPad + REMOVE_ICON_SIZE + removeIconPad + ADD_ICON_SIZE + removeIconPad - 2 + "px",
                height: EXPAND_ICON_HEIGHT + "px",
                width: EXPAND_ICON_WIDTH + "px",
                //visibility: "hidden",
                cursor: "pointer"
            })
            .classed("iconButton", true)
            .attr("title", "Go Full Screen")
            .on("click", onExpandClick);

        shapeUtil.createExpandIcon(expandButton, EXPAND_ICON_WIDTH, EXPAND_ICON_HEIGHT, "#cccccc", 3);

        if (!selectedStock) {
            hideTitleButtons();
        }


        drillTitlePElement = titleDiv.append("p")
            .style({
                position: "absolute",
                color: "white",
                margin: 0,
                left: 10 + "px",
                height: TITLE_HEIGHT + "px",
                "line-height": TITLE_HEIGHT + "px",
                display: "none"
            })
            .text("Navigate Here To Drill");
    }

    function fillHeader() {
        listTitleName = createHeader("NAME", SORT_BY_OPTIONS.ALPHABET);
        listTitleToday = createHeader("TODAY", SORT_BY_OPTIONS.TODAY_CHANGE);
        listTitleTotal = createHeader("TOTAL", SORT_BY_OPTIONS.TOTAL_GAIN);

        listTitleName.style("padding-left", 10 + "px");
        listTitleToday.style("width", 72 + "px");
        listTitleTotal.style("width", 70 + "px");

        alignListTilesPosition();
    }

    function createHeader(textStr, sortBy) {
        var titleDiv = headerDiv.append("div")
            .style({
                display: "inline-block",
                margin: 0,
                height: HEADER_HEIGHT + "px",
                "box-sizing": "border-box",
                cursor: "pointer"
            })
            .datum(sortBy)
            .on("click", onHeaderClick);

        var pElement = titleDiv.append("p")
            .style({
                position: "absolute",
                margin: 0,
                height: HEADER_HEIGHT + "px",
                "line-height": HEADER_HEIGHT + "px"
            })
            .text(textStr);

        return titleDiv;
    }

    function fillBottomPaddingDiv() {
        var containerDiv = emptyBottomPaddingDiv.append("div")
            .style({
                position: "absolute",
                top: 10 + "px",
                left: 10 + "px",
                bottom: 10 + "px",
                right: 10 + "px",
                border: "1px solid " + "#cccccc"
            });

        containerDiv.append("p")
            .style({
                color: "#999999",
                "text-align": "center",
                "margin-top": 50 + "px"
            })
            .text(DETAIL_VIEW_HERE)
    }

    function fillHoverCardByData() {
        if (selectedStock) {
            hoverCard.setData(selectedStock);
            hoverCard.drawComponent();
        }
    }

    function repositionHoverCard() {
        if (isCardOpen) {
            redrawOpenCard();
        }
    }

    function redrawOpenCard() {
        var prevCardWidth = cardWidth;
        alignHoverCardPosition();
        var hasBeenResized = prevCardWidth != cardWidth; //The scroll appeared or disappeard
        if (hasBeenResized) {
            fillHoverCardByData();
        }
    }


    /**Layout calculations**/
    function calculateCardWidth() {
        cardWidth = listDiv.node().clientWidth - 1; //-1 for shadow
    }

    function calculateListWidth() {
        listWidth = listDiv.node().clientWidth;
    }

    /**Layout calculations End.**/

    /**Actions!**/
    function startFresh() {
        prevSymbolList = [];
        for (var i = 0; i < symbolsList.length; i++) {
            prevSymbolList.push(symbolsList[i]);
        }
        symbolsList.splice(0, symbolsList.length);

        hideTitleButtons();
        stockList.unselectSymbol();
        hideHoverCard();
        redrawList();
    }

    function revertStartFresh() {
        for (var i = 0; i < prevSymbolList.length; i++) {
            symbolsList.push(prevSymbolList[i]);
        }
        redrawList();
    }

    function sortAndRedraw(sortType, sortDirection) {
        sortSymbolList(sortType, sortDirection);
        alignPrevChangeOfAllStocks();
        stockList.drawComponent();
        repositionHoverCard();
        informActionToSave();
    }

    function completelyRemove(symbol) {
        var funGrid = FunGrid.getInstance();
        funGrid.removeCardsBySymbol(symbol);
        removedSymbol = symbol;
        removedIndex = symbolsList.indexOf(removedSymbol);
        symbolsList.splice(removedIndex, 1);

        var isSelectedSymbolDeleted = (selectedStock && symbol == selectedStock.symbol);
        if (isSelectedSymbolDeleted) {
            hideTitleButtons();
            stockList.unselectSymbol();
            hideHoverCard();
            if (isDrillState) {
                respondToDeleteInDrill();
            }
        }

        redrawList();

        if (!isSelectedSymbolDeleted) {
            repositionHoverCard();
        }

        revertActionService.showMessage("Completely Removed", completelyRevive, 300);
    }

    function completelyRevive() {
        var funGrid = FunGrid.getInstance();
        funGrid.reviveAllRemovedCards();

        symbolsList.splice(removedIndex, 0, removedSymbol);
        redrawList();
        alignListTilesPosition();

        if (!isDrillState && selectedStock && removedSymbol == selectedStock.symbol) {
            openHoverCard();
        }
    }

    function respondToDeleteInDrill() {
        if (symbolsList.length > 0) {
            var firstSymbol = symbolsList[0];
            setSelectedStock(getStockDataBySymbolGlobal(firstSymbol));
        }else{
            drillWindow.slideOutPanel();
        }
    }

    function redrawList() {
        stockList.setSymbols(symbolsList);
        stockList.drawComponent();
    }

    function showTitleButtons() {
        removeButton.style("display", "");
        addButton.style("display", "");
        expandButton.style("display", "");
    }

    function hideTitleButtons() {
        removeButton.style("display", "none");
        addButton.style("display", "none");
        expandButton.style("display", "none");
    }

    function addCard(symbol) {
        var funGrid = FunGrid.getInstance();
        var newCardData = createNewCardDataGlobal(symbol);
        funGrid.addNewCard(newCardData);
    }

    function executeInnerAddEntry(symbol){
        var isActuallyNew = (symbolsList.indexOf(symbol) == -1);
        FunGrid.getInstance().respondToAddNewCard(symbol, undefined, undefined, 0);
        stockList.moveEntryToLast(symbol);
        if (isActuallyNew){
            listDiv.node().scrollTop = listDiv.node().scrollTop + ADD_NEW_ENTRY_HEIGHT;
        }
    }

    /**Actions! Ens.**/

    /**Data processing***/
    function fillStockDataList() {
        stockDataList = [];
        var stockData;
        for (var i = 0; i < symbolsList.length; i++) {
            stockData = SymbolToData[symbolsList[i]];
            stockDataList.push(stockData)
        }
    }

    function addToSymbolsList(symbol) {
        if (symbolsList.indexOf(symbol) < 0) {
            addAsFirstToArray(symbolsList, symbol);
        }
    }

    function sortSymbolList(sortType, sortDirection) {
        symbolsList.sort(compareFunction);

        //Inner function
        function compareFunction(symbol1, symbol2) {
            var stockData1 = SymbolToData[symbol1];
            var stockData2 = SymbolToData[symbol2];
            return sortHelper(sortType, sortDirection, stockData1, stockData2);
        }
    }

    function alignPrevChangeOfAllStocks() {
        var stockData;
        var symbol;
        for (var i = 0; i < symbolsList.length; i++) {
            symbol = symbolsList[i];
            stockData = SymbolToData[symbol];
            if (stockData) {
                stockData.alignPrevChange();
            }
        }
    }

    function sortHelper(sortType, sortDirection, stockData1, stockData2) {
        var retValue = 0;
        switch (sortType) {
            case SORT_BY_OPTIONS.TODAY_CHANGE:
                retValue = compareValuesForSort(stockData1.getChangePercentage(), stockData2.getChangePercentage(), sortDirection, stockData1.symbol, stockData2.symbol);
                break;
            case SORT_BY_OPTIONS.TOTAL_GAIN:
                retValue = compareValuesForSort(stockData1.getTotalGainPercentage(), stockData2.getTotalGainPercentage(), sortDirection, stockData1.symbol, stockData2.symbol);
                break;
            case SORT_BY_OPTIONS.ALPHABET:
                retValue = compareValuesForSort(0, 0, sortDirection, stockData1.symbol, stockData2.symbol);
                break;
        }
        return retValue;
    }

    /**Data processing End.***/

    /**UI Changes***/
    function alignHoverCardPosition() {
        var lisScrollTop = listDiv.node().scrollTop;
        calculateCardWidth();

        if (lisScrollTop == 0) { //There is no scroll, so we might need to position the hover card higher
            var hoverCardBottom = contentDiv.node().clientHeight - listContentDiv.node().clientHeight;
            hoverCardBottom = hoverCardBottom - (HOVERED_CARD_HEIGHT + ADD_NEW_ENTRY_HEIGHT);
            hoverCardBottom = iMath.max(hoverCardBottom, 0);
            hoverCardDiv.style("bottom", hoverCardBottom + "px");
        } else {
            hoverCardDiv.style("bottom", 0);
        }

        hoverCardDiv.style("width", cardWidth + "px");
        if (!isCardOpen) {
            hoverCardDiv.style("left", -cardWidth + "px");
        }
    }

    function alignListTilesPosition() {
        calculateListWidth();
        var nameTitleWidth = listWidth - 72 - 70;
        listTitleName.style("width", nameTitleWidth + "px");
    }

    function openHoverCard(stopAnimation) {
        hoverCardDiv.style("display", "");
        alignHoverCardPosition();
        if (!stopAnimation) {
            isCardMidAnimation = true;
            hoverCardDiv.transition()
                .duration(OPEN_CARD_DURATION)
                .ease("cubic-out")
                .tween("pook", function (d) {
                    var leftInterpolate = d3.interpolate(-cardWidth, 0);
                    return function (t) {
                        hoverCardDiv.style("left", leftInterpolate(t) + "px");
                        if (t == 1) {
                            fillHoverCardByData();
                            hoverCardDiv.style("opacity", 1);
                            isCardOpen = true;
                            isCardMidAnimation = false;
                        }
                    }
                });
        } else {
            hoverCardDiv.style("left", 0);
            hoverCardDiv.style("opacity", 1);
            fillHoverCardByData();
            isCardOpen = true;
            isCardMidAnimation = false;
        }
    }

    function hideHoverCard() {
        isCardOpen = false;
        isCardMidAnimation = true;
        hoverCardDiv.transition()
            .duration(OPEN_CARD_DURATION)
            .ease("cubic-out")
            .tween("pook", function (d) {
                var leftInterpolate = d3.interpolate(0, -cardWidth);
                return function (t) {
                    hoverCardDiv.style("left", leftInterpolate(t) + "px");
                    if (t == 1) {
                        hideCardNow();
                    }
                }
            });
    }

    function applyDrillState() {
        if (selectedStock && selectedStock.symbol != drillWindow.getSelectedSymbol()) {
            clearStates();
        } else {
            hideCardNow();
            hideTitleButtons();
        }
        isDrillState = true;
        drillTitlePElement.style("display", "");
        emptyBottomPaddingDiv.style("display", "none");

        alignListTilesPosition();
    }

    function revertrillState() {
        isDrillState = false;
    }

    function hideCardNow() {
        hoverCardDiv.style("display", "none");
        drillTitlePElement.style("display", "none");
        hoverCard.clearContent();
        isCardOpen = false;
        isCardMidAnimation = false;
    }

    function updateHoverCardPortfolioSection() {
        hoverCard.updatePortfolioSection();
    }

    function fadeAwayHoverCard() {
        hoverCardDiv.transition()
            .duration(300)
            .tween("pook", function (d) {
                var interpolate = d3.interpolate(1, 0);
                return function (t) {
                    hoverCardDiv.style("opacity", interpolate(t));
                    if (t == 1) {
                        isCardMidAnimation = false;
                    }
                }
            });
    }

    function fadeBackHoverCard() {
        hoverCardDiv.transition()
            .duration(300)
            .tween("pook", function (d) {
                var interpolate = d3.interpolate(0, 1);
                return function (t) {
                    hoverCardDiv.style("opacity", interpolate(t));
                    if (t == 1) {
                        if (hoverCardDiv.style("display") == ""){
                            openHoverCard(false);
                        }
                        isCardMidAnimation = false;
                    }
                }
            });
    }

    /**State change**/
    function clearStates() {
        isDrillState = false;
        hideCardNow();
        selectedStock = undefined;
        hideTitleButtons();
        stockList.unselectSymbol();
        stockList.setSelectedStockData(undefined);

        emptyBottomPaddingDiv.style("display", "");

        alignListTilesPosition();
    }

    function setSelectedStock(stockData) {
        var isSelectionChanges = (!selectedStock || stockData.symbol != selectedStock.symbol);
        selectedStock = stockData;
        if (!isDrillState) {
            if (isCardOpen) {
                fillHoverCardByData();
            } else if (!isCardMidAnimation) {
                openHoverCard();
            }
            showTitleButtons();
        } else {
            stockList.setSelectedStockData(selectedStock);
            drillWindow.setSelectedSymbol(selectedStock.symbol);
        }
    }


    /**Event Listener***/
    function onHeaderClick() {
        var target = d3.event.target;
        var clickedSortBy = d3.select(target).datum();
        if (clickedSortBy == titleSortBy) {
            titleSortDirection = (titleSortDirection + 1) % 2;
        } else {
            titleSortDirection = SORT_BY_DIRECTION.ASCENDING;
            titleSortBy = clickedSortBy;
        }
        sortAndRedraw(titleSortBy, titleSortDirection);
    }

    function onRemoveClick() {
        var symbol = selectedStock.symbol;
        completelyRemove(symbol);
    }

    function onAddClick() {
        var symbol = selectedStock.symbol;
        addCard(symbol);
    }

    function onExpandClick() {
        drillWindow.introducePanel(selectedStock.symbol);
        shapeUtil.clearAllExpandIconsText();
    }
}

StockListContainer.getInstance = function () {
    if (!StockListContainer.instance) {
        StockListContainer.instance = new StockListContainer();
    }
    return StockListContainer.instance;
};