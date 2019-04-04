/**
 * Created by avitzur on 2/21/2016.
 */
function ActionSelectorUltimate() {
    var clickNameSpace = "ActionSelectorUltimate" + getUniqueIDGlobal();
    /***CONSTANTS***/
    var TYPE_TEXT_LIST = ["Indicator", "Compare", "Profit"];
    var TYPE_TEXT_LIST_SHORT = ["Ind", "Com", "Pro"];
    var OPTION_CLICK_ATTR = "OPTION_CLICK_ATTR";
    //Layout
    var MIN_WIDTH_FOR_FULL_TEXT = 80;
    var FONT_SIZE = 13;
    var DROP_ICON_SIZE = 8;

    /***Externally Set****/
    //Structure
    var externalDiv;
    //Layout
    var width;
    //Util
    var papaToolbar;

    /***Internally Set****/
    //Structure
    var mainElement;
    var optionsWindow;
    var mainTextElement;
    var optionElementList;
    //State
    var selectedIndex = 0;
    var isWindowOpen;
    //Layout
    var isShort;
    //Util
    var shapeUtil = ShapesUtil.getInstance();

    /***Public Functions****/
    this.setExternalDiv = function (divD3, widthInput) {
        externalDiv = divD3;
        width = widthInput;

        isShort = (width < MIN_WIDTH_FOR_FULL_TEXT);
    };

    this.setPapa = function (topBar) {
        papaToolbar = topBar;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.getSelectedView = function(){
        return selectedIndex;
    };

    this.getIsCompare = function () {
        return (selectedIndex == 1);
    };

    this.redraw = function () {
        redraw();
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }


    function construct() {
        clearSlate(externalDiv);

        mainElement = externalDiv.append("div")
            .style({
                cursor: "pointer",
                position: "absolute",
                top: -7 + "px",
                height: 26 + "px"
            })
            .attr("name", "ActionSelectorUltimate")
            .on("click", onMainElementClick)
            .on("mousedown", onOptionMouseDown);

        createMainSection();

        optionsWindow = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 11 + "px",
                left: -4 + "px",
                width: MIN_WIDTH_FOR_FULL_TEXT + "px",
                background: "white",
                border: "1px solid #666666",
                cursor: "pointer",
                padding: 2 + "px",
                "box-shadow": "rgba(0,0,0,0.5) 1px 1px 1px 1px",
                "z-index": 3
            });
        createWindow();
    }

    function createMainSection() {
        var marginRight = 6;

        if (isShort) {
            marginRight = 3;
        }

        mainTextElement = mainElement.append("p")
            .style({
                margin: 0,
                "margin-right": marginRight + "px",
                color: "#666666",
                display: "inline-block",
                "font-size": FONT_SIZE + "px"
            })
            .text("Indicator ");

        var dropIcon = mainElement.append("div")
            .style({
                position: "relative",
                top: -1 + "px",
                width: DROP_ICON_SIZE + "px",
                height: DROP_ICON_SIZE + "px",
                display: "inline-block"
            });

        shapeUtil.createTriangle(dropIcon, DROP_ICON_SIZE, DROP_ICON_SIZE, shapeUtil.DIRECTION.BOTTOM, "#666666");
    }

    function createWindow() {
        optionElementList = [];
        for (var i = 0; i < TYPE_TEXT_LIST.length; i++) {
            createOption(i);
        }
    }

    function createOption(index) {
        var text = TYPE_TEXT_LIST[index];

        var optionElement = optionsWindow.append("p")
            .style({
                margin: 0,
                padding: 2 + "px",
                "padding-bottom": 4 + "px",
                "padding-top": 4 + "px",
                "padding-right": 5 + "px",
                "font-size": FONT_SIZE + "px"
            })
            .text(text)
            .classed("ActionSelectorUltimateOptionText", true)
            .datum(index)
            .on("click", onOptionClick)
            .on("mousedown", onOptionMouseDown);

        optionElementList.push(optionElement);
    }


    /**Draw*****/
    function redraw() {
        updateBySelectedIndex();
        hideWindow();
    }

    /***UI Changes*/
    function updateBySelectedIndex() {
        showAllOptions();
        hideSelectedOptions();

        mainElement.attr("title", TYPE_TEXT_LIST[selectedIndex]);
        var selectedText = TYPE_TEXT_LIST[selectedIndex];
        if (isShort) {
            selectedText = TYPE_TEXT_LIST_SHORT[selectedIndex];
        }
        mainTextElement.text(selectedText);
    }

    function hideSelectedOptions() {
        optionElementList[selectedIndex].style("display", "none");
    }

    function showAllOptions() {
        for (var i = 0; i < optionElementList.length; i++) {
            optionElementList[i].style("display", "");
        }
    }

    function hideWindow() {
        isWindowOpen = false;
        removeEventFromBody();
        optionsWindow.style("display", "none");
    }

    function showWindow() {
        isWindowOpen = true;
        attachEventToBody();
        optionsWindow.style("display", "");
    }


    /**Event Manager***/
    function attachEventToBody() {
        d3.select("body")
            .on("mousedown." + clickNameSpace, onBodyMouseDown);
    }

    function removeEventFromBody() {
        d3.select("body")
            .on("mousedown." + clickNameSpace, null);
    }

    /**Event Listeners**/
    function onMainElementClick() {
        if (!isWindowOpen) {
            showWindow();
        } else {
            hideWindow();
        }
    }

    function onOptionMouseDown() {
        d3.event[OPTION_CLICK_ATTR] = true;
    }

    function onOptionClick() {
        var d3Target = d3.select(d3.event.currentTarget);
        selectedIndex = d3Target.datum();
        hideWindow();
        updateBySelectedIndex();

        papaToolbar.notifyActionChange();
    }

    function onBodyMouseDown() {
        if (!d3.event[OPTION_CLICK_ATTR]) {
            hideWindow();
        }
    }

    /**Event Listeners End.**/

}