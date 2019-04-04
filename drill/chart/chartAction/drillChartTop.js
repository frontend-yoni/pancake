/**
 * Created by yoni_ on 1/2/2016.
 */
function DrillChartTop() {
    var me = this;

    /**CONSTANTS***/
    var DEFAULT_PERIODICITY = PERIODICITY.INTRA_DAY;
    //Class
    var DRILL_FREQUENCY_BUTTON_CLASS = "DRILL_FREQUENCY_BUTTON_CLASS";
    //Layout
    var TOP_AREA_HEIGHT = 20;
    var FILED_NAME_FONT_SIZE = 14;
    var FREQUENCY_FONT_SIZE = 12;
    var FREQUENCY_BUTTON_WIDTH_FULL = 70;
    var FREQUENCY_BUTTON_WIDTH = 35;
    var FREQUENCY_TOTAL_WIDTH = 295;
    var INDICATOR_TOTAL_WIDTH = 213;
    var COMPARE_TOTAL_WIDTH = 456;
    var CHART_TYPE_TOTAL_WIDTH = TOP_AREA_HEIGHT * 2 + 2;
    var PAD_WETWEEN_SECTIONS = 10;

    /**Externally Set***/
    //Structure
    var externalDiv;
    //Util
    var papaDrillChart;
    //Data
    var symbol;

    /**Internally Set***/
    //Structure
    var frequencySectionDiv;
    var chartTypeSectionDiv;
    var indicatorSectionDiv;
    var compareSectionDiv;
    //State
    var showCompare;
    var periodicity = DEFAULT_PERIODICITY;
    var isCandleChart;
    var compareSymbol;
    //Utils
    var periodicityToButton;
    var chartTypeButtons = new ChartButtonsComponent();
    var compareComponent = new DrillCompareSection();
    var indicatorComponent = new IndicatorSection();
    //Layout
    var totalWidth;
    //State
    var isCurrency;

    /**Public Function**/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.getPeriodicity = function () {
        return periodicity;
    };

    this.setPeriodicityManually = function (periodicityInput) {
        unmarkSelectedFrequency();
        periodicity = periodicityInput;
        markSelectedFrequency();
    };

    this.drawComponent = function () {
        performConstruct();
    };

    this.setMainSymbol = function (symbolInput) {
        symbol = symbolInput;
        compareComponent.setMainSymbol(symbol);
    };

    this.firstCall = function (symbolInput) {
        symbol = symbolInput;

        unmarkSelectedFrequency();
        compareComponent.firstCall(symbol);
        periodicity = DEFAULT_PERIODICITY;
        isCandleChart = true;

        chartTypeButtons.setIsCandleSelected(isCandleChart);
        chartTypeButtons.drawComponent();
        markSelectedFrequency();

        indicatorComponent.clearSelection();
    };

    this.setPapa = function (papaComponent) {
        papaDrillChart = papaComponent;
        compareComponent.setExternalComponents(papaDrillChart, me);
    };

    this.getCompareSymbol = function () {
        return compareComponent.getCompareSymbol();
    };

    this.hideChartSelection = function () {
        chartTypeSectionDiv.style("display", "none");
    };

    this.showChartSelection = function () {
        chartTypeSectionDiv.style("display", "");
    };

    this.hideCompare = function () {
        hideCompare();
    };

    this.showCompare = function () {
        showCompare();
    };

    this.respondToCompareSelection = function () {
        indicatorComponent.clearSelection();
    };

    this.applyZoomState = function(){
        applyShadowToSelectedFrequency();
    };

    this.removeZoomState = function(){
        removeShadowFromFrequencies();
    };

    /***Construct***/
    function performConstruct() {
        clearSlate(externalDiv);

        totalWidth = externalDiv.node().clientWidth;

        chartTypeSectionDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                height: TOP_AREA_HEIGHT + "px",
                left: 0 + "px",
                width: CHART_TYPE_TOTAL_WIDTH + "px"
            });

        var frequencyLeft = CHART_TYPE_TOTAL_WIDTH + PAD_WETWEEN_SECTIONS;
        frequencySectionDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                height: TOP_AREA_HEIGHT + "px",
                left: frequencyLeft + "px",
                width: FREQUENCY_TOTAL_WIDTH + "px"
            });

        var indicatorLeft = frequencyLeft + FREQUENCY_TOTAL_WIDTH + PAD_WETWEEN_SECTIONS;


        indicatorSectionDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                height: TOP_AREA_HEIGHT + "px",
                left: indicatorLeft + "px"
            });


        var compareLeft = indicatorLeft + INDICATOR_TOTAL_WIDTH + PAD_WETWEEN_SECTIONS;
        compareSectionDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                height: TOP_AREA_HEIGHT + "px",
                left: compareLeft + "px"
            });

        var hasPlaceForFullCompare = (totalWidth - compareLeft > COMPARE_TOTAL_WIDTH);

        fillFrequencySection();
        fillChartTypeSection();
        fillIndicatorSection();
        fillCompareSection(hasPlaceForFullCompare);
    }

    function hideCompare() {
        compareComponent.clearState();
        compareSectionDiv.style("visibility", "hidden");
    }

    function showCompare() {
        compareSectionDiv.style("visibility", "visible");
    }

    /***Chart type***/
    function fillIndicatorSection() {
        indicatorComponent.setPapaComponent(me, papaDrillChart);
        indicatorComponent.setExternalDiv(indicatorSectionDiv);
        indicatorComponent.drawComponent();
    }

    function fillCompareSection(hasPlaceForFullCompare) {
        compareComponent.setExternalDiv(compareSectionDiv);
        compareComponent.drawComponent();
        compareComponent.setHasPlaceForFullCompare(hasPlaceForFullCompare);
    }

    function fillChartTypeSection() {
        var chartIconHeight = TOP_AREA_HEIGHT - 2;
        var chartTypeButtonsArea = chartTypeSectionDiv.append("div")
            .style({
                position: "relative",
                display: "inline-block",
                top: 1 + "px",
                height: TOP_AREA_HEIGHT + "px",
                width: chartIconHeight * 2 + 4 + "px",
                "vertical-align": "middle"
            })
            .attr("name", "chartTypeButtonsArea")
            .on(ChartButtonsComponent.CHART_TYPE_SELECTED_EVENT, onChertTypeSelected);

        chartTypeButtons.setExternalDiv(chartTypeButtonsArea);
        chartTypeButtons.setPadBetweenButtons(5);
        chartTypeButtons.setButtonHeight(chartIconHeight);
        chartTypeButtons.setIsCandleSelected(isCandleChart);
        chartTypeButtons.drawComponent();
    }

    /**Frequency**/
    function fillFrequencySection() {
        var textP = frequencySectionDiv.append("p")
            .style({
                display: "inline-block",
                margin: 0,
                "margin-right": 5 + "px",
                height: TOP_AREA_HEIGHT + "px",
                "line-height": TOP_AREA_HEIGHT + "px",
                "font-size": FILED_NAME_FONT_SIZE + "px"
            })
            .text("Period: ");

        periodicityToButton = {};
        createFrequencyButton(PERIODICITY.INTRA_DAY, "20D", "20 Days", "Data every 15 minutes");
        createFrequencyButton(PERIODICITY.DAILY, "3Y", "3 Years", "Data every Day");
        createFrequencyButton(PERIODICITY.WEEKLY, "10Y", "10 Years", "Data every Week");
        createFrequencyButton(PERIODICITY.MONTHLY, "20Y", "20 Years", "Usually data every Month");
        createFrequencyButton(PERIODICITY.QUARTERLY, "MAX", "All Time", "Usually data every Quarter");

        markSelectedFrequency();
    }

    function createFrequencyButton(periodicityInput, text, fullText, tooltipText) {
        var button = frequencySectionDiv.append("p")
            .style({
                display: "inline-block",
                margin: 0,
                "margin-right": 5 + "px",
                "text-align": "center",
                width: FREQUENCY_BUTTON_WIDTH + "px",
                height: TOP_AREA_HEIGHT - 2 + "px",
                "line-height": TOP_AREA_HEIGHT - 2 + "px",
                "font-size": FREQUENCY_FONT_SIZE + "px",
                "border-radius": 2 + "px"
            })
            .attr({
                "fullText": fullText,
                "shortText": text,
                "title": tooltipText,
                "tooltipText": tooltipText
            })
            .classed(DRILL_FREQUENCY_BUTTON_CLASS, true)
            .text(text)
            .datum(periodicityInput)
            .on("click", onFrequencyClick);

        periodicityToButton[periodicityInput] = button;
        return button;
    }

    function markSelectedFrequency() {
        var button = periodicityToButton[periodicity];
        var text = button.attr("fullText");
        button.classed(SELECTED_BUTTON_CLASS, true);
        button.text(text);
        button.style("width", FREQUENCY_BUTTON_WIDTH_FULL + "px");
    }

    function unmarkSelectedFrequency() {
        var button = periodicityToButton[periodicity];
        var text = button.attr("shortText");
        button.classed(SELECTED_BUTTON_CLASS, false);
        button.text(text);
        button.style("width", FREQUENCY_BUTTON_WIDTH + "px");
    }

    function applyShadowToSelectedFrequency() {
        removeShadowFromFrequencies();

        var button = periodicityToButton[periodicity];
        button.style({
                "box-shadow": "rgba(0,0,0,0.5) 0px 0px 2px 2px"
            })
            .attr("title", "Cancel Zoom");
    }

    function removeShadowFromFrequencies() {
        var buttons = d3.values(periodicityToButton);
        var button;
        for (var i = 0; i < buttons.length; i++) {
            button = buttons[i];
            button.style({
                    "box-shadow": "none"
                })
                .attr("title", button.attr("tooltipText"));
        }
    }


    /**Event Listener***/
    function onFrequencyClick() {
        var target = d3.event.target;
        var clickedPeriodicity = d3.select(target).datum();

        if (periodicity != clickedPeriodicity) {
            unmarkSelectedFrequency();
            periodicity = clickedPeriodicity;
            markSelectedFrequency();
            papaDrillChart.fetchDataAndDrawUltimate();
        } else {
            papaDrillChart.cancelZoom();
        }

    }

    function onChertTypeSelected() {
        isCandleChart = d3.event.detail.data;
        papaDrillChart.setIsCandleAndRedraw(isCandleChart);
    }
}