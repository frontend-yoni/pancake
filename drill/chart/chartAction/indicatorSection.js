/**
 * Created by avitzur on 1/12/2016.
 */
function IndicatorSection() {
    var me = this;
    /**CONSTANTS***/
    var MAX_SELECTOR_COUNT = 3;
    var COLORS = ["#800080", "#FFA500", "#427242"];
    //Class
    var ADDITIONAL_SELECTOR_CLASS = "ADDITIONAL_SELECTOR_CLASS";
    //Attribute
    var IS_FRESH = "IS_FRESH";
    var PAPA_DIV = "PAPA_DIV";
    //Class

    //Layout
    var TOP_AREA_HEIGHT = 20;
    var DROPDOWN_WIDTH = 140;
    var FILED_NAME_FONT_SIZE = 14;

    /**Externally Set***/
    //Structure
    var externalDiv;
    //Papa
    var papaTopSectionComponent;
    var chartComponent;

    /**Internally Set***/
    //Structure

    //Layout

    //Util
    var mainSelector;
    var allSelectors = [];

    //Data
    var overlayIndicatorsParams = [];
    var extraChartsIndicatorsParams = [];

    /**Public Function**/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.drawComponent = function () {
        performConstruct();
    };

    this.setPapaComponent = function (papaComponent, drillChartComponent) {
        papaTopSectionComponent = papaComponent;
        chartComponent = drillChartComponent;
    };

    this.clearSelection = function () {
        clearSelection();
    };

    this.onOptionSelected = function (selector, optionObj) {
        onOptionSelected(selector, optionObj);
    };

    /***Construct***/
    function performConstruct() {
        clearSlate(externalDiv);

        var titleP = externalDiv.append("p")
            .style({
                float: "left",
                margin: 0,
                "margin-right": 5 + "px",
                height: TOP_AREA_HEIGHT + "px",
                "line-height": TOP_AREA_HEIGHT + "px",
                "font-size": FILED_NAME_FONT_SIZE + "px"
            })
            .text("Indicators: ");

        mainSelector = createNewSelector(true);
        allSelectors.push(mainSelector);
    }


    function createNewSelector(isFirst) {
        var promptText = "Select Indicator";

        var selectorDiv = externalDiv.append("div")
            .style({
                position: "relative",
                display: "inline-block",
                height: TOP_AREA_HEIGHT + "px",
                width: DROPDOWN_WIDTH + "px",
                "margin-right": 5 + "px",
                top: 1 + "px"
            });

        if (!isFirst) {
            promptText = "Select Another";
            selectorDiv.classed(SELECTED_BUTTON_CLASS, true);
        }

        var selector = new IndicatorSelection(promptText, COLORS[allSelectors.length]);
        selector.setPapaComponent(me);
        selector.setExternalDiv(selectorDiv);
        selector.drawComponent();

        selector[IS_FRESH] = true;
        selector[PAPA_DIV] = selectorDiv;

        return selector;
    }


    /**Actions***/
    function addNewSelector() {
        var selector = createNewSelector();
        allSelectors.push(selector);
    }

    function clearSelection() {
        var selector;
        for (var i = 0; i < allSelectors.length; i++) {
            selector = allSelectors[i];
            selector.clearSelection();
        }
        respondToClearAll();
    }

    /**Data***/
    function respondToSelection() {
        papaTopSectionComponent.hideCompare();
        if (getIsAllEmpty()) {
            respondToClearAll();
        } else {
            fillIndicatorParams();
            chartComponent.showIndicator(overlayIndicatorsParams, extraChartsIndicatorsParams);
        }
    }

    function respondToClearAll() {
        papaTopSectionComponent.showCompare();

        externalDiv.selectAll("." + SELECTED_BUTTON_CLASS).remove();

        allSelectors = [mainSelector];
        mainSelector[IS_FRESH] = true;

        chartComponent.hideIndicator();
    }

    function getIsFilled(selector) {
        var isIt = selector.getSelectedOptionData();
        return isIt;
    }

    function getIsAllEmpty() {
        var isIt = true;
        for (var i = 0; i < allSelectors.length; i++) {
            isIt = isIt && !getIsFilled(allSelectors[i]);
        }
        return isIt;
    }

    function fillIndicatorParams() {
        overlayIndicatorsParams = [];
        extraChartsIndicatorsParams = [];
        var optionData;
        var indicatorData;
        for (var i = 0; i < allSelectors.length; i++) {
            optionData = allSelectors[i].getSelectedOptionData();
            if (optionData) {
                indicatorData = optionData.data;
                if (indicatorData.getIsExtraChart()){
                    extraChartsIndicatorsParams.push(indicatorData);
                }else{
                    overlayIndicatorsParams.push(indicatorData);
                }
            }
        }
    }

    /**Event Listener***/
    function onOptionSelected(selector, optionObj) {
        respondToSelection(selector);

        if (optionObj && selector[IS_FRESH] && allSelectors.length < MAX_SELECTOR_COUNT) {
            addNewSelector();
            selector[IS_FRESH] = false;
        }
    }
}