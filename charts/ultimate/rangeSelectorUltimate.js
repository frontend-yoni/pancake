/**
 * Created by yoni_ on 2/20/2016.
 */
function RangeSelectorUltimate() {
    /***CONSTANTS***/
    //Data
    var RANGE_VALUE_LIST = ["5d", "20d", "1y", "3y"];
    var RANGE_TEXT_LIST = ["5 Days", "20 Days", "1 Year", "3 Years"];
    var RANGE_TEXT_LIST_SHORT = ["5D", "20D", "1Y", "3Y"];
    //Style
    var MIN_BUTTON_WIDTH_FOR_FULL_TEXT = 50;
    var PAD_BETWEEN_BUTTONS = 5;
    var BORDER_COLOR = "#bcbcbc";
    var BORDER_TEXT = "1px solid " + BORDER_COLOR;
    var FONT_SIZE = 13;
    /***Externally Set****/
    //Structure
    var externalDiv;
    //Util
    var papaChart;
    //Layout
    var isOnRight;

    /***Internally Set****/
    //Structure
    var buttonElementList;
    //State
    var selectedIndex = 1;
    var isShowShadow;
    //Layout
    var parentHeight;
    var parentWidth;
    var buttonWidth;
    var buttonHeight;
    var fontSize;

    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.setPapa = function(chart){
        papaChart = chart;
    };

    this.setIsOnRight = function(boolean){
        isOnRight = boolean;
    };

    this.redraw = function () {
        redraw();
    };

    this.applyZoomShadow = function(){
        unmarkAllAsZoomed();
        markAsZoomed();
    };

    this.removeZoomShadow = function(){
        unmarkAllAsZoomed();
    };

    this.getSelectedRangeStr = function () {
        return RANGE_VALUE_LIST[selectedIndex];
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        parentHeight = externalDiv.node().clientHeight;
        parentWidth = externalDiv.node().clientWidth;
        if (isOnRight){
            buttonWidth = 30;
            buttonHeight = 18;
            fontSize = FONT_SIZE - 1
        }else {
            var totalButtonWidth = (parentWidth + PAD_BETWEEN_BUTTONS) / (RANGE_VALUE_LIST.length);
            buttonWidth = totalButtonWidth - PAD_BETWEEN_BUTTONS;
            externalDiv.style("white-space", "nowrap");
            buttonHeight = parentHeight;
            fontSize = FONT_SIZE;
        }

        createAllButtons();
    }

    function createAllButtons() {
        buttonElementList = [];
        for (var i = 0; i < RANGE_VALUE_LIST.length; i++) {
            createButton(i);
        }
    }

    function createButton(index) {
        var fullText = RANGE_TEXT_LIST[index];

        var buttonElement = externalDiv.append("p")
            .style({
                margin: 0,
                "font-size": fontSize + "px",
                "margin-right": PAD_BETWEEN_BUTTONS + "px",
                cursor: "pointer",
                width: buttonWidth + "px",
                height: buttonHeight + "px",
                "line-height": buttonHeight + "px",
                position: "relative",
                display: "inline-block",
                border: BORDER_TEXT,
                "text-align": "center",
                "font-weight": "bold",
                "box-sizing": "border-box"
            })
            .attr("title", fullText)
            .attr("fullText", fullText)
            .classed("ULTIMATE_RANGE_BUTTON_CLASS", true)
            .text(fullText)
            .datum(index)
            .on("click", onClick);

        if (buttonWidth < MIN_BUTTON_WIDTH_FOR_FULL_TEXT){
            var shortText = RANGE_TEXT_LIST_SHORT[index];
            buttonElement.text(shortText);
        }

        if (isOnRight && index < RANGE_VALUE_LIST.length - 1){
            externalDiv.append("div")
                .style({
                    width: buttonWidth + "px",
                    height: 5 + "px"
                })
        }

        buttonElementList.push(buttonElement);
    }

    /**Draw*****/
    function redraw() {
        markAsSelected();
        if (isShowShadow){
            markAsZoomed();
        }
    }

    /***State***/
    function markAsSelected() {
        var selectedButton = buttonElementList[selectedIndex];
        selectedButton.classed(SELECTED_BUTTON_CLASS, true);
    }

    function unmarkAllAsSelected() {
        for (var i = 0; i < buttonElementList.length; i++) {
            buttonElementList[i].classed(SELECTED_BUTTON_CLASS, false);
        }
    }

    function markAsZoomed() {
        isShowShadow = true;
        var selectedButton = buttonElementList[selectedIndex];
        selectedButton.style("box-shadow", "rgba(0, 0, 0, 0.5) 0px 0px 3px 3px");
        selectedButton.attr("title", "Cancel Zoom");
    }

    function unmarkAllAsZoomed() {
        isShowShadow = false;
        var button;
        for (var i = 0; i < buttonElementList.length; i++) {
            button = buttonElementList[i];
            button.style("box-shadow", "rgba(0, 0, 0, 0.5) 0 0 0 0");
            button.attr("title", button.attr("fullText"));
        }
    }

    /**Event Listener***/
    function onClick() {
        var target = d3.event.target;
        var clickedIndex = d3.select(target).datum();
        var isNewRange = (selectedIndex != clickedIndex);

        selectedIndex = clickedIndex;
        unmarkAllAsSelected();
        unmarkAllAsZoomed();

        markAsSelected();

        papaChart.cancelZoom();
        if (isNewRange){
            papaChart.updateParamsAndFetchData();
        }else{
            papaChart.updateParamsAndRedraw();
        }

    }
}