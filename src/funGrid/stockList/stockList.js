function StockList() {
    var me = this;

    /****Constants***/
    var DO_NOT_SELECT_ENTRY = "DO_NOT_SELECT_ENTRY";
    //Layout
    var ENTRY_HEIGHT = 50;
    var SELECTED_STROKE_WIDTH = 4;
    var MID_PADDING = 5;
    var RIGHT_PADDING = 10;
    var SYMBOL_FONT_SIZE = 16;
    var FULL_NAME_FONT_SIZE = 12;
    var VALUE_AREA_WIDTH = 60;
    var CHANGE_AREA_WIDTH = 60;
    var VALUE_FONT_SIZE = 16;
    var VALUE_FONT_SIZE_LONG = 13;
    var CHANGE_TOP = 10;
    var CHANGE_TOP_LONG = 13;
    //Color
    var BORDER_COLOR = "rgb(218, 222, 222)";
    var SELECTED_STROKE_COLOR = "#178FB7";
    var HOVERED_BG_COLOR = "#F1F1F1";
    var SELECTED_BG_COLOR = "#DDDDDD";
    var EVEN_ENTRY_BG_COLOR = /*"rgba(255,255,255, 0.7)"*/ "#FFFFFF";
    var ODD_ENTRY_BG_COLOR = /*"rgba(255,255,255, 0.2)"*/ "#FDFDFD";
    //Class
    var SELECTED_STROKE_CLASS = "selectedStrokeClass";
    var LIST_ENTRY_CLASS = "listEntryClass";
    var TODAY_AREA_CLASS = "valueAreaClass";
    var TOTAL_AREA_CLASS = "changeAreaClass";
    var NAME_AREA_CLASS = "nameAreaClass";
    var ENTRY_CONTENT_CLASS = "listEntryContentClass";
    var ENTRY_EMPTY_DROP_HINT_CLASS = "ENTRY_EMPTY_DROP_HINT_CLASS";
    var DELETE_ENTRY_BUTTON_CLASS = "DELETE_ENTRY_BUTTON_CLASS";
    //Attribute nam
    var ENTRY_BG_COLOR_ATTR = "entryBGColor";
    var SYMBOL_ATTR = "symbol";

    //Structure Elements
    var externalDiv;
    var scrollDiv;

    //Layout params

    //Data
    var stockDataList;
    var symbolList;
    var draggedDivEntry;
    var draggedSymbol;

    //State
    var selectedEntryDiv;
    var hoveredEntryDiv;
    var selectedStockData;

    //Utils
    var papaStockListContainer;
    var renderedSymbolList;
    var dragAndDropUtil = new ListEntryDragService();


    /**Public functions**/
    this.setExternalDiv = function (divHTML) {
        externalDiv = d3.select(divHTML);
    };

    this.setScrollDiv = function (scrollDivD3) {
        scrollDiv = scrollDivD3;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.setData = function (list) {
        stockDataList = list;
    };

    this.setSymbols = function (stringList) {
        symbolList = stringList;
    };

    this.setStockListContainer = function (papaInput) {
        papaStockListContainer = papaInput;
    };

    this.unselectSymbol = function () {
        if (selectedEntryDiv) {
            unmarkEntryDivAsSelected(selectedEntryDiv);
        }
        selectedEntryDiv = undefined;
        selectedStockData = undefined;
    };

    this.setSelectedStockData = function (dataInput) {
        if (selectedEntryDiv && selectedStockData != dataInput) {
            unmarkEntryDivAsSelected(selectedEntryDiv);
        }
        selectedStockData = dataInput;
        setBGColors();
    };

    this.addEntry = function (symbol) {
        addEntry(symbol);
    };

    this.addNewData = function (stockData) {
        addNewData(stockData);
    };

    this.onDragMove = function () {
        onDragMove();
    };

    this.onDropAnimationComplete = function () {
        onDropAnimationComplete();
    };

    this.onDragStart = function () {
        onDragStart();
    };

    this.moveEntryToLast = function (symbol) {
        moveEntryToLast(symbol);
    };

    /**Construction***/
    function drawComponent() {
        performConstruct();
        createAllEntries();
    }

    function performConstruct() {
        clearSlate(externalDiv);
    }

    function createAllEntries() {
        renderedSymbolList = [];
        dragAndDropUtil.setOpacity(0.9);
        dragAndDropUtil.setContainerDivs(externalDiv, scrollDiv);
        dragAndDropUtil.setPapaComponent(me);

        var symbol;
        for (var i = 0; i < symbolList.length; i++) {
            symbol = symbolList[i];
            createEntry(SymbolToData[symbol], symbolList[i]);
        }
        setBGColors();
    }

    //Create new entry, but only if haven't been created before.
    //stockData is undefined in case we don't have the data yet
    function createEntry(stockData, symbol) {
        if (stockData && stockData.symbol) {
            symbol = stockData.symbol;
        }
        var entryDiv;
        //Create new entry if this is a new symbol
        if (renderedSymbolList.indexOf(symbol) < 0) {
            renderedSymbolList.push(symbol);
            entryDiv = externalDiv.append("div")
                .style({
                    position: "relative",
                    height: ENTRY_HEIGHT + "px",
                    "border-bottom": "1px solid " + BORDER_COLOR,
                    width: "100%"
                })
                .attr(SYMBOL_ATTR, symbol)
                .datum(stockData)
                .classed(LIST_ENTRY_CLASS, true)
                .on("click", onEntryClick)
                .on("mouseenter", onMouseEnter)
                .on("mouseleave", onMouseLeave);

            fillEntryDiv(entryDiv, stockData, symbol);

            dragAndDropUtil.setAsDraggable(entryDiv);
        }

        return entryDiv;
    }

    function fillEntryDiv(entryDiv) {
        if (entryDiv) {
            clearSlate(entryDiv);
            var stockData = entryDiv.datum();
            var symbol = entryDiv.attr(SYMBOL_ATTR);

            var entryContentDiv = entryDiv.append("div")
                .style({
                    position: "relative",
                    height: "100%",
                    width: "100%",
                    "background": "inherit"
                })
                .classed(ENTRY_CONTENT_CLASS, true);

            var selectionStrokeDiv = entryContentDiv.append("div")
                .style({
                    position: "relative",
                    height: ENTRY_HEIGHT + "px",
                    width: SELECTED_STROKE_WIDTH + "px",
                    background: SELECTED_STROKE_COLOR,
                    visibility: "hidden",
                    float: "left"
                })
                .classed(SELECTED_STROKE_CLASS, true);

            var totalArea = entryContentDiv.append("div")
                .style({
                    position: "relative",
                    height: ENTRY_HEIGHT + "px",
                    width: CHANGE_AREA_WIDTH + "px",
                    "padding-right": RIGHT_PADDING + "px",
                    "font-weight": "bold",
                    float: "right"
                })
                .classed(TOTAL_AREA_CLASS, true);

            var todayArea = entryContentDiv.append("div")
                .style({
                    height: ENTRY_HEIGHT + "px",
                    position: "relative",
                    width: VALUE_AREA_WIDTH + "px",
                    "padding-right": MID_PADDING + 2 + "px",
                    "padding-left": MID_PADDING + "px",
                    "font-weight": "bold",
                    float: "right"
                })
                .classed(TODAY_AREA_CLASS, true);

            var nameDiv = entryContentDiv.append("div")
                .style({
                    height: ENTRY_HEIGHT + "px",
                    position: "relative",
                    "padding-left": MID_PADDING + "px",
                    overflow: "hidden"
                })
                .classed(NAME_AREA_CLASS, true);

            var deleteDiv = entryContentDiv.append("div")
                .style({
                    position: "absolute",
                    margin: 0,
                    bottom: 0 + "px",
                    right: 3 + "px",
                    "background-color": "inherit",
                    display: "none"
                })
                .attr({
                    title: "Completely Remove Item",
                    symbol: symbol
                })
                .classed(DELETE_ENTRY_BUTTON_CLASS, true)
                .classed("iconButton", true)
                .classed(ListEntryDragService.ELEMENTS_TO_REMOVE_CLASS, true)
                .classed("tinyGarbageIcon", true)
                .on("click", onDeleteClick)
                .on("mousedown", onDeleteMouseDown);

            if (stockData) {
                createNameSection(nameDiv, stockData.symbol);
                fillTodayArea(todayArea, stockData);
                fillTotalArea(totalArea, stockData);
            } else {
                createNameSection(nameDiv, symbol);
            }
        }
    }

    function fillTotalArea(totalArea, stockData) {
        clearSlate(totalArea);

        var changePercentage = stockData.getTotalGainPercentage();
        var changeText = formatNiceNumber(changePercentage) + "%";
        var valueText = formatNiceNumber(stockData.getTotalValue(), stockData.isCurrency);

        var color = getValueTextColor(changePercentage, 0);
        if (changePercentage >= 0) {
            changeText = "+" + changeText;
        }

        var valueFontSize = VALUE_FONT_SIZE;
        var changeTop = CHANGE_TOP;

        if (valueText.length > 7) {
            valueFontSize = VALUE_FONT_SIZE_LONG;
            changeTop = CHANGE_TOP_LONG;
        }

        var changeValueP = totalArea.append("p")
            .style({
                position: "relative",
                top: 6 + "px",
                margin: 0,
                overflow: "hidden",
                "text-overflow": "ellipsis",
                "white-space": "nowrap",
                "font-size": valueFontSize + "px",
                width: "100%"
            })
            .attr("title", valueText)
            .text(valueText);

        var percentageP = totalArea.append("p")
            .style({
                position: "relative",
                top: changeTop + "px",
                margin: 0,
                overflow: "hidden",
                "text-overflow": "ellipsis",
                "white-space": "nowrap",
                "font-size": FULL_NAME_FONT_SIZE + "px",
                color: color,
                width: "100%"
            })
            .text(changeText);
    }

    function fillTodayArea(todayArea, stockData) {
        clearSlate(todayArea);

        var changePercentage = stockData.getChangePercentage();
        var changeText = formatNiceNumber(changePercentage) + "%";
        var valueText = formatNiceNumber(stockData.value, stockData.isCurrency);

        var color;
        if (changePercentage >= 0) {
            changeText = "+" + changeText;
            color = GOOD_COLOR;
        } else {
            color = BAD_COLOR;
        }

        var changeValueP = todayArea.append("p")
            .style({
                position: "relative",
                top: 6 + "px",
                margin: 0,
                overflow: "hidden",
                "text-overflow": "ellipsis",
                "white-space": "nowrap",
                "font-size": VALUE_FONT_SIZE + "px",
                width: "100%"
            })
            .attr("title", valueText)
            .text(valueText);

        var percentageP = todayArea.append("p")
            .style({
                position: "relative",
                top: CHANGE_TOP + "px",
                margin: 0,
                overflow: "hidden",
                "text-overflow": "ellipsis",
                "white-space": "nowrap",
                "font-size": FULL_NAME_FONT_SIZE + "px",
                color: color,
                width: "100%"
            })
            .text(changeText);

        setValueRefreshClassGlobal(percentageP, stockData.getPrevChangePercentage(), stockData.getChangePercentage());
    }

    function createNameSection(nameDiv, symbol) {
        clearSlate(nameDiv);

        var fullName = getNameFromSymbol(symbol);

        var symbolP = nameDiv.append("p")
            .style({
                position: "relative",
                top: 6 + "px",
                margin: 0,
                overflow: "hidden",
                "text-overflow": "ellipsis",
                "white-space": "nowrap",
                "font-size": SYMBOL_FONT_SIZE + "px",
                width: "100%"
            })
            .text(symbol)
            .attr("title", fullName);

        var fullnameP = nameDiv.append("p")
            .style({
                position: "relative",
                top: 10 + "px",
                margin: 0,
                overflow: "hidden",
                "text-overflow": "ellipsis",
                "white-space": "nowrap",
                "font-size": FULL_NAME_FONT_SIZE + "px",
                width: "100%"
            })
            .text(fullName)
            .attr("title", fullName);
    }

    function setBGColors() {
        var children = externalDiv.node().childNodes;
        var d3Entry;
        var entryCounter = 0;

        for (var i = 0; i < children.length; i++) {
            d3Entry = d3.select(children[i]);
            if (d3Entry.classed(LIST_ENTRY_CLASS)) {
                if (!hoveredEntryDiv || hoveredEntryDiv.node() != d3Entry.node()) {
                    setBGColor(d3Entry, i);
                }

                entryCounter++;

                if (selectedStockData && d3Entry.attr(SYMBOL_ATTR) == selectedStockData.symbol) {
                    selectedEntryDiv = d3Entry;
                }
            }
        }

        if (selectedEntryDiv) {
            markEntryDivAsSelected(selectedEntryDiv);
        }
    }

    function setBGColor(entryDiv, index) {
        var bgColor = EVEN_ENTRY_BG_COLOR;
        if (index % 2 != 0) {
            bgColor = ODD_ENTRY_BG_COLOR;
        }

        entryDiv.attr(ENTRY_BG_COLOR_ATTR, bgColor);
        entryDiv.style("background", bgColor);
    }

    /**Actions!***/
    function addEntry(symbol) {
        var newEntry = createEntry(undefined, symbol);
        if (newEntry) { //If it wasn't added already
            moveChildToBeFirst(newEntry);
            setBGColors();
        }
    }

    function addNewData(stockData) {
        var children = externalDiv.node().childNodes;
        var d3Entry;
        for (var i = 0; i < children.length; i++) {
            d3Entry = d3.select(children[i]);
            if (d3Entry.classed(LIST_ENTRY_CLASS) && d3Entry.attr(SYMBOL_ATTR) == stockData.symbol) {
                fillNewEntryWithData(d3Entry, stockData)
            }
        }
    }

    function fillNewEntryWithData(entryDiv, stockData) {
        entryDiv.datum(stockData);
        var todayArea = entryDiv.select("." + TODAY_AREA_CLASS);
        var changeArea = entryDiv.select("." + TOTAL_AREA_CLASS);
        var nameDiv = entryDiv.select("." + NAME_AREA_CLASS);

        createNameSection(nameDiv, stockData.symbol);
        fillTodayArea(todayArea, stockData);
        fillTotalArea(changeArea, stockData);
    }

    function moveEntryToLast(symbol) {
        repositionArrayEntryByIndex(symbolList, 0, symbolList.length);
        var papaNode = externalDiv.node();
        var entryHTML = getEntryBySymbol(symbol);
        if (entryHTML){
            papaNode.appendChild(entryHTML);
            setBGColors();
        }
    }

    function getEntryBySymbol(symbol) {
        var children = externalDiv.node().childNodes;
        var entryHTML;
        for (var i = 0; i < children.length; i++) {
            if (children[i].getAttribute(SYMBOL_ATTR) == symbol) {
                entryHTML = children[i];
                break;
            }
        }
        return entryHTML;
    }

    /**Drag and drop interactions****/
    function onDragStart() {
        draggedDivEntry = dragAndDropUtil.getDraggedEntryDiv();
        draggedSymbol = draggedDivEntry.attr(SYMBOL_ATTR);
        setEntryDivAsDropTarget(draggedDivEntry);
        papaStockListContainer.fadeAwayHoverCard();
    }

    function onDragMove() {
        var dropIndex = getIndexToInsertByMouseY(dragAndDropUtil.getMouseYRelativeToCanvas());
        var currentIndex = getIndexFromSymbolList(draggedSymbol);

        repositionArrayEntryByIndex(symbolList, currentIndex, dropIndex);
        repositionByIndex(currentIndex, dropIndex);
    }

    function onDropAnimationComplete() {
        fillEntryDiv(draggedDivEntry);
        if (selectedEntryDiv && draggedDivEntry && draggedDivEntry.node() == selectedEntryDiv.node()) {
            markEntryDivAsSelected(selectedEntryDiv);
        }
        informActionToSave();
        papaStockListContainer.fadeBackHoverCard();
    }

    function repositionByIndex(currentIndex, newIndex) {
        var papaNode = externalDiv.node();
        var children = papaNode.childNodes;

        var indexToInsertBefore = newIndex;
        if (currentIndex < newIndex) {
            indexToInsertBefore++;
        }
        papaNode.insertBefore(draggedDivEntry.node(), children[indexToInsertBefore]);

        setBGColors();
    }

    /**UI State change***/
    function markEntryDivAsSelected(entryDiv) {
        var strokeDiv = entryDiv.select("." + SELECTED_STROKE_CLASS);
        entryDiv.style("background", SELECTED_BG_COLOR);
        strokeDiv.style("visibility", "visible");
    }

    function unmarkEntryDivAsSelected(entryDiv) {
        var strokeDiv = entryDiv.select("." + SELECTED_STROKE_CLASS);
        unmarkEntryDivAsHovered(entryDiv);
        strokeDiv.style("visibility", "hidden");
    }

    function markEntryDivAsHovered(entryDiv) {
        entryDiv.style("background", HOVERED_BG_COLOR);
    }

    function unmarkEntryDivAsHovered(entryDiv) {
        entryDiv.style("background", entryDiv.attr(ENTRY_BG_COLOR_ATTR));
    }

    function setEntryDivAsDropTarget(entryDiv) {
        entryDiv.select("." + ENTRY_CONTENT_CLASS)
            .style("display", "none");

        var borderDiv = entryDiv.append("div")
            .style({
                position: "absolute",
                top: 5 + "px",
                bottom: 5 + "px",
                left: 5 + "px",
                right: 5 + "px",
                border: "2px dashed #333333",
                "border-radius": 5 + "px"
            })
    }

    /**Data calculations***/
    function getIndexFromSymbolList(symbol) {
        var index = 0;
        var currentSymbol = symbolList[index];
        while (currentSymbol != symbol && index < symbolList.length) {
            index++;
            currentSymbol = symbolList[index];
        }
        return index;
    }

    /**State changes***/
    function setSelectedEntry(entryDiv) {
        if (selectedEntryDiv) {
            unmarkEntryDivAsSelected(selectedEntryDiv);
        }
        selectedEntryDiv = entryDiv;
        selectedStockData = selectedEntryDiv.datum();
        if (!selectedStockData) {
            var symbol = selectedEntryDiv.attr(SYMBOL_ATTR);
            selectedStockData = getStockDataBySymbolGlobal(symbol);
        }
        markEntryDivAsSelected(selectedEntryDiv);

        papaStockListContainer.setSelectedStock(selectedStockData);
    }

    /**Layout calculations**/
    function getIndexToInsertByMouseY(mouseY) {
        var tempCalcValue = (mouseY) / ENTRY_HEIGHT;
        tempCalcValue = iMath.floor(tempCalcValue);
        tempCalcValue = iMath.min(symbolList.length, tempCalcValue);
        tempCalcValue = iMath.max(0, tempCalcValue);

        var index = tempCalcValue;
        return index;
    }

    /**Mouse events**/
    function onEntryClick() {
        if (!d3.event[DO_NOT_SELECT_ENTRY]) {
            var target = d3.event.currentTarget;
            var entryDiv = d3.select(target);
            setSelectedEntry(entryDiv);
        }
    }

    function onMouseEnter() {
        var target = d3.event.currentTarget;
        var entryDiv = d3.select(target);
        hoveredEntryDiv = entryDiv;
        if (!selectedEntryDiv || hoveredEntryDiv.node() != selectedEntryDiv.node()) {
            markEntryDivAsHovered(entryDiv);
        }

        hoveredEntryDiv.select("." + DELETE_ENTRY_BUTTON_CLASS)
            .style("display", "");
    }

    function onMouseLeave() {
        if (!selectedEntryDiv || hoveredEntryDiv.node() != selectedEntryDiv.node()) {
            unmarkEntryDivAsHovered(hoveredEntryDiv);
        }

        hoveredEntryDiv.select("." + DELETE_ENTRY_BUTTON_CLASS)
            .style("display", "none");
    }

    function onDeleteClick() {
        d3.event[DO_NOT_SELECT_ENTRY] = true;

        var target = d3.event.currentTarget;
        var symbolToDelete = target.getAttribute("symbol");
        papaStockListContainer.completelyRemove(symbolToDelete);
    }

    function onDeleteMouseDown() {
        d3.event[ListEntryDragService.NO_DRAG_CLASS] = true;
    }

}