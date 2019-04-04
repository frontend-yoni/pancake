/**
 * Created by Jonathan on 10/2/2015.
 */

//CONSTANTS
TimeRangeSelector.BUTTON_CLICK_EVENT = "rangeButtonClickEvent";

function TimeRangeSelector() {
    var me = this;
    me.iMath = Math;
    //Constants
    me.BUTTON_COUNT = 7;
    me.MIN_PAD_BETWEEN_BUTTONS = 1;
    me.FINE_PAD_BETWEEN_BUTTONS = 3;
    me.MAX_PAD_BETWEEN_BUTTONS = 6;


    me.REST_API_RANGE_TO_INDEX = {
        1: 0,
        7: 1,
        30: 2,
        90: 3,
        365: 4,
        1825: 5,
        14600: 6
    };

    me.RANGES_TYPE = {
        DAY: 0,
        WEEK: 1,
        MONTH: 2,
        THREE_MONTH: 3,
        YEAR: 4,
        FIVE_YEAR: 5,
        MAX: 6
    };
    me.RANGES_TEXT = {
        0: "1 Day",
        1: "5 Days",
        2: "1 Month",
        3: "3 Months",
        4: "1 Year",
        5: "5 Years",
        6: "MAX"
    };
    me.RANGES_TEXT_SHORT = {
        0: "1D",
        1: "5D",
        2: "1M",
        3: "3M",
        4: "1Y",
        5: "5Y",
        6: "MAX"
    };

    //Color Constants
    me.BUTTON_COLOR = "#f6f6f6";
    me.TEXT_COLOR = "#777777";
    me.BORDER_COLOR = "#bcbcbc";
    me.SELECTED_BUTTON_COLOR = "#bbbbbb";
    me.SELECTED_TEXT_COLOR = "#000000";
    me.BORDER_TEXT = "1px solid " + me.BORDER_COLOR;
    //Layout Constants
    me.MAX_BUTTON_HEIGHT = 20;
    me.borderText = me.BORDER_TEXT;

    //Structure Util
    me.typeToButtonDiv = {};

    //Structure
    me.containerDiv;

    //Layout
    me.buttonHeight;
    me.buttonWidth;
    me.fontSize;
    me.padBetweenButtons;
    //Color

    //State
    me.selectedRange;
    //Layout state
    me.isVertical;

    //Papa
    me.papaComponent;
}

TimeRangeSelector.prototype.setPapa = function (papaComponent) {
    var me = this;
    me.papaComponent = papaComponent;
};

/**Public functions**/
TimeRangeSelector.prototype.setSelectedButton = function (restAPITimeRange) {
    var me = this;
    var selectedIndex = me.REST_API_RANGE_TO_INDEX[restAPITimeRange];
    me.selectedRange = selectedIndex;
};

TimeRangeSelector.prototype.createButtonsArea = function (container, isVertical, width, height) {
    var me = this;
    me.isVertical = isVertical;
    me.calculateButtonSize(width, height, isVertical);

    container.style({
        "font-size": me.fontSize + "px",
        "font-weight": "bold"
    });

    me.containerDiv = container;
    for (var i = 0; i < me.BUTTON_COUNT; i++) {
        me.createButton(i);
    }
};
/**Public functions End.**/

/**Inner functions**/
TimeRangeSelector.prototype.createButton = function (typeIndex) {
    var me = this;
    var container = me.containerDiv;
    var typeText = me.RANGES_TEXT_SHORT[typeIndex];
    var typeFullText = me.RANGES_TEXT[typeIndex];

    var buttonDiv = container.append("div")
        .style({
            color: me.TEXT_COLOR,
            background: me.BUTTON_COLOR,
            margin: 0,
            cursor: "pointer",
            width: me.buttonWidth + "px",
            height: me.buttonHeight + "px",
            border: me.borderText,
            position: "relative",
            "box-sizing": "border-box"
        })
        .classed("TimeRangeSelectorButton", true)
        .attr("title", typeFullText)
        .attr("typeFullText", typeFullText)
        .datum(typeIndex);

    var textContainer = buttonDiv.append("div")
        .style({
            display: "table",
            width: "100%",
            height: "100%"
        });

    var buttonP = textContainer.append("p")
        .style({
            display: "table-cell",
            "vertical-align": "middle",
            "text-align": "center",
            width: "100%",
            margin: 0
        })
        .text(typeText);

    if (!me.isVertical) {
        buttonDiv.style({
            display: "inline-block"
        });
    }

    if (typeIndex < me.BUTTON_COUNT - 1) {
        if (me.isVertical) {
            buttonDiv.style("margin-bottom", me.padBetweenButtons + "px");
        } else {
            buttonDiv.style("margin-right", me.padBetweenButtons + "px");
        }
    }


    me.typeToButtonDiv[typeIndex] = buttonDiv;
    if (me.selectedRange == typeIndex) {
        me.markRangeButton(typeIndex);
    }

    me.attachClickEvent(buttonDiv);
};

