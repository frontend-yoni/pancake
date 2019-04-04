/**
 * Created by yoni_ on 2/20/2016.
 */
function StudyView() {
    /***Constants***/

    /***Externally Set***/
    //Data
    var cardData;
    //Structure Elements
    var externalDiv;

    /***Internally Set***/
    //Structure Elements
    var chartDiv;

    //Utils
    var chartObject = new UltimateMegaChart();

    /*Public functions*/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.setData = function (cardDataInput) {
        cardData = cardDataInput;

        setChartData();
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.redrawByNewData = function () {

    };

    this.hideLinePath = function () {
        chartObject.hideLinePath();
    };

    this.restoreLinePath = function () {
        chartObject.restoreLinePath();
    };

    this.hideLinePathForHeavyCharts = function () {
        chartObject.hideLinePathForHeavyCharts();
    };

    this.updatePersonalData = function () {
        chartObject.repsondToHoldingsUpdate();
    };

    this.resetChartTypeAndRedraw = function(isCandleInput){
        chartObject.resetChartTypeAndRedraw(isCandleInput);
    };

    this.redrawChartByVolumeVisibility = function(){
        chartObject.redrawChartByVolumeVisibility();
    };

    /*Structure component*/
    function drawComponent() {
        performConstruct();
        drawChart();
    }

    function performConstruct() {
        var externalDivDOM = externalDiv.node();
        clearSlate(externalDiv);

        chartDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            });

        chartObject.setExternalDiv(chartDiv.node());
    }

    function drawChart() {
        chartObject.drawComponent();
    }

    /**Data Processing***/
    function setChartData() {
        chartObject.setMainSymbol(cardData.symbol);
        chartObject.setCardData(cardData);
    }
}
