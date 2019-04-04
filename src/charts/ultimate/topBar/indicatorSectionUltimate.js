/**
 * Created by avitzur on 2/21/2016.
 */
function IndicatorSectionUltimate() {
    var me = this;
    /***CONSTANTS***/
    //Class
    var ADDITIONAL_SELECTOR_CLASS = "ADDITIONAL_SELECTOR_CLASS";
    //Attribute
    var COLORS = ["rgb(243, 167, 108)", "#800080", "#427242"];
    //Layout
    var DROPDOWN_WIDTH = 140;
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
    var indicatorElementList;
    //Util
    var indicatorObjectList;
    var indicatorsParams = [];

    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
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

    this.getOverlayParams = function () {
        var overlayParams = [];
        var param;
        for (var i = 0; i < dropDownCount; i++) {
            param = indicatorsParams[i];
            if (param && !param.getIsExtraChart()){
                overlayParams.push(param);
            }
        }
        return overlayParams;
    };

    this.getExtraChartsParams = function () {
        var extraChartParams = [];
        var param;
        for (var i = 0; i < dropDownCount; i++) {
            param = indicatorsParams[i];
            if (param && param.getIsExtraChart()){
                extraChartParams.push(param);
            }
        }
        return extraChartParams;
    };

    /***Inner public functions***/
    this.onOptionSelected = function (component, optionObj) {
        onOptionSelected(component, optionObj);
    };

    /**Construction**/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        createIndicatorDropDowns();
    }

    function createIndicatorDropDowns() {
        indicatorElementList = [];
        indicatorObjectList = [];

        for (var i = 0; i < dropDownCount; i++) {
            addIndicatorElement(i);
        }
    }

    function addIndicatorElement(index) {
        var promptText = "Select Indicator";


        var selectorDiv = externalDiv.append("div")
            .style({
                display: "inline-block",
                "vertical-align": "middle",
                position: "relative",
                width: DROPDOWN_WIDTH + "px",
                "margin-right": PAD_BETEEN_DROPDOWNS + "px",
                height: DROP_DOWN_HEIGHT + "px"
            });

        if (index > 0) {
            promptText = "Select Another";
            selectorDiv.classed(SELECTED_BUTTON_CLASS, true);
        }

        var selector = new IndicatorSelection(promptText, COLORS[index]);

        if (indicatorsParams[index] && index < dropDownCount){
            selector.setSelectedIndicator(indicatorsParams[index]);
        }

        var isAlignLeft = papaToolbar.getIsAlignLeft();
        selector.setIsAlignLeft(isAlignLeft);
        selector.setIsInsideCard(true);
        selector.setPapaComponent(me);
        selector.setExternalDiv(selectorDiv);
        selector.drawComponent();


        indicatorElementList.push(selectorDiv);
        indicatorObjectList.push(selector);
    }

    /**Draw*****/
    function redraw() {
        alignDropDownVisibility();
    }

    /***Data Manipulation**/
    function fillIndicatorParams() {
        indicatorsParams = [];
        var optionData;
        var indicatorData;
        for (var i = 0; i < dropDownCount; i++) {
            optionData = indicatorObjectList[i].getSelectedOptionData();
            if (optionData) {
                indicatorData = optionData.data;
                indicatorsParams.push(indicatorData);
            }
        }
    }

    /**Data State**/

    /**UI State***/
    function alignDropDownVisibility() {
        for (var i = 1; i < indicatorElementList.length; i++) {
            if (isIndicatorSet(i) || isIndicatorSet(i - 1) || isIndicatorSet(i + 1)) {
                indicatorElementList[i].style("display", "inline-block");
            } else {
                indicatorElementList[i].style("display", "none");
            }
        }
    }

    function isIndicatorSet(index) {
        var indicatorObj = indicatorObjectList[index];
        var isIt = indicatorObj && indicatorObj.getSelectedOptionData();

        return isIt;
    }

    /**Util**/


    /**Interaction***/
    function onOptionSelected(component, optionObj) {
        alignDropDownVisibility();
        fillIndicatorParams();

        papaToolbar.notifyActionChange();
    }

    /**Event listener***/
}