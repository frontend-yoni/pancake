/**
 * Created by avitzur on 11/2/2015.
 */
function MainView() {
    var me = this;
    //CONSTANTS
    //Layout constants
    var TITLE_HEIGHT = 55;
    var LEFT_PANE_WIDTH = 320;
    var TITLE_RIGHT_PAD = 23;
    var HIDE_BUTTON_SIZE = 20;
    var MIN_WIDTH_FOR_SCREEN = 400;
    var MIN_HEIGHT_FOR_SCREEN = 400;
    //Animation Constants
    var OPEN_PAIN_DURATION = 600;

    //Structure Elements
    var externalDiv;
    var parentDiv;
    var titleDiv;
    var leftPaneDiv;
    var gridDiv;
    var drillWindowDiv;

    //Layout params
    var parentDivWidth;
    var parentDivHeight;

    //State
    var isLeftPaneOpen = false;
    var hasLeftPaneDrawn = false;

    //UI Components
    var funGrid = FunGrid.getInstance();
    var stockList = StockListContainer.getInstance();
    var mainTitle = new MainTitle();
    var drillDownWindow = DrillWindow.getInstance();
    var twitterUtil = TwitterUtil.getInstance();

    /**Public Function**/
    this.setExternalDiv = function (externalDivInput) {
        externalDiv = d3.select(externalDivInput);
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.respondToResize = function () {
        respondToResize();
    };

    this.setCardObjectsList = function (listInput) {
        funGrid.setCardObjectsList(listInput);
    };

    this.setSymbolsList = function (stringList) {
        stockList.setSymbolsList(stringList);
    };


    this.openLeftPane = function (isDrillState) {
        openLeftPane(isDrillState);
    };

    this.alignLeftPaneButtonState = function (leftPaneText) {
        mainTitle.alignListButtonState(isLeftPaneOpen, leftPaneText);
    };

    this.hideLeftPane = function () {
        hideLeftPane();
    };

    this.hideGridScroll = function () {
        funGrid.hideScroll();
        mainTitle.switchToDrillMode();
        twitterUtil.hideButton();
    };

    this.showGridScroll = function () {
        funGrid.showScroll();
        mainTitle.revertDrillMode();
        twitterUtil.showButton();
    };

    this.getIsLeftPaneOpen = function () {
        return isLeftPaneOpen;
    };

    this.addNewCardByIndex = function (symbol, width, height, index) {
        addNewCardByIndex(symbol, width, height, index);
    };

    this.addSummaryCard = function (width, height) {
        addSummaryCard(width, height);
    };

    this.applyUnifiesRange = function(range){
        funGrid.applyUnifiedRange(range);
    };

    /**Construction**/
    function respondToResize() {
        drawComponent();
    }

    function drawComponent() {
        performConstruct();

        if (isLeftPaneOpen) {
            funGrid.setLeftPaneWidth(LEFT_PANE_WIDTH);
            leftPaneDiv.style({
                left: 0
            });
        } else {
            leftPaneDiv.style({
                left: -LEFT_PANE_WIDTH + "px"
            });
        }

        funGrid.drawComponent();
        mainTitle.drawComponent();

        stockList.drawComponent();
    }

    function performConstruct() {
        externalDiv.select("div").remove(); //Clear slate
        var externalDivDOM = externalDiv.node();

        parentDivWidth = externalDivDOM.clientWidth;
        parentDivHeight = externalDivDOM.clientHeight;

       /* parentDivWidth= iMath.max(MIN_WIDTH_FOR_SCREEN, parentDivWidth);
        parentDivHeight= iMath.max(MIN_WIDTH_FOR_SCREEN, parentDivHeight);*/

        parentDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: 0,
                top: 0,
                height: parentDivHeight + "px",
                width: parentDivWidth + "px"
            })
            .attr({
                "name": "mainViewParent"
            });

        gridDiv = parentDiv.append("div")
            .style({
                position: "absolute",
                left: 0,
                top: 0,
                height: parentDivHeight + "px",
                width: parentDivWidth + "px"
            })
            .attr({
                "name": "gridDiv"
            });

        funGrid.setPapaComponent(me);
        funGrid.setExtraPaddingOnTop(TITLE_HEIGHT);
        funGrid.setExternalDiv(gridDiv.node());

        titleDiv = parentDiv.append("div")
            .style({
                position: "absolute",
                left: 0,
                top: 0,
                right: TITLE_RIGHT_PAD + "px",
                height: TITLE_HEIGHT + "px",
                background: MAIN_VIEW_TITLE_COLOR,
                "box-shadow": "rgba(50, 50, 50, 0.5) -7px 1px 5px 0px",
                "z-index": GridCard.TOP_Z_INDEX + 3
            })
            .attr({
                "name": "gridTitleDiv"
            })
            .on(StockAutoCompleteList.STOCK_SOLECTES_EVENT, onStockSelected);

        mainTitle.setExternalDiv(titleDiv.node());
        mainTitle.setPapaComponent(me);

        leftPaneDiv = parentDiv.append("div")
            .style({
                position: "absolute",
                top: TITLE_HEIGHT,
                height: parentDivHeight - TITLE_HEIGHT + "px",
                width: LEFT_PANE_WIDTH + "px",
                background: "white",
                "box-shadow": "rgba(0,0,0,0.3) 1px 1px 1px 0px",
                left: -LEFT_PANE_WIDTH + "px"
            })
            .attr({
                "name": "leftPaneDiv"
            });

        stockList.setExternalDiv(leftPaneDiv.node());
        stockList.setPapaComponent(me);

        twitterUtil.setExternalDivs(parentDiv);
        twitterUtil.drawComponent();

        drillWindowDiv = parentDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                display: "none"
            })
            .attr({
                "name": "drillWindowDiv"
            });

        drillDownWindow.setExternalDiv(drillWindowDiv, leftPaneDiv);
        drillDownWindow.setLeftPaneList(stockList);
        drillDownWindow.setPapaView(me);
    }


    /***Layout change**/


    /**Actions***/
    function openLeftPane(isDrillState) {
        isLeftPaneOpen = true;
        leftPaneDiv.style({
            "left": -LEFT_PANE_WIDTH + "px",
            "z-index": GridCard.TOP_Z_INDEX + 1
        });

        leftPaneDiv.transition()
            .duration(OPEN_PAIN_DURATION)
            .ease("cubic-out")
            .tween("pook", function (d) {
                var leftInterpolate = d3.interpolate(-LEFT_PANE_WIDTH, 0);
                return function (t) {
                    leftPaneDiv.style("left", leftInterpolate(t) + "px");
                    if (t == 1 && !isDrillState) {
                        leftPaneDiv.style("z-index", null);
                    }
                }
            });

        funGrid.performLeftPaddingShift(LEFT_PANE_WIDTH);
    }

    function hideLeftPane() {
        isLeftPaneOpen = false;
        leftPaneDiv.style("z-index", ChartButtonsComponent.Z_INDEX);

        leftPaneDiv.transition()
            .duration(OPEN_PAIN_DURATION)
            .ease("cubic-out")
            .tween("pook", function (d) {
                var leftInterpolate = d3.interpolate(0, -LEFT_PANE_WIDTH);
                return function (t) {
                    leftPaneDiv.style("left", leftInterpolate(t) + "px");
                }
            });

        funGrid.cancelLeftPadding();
    }

    function addNewCardByIndex(symbol, width, height, index) {
        stockList.addEntry(symbol);

        if (!drillDownWindow.getIsOpen()) {
            var newCardData = createNewCardDataGlobal(symbol, width, height);
            funGrid.addNewCard(newCardData, index);
        } else {
            fetchDataForListOnly(symbol);
        }

        informActionToSave();
        mainTitle.checkIfFreshState();
        funGrid.checkIfFreshState();
    }

    function addSummaryCard(width, height){
        var newCardData = createSummaryCardDataGlobal(width, height);
        funGrid.addNewCard(newCardData, 0);

        informActionToSave();
        mainTitle.checkIfFreshState();
        funGrid.checkIfFreshState();
    }

    /**Event Listeners**/
    function onStockSelected() {
        var symbol = d3.event.detail.data;
        addNewCardByIndex(symbol);

    }
}