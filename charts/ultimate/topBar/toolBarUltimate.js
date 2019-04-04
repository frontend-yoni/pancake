/**
 * Created by avitzur on 2/21/2016.
 */
function ToolBarUltimate() {
    var me = this;
    /***CONSTANTS***/

    //Layout
    var HEIGHT = 25;

    var MIN_WIDTH_FOR_FULL_TEXT = 300;
    var ACTION_SELECTOR_WIDTH = 80;
    var ACTION_SELECTOR_WIDTH_SHORT = 50;
    var DROPDOWNS_WIDTH = 140;
    var PAD_BETEEN_DROPDOWNS = 10;

    /***Externally Set****/
    //Structure
    var externalDiv;
    //Util
    var papaChart;
    //Data
    var cardData;

    /***Internally Set****/
    //Structure
    var actionSelectElement;
    var compareSectionDiv;
    var indicatorSectionDiv;
    var profitSectionDiv;
    //Layout
    var parentWidth;
    var actionSelectorWidth;
    //Count
    var dropDownCount;

    //Util
    var actionSelectorObject = new ActionSelectorUltimate();
    var compareComponent = new CompareSectionUltimate();
    var indicatorComponent = new IndicatorSectionUltimate();
    var profitComponent = new ProfitSectionUltimate();

    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.setCardData = function (cardDataInput) {
        cardData = cardDataInput;
    };

    this.setPapa = function (chart) {
        papaChart = chart;
    };

    this.getIsCompare = function () {
        return actionSelectorObject.getIsCompare();
    };

    this.getSelectedView = function () {
        return actionSelectorObject.getSelectedView();
    };

    this.redraw = function () {
        redraw();
    };

    this.getCompareSymbols = function () {
        return compareComponent.getCompareSymbols();
    };

    this.getActiveColors = function () {
        return compareComponent.getActiveColors();
    };

    this.getOverlayParams = function () {
        return indicatorComponent.getOverlayParams();
    };

    this.getExtraChartsParams = function () {
        return indicatorComponent.getExtraChartsParams();
    };

    /**Inner Public Function****/
    this.informChange = function () {
        papaChart.clearState();
        informPapa();
        redraw();
    };

    this.clearAllCompare = function () {
        papaChart.clearAllCompare();
    };

    this.notifyActionChange = function () {
        papaChart.clearState();
        informPapa();
        redraw();
    };

    this.getIsAlignLeft = function () {
        var isItLast = (cardData.column + cardData.width == cardData.currentColumnCount);
        var isItFirst = (cardData.column == 0);
        return isItLast && !isItFirst;
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        clearSlate(externalDiv);
        calculateLayoutParams();

        externalDiv.style("white-space", "nowrap");

        actionSelectElement = externalDiv.append("div")
            .style({
                position: "relative",
                "vertical-align": "middle",
                display: "inline-block",
                width: actionSelectorWidth + "px"
            });
        actionSelectorObject.setPapa(me);
        actionSelectorObject.setExternalDiv(actionSelectElement, actionSelectorWidth);
        actionSelectorObject.drawComponent();

        compareSectionDiv = externalDiv.append("div")
            .style({
                position: "relative",
                "vertical-align": "middle",
                display: "inline-block"
            });

        compareComponent.setPapa(me);
        compareComponent.setExternalDiv(compareSectionDiv, papaChart.getMainSymbol());
        compareComponent.setDropdownCount(dropDownCount);
        compareComponent.drawComponent();

        indicatorSectionDiv = externalDiv.append("div")
            .style({
                position: "relative",
                "vertical-align": "middle",
                display: "inline-block"
            });

        indicatorComponent.setPapa(me);
        indicatorComponent.setExternalDiv(indicatorSectionDiv);
        indicatorComponent.setDropdownCount(dropDownCount);
        indicatorComponent.drawComponent();

        profitSectionDiv = externalDiv.append("div")
            .style({
                position: "relative",
                "vertical-align": "middle",
                display: "inline-block"
            });
        profitComponent.setPapa(me);
        profitComponent.setExternalDiv(profitSectionDiv);
        profitComponent.setCardData(cardData);
        profitComponent.drawComponent();
    }


    /**Draw*****/
    function redraw() {
        indicatorSectionDiv.style("display", "none");
        compareSectionDiv.style("display", "none");
        profitSectionDiv.style("display", "none");

        var selectedView = actionSelectorObject.getSelectedView();
        switch (selectedView) {
            case ToolBarUltimate.VIEWS.Indicator:
                indicatorSectionDiv.style("display", "inline-block");
                break;
            case ToolBarUltimate.VIEWS.Compare:
                compareSectionDiv.style("display", "inline-block");
                break;
            case ToolBarUltimate.VIEWS.Profit:
                profitSectionDiv.style("display", "inline-block");
                break;
        }
    }

    /***Calculation**/
    function calculateLayoutParams() {
        parentWidth = externalDiv.node().clientWidth;
        actionSelectorWidth = ACTION_SELECTOR_WIDTH;
        if (parentWidth < MIN_WIDTH_FOR_FULL_TEXT) {
            actionSelectorWidth = ACTION_SELECTOR_WIDTH_SHORT;
        }

        dropDownCount = 1;
        var widthFor2 = actionSelectorWidth + DROPDOWNS_WIDTH + PAD_BETEEN_DROPDOWNS + DROPDOWNS_WIDTH;
        var widthFor3 = widthFor2 + PAD_BETEEN_DROPDOWNS + DROPDOWNS_WIDTH;
        if (parentWidth >= widthFor2) {
            dropDownCount = 2;
        }
        if (parentWidth >= widthFor3) {
            dropDownCount = 3;
        }
    }

    /**Inform***/
    function informPapa() {
        if (actionSelectorObject.getIsCompare()) {
            papaChart.updateParamsAndFetchData();
        } else {
            papaChart.updateParamsAndRedraw();
        }
    }

}

ToolBarUltimate.VIEWS = {
    "Indicator": 0,
    "Compare": 1,
    "Profit": 2
};