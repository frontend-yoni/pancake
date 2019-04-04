/**
 * Created by avitzur on 11/8/2015.
 */
function MainTitle() {
    var me = this;

    //Constants
    var OPEN_LIST_CLASS = "tileOpenListButtonClass";
    var CLICKED_INSIDE_ABOUT_POPUP = "clickedInsideAbout";
    var CLICKED_INSIDE_SIGNIN_POPUP = "clickedInsideSignIn";
    var CLICKED_INSIDE_EXTRA_STUFF_POPUP = "clickedInsideExtraStuff";
    var CLICKED_INSIDE_CARD_ACTION_POPUP = "CLICKED_INSIDE_CARD_ACTION_POPUP";
    var BLUE_BUTTON_CLASS = "blueButtonClass";
    //Layout Constants
    var SERACH_HEIGHT = 34;
    var LIST_OPEN_AREA_LEFT = 20;
    var LIST_OPEN_AREA_WIDTH = 120;
    var LIST_OPEN_AREA_BOTTOM = 10;
    var SEARCH_FONT_SIZE = 16;
    var LIST_BUTTON_WIDTH = 32;
    var LIST_BUTTON_HEIGHT = 32;
    var SIDE_BUTTONS_WIDTH = 42;
    var EXTRA_BUTTON_SIZE = 32;
    //Color
    //TEXT

    //Layout
    var searchBoxWidth;
    var parentDivWidth;
    var parentDivHeight;

    //Structure Elements
    var externalDiv;
    var searchBoxArea;
    var rightSideDropdown;
    var leftSidePancake;
    var listAreaDiv;
    var listButtonDiv;
    var aboutUsPopupDiv;
    var signInPopupDiv;
    var startFreshButton;
    var extraStuffButton;
    var extraStuffPopupDiv;
    var cardActionsPopupDiv;

    //Components
    var papaMainView;

    //State
    var isLeftPaneOpen = false;
    var isAboutOpen = false;
    var isSignInOpen = false;
    var isExtraStuffOpen = false;
    var isCardActionsOpen = false;
    var isStartFreshClicked;

    //Util
    var shapeUtil = ShapesUtil.getInstance();
    var searchBoxComponent = SymbolSearchBox.getInstance();
    var aboutComponent = new AboutUsComponent();
    var revertActionService = RevertActionService.getInstance();
    var loginComponent = new LoginComponent();
    var drillDownWindow = DrillWindow.getInstance();
    var extraStuffComponent = ExtraStuffComponent.getInstance();
    var cardActionWindowComponent = new UniversalCardsActionWindow();

    /**Public functions**/
    this.setExternalDiv = function (divHTML) {
        externalDiv = d3.select(divHTML);
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.setPapaComponent = function (papaComponent) {
        papaMainView = papaComponent;
    };

    this.alignListButtonState = function (isOpen, listButtonText) {
        alignListButtonState(isOpen);
    };

    this.switchToDrillMode = function () {
        switchToDrillMode();
    };

    this.revertDrillMode = function () {
        revertDrillMode();
    };

    this.checkIfFreshState = function () {
        checkIfFreshState();
    };

    /***Inner public function***/
    this.hideAboutPopup = function () {
        hideAbout();
    };

    this.hideCardActionPopup = function () {
        hideCardActionPopup();
    };

    this.onStartFresh = function () {
        onStartFreshClick();
    };


    this.onSignInClick = function () {
        hideExtraStuff();
        showSignIn();
    };

    this.addSummaryCard = function () {
        papaMainView.addSummaryCard();
        hideExtraStuff();
    };

    /**Construction**/
    function drawComponent() {
        performConstruct();
    }

    function performConstruct() {
        var externalDivDOM = externalDiv.node();
        externalDiv.selectAll("div").remove(); //Clear slate

        parentDivWidth = externalDivDOM.clientWidth;
        parentDivHeight = externalDivDOM.clientHeight;
        searchBoxWidth = iMath.min(parentDivWidth * 0.6, parentDivWidth - 420);

        var searchLeft = (parentDivWidth - searchBoxWidth) / 2;
        var searchTop = (parentDivHeight - SERACH_HEIGHT) / 2;

        rightSideDropdown = externalDiv.append("div")
            .style({
                position: "absolute",
                left: searchLeft + searchBoxWidth - 1 + "px",
                top: searchTop + "px",
                width: SIDE_BUTTONS_WIDTH + "px",
                height: SERACH_HEIGHT + "px",
                "border-radius": "0 6px 6px 0"
            })
            .classed("pancakeButton", true)
            .on("click", onCardActionsButtonClick)
            .on("mousedown", onCardActionsButtonMouseDown);
        prepRightDropdown();

        leftSidePancake = externalDiv.append("div")
            .style({
                position: "absolute",
                left: searchLeft - SIDE_BUTTONS_WIDTH + 1 + "px",
                top: searchTop + "px",
                width: SIDE_BUTTONS_WIDTH + "px",
                height: SERACH_HEIGHT + "px",
                "border-radius": "6px 0 0 6px"
            })
            .on("click", onAboutButtonClick)
            .on("mousedown", onAboutPopupMouseDown)
            .classed("pancakeButton", true);
        prepLeftDropdown();

        listAreaDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: LIST_OPEN_AREA_LEFT + "px",
                bottom: LIST_OPEN_AREA_BOTTOM + "px",
                width: LIST_BUTTON_WIDTH + "px",
                cursor: "pointer",
                margin: 0,
                height: LIST_BUTTON_HEIGHT + "px"
            })
            .classed(OPEN_LIST_CLASS, true)
            .on("click", onLeftPaneButtonClick);
        createListAreaSection();

        searchBoxArea = externalDiv.append("div")
            .style({
                position: "absolute",
                width: searchBoxWidth + "px",
                height: SERACH_HEIGHT + "px",
                left: searchLeft + "px",
                top: searchTop + "px",
                border: "1px solid #ccc",
                "box-shadow": "inset 0 1px 2px #eee",
                "box-sizing": "border-box",
                background: '#eeeeee'
            });

        aboutUsPopupDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: searchLeft - SIDE_BUTTONS_WIDTH + "px",
                top: 50 + "px",
                display: "none",
                "z-index": GridCard.TOP_Z_INDEX + 2
            })
            .on("mousedown", onAboutPopupMouseDown);
        aboutComponent.setExternalDiv(aboutUsPopupDiv);
        aboutComponent.setPapaComponent(me);
        aboutComponent.drawComponent();
        d3.select("body").on("mousedown.closeAboutWindow", onBodyMouseDown);

        configureLeftPaneButton();
        fillSearchBoxArea();

        createExtraButton();

        createStartFreshButton(45, searchTop);

        signInPopupDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                right: 5 + "px",
                top: 50 + "px",
                "z-index": GridCard.TOP_Z_INDEX + 2
            })
            .attr("name", "signInPopupDiv")
            .on("mousedown", onSignInPopupMouseDown);

        loginComponent.setExternalDiv(signInPopupDiv);
        loginComponent.drawComponent();
        hideSignIn();

        extraStuffPopupDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                right: 5 + "px",
                top: 50 + "px",
                "z-index": GridCard.TOP_Z_INDEX + 2
            })
            .attr("name", "extraStuffPopupDiv")
            .on("mousedown", onExtraStuffPopupMouseDown);
        extraStuffComponent.setExternalDiv(extraStuffPopupDiv);
        extraStuffComponent.setPapaComponent(me);
        extraStuffComponent.drawComponent();
        hideExtraStuff();

        cardActionsPopupDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: searchLeft + searchBoxWidth + SIDE_BUTTONS_WIDTH + "px",
                top: 50 + "px",
                "z-index": GridCard.TOP_Z_INDEX + 2
            })
            .attr("name", "cardActionsPopupDiv")
            .on("mousedown", onCardActionsButtonMouseDown);
        cardActionWindowComponent.setExternalDiv(cardActionsPopupDiv);
        cardActionWindowComponent.setPapaComponent(me);
        cardActionWindowComponent.drawComponent();
        hideCardActionPopup();

        if (isStartFreshClicked) {
            hideStartFresh();
        }

        checkIfFreshState();
    }

    function prepLeftDropdown() {
        var iconPapa = leftSidePancake.append("div")
            .style({
                position: "absolute",
                top: 5 + "px",
                left: 8 + "px"
            })
            .classed("pancakeIcon", true);
    }


    function prepRightDropdown() {
        var iconPapa = rightSideDropdown.append("div")
            .style({
                position: "absolute",
                top: 10 + "px",
                left: 9 + "px"
            });
        shapeUtil.createCardActionsDropDownIcon(iconPapa);
    }

    function createExtraButton() {
        extraStuffButton = externalDiv.append("div")
            .style({
                position: "absolute",
                bottom: 10 + "px",
                right: 5 + "px",
                width: EXTRA_BUTTON_SIZE + "px",
                height: EXTRA_BUTTON_SIZE + "px",
                cursor: "pointer"
            })
            .classed("extraStuffButtonClass", true)
            .classed("userManagementButton", true)
            .classed("iconButton", true)
            .on("mousedown", onExtraStuffPopupMouseDown)
            .on("click", onExtraStuffButtonClick);
    }

    function createStartFreshButton(right, topPad) {
        startFreshButton = externalDiv.append("div")
            .style({
                position: "absolute",
                top: topPad + "px",
                right: right + "px",
                height: SERACH_HEIGHT + "px",
                "line-height": SERACH_HEIGHT + "px",
                "padding-left": 5 + "px",
                "padding-right": 5 + "px",
                "border-radius": 2 + "px",
                "font-family": "Arial",
                "box-sizing": "border-box",
                cursor: "pointer"
            })
            .classed(BLUE_BUTTON_CLASS, true)
            .attr("title", "Remove All Items")
            .on("click", onStartFreshClick)
            .text("Start Fresh")
    }


    function createListAreaSection() {
        listButtonDiv = listAreaDiv.append("div")
            .style({
                position: "relative",
                display: "inline-block",
                left: 0 + "px",
                height: LIST_BUTTON_HEIGHT + "px",
                width: LIST_BUTTON_WIDTH + "px"
            })
            .classed("iconButton", true);

        setProperListIcon();
    }

    function fillSearchBoxArea() {
        searchBoxComponent.setExternalDiv(searchBoxArea.node());
        searchBoxComponent.setFontSize(SEARCH_FONT_SIZE);
        searchBoxComponent.drawComponent();
    }

    function setProperListIcon() {
        if (isLeftPaneOpen) {
            listButtonDiv.classed("openListIcon", false);
            listButtonDiv.classed("closeListIcon", true);
        } else {
            listButtonDiv.classed("openListIcon", true);
            listButtonDiv.classed("closeListIcon", false);
        }
    }

    /**Actions**/
    function alignListButtonState(isOpen) {
        isLeftPaneOpen = isOpen;
        configureLeftPaneButton();
    }

    function configureLeftPaneButton() {
        setProperListIcon();
    }

    function checkIfFreshState() {
        if (getIsFreshStateGlobal()) {
            hideSortAndUnify();
        } else {
            restoreSortAndUnify();
        }
    }

    function switchToDrillMode() {
        rightSideDropdown.style("visibility", "hidden");
        startFreshButton.style("visibility", "hidden");

        searchBoxArea.style("width", searchBoxWidth + "px");
        searchBoxComponent.drawComponent();
    }

    function revertDrillMode() {
        rightSideDropdown.style("visibility", "visible");
        startFreshButton.style("visibility", "visible");

        searchBoxArea.style("width", searchBoxWidth);
        searchBoxComponent.drawComponent();
    }

    function hideSortAndUnify() {

    }

    function restoreSortAndUnify() {

    }


    function toggleAboutVisibility() {
        if (isAboutOpen) {
            hideAbout();
        } else {
            showAbout();
        }
    }

    function toggleExtraStuffVisibility() {
        if (isExtraStuffOpen) {
            hideExtraStuff();
        } else {
            showExtraStuff();
        }
    }

    function toggleCardActionsVisibility() {
        if (isCardActionsOpen) {
            hideCardActionPopup();
        } else {
            showCardActionPopup();
        }
    }

    function showAbout() {
        isAboutOpen = true;
        aboutUsPopupDiv.style("display", "");
    }

    function hideAbout() {
        isAboutOpen = false;
        aboutUsPopupDiv.style("display", "none");
    }

    function showSignIn() {
        isSignInOpen = true;
        signInPopupDiv.style("display", "");
    }

    function hideSignIn() {
        isSignInOpen = false;
        signInPopupDiv.style("display", "none");
    }

    function showExtraStuff() {
        isExtraStuffOpen = true;
        extraStuffPopupDiv.style("display", "");
    }

    function showCardActionPopup() {
        isCardActionsOpen = true;
        cardActionsPopupDiv.style("display", "");
    }

    function hideExtraStuff() {
        isExtraStuffOpen = false;
        extraStuffPopupDiv.style("display", "none");
    }

    function hideCardActionPopup() {
        isCardActionsOpen = false;
        cardActionsPopupDiv.style("display", "none");
    }

    function showStartFresh() {
        startFreshButton.style("display", "");
    }

    function hideStartFresh() {
        startFreshButton.style("display", "none");
    }

    function activateStartFresh() {

        hideStartFresh();
        var listContainer = StockListContainer.getInstance();
        var drillWindow = DrillWindow.getInstance();
        var funGrid = FunGrid.getInstance();

        listContainer.startFresh();
        funGrid.startFresh();

        if (isLeftPaneOpen) {
            drillWindow.manuallyClose();
            papaMainView.hideLeftPane();
        }


        isStartFreshClicked = true;
        isLeftPaneOpen = false;

        configureLeftPaneButton();
        hideSortAndUnify();
    }

    function revertStartFresh() {
        showStartFresh();
        restoreSortAndUnify();
        var listContainer = StockListContainer.getInstance();
        var funGrid = FunGrid.getInstance();

        listContainer.revertStartFresh();
        funGrid.revertStartFresh();

        setProperListIcon();
    }

    /**Event Listener**/
    function onLeftPaneButtonClick() {
        isLeftPaneOpen = !isLeftPaneOpen;
        if (isLeftPaneOpen) {
            papaMainView.openLeftPane();
        } else {
            papaMainView.hideLeftPane();
            drillDownWindow.slideOutPanel();
        }
        configureLeftPaneButton();
    }

    function onAboutButtonClick() {
        toggleAboutVisibility();
    }

    function onAboutPopupMouseDown() {
        d3.event[CLICKED_INSIDE_ABOUT_POPUP] = true;
    }

    function onExtraStuffPopupMouseDown() {
        d3.event[CLICKED_INSIDE_EXTRA_STUFF_POPUP] = true;
    }

    function onCardActionsButtonMouseDown() {
        d3.event[CLICKED_INSIDE_CARD_ACTION_POPUP] = true;
    }

    function onSignInPopupMouseDown() {
        d3.event[CLICKED_INSIDE_SIGNIN_POPUP] = true;
    }

    function onBodyMouseDown() {
        if (!d3.event[CLICKED_INSIDE_ABOUT_POPUP]) {
            hideAbout();
        }
        if (!d3.event[CLICKED_INSIDE_SIGNIN_POPUP]) {
            hideSignIn();
        }
        if (!d3.event[CLICKED_INSIDE_EXTRA_STUFF_POPUP]) {
            hideExtraStuff();
        }
        if (!d3.event[CLICKED_INSIDE_CARD_ACTION_POPUP]) {
            hideCardActionPopup();
        }
    }

    function onStartFreshClick() {
        activateStartFresh();
        revertActionService.showMessage("Deleted All", revertStartFresh, 200);
    }

    function onExtraStuffButtonClick() {
        toggleExtraStuffVisibility();
    }

    function onCardActionsButtonClick() {
        toggleCardActionsVisibility();
    }
}