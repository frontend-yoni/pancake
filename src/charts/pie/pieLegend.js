/**
 * Created by yoni_ on 4/16/2016.
 */
function PieLegend() {
    var me = this;
    /***CONSTANTS***/
    var COLORS_SHORT = ["#60BAE3", "#00A3D3", "#007790", "#92CBDB", "#65B6BF", "#0097A4", "#88BFB1"];
    var ENTRY_HEIGHT = 24;
    var ENTRY_ICON_SIZE = 10;
    var FONT_SIZE = 12;
    var TEXT_SHADOW = "rgb(255, 255, 255) 1px 1px, rgb(255, 255, 255) -1px -1px";
    var COLUMN_WIDTH = 60;
    //Layout
    var LONG_CHAR_COUNT = 6;

    /***Externally Set****/
    //Structure
    var externalDiv;
    var longSymbolPArray;
    //Util
    var papaComponent;
    //Layout
    var width;
    var height;
    var isOnBottom;
    //Data
    var entryDataList;

    /***Internally Set****/
    //Layout
    var entriesPerColumn;
    var columnCount;
    var startTopPosition;
    var visibleEntryCount;
    var columnWidth;
    //Data
    var visibleEntryDataList;
    //Structure
    var entryDivList;
    //Util
    var colors = COLORS_SHORT;

    /***Public Functions****/
    this.setExternalDiv = function (divD3, widthI, heightI) {
        externalDiv = divD3;
        width = widthI;
        height = heightI;
    };

    this.setDataList = function (arcDataListI) {
        entryDataList = arcDataListI;
    };

    this.setLayout = function (isOnBottomI) {
        isOnBottom = isOnBottomI;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.redraw = function () {
        redraw();
    };

    this.setPapaComponent = function (papaComponentI) {
        papaComponent = papaComponentI;
    };

    this.getRequiredWidth = function (height) {
        return getRequiredWidth(height);
    };

    this.markAsHoverByIndex = function (index) {
        return  markAsHoverByIndex(index);
    };

    this.unmarkAllAsHovered = function () {
        return unmarkAllAsHovered();
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        calculateLayout();
        setVisibleEntries();
        longSymbolPArray = [];
        entryDivList = [];
        for (var i = 0; i < visibleEntryDataList.length; i++) {
            createEntry(entryDataList[i], i);
        }
    }

    function createEntry(arcData, index) {
        var columnIndex = iMath.floor(index / entriesPerColumn);
        var left = columnIndex * COLUMN_WIDTH;
        var top = ENTRY_HEIGHT * (index - columnIndex * entriesPerColumn) + startTopPosition;

        var entryDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: top + "px",
                left: left + "px",
                height: ENTRY_HEIGHT + "px",
                width: columnWidth + "px",
                cursor: "default"
            })
            .attr("title", arcData.symbol)
            .attr("index", index)
            .datum(index)
            .on("mouseenter", onMouseEnter)
            .on("mouseleave", onMouseLeave);

        var color = arcData.color;
        var iconDiv = entryDiv.append("div")
            .style({
                position: "absolute",
                top: (ENTRY_HEIGHT - ENTRY_ICON_SIZE) / 2 + "px",
                left: 0,
                width: ENTRY_ICON_SIZE + "px",
                height: ENTRY_ICON_SIZE + "px",
                background: color
            });

        var textP = entryDiv.append("p")
            .style({
                position: "absolute",
                "font-size": FONT_SIZE + "px",
                margin: 0,
                top: 5 + "px",
                left: 0,
                "padding-left": ENTRY_ICON_SIZE + 3 + "px",
                "white-space": "nowrap"
            })
            .text(arcData.symbol);

        entryDivList.push(entryDiv);
    }

    /***Calculation***/
    function calculateLayout() {
        entriesPerColumn = iMath.floor(height / ENTRY_HEIGHT);
        columnCount = iMath.floor(width / COLUMN_WIDTH);
        columnCount = iMath.max(1, columnCount);

        visibleEntryCount = iMath.min(columnCount * entriesPerColumn, entryDataList.length);
        if (isOnBottom) {
            startTopPosition = 0;
        } else {
            var columnHeight = ENTRY_HEIGHT * iMath.min(entriesPerColumn, visibleEntryCount);
            startTopPosition = (height - columnHeight) / 2;
        }

        columnWidth = iMath.min(width, COLUMN_WIDTH);
    }

    function setVisibleEntries() {
        visibleEntryDataList = [];
        for (var i = 0; i < visibleEntryCount; i++) {
            visibleEntryDataList.push(entryDataList[i]);
        }
    }

    function getRequiredWidth(height) {
        var entriesPerColumn = iMath.floor(height / ENTRY_HEIGHT);
        var numberOfColumnsForAll = iMath.ceil(entryDataList.length / entriesPerColumn);
        var requiredWidth = numberOfColumnsForAll * COLUMN_WIDTH;
        return requiredWidth;
    }

    /**Draw*****/
    function redraw() {

    }

    /**UI State Change***/
    function markAsHoverByIndex(index){
        if (index < entryDivList.length){
            markAsHovered(entryDivList[index]);
        }
    }
    function unmarkAllAsHovered() {
        for (var i = 0; i < entryDivList.length; i++) {
            unmarkAsHovered(entryDivList[i]);
        }
    }

    function markAsHovered(entryDiv) {
        var textP = entryDiv.select("p");
        textP.style("text-decoration", "underline")
    }

    function unmarkAsHovered(entryDiv) {
        var textP = entryDiv.select("p");
        textP.style("text-decoration", null);
    }

    /**Event Listener***/
    function onMouseEnter() {
        var entryHTML = d3.event.currentTarget;
        var hoverIndex = +entryHTML.getAttribute("index");

        papaComponent.respondToHover(hoverIndex);
    }

    function onMouseLeave() {
        papaComponent.respondToHover(null);
    }
}