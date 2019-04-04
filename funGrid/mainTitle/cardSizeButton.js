/**
 * Created by avitzur on 12/10/2015.
 */
function CardSizeButton() {
    /**Constants**/
    var MAIN_BUTTON_WIDTH = 65;
    var DROP_BUTTON_WIDTH = 20;
    var TRIANGLE_SIZE = 8;
    var CARD_SIZE_BUTTON_CLASS = "cardSizeButton";
    var CARD_SIZE_OPTION_CLASS = "cardSizeOptionDiv";
    var CLICKED_INSIDE_OPTIONS = "clickedInsideOptions";
    //Color
    var BORDER_COLOR = "#d3d3d3";
    var TEXT_COLOR = "#333";


    /**Externally set**/
    //Structure Elements
    var externalDiv;

    /**Internally set**/
    //Structure Elements
    var mainButton;
    var dropButton;
    var mainTextP;
    var optionsPopup;

    //Layout
    var parentHeight;

    //State
    var isOpen = false;
    var selectedSizeIndex = 0;

    //Util
    var shapeUtil = ShapesUtil.getInstance();
    var searchBoxComponent = SymbolSearchBox.getInstance();
    var funGrid = FunGrid.getInstance();

    /**Public functions**/
    this.TOTAL_BOTTONS_WIDTH = MAIN_BUTTON_WIDTH + DROP_BUTTON_WIDTH - 1;

    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.getSelectWidth = function () {
        return getWidthByIndex(selectedSizeIndex);
    };

    this.getSelectHeight = function () {
        return getHeightByIndex(selectedSizeIndex);
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
                left: MAIN_BUTTON_WIDTH - 1 + "px",
                height: parentHeight + "px",
                width: DROP_BUTTON_WIDTH + "px",
                border: "1px solid " + BORDER_COLOR,
                "border-radius": 2 + "px",
                "-moz-border-radius-topleft": 0,
                "border-top-left-radius": 0,
                "-moz-border-radius-bottomleft": 0,
                "border-bottom-left-radius": 0,
                "box-sizing": "border-box",
                "box-shadow": "rgba(0, 0, 0, 0.1) 1px 1px 0px",
                cursor: "pointer"
            })
            .attr("title", "Default Card Size")
            .on("click", onDropButtonClick)
            .classed(CARD_SIZE_BUTTON_CLASS, true);
        fillDropButton();

        mainButton = externalDiv.append("div").
            style({
                position: "absolute",
                top: 0,
                left: 0,
                height: parentHeight + "px",
                width: MAIN_BUTTON_WIDTH + "px",
                border: "1px solid " + BORDER_COLOR,
                "box-sizing": "border-box",
                "box-shadow": "rgba(0, 0, 0, 0.1) 1px 1px 0px",
                cursor: "pointer"
            })
            .attr("title", "Default Card Size. width X height")
            .on("click", onMainClick)
            .classed(CARD_SIZE_BUTTON_CLASS, true);

        mainTextP = mainButton.append("p")
            .style({
                position: "absolute",
                top: 8 + "px",
                margin: 0,
                width: MAIN_BUTTON_WIDTH + "px",
                color: TEXT_COLOR,
                "text-align": "center",
                "font-weight": "bold"
            })
            .text("1 X 1");

        optionsPopup = externalDiv.append("div").
            style({
                position: "absolute",
                top: parentHeight + 4 + "px",
                left: 0,
                width: MAIN_BUTTON_WIDTH + "px",
                border: "1px solid #333333",
                background: "#ffffff",
                "box-sizing": "border-box",
                "box-shadow": "rgba(0, 0, 0, 0.5) 1px 1px 1px",
                cursor: "pointer"
            })
            .classed(CARD_SIZE_OPTION_CLASS, true);

        hideOptions();
        d3.select("body").on("click.closeCardSizeButtonWindow", onBodyClick);
        fillOptions();
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
        var options = CardSizeButton.OPTIONS;
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
                color: TEXT_COLOR
            })
            .on("click", onOptionClicked)
            .datum(index)
            .text(CardSizeButton.OPTIONS[index]);
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

    /**Calculations**/
    function getWidthByIndex(index) {
        return CardSizeButton.WIDTHS[index];
    }

    function getHeightByIndex(index) {
        return CardSizeButton.HEIGHTS[index];
    }

    /**Event Listener***/
    function onMainClick(){
        searchBoxComponent.activateSelection();
    }

    function onOptionClicked() {
        var htmlTarget = d3.event.currentTarget;
        selectedSizeIndex = d3.select(htmlTarget).datum();
        mainTextP.text(CardSizeButton.OPTIONS[selectedSizeIndex]);

        funGrid.respondToDefaultSizeChange();
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

CardSizeButton.OPTIONS = ["1 X 1", "2 X 1", "1 X 2", "2 X 2", "3 X 1", "3 X 2"];
CardSizeButton.WIDTHS = [1, 2, 1, 2, 3, 3];
CardSizeButton.HEIGHTS = [1, 1, 2, 2, 1, 2];

CardSizeButton.getInstance = function () {
    if (!CardSizeButton.instance) {
        CardSizeButton.instance = new CardSizeButton();
    }

    return CardSizeButton.instance;
};