/**
 * Created by yoni_ on 12/26/2015.
 */
function FillGridVoidService() {
    var me = this;
    /**Constants**/
    var PLUS_ICON_SIZE = 56;
    var PAD_FROM_EDGES = 5;
    var BORDER_RADIUS = 0;
    var BORDER_COLOR = "#999999";
    var SEARCH_WIDTH = 130;
    var SEARCH_HEIGHT = 30;
    var CELL_SIZE = 200;
    //Class
    var ADD_DIV_PAPA_CLASS = "ADD_DIV_PAPA_CLASS";
    var IN_GRID_ADD_CARD_BUTTON_CLASS = "IN_GRID_ADD_CARD_BUTTON_CLASS";

    /**Externally Set***/
    //Structure
    var dashboardContentDiv;
    //Util
    var cardPositionUtil;
    var funGrid;

    /**Internally set***/
    //Structure
    var addDiv;
    var plusDiv;
    var searchDiv;

    //Utils
    var shapeUtil = ShapesUtil.getInstance();
    var searchComponent = new SelectSymbolSearchBox();

    /**Public functions**/
    this.setUtils = function (cardPositionUtilInput, papaFunGridInput) {
        cardPositionUtil = cardPositionUtilInput;
        funGrid = papaFunGridInput;
    };

    this.setExternalDivs = function (dashboardContentDivInput) {
        dashboardContentDiv = dashboardContentDivInput
    };

    this.createLastAddDiv = function () {
        createLastAddDiv();
    };

    this.positionLastAddDiv = function (top, left) {
        positionLastAddDiv(top, left);
    };

    this.hideAddDiv = function () {
        hideAddDiv();
    };

    this.showAddDiv = function () {
        showAddDiv();
    };

    this.respondToSymbolSelected = function (selectedSymbol) {
        respondToSymbolSelected(selectedSymbol);
    };

    /**Construct**/
    function createLastAddDiv() {
        addDiv = createAddDiv();
        plusDiv = createAddIcon(addDiv);
        searchDiv = createSelectSymbolSection(addDiv, searchComponent);
    }

    function createAddDiv() {
        var addDiv = dashboardContentDiv.append("div")
            .style({
                position: "absolute",
                "box-sizing": "border-box",
                "border-radius": BORDER_RADIUS + "px"
            })
            .attr({
                "clickToAdd": true,
                "title": "Add Card"
            })
            .classed(ADD_DIV_PAPA_CLASS, true);

        return addDiv;
    }

    function createAddIcon(addDiv) {
        var iconDiv = addDiv.append("div")
            .style({
                position: "absolute",
                top: 0 + "px",
                left: 10 + "px",
                width: PLUS_ICON_SIZE + "px",
                height: PLUS_ICON_SIZE + "px",
                "border-radius": "50%",
                "box-shadow": "0 1px 2px 0 rgba(0,0,0,0.5)"
            })
            .attr("clickToAdd", true)
            .classed("pancakeButton", true)
            .on("click", onAddClick);

        var signSize = PLUS_ICON_SIZE - 26;
        var plusSign = iconDiv.append("div")
            .style({
                position: "absolute",
                background: "none",
                top: 12 + "px",
                left: 12 + "px",
                width: signSize + "px",
                height: signSize + "px"
            });

        shapeUtil.createPlusSign(plusSign, signSize, signSize, BORDER_COLOR, 3);

        return iconDiv;
    }

    function createSelectSymbolSection(addDiv, searchComponent) {
        var searchDiv = addDiv.append("div")
            .style({
                display: "table",
                position: "relative",
                margin: "auto",
                top: 10 + "px",
                visibility: "hidden",
                height: SEARCH_HEIGHT + "px",
                width: SEARCH_WIDTH + "px"
            });

        searchComponent.setBGColors("rgba(255,255,255,0.5)", "rgba(245,245,245,0.5)");
        searchComponent.setExternalDiv(searchDiv);
        searchComponent.setPapaCompareSection(me);
        searchComponent.setLayout(SEARCH_WIDTH, SEARCH_HEIGHT);
        searchComponent.drawComponent();
        searchComponent.setPromptMessage();

        return searchDiv;
    }

    /**Position***/
    function positionLastAddDiv(top, left) {
        positionAddDiv(top, left);
    }

    function hideAddDiv() {
        addDiv.style("opacity", 0);
    }

    function showAddDiv() {
        addDiv.style("opacity", 1);
    }

    function showSearch() {
        searchComponent.clearSelection();
        searchDiv.style("visibility", "visible");
        plusDiv.style("visibility", "hidden");

        addDiv.classed(IN_GRID_ADD_CARD_BUTTON_CLASS, true);
        searchComponent.focus();

        var suggestionsToExclude = getSuggestionsToExcludeGlobal();
        searchComponent.setExcludeSymbols(suggestionsToExclude);

        attachEventToBody();
    }

    function hideSearch() {
        searchComponent.clearSelection();
        searchDiv.style("visibility", "hidden");
        plusDiv.style("visibility", "visible");

        addDiv.classed(IN_GRID_ADD_CARD_BUTTON_CLASS, false);

        detachEventToBody();
    }

    function positionAddDiv(top, left) {
        addDiv.style({
            top: top + PAD_FROM_EDGES + "px",
            left: left + PAD_FROM_EDGES + "px",
            width: CELL_SIZE + "px",
            height: CELL_SIZE + "px"
        });
    }

    /**Action**/
    function respondToSymbolSelected(selectedSymbol) {
        if (selectedSymbol){
            hideSearch();
            funGrid.respondToAddNewCard(selectedSymbol, undefined, undefined, CardDataList.length);
        }

    }

    /**Event Management****/
    function attachEventToBody() {
        d3.select("body").on("mousedown.FillGridVoidService", onMouseDownBody);
    }

    function detachEventToBody() {
        d3.select("body").on("mousedown.FillGridVoidService", null);
    }

    /**Event Listeners****/
    function onAddClick() {
        showSearch();
    }

    function onMouseDownBody() {
        var target = d3.event.target;
        var d3Element = d3.select(target);
        if (!getIsChildOfPapaClass(d3Element, ADD_DIV_PAPA_CLASS)) {
            hideSearch();
        }
    }
}

FillGridVoidService.getInstance = function () {
    if (!FillGridVoidService.instance) {
        FillGridVoidService.instance = new FillGridVoidService();
    }

    return FillGridVoidService.instance;
};