TimeRangeSelector.prototype.attachClickEvent = function (buttonDiv) {
    var me = this;
    buttonDiv.on("click", function () {
        me.onMouseClick();
    })
};

TimeRangeSelector.prototype.markRangeButton = function (rangeType) {
    var me = this;
    var buttonDiv = me.typeToButtonDiv[rangeType];
    buttonDiv.style({
        background: me.SELECTED_BUTTON_COLOR,
        color: me.SELECTED_TEXT_COLOR
    });
};

TimeRangeSelector.prototype.applyShadow = function () {
    var me = this;
    me.removeShadow();

    if (me.selectedRange){
        var selectedDiv = me.typeToButtonDiv[me.selectedRange ];
        selectedDiv.style({
            "z-index": 1,
            "box-shadow": "rgba(0, 0, 0, 0.5) 0px 0px 3px 3px"
        })
            .attr("title", "Cancel Zoom");
    }
};

TimeRangeSelector.prototype.removeShadow = function () {
    var me = this;
    var buttons = d3.values(me.typeToButtonDiv);
    var button;
    for (var i = 0; i < buttons.length; i++) {
        button = buttons[i];
        button.style({
            "z-index": 0,
            "box-shadow": "none"
        })
            .attr("title", button.attr("typeFullText"))
    }
};

TimeRangeSelector.prototype.unmarkRangeButton = function (rangeType) {
    var me = this;
    var buttonDiv = me.typeToButtonDiv[rangeType];
    buttonDiv.style({
        background: me.BUTTON_COLOR,
        color: me.TEXT_COLOR
    });
};

TimeRangeSelector.prototype.calculateButtonSize = function (width, height, isVertical) {
    var me = this;
    var iMath = me.iMath;
    var pad = me.MIN_PAD_BETWEEN_BUTTONS;
    var totalPad;
    var fontSize;
    var buttonHeight;
    var buttonWidth;

    if (!isVertical && width > 200) {
        pad = me.MAX_PAD_BETWEEN_BUTTONS;
    }
    if (isVertical && height > 110) {
        pad = me.FINE_PAD_BETWEEN_BUTTONS;
    }
    if (isVertical && height < 110) {
        me.borderText = "";
        me.superTiny = true;
    } else {
        me.borderText = me.BORDER_TEXT;
    }

    me.padBetweenButtons = pad;

    if (isVertical) {
        totalPad = pad * (me.BUTTON_COUNT - 1);
        buttonHeight = iMath.floor((height - totalPad) / me.BUTTON_COUNT);
        buttonWidth = width;
        fontSize = iMath.floor(buttonHeight / 1.1);
        fontSize = iMath.min(11, fontSize);
    } else {
        totalPad = pad * (me.BUTTON_COUNT - 1);
        buttonHeight = height;
        buttonWidth = (width - totalPad) / me.BUTTON_COUNT;
        fontSize = iMath.floor(buttonWidth / 3);
        fontSize = iMath.max(10, fontSize);
        fontSize = iMath.min(15, fontSize);
    }

    me.buttonHeight = buttonHeight;
    me.buttonWidth = buttonWidth;
    me.fontSize = fontSize;
};
/**Inner functions End.**/

/**Event Listeners**/
TimeRangeSelector.prototype.onMouseClick = function () {
    var me = this;
    var target = d3.event.target;
    var clickedButton = d3.select(target);
    var clickedTypeIndex = clickedButton.datum();
    var typeIndexToRestAPIsRange = [RestAPIs.TIME_RANGE.D1, RestAPIs.TIME_RANGE.D5, RestAPIs.TIME_RANGE.M1, RestAPIs.TIME_RANGE.M3, RestAPIs.TIME_RANGE.Y1,
        RestAPIs.TIME_RANGE.Y5, RestAPIs.TIME_RANGE.MAX];
    var restRange = typeIndexToRestAPIsRange[clickedTypeIndex];
    if (me.selectedRange != clickedTypeIndex) {
        me.unmarkRangeButton(me.selectedRange);
        me.selectedRange = clickedTypeIndex;
        me.markRangeButton(clickedTypeIndex);
        dispatchEventByNameAndData(me.containerDiv, TimeRangeSelector.BUTTON_CLICK_EVENT, restRange);
    } else {
        me.papaComponent.cancelZoom();
    }

    me.removeShadow();
};