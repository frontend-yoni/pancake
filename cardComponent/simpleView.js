function SimpleView() {
    //Constants
    //Layout constants
    var TITLE_HEIGHT = 38;
    var NAV_BAR_HEIGHT = 16;
    var PAD_FROM_EDGES = 5;
    var PAD_FROM_NAV_TO_CONTENT = 4;
    var NAV_BAR_FONT_SIZE = 10;
    var BUTTON_WIDTH_PERCENT = 25;
    //Color constants
    var TITLE_BG_GRADIENT = "linear-gradient(#eeeeee, #dddddd)";
    var TITLE_BORDER_COLOR = "#aaaaaa";
    var NAV_BAR_COLOR = "#eeeeee";
    var NAV_BAR_COLOR_SELECTED = "#dddddd";
    var NAV_TEXT_COLOR = "#777777";
    var SELECTED_STRIP_COLOR = "#60B2CE";
    var NAV_TEXT_COLOR_SELECTED = "#000000";
    //Class
    var NAV_BAR_CLASS = "cardContentNav";
    //Animation
    var STRIP_ANIMATION_DURATION = 200;

    //Data
    var cardData;

    //Structure Elements
    var externalDiv;
    var parentDiv;
    var titleDiv;
    var navBar;
    var navSelectedStrip;
    var contentDiv;

    //Layout params
    var contentWidth;
    var contentHeight;

    //State
    var selectedView;
    var isRedrawByNewData;

    //Utils
    var presentationUtil = ValuePresentationUtil.getInstance();
    var liveView = new LiveView();
    var statsView = new StatsView();
    var newsView = new NewsView();
    var studyView = new StudyView();

    var viewToButtons;

    /*Public functions*/
    this.setExternalDiv = function (divInput) {
        externalDiv = d3.select(divInput);
    };

    this.setSymbolAndDrawTitle = function (symbolInput) {
        createTitle(externalDiv, symbolInput);
    };

    this.setData = function (cardDataInput) {
        cardData = cardDataInput;
        selectedView = cardData.view;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.hideLinePath = function () {
        studyView.hideLinePath();
        liveView.hideLinePath();
    };

    this.restoreLinePath = function () {
        studyView.restoreLinePath();
        liveView.restoreLinePath();
    };

    this.hideLinePathForHeavyCharts = function () {
        studyView.hideLinePathForHeavyCharts();
    };

    this.updatePersonalData = function () {
        liveView.updatePersonalData();
        studyView.updatePersonalData();
    };

    this.redrawByNewData = function () {
        redrawByNewData();
    };

    this.resetChartTypeAndRedraw = function(isCandleInput){
        if (selectedView == SimpleView.VIEWS.STUDY){
            studyView.resetChartTypeAndRedraw(isCandleInput);
        }
        if (selectedView == SimpleView.VIEWS.LIVE){
            liveView.resetChartTypeAndRedraw(isCandleInput);
        }
    };

    this.redrawChartByVolumeVisibility = function(){
        if (selectedView == SimpleView.VIEWS.STUDY){
            studyView.redrawChartByVolumeVisibility();
        }
        if (selectedView == SimpleView.VIEWS.LIVE){
            liveView.redrawChartByVolumeVisibility();
        }
    };

    /*Structure component*/
    function drawComponent() {
        isRedrawByNewData = false;
        performConstruct();
    }

    function redrawByNewData() {
        isRedrawByNewData = true;
        switchBetweenViews();
    }

    function performConstruct() {
        clearSlate(externalDiv);
        var contentTop = TITLE_HEIGHT + NAV_BAR_HEIGHT + PAD_FROM_NAV_TO_CONTENT;

        contentWidth = externalDiv.node().clientWidth - 2 * PAD_FROM_EDGES;
        contentHeight = externalDiv.node().clientHeight - (contentTop + PAD_FROM_EDGES);

        parentDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: 0 + "px",
                height: "100%",
                width: "100%"
            });
        createTitle(parentDiv, cardData.symbol);
        createNavBar();

        contentDiv = parentDiv.append("div")
            .style({
                position: "absolute",

                // visibility: "hidden",

                left: PAD_FROM_EDGES + "px",
                top: contentTop + "px",
                width: contentWidth + "px",
                height: contentHeight + "px"
            });

        switchBetweenViews();
    }

    function createTitle(papaDiv, symbol) {
        titleDiv = papaDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: 0 + "px",
                height: TITLE_HEIGHT + "px",
                right: 0 + "px",
                "padding-top": 7 + "px",
                "padding-left": 5 + "px",
                "padding-right": 5 + "px",
                "box-sizing": "border-box",
                cursor: "default",
                "border-bottom": "1px solid " + TITLE_BORDER_COLOR,
                "background-image": TITLE_BG_GRADIENT,
                "border-top-left-radius": 0 + "px",
                "border-top-right-radius": 0 + "px"
            });

        presentationUtil.createTitleText(symbol, getNameFromSymbol(symbol), titleDiv);
    }

    function createNavBar() {
        navBar = parentDiv.append("div")
            .style({
                position: "absolute",
                "font-size": 0,
                left: 0,
                right: 0,
                top: TITLE_HEIGHT + "px",
                height: NAV_BAR_HEIGHT + "px",
                background: NAV_BAR_COLOR
            })
            .classed(NAV_BAR_CLASS, true);

        var liveButton = createNavBarButton("LIVE", SimpleView.VIEWS.LIVE, 0);
        var statsButton = createNavBarButton("STATS", SimpleView.VIEWS.STATS, 1);
        var newsButton = createNavBarButton("NEWS", SimpleView.VIEWS.NEWS, 2);
        var studyButton = createNavBarButton("WOW!", SimpleView.VIEWS.STUDY, 3);

        viewToButtons = [liveButton, statsButton, newsButton, studyButton];

        navSelectedStrip = navBar.append("div")
            .style({
                position: "absolute",
                bottom: 0 + "px",
                height: 2 + "px",
                background: SELECTED_STRIP_COLOR,
                width: BUTTON_WIDTH_PERCENT + "%",
                "pointer-events": "none"
            });

        markAsSelected(selectedView);
    }

    function createNavBarButton(text, data, index) {
        var buttonP = navBar.append("p")
            .style({
                display: "inline-block",
                width: BUTTON_WIDTH_PERCENT + "%",
                "box-sizing": "border-box",
                margin: 0,
                height: NAV_BAR_HEIGHT + "px",
                "line-height": NAV_BAR_HEIGHT + "px",
                "text-align": "center",
                "font-size": NAV_BAR_FONT_SIZE,
                color: NAV_TEXT_COLOR,
                "border-bottom": "1px solid #cccccc",
                cursor: "pointer"
            })
            .attr("index", index)
            .on("click", onNavClicked)
            .classed(SELECTED_BUTTON_CLASS, false)
            .text(text)
            .datum(data);

        

        return buttonP;
    }

    /**UI State Change***/
    function markAsSelected(viewType) {
        var navButton = viewToButtons[viewType];
        navButton.classed(SELECTED_BUTTON_CLASS, true)
            .on("click", null);

        var index = +navButton.attr("index");
        positionStrip(index * BUTTON_WIDTH_PERCENT);
    }

    function unmarkAsSelected(viewType) {
        var navButton = viewToButtons[viewType];
        navButton.classed(SELECTED_BUTTON_CLASS, false)
            .on("click", onNavClicked);
    }

    function positionStrip(newLeft) {
        var currentLeftStr = navSelectedStrip.node().style.left;
        if (currentLeftStr == "") {
            navSelectedStrip.style("left", newLeft + "%");
        } else {
            var prevLeft = +currentLeftStr.replace("%", "");
            animateSelectedStrip(prevLeft, newLeft);
        }
    }

    function animateSelectedStrip(prevLeft, newLeft) {
        navSelectedStrip.transition()
            .duration(STRIP_ANIMATION_DURATION)
            .ease("cubic-out")
            .tween("pook", function (d) {
                var leftInterpolate = d3.interpolate(prevLeft, newLeft);
                return function (t) {
                    var left = leftInterpolate(t);
                    navSelectedStrip.style("left", left + "%");
                }
            });
    }

    function switchBetweenViews() {
        cardData.setView(selectedView);
        switch (selectedView) {
            case SimpleView.VIEWS.LIVE:
                switchToLive();
                break;

            case SimpleView.VIEWS.STATS:
                switchToStats();
                break;

            case SimpleView.VIEWS.NEWS:
                switchToNews();
                break;

            case SimpleView.VIEWS.STUDY:
                switchToStudy();
                break;
        }
    }

    function switchToNews() {
        cardData.drawCount = 0; //When switching back to live, don't wanna see a blink on the value
        if (cardData.news.length > 0) {
            newsView.setExternalDiv(contentDiv);
            newsView.setCardData(cardData);
            newsView.drawComponent();
        } else {
            fetchNewsForCard(cardData);
        }
    }

    function switchToStats() {
        cardData.drawCount = 0; //When switching back to live, don't wanna see a blink on the value
        if (cardData.getStatsData() || noStatsGlobal) {
            statsView.setExternalDiv(contentDiv, contentWidth, contentHeight);
            statsView.setCardData(cardData);
            statsView.drawComponent();
        } else {
            fetchStatsForCard(cardData);
        }
    }

    function switchToLive() {
        var hasData = getHasDataForLive();
        if (hasData) {
            liveView.setExternalDiv(contentDiv);
            liveView.setData(cardData);
            if (isRedrawByNewData) {
                liveView.redrawByNewData();
            } else {
                liveView.drawComponent();
            }
        } else {
            cardData.drawCount = 0;
            fetchDataForCardByState(cardData);
        }
    }

    function switchToStudy() {
        studyView.setExternalDiv(contentDiv);
        studyView.setData(cardData);
        studyView.drawComponent();
    }

    function getHasDataForLive() {
        var historicData = getProperDataListByRange(cardData.data, cardData.userData.timeRange);
        var hasHistoricData = (historicData && historicData.length > 0);
        return true;
    }

    /**Navigation**/
    function respondToNavSelection() {
        isRedrawByNewData = false;
        markAsSelected(selectedView);
        switchBetweenViews();
        informActionToSave();
    }


    /**Event Listeners***/
    function onNavClicked() {
        var target = d3.event.target;
        var button = d3.select(target);
        var clickedView = button.datum();
        unmarkAsSelected(selectedView);
        if (clickedView != selectedView) {
            selectedView = clickedView;
            respondToNavSelection();
        }
    }
}


SimpleView.VIEWS = {
    LIVE: 0,
    STATS: 1,
    NEWS: 2,
    STUDY: 3
};