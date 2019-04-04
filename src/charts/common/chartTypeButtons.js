/**
 * Created by yoni_ on 12/4/2015.
 */
function ChartButtonsComponent() {
    /***Constants***/
    //Layout
    var INNER_PAD = 2;
    var DEFAULT_PAD_BETWEEN_BUTTONS = 2;
    var UNSELECTED_OPACITY = 0.5;
    //Color
    var SELECTED_BG_COLOR = "#EFEFEF";
    var REGULAR_BG_COLOR = "#FFFFFF";
    var SELECTED_BORDER_COLOR = "rgb(51, 51, 51)";
    var REGULAR_BORDER_COLOR = "rgb(153, 153, 153)";
    var LINE_CHART_COLOR = "#0067a5";
    var DEFAULT_CONETNT_FILL = "#555555";

    /***Externally set***/
    //Structure
    var externalDiv;
    //Layout
    var buttonHeight;
    var padBetweenButtons = DEFAULT_PAD_BETWEEN_BUTTONS;
    //State
    var isCandleSelected;

    /***Internally set***/
    //Structure
    var candleButtonDiv;
    var lineButtonDiv;
    //Layout
    var iconHeight;
    var buttonHitAreaHeight;
    //Util
    var candleStickElement = new CandleStickElement();

    /**Public functions***/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.setButtonHeight = function (num) {
        buttonHeight = num;
        iconHeight = buttonHeight - 2 * INNER_PAD;
    };

    this.setPadBetweenButtons = function (pad) {
        padBetweenButtons = pad;
    };

    this.setIsCandleSelected = function (boolean) {
        isCandleSelected = boolean;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    /**Construction***/
    function drawComponent() {
        clearSlate(externalDiv);
        createButtons();
        markCorrectButton();
    }

    function createButtons() {
        createCandleButton();
        createLineButton();
    }

    function createLineButton() {
        var leftPosition = buttonHeight + padBetweenButtons;
        lineButtonDiv = createButton(leftPosition);
        lineButtonDiv.datum(false);
        fillLineButton();
    }

    function createCandleButton() {
        candleButtonDiv = createButton(0);
        candleButtonDiv.datum(true);
        fillCandleButton();
    }

    function createButton(leftPosition) {
        var button = externalDiv.append("div")
            .style({
                position: "absolute",
                height: buttonHeight + "px",
                width: buttonHeight + "px",
                left: leftPosition + "px",
                top: 0,
                "box-sizing": "border-box",
                border: "1px solid",
                "border-radius": 0 + "px"
            })
            .on("click", onButtonClick);

        return button;
    }


    function fillCandleButton() {
        var group = createSVGAndG(candleButtonDiv, 0);

        candleStickElement.setBodyColor(DEFAULT_CONETNT_FILL);
        candleStickElement.setExternalGroup(group, group);

        var candleWidth = iconHeight / 2 - 1;
        candleStickElement.setWidthOffser(candleWidth - 1);

        candleStickElement.setLayoutParams(candleWidth, 0, iconHeight, iconHeight - 3, 2, 0);
        candleStickElement.createCandle();

        candleStickElement.setLayoutParams(candleWidth, 0, iconHeight, iconHeight - 8, iconHeight - 2, candleWidth + 1);
        candleStickElement.createCandle();
    }

    function fillLineButton() {
        var group = createSVGAndG(lineButtonDiv, 1);
        var pathD3 = group.append("path");

        var xPositions = [];
        for (var i = 0; i < 6; i++) {
            xPositions.push(i * iconHeight / 5);
        }
        xPositions[4] -= 1;

        var yPositions = [];
        yPositions.push(iconHeight);
        yPositions.push(0.6 * iconHeight);
        yPositions.push(0.7 * iconHeight);
        yPositions.push(0.4 * iconHeight);
        yPositions.push(0.6 * iconHeight);
        yPositions.push(0);

        var pathStrArr = [];
        pathStrArr.push(moveToStr(xPositions[0], yPositions[0]));

        for (var j = 1; j < 6; j++) {
            pathStrArr.push(lineToStr(xPositions[j], yPositions[j]));
        }
        pathStrArr.push(lineToStr(iconHeight, iconHeight));

        pathStrArr.push("Z");

        var pathStr = pathStrArr.join(" ");

        pathD3.attr("d", pathStr);
    }

    function createSVGAndG(button, leftOffset) {
        var svg = button.append("svg")
            .style({
                position: "absolute",
                top: INNER_PAD - 1 + "px",
                left: INNER_PAD - leftOffset + "px",
                width: iconHeight + "px",
                height: iconHeight + "px",
                fill: DEFAULT_CONETNT_FILL
            });
        var group = svg.append("g");
        return group;
    }

    /**State changes***/
    function markCorrectButton() {
        if (isCandleSelected) {
            markButtonAsSelected(candleButtonDiv);
            unmarkButtonAsSelected(lineButtonDiv);
        } else {
            markButtonAsSelected(lineButtonDiv);
            unmarkButtonAsSelected(candleButtonDiv);
        }
    }

    function markButtonAsSelected(button) {
        button.style({
            "border-color": SELECTED_BORDER_COLOR,
            background: SELECTED_BG_COLOR,
            cursor: "default"
        });

        button.select("svg").style("opacity", 1);
    }

    function unmarkButtonAsSelected(button) {
        button.style({
            "border-color": REGULAR_BORDER_COLOR,
            background: REGULAR_BG_COLOR,
            cursor: "pointer"
        });

        button.select("svg").style("opacity", UNSELECTED_OPACITY);
    }

    /**Event Listeners**/
    function onButtonClick() {
        var clickedButtonHTML = d3.event.target;
        var isCandleClicked = d3.select(clickedButtonHTML).datum();
        if (isCandleSelected != isCandleClicked) {
            isCandleSelected = isCandleClicked;
            markCorrectButton();
            dispatchEventByNameAndData(externalDiv, ChartButtonsComponent.CHART_TYPE_SELECTED_EVENT, isCandleSelected);
        }
    }
}

ChartButtonsComponent.CHART_TYPE_SELECTED_EVENT = "chartTypeSelectedEvent";
ChartButtonsComponent.Z_INDEX = 1;