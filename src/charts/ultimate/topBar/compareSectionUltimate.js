/**
 * Created by avitzur on 2/21/2016.
 */
function CompareSectionUltimate() {
    var me = this;
    /***CONSTANTS***/
    var COLORS = ["rgb(243, 167, 108)", "#800080", "#427242"];
    //Layout
    var COMPARE_DROPDOWN_WIDTH = 100;
    var DROP_DOWN_HEIGHT = 20;
    var PAD_BETEEN_DROPDOWNS = 10;

    /***Externally Set****/
    //Structure
    var externalDiv;
    //Count
    var dropDownCount;
    //Data
    var mainSymbol;
    //Util
    var papaToolbar;

    /***Internally Set****/
    //Structure
    var compareElementList;
    var cancelButton;
    //Util
    var compareObjectList;
    var selectedSymbolList = [];

    /***Public Functions****/
    this.setExternalDiv = function (divD3, symbolInput) {
        externalDiv = divD3;
        mainSymbol = symbolInput;
    };

    this.setDropdownCount = function (count) {
        dropDownCount = count;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.redraw = function () {
        redraw();
    };

    this.setPapa = function (toolbar) {
        papaToolbar = toolbar;
    };

    this.getCompareSymbols = function () {
        var compareList = getCompareList();
        return compareList;
    };

    this.getActiveColors = function () {
        return getActiveColors();
    };

    /***Inner public functions***/
    this.respondToSymbolSelected = function (symbol, compareObj) {
        respondToSymbolSelected(symbol, compareObj);
    };

    /**Construction**/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        createCompareDropDowns();
        createCancelButton();
    }

    function createCancelButton() {
        cancelButton = externalDiv.append("p")
            .style({
                position: "absolute",
                "font-size": 13 + "px",
                "text-align": "center",
                height: DROP_DOWN_HEIGHT + "px",
                width: DROP_DOWN_HEIGHT + "px",
                "box-sizing": "border-box",
                "font-weight": "bold",
                cursor: "pointer",
                margin: 0,
                display: "inline-block",
                "padding-left": "1px",
                "border-radius": 2 + "px",
                "font-family": "sans-serif"
            })
            .classed("DRILL_FREQUENCY_BUTTON_CLASS", true)
            .text("X");

        cancelButton.on("click", onCancelClick);
    }

    function createCompareDropDowns() {
        compareElementList = [];
        compareObjectList = [];

        for (var i = 0; i < dropDownCount; i++) {
            addCompareElement(i);
        }
    }

    function addCompareElement(index) {
        var compareObject = new SelectSymbolSearchBox();
        var compareElement = externalDiv.append("div")
            .style({
                display: "inline-block",
                "vertical-align": "middle",
                position: "relative",
                width: COMPARE_DROPDOWN_WIDTH + "px",
                "margin-right": PAD_BETEEN_DROPDOWNS + "px",
                height: DROP_DOWN_HEIGHT + "px"
            });


        compareObject.setDropDownIndex(index);
        compareObject.setSeriesColor(COLORS[index]);
        compareObject.setExternalDiv(compareElement);
        compareObject.setPapaCompareSection(me);
        compareObject.setLayout(COMPARE_DROPDOWN_WIDTH, DROP_DOWN_HEIGHT);
        compareObject.drawComponent();
        compareObject.setSelectedSymbol(selectedSymbolList[index]);
        compareObject.setMainSymbol(mainSymbol, true);

        compareElementList.push(compareElement);
        compareObjectList.push(compareObject);
    }

    /**Draw*****/
    function redraw() {
        alignSelectedSymbolList();
        alignDropDownVisibility();
    }

    /**Data State**/
    function alignSelectedSymbolList() {
        if (selectedSymbolList.length > dropDownCount) {
            selectedSymbolList = selectedSymbolList.slice(0, dropDownCount);
        }
    }

    /**UI State***/
    function alignDropDownVisibility() {
        for (var i = 1; i < compareElementList.length; i++) {
            if (selectedSymbolList[i] || selectedSymbolList[i - 1] || selectedSymbolList[i + 1]) {
                compareElementList[i].style("display", "inline-block");
            } else {
                compareElementList[i].style("display", "none");
            }
        }

        var compareList = getCompareList();
        var isAnyoneActive = compareList.length > 0;
        if (isAnyoneActive) {
            cancelButton.style("display", "inline-block");
        } else {
            cancelButton.style("display", "none");
        }

        for (var i = 0; i < compareObjectList.length; i++) {
            compareObjectList[i].setExcludeSymbols([mainSymbol].concat(selectedSymbolList));
        }
    }

    /**Util**/
    function getActiveColors() {
        var colors = [];
        for (var i = 0; i < selectedSymbolList.length; i++) {
            if (selectedSymbolList[i]) {
                colors.push(COLORS[i]);
            }
        }
        return colors;
    }

    function getCompareList() {
        var compareList = [];
        for (var i = 0; i < selectedSymbolList.length; i++) {
            if (selectedSymbolList[i]) {
                compareList.push(selectedSymbolList[i]);
            }
        }
        return compareList;
    }

    /**Data Change***/
    function clearAll() {
        selectedSymbolList = [];
        for (var i = 0; i < compareObjectList.length; i++) {
            compareObjectList[i].clearSelection();
        }
        alignDropDownVisibility();
        papaToolbar.clearAllCompare();
    }

    /**Interaction***/
    function respondToSymbolSelected(symbol, compareObj) {
        selectedSymbolList[compareObj.getDropDownIndex()] = symbol;
        alignDropDownVisibility();
        papaToolbar.informChange();
    }

    /**Event listener***/
    function onCancelClick() {
        clearAll();
    }

}