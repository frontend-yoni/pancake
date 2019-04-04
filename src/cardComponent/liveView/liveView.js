/**
 * Created by yoni_ on 12/25/2015.
 */
function LiveView() {
    //Constants
    //TIME
    var CHART_REFRESH_RATE = 5;
    //Layout constants
    var DEFAULT_SECTION_WIDTH = 190;
    var MIN_HEIGHT_FOR_CHART = 300;
    var SECTION_HEIGHT = 60;
    //Class

    //Data
    var cardData;
    var stockData;
    var userStockData;


    //Structure Elements
    var externalDiv;
    var currentDataDiv;
    var chartSectionDiv;

    //Layout params
    var parentDivHeight;
    var parentDivWidth;
    var currentDataDivHeight;
    var currentDataDivWidth;

    //State
    var isWide;
    var isCurrentDataVerticalAlign;
    var hasChart;

    //Utils
    var lineChart = new LineChartContainer();
    var currentDataSection = new CurrentDataSection();

    /*Public functions*/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.setData = function (cardDataInput) {
        cardData = cardDataInput;
        stockData = cardData.data;
        userStockData = getUserDataBySymbolGlobal(stockData.symbol);

        setChartData();
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.redrawByNewData = function(){
        redrawByNewData();
    };

    this.hideLinePath = function () {
        lineChart.hideLinePath();
    };

    this.restoreLinePath = function () {
        lineChart.restoreLinePath();
    };

    this.updatePersonalData = function () {
        currentDataSection.updatePersonalData();
    };

    this.resetChartTypeAndRedraw = function(isCandleInput){
        lineChart.resetChartTypeAndRedraw(isCandleInput);
    };

    this.redrawChartByVolumeVisibility = function(){
        lineChart.redrawChartByVolumeVisibility();
    };

    /*Structure component*/
    function drawComponent() {
        performConstruct();
    }

    function performConstruct() {
        var externalDivDOM = externalDiv.node();
        clearSlate(externalDiv);

        parentDivHeight = externalDivDOM.clientHeight;
        parentDivWidth = externalDivDOM.clientWidth;

        isWide = (cardData.width >= 2);
        hasChart = isWide || parentDivHeight >= MIN_HEIGHT_FOR_CHART;
        isCurrentDataVerticalAlign = !isWide || (cardData.width >= 2 && cardData.height == 1);

        if (isCurrentDataVerticalAlign) {
            currentDataDivWidth = DEFAULT_SECTION_WIDTH;
            currentDataDivHeight = SECTION_HEIGHT * 2;
        } else {
            currentDataDivWidth = parentDivWidth;
            currentDataDivHeight = SECTION_HEIGHT;
        }

        createCurrentDataSection();

        //Chart
        if (hasChart) {
            createChartArea();
        }
    }

    function redrawByNewData(){
        currentDataSection.setData(cardData);
        currentDataSection.drawComponent();

        if (hasChart && getShouldRedrawChart()){
            setChartData();
            drawChart();
        }
    }

    function createCurrentDataSection() {
        currentDataDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: 0,
                right: 0,
                height: currentDataDivHeight + "px"
            });
        currentDataSection.setData(cardData);
        currentDataSection.setExternalDiv(currentDataDiv, currentDataDivWidth, currentDataDivHeight, isCurrentDataVerticalAlign);
        currentDataSection.drawComponent();
    }

    function createChartArea() {
        var chartSectionTop = currentDataDivHeight;
        var chartSectionLeft = 0;

        if (isCurrentDataVerticalAlign && isWide) {
            chartSectionTop = 0;
            chartSectionLeft = currentDataDivWidth + 15;
        }

        chartSectionDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: chartSectionLeft + "px",
                right: 0 + "px",
                top: chartSectionTop + "px",
                bottom: 0 + "px"
            });

        lineChart.setExternalDiv(chartSectionDiv.node());

        drawChart();
    }

    function drawChart(){
        lineChart.drawComponent();
    }

    /**Data Processing***/
    function getShouldRedrawChart(){
        var isLastCall = stockData.getIsDoneAllCallsForToday();
        var timeToRefresh = (cardData.drawCount % CHART_REFRESH_RATE == 0);
        var isStateChanged = (cardData.userData.timeRange !=  lineChart.getRange() || cardData.indexToCompare != lineChart.getIndexToCompare());

        var shouldIt = (isLastCall || timeToRefresh || isStateChanged);

        return shouldIt;
    }

    function setChartData(){
        var isItHovered = getIsHoveredOn();

        var range = cardData.userData.timeRange;
        var isStateChanged = (range != lineChart.getRange() || cardData.indexToCompare != lineChart.getIndexToCompare());
        if (isStateChanged){
            lineChart.clearState();
        }

        lineChart.setData(stockData, range, isItHovered);
        lineChart.setCardData(cardData);

        if (cardData.indexToCompare && cardData.comparedIndexStockData) {
            lineChart.setDataSecondary(cardData.comparedIndexStockData);
        }
    }

    /***State**/
    function getIsHoveredOn(){
        return (cardData == GridCard.hoverdCardData);
    }

    /**Event Listener**/
}
