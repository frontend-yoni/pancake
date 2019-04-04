/**
 * Created by yoni_ on 5/6/2016.
 */
function AddEntryUtil() {
    var me = this;
    /***CONSTANTS***/
    var MOUSE_DOWN_INSIDE_SEARCH = "MOUSE_DOWN_INSIDE_AddEntryUtil_SEARCH";
    var ICON_SIZE = 20;
    var SEARCH_WIDTH = 130;
    var SEARCH_HEIGHT = 30;

    /***Externally Set****/
    //Structure
    var externalDiv;
    //Util
    var papaComponent;

    /***Internally Set****/
    //Structure
    var addButton;
    var searchDiv;
    //Util
    var shapeUtil = ShapesUtil.getInstance();
    var searchComponent = new SelectSymbolSearchBox();

    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
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

    /*****/
    this.respondToSymbolSelected = function (symbol) {
        respondToSymbolSelected(symbol);
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        createAddButton();
        createSelectSymbolSection();
    }

    function createAddButton() {
        addButton = externalDiv.append("div")
            .style({
                position: "relative",
                top: 8 + "px",
                width: 180 + "px",
                height: 32 + "px",
                "border-radius": 5 + "px",
                "text-align": "center",
                margin: "auto"
            })
            .on("click", onAddClick)
            .classed("pancakeButton", true);

        var pillar = addButton.append("div")
            .style({
                display: "inline-block",
                height: "100%",
                width: 0,
                "vertical-align": "middle"
            });

        var icon = addButton.append("div")
            .style({
                display: "inline-block",
                width: ICON_SIZE + "px",
                height: ICON_SIZE + "px",
                "vertical-align": "middle",
                "margin-left": 5 + "px",
                "margin-right": 5 + "px",
                background: "none"
            });

        shapeUtil.createPlusSign(icon, ICON_SIZE, ICON_SIZE, "#666666", 2);

        var buttonP = addButton.append("p")
            .style({
                display: "inline-block",
                "vertical-align": "middle",
                margin: 0,
                top: 4 + "px",
                "font-size": 14 + "px",
                color: "black"
            })
            .text("Add New Entry");
    }

    function createSelectSymbolSection() {
        searchDiv = externalDiv.append("div")
            .style({
                display: "none",
                position: "relative",
                margin: "auto",
                top: 10 + "px",
                height: SEARCH_HEIGHT + "px",
                width: SEARCH_WIDTH + "px"
            })
            .on("mousedown", onSearchMouseDown);

        searchComponent.setBGColors("rgba(255,255,255,0.5)", "rgba(245,245,245,0.5)");
        searchComponent.setExternalDiv(searchDiv);
        searchComponent.setPapaCompareSection(me);
        searchComponent.setLayout(SEARCH_WIDTH, SEARCH_HEIGHT);
        searchComponent.drawComponent();
        searchComponent.setPromptMessage();

        return searchDiv;
    }

    /**Draw*****/
    function redraw() {

    }

    /**UI State****/
    function showSearch() {
        searchComponent.clearSelection();
        searchDiv.style("display", "table");
        addButton.style("display", "none");

        searchComponent.focus();

        searchComponent.setOptionsCount(6);
        if(DrillWindow.getInstance().getIsOpen()){
            searchComponent.setOptionsCount(1);
        }

        var suggestionsToExclude = getSuggestionsToExcludeGlobal();
        searchComponent.setExcludeSymbols(suggestionsToExclude);

        attachEventToBody();
    }

    function hideSearch() {
        searchComponent.clearSelection();
        searchDiv.style("display", "none");
        addButton.style("display", "");

        detachEventToBody();
    }

    /**Action**/
    function respondToSymbolSelected(selectedSymbol) {
        if (selectedSymbol) {
            hideSearch();
            papaComponent.executeInnerAddEntry(selectedSymbol);
        }
    }

    /**Event Management****/
    function attachEventToBody() {
        d3.select("body").on("mousedown.AddEntryUtil", onMouseDownBody);
    }

    function detachEventToBody() {
        d3.select("body").on("mousedown.AddEntryUtil", null);
    }

    /**Event Listeners****/
    function onAddClick() {
        showSearch();
    }

    function onMouseDownBody() {
        if (!d3.event[MOUSE_DOWN_INSIDE_SEARCH]) {
            hideSearch();
        }
    }

    function onSearchMouseDown() {
        d3.event[MOUSE_DOWN_INSIDE_SEARCH] = true;
    }
}