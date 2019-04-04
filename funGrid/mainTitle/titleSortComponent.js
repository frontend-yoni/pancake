/**
 * Created by ReznikFamily on 14/12/2015.
 */
/**
 * Created by avitzur on 12/10/2015.
 */
function TitleSortComponent() {
    /**Constants**/
    var MAIN_BUTTON_WIDTH = 100;
    var DROP_BUTTON_WIDTH = 20;
    var DIRECTION_BUTTON_WIDTH = 40;
    var TRIANGLE_SIZE = 8;
    var OPTION_FONT_SIZE = 12;
    var DIRECTION_FONT_SIZE = 10;
    var SECONDARY_FONT_SIZE = 12;
    var ACTION_FONT_SIZE = 16;
    var CARD_SIZE_BUTTON_CLASS = "cardSizeButton";
    var CARD_SIZE_OPTION_CLASS = "cardSizeOptionDiv";
    var CLICKED_INSIDE_OPTIONS = "clickedInsideOptions";

    var DIRECTION_BUTTON_CLASS = "titleSortDirectionButton";
    //Color
    var BORDER_COLOR = "#d3d3d3";
    var BG_COLOR = "#f8f8f8";
    var TEXT_COLOR = "#333";


    /**Externally set**/
    //Structure Elements
    var externalDiv;

    /**Internally set**/
    //Structure Elements
    var mainButton;
    var directionButtons;
    var dropButton;
    var selectedTypeTextP;
    var optionsPopup;
    var upButton;
    var downButton;

    //Layout
    var parentHeight;

    //State
    var isOpen = false;
    var selectedSortIndex = 0;
    var selectedDirection = undefined;

    //Util
    var shapeUtil = ShapesUtil.getInstance();

    /**Public functions**/
    this.SORT_BOTTONS_WIDTH = MAIN_BUTTON_WIDTH + DROP_BUTTON_WIDTH + DIRECTION_BUTTON_WIDTH - 2;

    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.getSelectedSortType = function () {
        return getSelectedSortType();
    };

    this.returnToDEfaultState = function(){
        returnToDEfaultState();
    };

    /**Construction**/
    function drawComponent() {
        performConstruct();
    }

    function performConstruct() {
        clearSlate(externalDiv);

        parentHeight = externalDiv.node().clientHeight;

        dropButton = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                left: MAIN_BUTTON_WIDTH + DIRECTION_BUTTON_WIDTH - 2 + "px",
                height: parentHeight + "px",
                width: DROP_BUTTON_WIDTH + "px",
                border: "1px solid " + BORDER_COLOR,
                background: BG_COLOR,
                "border-radius": 2 + "px",
                "-moz-border-radius-topleft": 0,
                "border-top-left-radius": 0,
                "-moz-border-radius-bottomleft": 0,
                "border-bottom-left-radius": 0,
                "box-sizing": "border-box",
                "box-shadow": "rgba(0, 0, 0, 0.1) 1px 1px 0px",
                cursor: "pointer"
            })
            .on("click", onDropButtonClick)
            .classed(CARD_SIZE_BUTTON_CLASS, true);
        fillDropButton();

        directionButtons = externalDiv.append("div")
            .style({
                position: "absolute",
                overflow: "hidden",
                top: 0,
                left: 0 + "px",
                height: parentHeight + "px",
                width: DIRECTION_BUTTON_WIDTH + "px",
                border: "1px solid " + BORDER_COLOR,
                background: BG_COLOR,
                "border-radius": 2 + "px",
                "-moz-border-radius-topright": 0,
                "border-top-right-radius": 0,
                "-moz-border-radius-bottomright": 0,
                "border-bottom-right-radius": 0,
                "box-sizing": "border-box",
                "font-size": DIRECTION_FONT_SIZE + "px",
                "box-shadow": "rgba(0, 0, 0, 0.1) 1px 1px 0px"
            });

        fillDirectionButtons();
        markProperDirectionButton();

        mainButton = externalDiv.append("div").
            style({
                position: "absolute",
                top: 0,
                left: DIRECTION_BUTTON_WIDTH - 1 + "px",
                height: parentHeight + "px",
                width: MAIN_BUTTON_WIDTH + "px",
                border: "1px solid " + BORDER_COLOR,
                background: BG_COLOR,
                "box-sizing": "border-box",
                "box-shadow": "rgba(0, 0, 0, 0.1) 1px 1px 0px",
                cursor: "pointer"
            })
            .on("click", onMainClick)
            .classed(CARD_SIZE_BUTTON_CLASS, true);

        fillMainButton();

        optionsPopup = externalDiv.append("div").
            style({
                position: "absolute",
                top: parentHeight + 4 + "px",
                left: DIRECTION_BUTTON_WIDTH - 1 + "px",
                width: MAIN_BUTTON_WIDTH + "px",
                border: "1px solid #333333",
                background: "#ffffff",
                "box-sizing": "border-box",
                "box-shadow": "rgba(0, 0, 0, 0.5) 1px 1px 1px",
                cursor: "pointer"
            })
            .classed(CARD_SIZE_OPTION_CLASS, true);

        hideOptions();
        d3.select("body").on("click.TitleSortComponent", onBodyClick);
        fillOptions();
    }

    function fillDirectionButtons() {
        upButton = createDirectionButton(true);
        downButton = createDirectionButton(false);

        upButton.datum(SORT_BY_DIRECTION.ASCENDING);
        downButton.datum(SORT_BY_DIRECTION.DESCENDING);

        var separator = directionButtons.append("div")
            .style({
                position: "absolute",
                height: 1 + "px",
                width: "100%",
                top: parentHeight / 2 - 2 + "px",
                background: BORDER_COLOR
            });
    }

    function createDirectionButton(isUp) {
        var button = directionButtons.append("div")
            .style({
                position: "absolute",
                height: parentHeight / 2 + "px",
                width: "100%",
                cursor: "pointer"
            })
            .classed(DIRECTION_BUTTON_CLASS, true)
            .on("click", onDirectionClick);

        var textP = button.append("p")
            .style({
                position: "relative",
                "text-align": "center",
                width: "100%",
                margin: 0,
                height: parentHeight / 2 + "px",
                "line-height": parentHeight / 2 + "px"
            });

        var textStr;
        if (isUp) {
            button.style({
                top: 0
            });
            textStr = "UP";
        } else {
            button.style({
                bottom: 0
            });
            textP.style({
                top: 1 + "px"
            });
            textStr = "DOWN";
        }

        textP.text(textStr);

        return button;
    }

    function fillMainButton() {
        var actionText = mainButton.append("p")
            .style({
                position: "absolute",
                top: 1 + "px",
                margin: 0,
                width: MAIN_BUTTON_WIDTH + "px",
                color: TEXT_COLOR,
                "text-align": "center",
                "font-weight": "bold",
                "font-size": ACTION_FONT_SIZE + "px"
            })
            .text("Sort!");


        selectedTypeTextP = mainButton.append("p")
            .style({
                position: "absolute",
                bottom: 1 + "px",
                margin: 0,
                width: MAIN_BUTTON_WIDTH + "px",
                color: TEXT_COLOR,
                "font-size": SECONDARY_FONT_SIZE + "px",
                "text-align": "center"
            })
            .text("Today Change");
    }

    function fillDropButton() {
        var triangleDiv = dropButton.append("div")
            .style({
                position: "absolute",
                top: (parentHeight - TRIANGLE_SIZE) / 2,
                left: (DROP_BUTTON_WIDTH - TRIANGLE_SIZE) / 2,
                height: TRIANGLE_SIZE + "px",
                width: TRIANGLE_SIZE + "px"
            });

        shapeUtil.createTriangle(triangleDiv, TRIANGLE_SIZE, TRIANGLE_SIZE, shapeUtil.DIRECTION.BOTTOM, "#555555");
    }

    function fillOptions() {
        var options = TitleSortComponent.OPTIONS;
        for (var i = 0; i < options.length; i++) {
            createOption(i)
        }
    }

    function createOption(index) {
        var option = optionsPopup.append("p")
            .style({
                margin: 0,
                "padding-top": 5 + "px",
                "padding-bottom": 5 + "px",
                width: "100%",
                "text-align": "center",
                "font-size": OPTION_FONT_SIZE + "px",
                color: TEXT_COLOR
            })
            .on("click", onOptionClicked)
            .datum(index)
            .text(TitleSortComponent.OPTIONS[index]);
    }

    /**Actions!**/
    function toggleAboutVisibility() {
        if (isOpen) {
            hideOptions();
        } else {
            showOptions();
        }
    }

    function showOptions() {
        isOpen = true;
        optionsPopup.style("display", "");
    }

    function hideOptions() {
        isOpen = false;
        optionsPopup.style("display", "none");
    }

    /**State Change**/
    function markProperDirectionButton(){
        upButton.classed(SELECTED_BUTTON_CLASS, false);
        downButton.classed(SELECTED_BUTTON_CLASS, false);

        if (selectedDirection == SORT_BY_DIRECTION.ASCENDING){
            upButton.classed(SELECTED_BUTTON_CLASS, true);
        }else if (selectedDirection == SORT_BY_DIRECTION.DESCENDING){
            downButton.classed(SELECTED_BUTTON_CLASS, true);
        }
    }

    function returnToDEfaultState(){
        selectedDirection = undefined;
        markProperDirectionButton();
    }

    /**Calculations**/
    function getSelectedSortType() {
        return selectedSortIndex;
    }

    /**Event Listener***/
    function onMainClick() {
        if (!selectedDirection){
            selectedDirection = SORT_BY_DIRECTION.ASCENDING;
        }
        markProperDirectionButton();
        sortFromTitle(selectedSortIndex, selectedDirection);
    }

    function onDirectionClick(){
        var target = d3.event.currentTarget;
        selectedDirection = d3.select(target).datum();
        markProperDirectionButton();
        sortFromTitle(selectedSortIndex, selectedDirection);
    }

    function onOptionClicked() {
        var htmlTarget = d3.event.currentTarget;
        selectedSortIndex = d3.select(htmlTarget).datum();
        selectedTypeTextP.text(TitleSortComponent.OPTIONS[selectedSortIndex]);
    }

    function onDropButtonClick() {
        d3.event[CLICKED_INSIDE_OPTIONS] = true;
        toggleAboutVisibility();
    }

    function onBodyClick() {
        if (!d3.event[CLICKED_INSIDE_OPTIONS]) {
            hideOptions();
        }
    }
}

TitleSortComponent.OPTIONS = ["Today Change", "Total Gain"]; //Must match the order of SORT_BY_OPTIONS for DataManager.js

TitleSortComponent.getInstance = function () {
    if (!TitleSortComponent.instance) {
        TitleSortComponent.instance = new TitleSortComponent();
    }

    return TitleSortComponent.instance;
};