/**
 * Created by avitzur on 12/28/2015.
 */
function DrillWindow() {
    var me = this;
    /**Constants**/
    //Animation
    var OPEN_DURATION = 500;
    var OPEN_PANEL_DELAY = 300;
    //Color
    var TITLE_BG = "linear-gradient(rgb(238, 238, 238), rgb(221, 221, 221))";
    var TITLE_BORDER_COLOR = "rgb(170, 170, 170)";
    //Layout
    var TOP = 55;
    var LEFT = 320;
    var RIGHT = 30;
    var BOTTOM = 0;
    var CONTENT_PAD = 5;
    var EXTRA_PAD_LEFT = 5;
    var BOTTOM_SECTION_TITLE_HEIGHT = 40;
    var STATS_SECTION_HEIGHT = 200;
    var BOTTOM_SECTION_HEIGHT = STATS_SECTION_HEIGHT + BOTTOM_SECTION_TITLE_HEIGHT;
    var TITLE_HEIGHT = 42;

    var CHART_SECTION_BOTTOM = BOTTOM_SECTION_HEIGHT;
    var NON_CHART_SECTIONS_TOTAL_HEIGHT = CHART_SECTION_BOTTOM + TITLE_HEIGHT;
    //Color
    var WINDOW_SHADOW = "rgba(0, 0, 0, 0.5) 2px 3px 3px 0px";

    /**Externally Set***/
    //Structure
    var externalDiv;
    var leftPaneDiv;

    //Util
    var leftPaneList; //StockListContainer
    var papaView; //MainView

    /**Internally Set***/
    //Structure
    var parentDiv;
    var contentDiv;
    var titleDiv;
    var chartSectionDiv;
    var bottomSectionDiv;
    //Title stuff
    var titleP;

    //Layout
    var parentWidth;
    var parentHeight;
    var contentWidth;
    var contentHeight;
    var chartSectionHeight;

    //State
    var wasLeftPaneOpen;
    var selectedSymbol;
    var selectedStockData;
    var isOpen;
    var hasDrawn;

    //Util
    var chartComponent = new DrillChartArea();
    var restAPIs = RestAPIs.getInstance();
    var bottomComponent = new DrillBottomSection();
    var dataManager = new DrillDataManager();

    /**Public function**/
    this.setExternalDiv = function (papaD3, leftPaneDiInputD3) {
        externalDiv = papaD3;
        leftPaneDiv = leftPaneDiInputD3;
        hasDrawn = false;
    };

    this.setLeftPaneList = function (listContainerComponent) {
        leftPaneList = listContainerComponent;
    };

    this.setPapaView = function (mainViewInput) {
        papaView = mainViewInput;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.getSelectedSymbol = function () {
        return selectedSymbol;
    };

    this.setSelectedSymbol = function (symbol) {
        if (symbol != selectedSymbol) {
            selectedSymbol = symbol;
            selectedStockData = SymbolToData[selectedSymbol];
            respondToStockChanged();
        }
    };

    this.introducePanel = function (symbol) {
        selectedSymbol = symbol;
        selectedStockData = SymbolToData[symbol];
        introducePanel();
    };

    this.slideOutPanel = function () {
        hidePanel();
    };

    this.getIsOpen = function () {
        return isOpen;
    };

    this.refetchStats = function () {
        updateStatsSection();
    };

    /***Inner Public Function***/
    this.manuallyClose = function () {
        onCloseClick();
    };

    /**Construction***/
    function drawComponent() {
        performConstruct();
        hasDrawn = true;
    }

    function performConstruct() {
        clearSlate(externalDiv);
        parentWidth = externalDiv.node().clientWidth - RIGHT - LEFT;
        parentHeight = externalDiv.node().clientHeight - TOP - BOTTOM;
        contentWidth = parentWidth - 2 * CONTENT_PAD - EXTRA_PAD_LEFT;
        contentHeight = parentHeight - 2 * CONTENT_PAD;

        chartSectionHeight = contentHeight - NON_CHART_SECTIONS_TOTAL_HEIGHT;

        parentDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: TOP + "px",
                left: LEFT + "px",
                width: parentWidth + "px",
                bottom: BOTTOM + "px",
                "border-top-right-radius": 0 + "px",
                "border-bottom-right-radius": 0 + "px",
                overflow: "hidden",
                background: "#FFFFFF",
                "box-shadow": WINDOW_SHADOW,
                "z-index": GridCard.TOP_Z_INDEX + 1
            });


        contentDiv = parentDiv.append("div")
            .style({
                position: "absolute",
                top: CONTENT_PAD + "px",
                left: CONTENT_PAD + EXTRA_PAD_LEFT + "px",
                bottom: CONTENT_PAD + "px",
                right: CONTENT_PAD + "px"
            });

        createTitleDiv();

        createChartSection();
        createBottomSection();

        createCloseIcon();

        dataManager.setExternalComponents(me, chartComponent);
    }

    function createTitleDiv() {
        titleDiv = contentDiv.append("div")
            .style({
                position: "absolute",
                top: -CONTENT_PAD + "px",
                left: -CONTENT_PAD - EXTRA_PAD_LEFT + "px",
                right: -CONTENT_PAD + "px",
                height: TITLE_HEIGHT + "px",
                "background-image": TITLE_BG
            });

        titleP = titleDiv.append("p")
            .style({
                margin: 0,
                height: TITLE_HEIGHT + "px",
                "line-height": TITLE_HEIGHT + "px",
                "padding-left": 30 + "px",
                "padding-right": 30 + "px",
                overflow: "hidden",
                "white-space": "nowrap",
                "text-overflow": "ellipsis",
                "font-weight": "bold",
                "text-align": "center"
            });
    }

    function createChartSection() {
        chartSectionDiv = contentDiv.append("div")
            .style({
                position: "absolute",
                bottom: CHART_SECTION_BOTTOM + "px",
                height: chartSectionHeight + "px",
                width: contentWidth + "px"
            });

        chartComponent.setExternalDiv(chartSectionDiv);
        chartComponent.drawComponent();
    }

    function createBottomSection() {
        bottomSectionDiv = contentDiv.append("div")
            .style({
                position: "absolute",
                height: BOTTOM_SECTION_HEIGHT + "px",
                width: contentWidth + "px",
                bottom: 0
            });

        bottomComponent.setExternalDiv(bottomSectionDiv);
        bottomComponent.createFramework();
    }

    function createCloseIcon() {
        var closeIcon = parentDiv.append("p")
            .style({
                position: "absolute",
                "font-size": 20 + "px",
                top: 10 + "px",
                right: 10 + "px",
                cursor: "pointer",
                margin: 0,
                display: "inline-block",
                "font-family": "sans-serif"
            })
            .text("X");

        closeIcon.on("click", onCloseClick);
    }

    /**Data Change***/
    function respondToStockChanged() {
        var symbol = selectedStockData.symbol;
        goGetStatsAndNews();
        chartComponent.setSymbolAndDraw(symbol);
        fillTile();

        dataManager.setStockData(selectedStockData);
    }

    function goGetStatsAndNews() {
        var symbol = selectedStockData.symbol;
        restAPIs.getNews(symbol, drawNews);
        updateStatsSection();
    }

    function updateStatsSection() {
        var symbol = selectedStockData.symbol;
        var stats = getStatsBySymbolGlobal(symbol);
        if (stats || noStatsGlobal) {
            drawStatsSection(stats);
        } else {
            restAPIs.getStats(symbol, drawStatsSection);
        }
    }

    function initialLoad() {
        var symbol = selectedStockData.symbol;
        fillTile();
        chartComponent.firstCall(symbol);
    }

    function drawNews(newsDataList) {
        bottomComponent.setData(selectedStockData);
        bottomComponent.fillNewsArea(newsDataList);
    }

    function fillTile() {
        var symbol = selectedStockData.symbol;
        var name = getNameFromSymbol(symbol);
        var tileText = symbol + " - " + name;
        titleP.text(tileText);
    }

    function drawStatsSection(statsData) {
        bottomComponent.setData(selectedStockData);
        bottomComponent.fillStatsArea(statsData);
    }

    /**Visibility Actions****/
    function introducePanel() {
        wasLeftPaneOpen = papaView.getIsLeftPaneOpen();

        if (!wasLeftPaneOpen) {
            papaView.openLeftPane(true);
            slideInPanel(OPEN_PANEL_DELAY);
        } else {
            slideInPanel();
        }

        leftPaneList.applyDrillState();
        papaView.alignLeftPaneButtonState("DRILL");
    }

    function slideInPanel(delay) {
        externalDiv.style("display", "");
        if (!hasDrawn) {
            drawComponent();
        }

        isOpen = true;
        parentDiv.style({
            "left": -parentWidth + "px"
        });

        leftPaneDiv.style("z-index", GridCard.TOP_Z_INDEX + 2);

        papaView.hideGridScroll();

        if (!delay) {
            delay = 0;
        }

        initialLoad();
        parentDiv.transition()
            .duration(OPEN_DURATION)//todo: resotre
            .ease("cubic-out")
            .delay(delay)
            .tween("pook", function (d) {
                var leftInterpolate = d3.interpolate(-parentWidth, LEFT);
                return function (t) {
                    parentDiv.style("left", leftInterpolate(t) + "px");
                    if (t == 1) {
                        dataManager.setStockData(selectedStockData);
                        leftPaneList.setSelectedStock(selectedStockData);
                        bottomComponent.fillTitles();
                        goGetStatsAndNews();
                        chartComponent.respondToReadyToDraw();
                    }
                }
            });
    }

    function hidePanel() {
        if (isOpen) {
            isOpen = false;
            externalDiv.style("display", "none");
            leftPaneDiv.style("z-index", null);

            bottomComponent.clearAll();

            chartComponent.cleaSlate();

            leftPaneList.clearStates();
            papaView.showGridScroll();
        }
    }

    /***Event Listener**/
    function onCloseClick() {
        hidePanel();
        if (!wasLeftPaneOpen) {
            papaView.hideLeftPane();
        }
        papaView.alignLeftPaneButtonState("LIST");
    }

}

DrillWindow.getInstance = function () {
    if (!DrillWindow.instance) {
        DrillWindow.instance = new DrillWindow();
    }
    return DrillWindow.instance;
};