/**
 * Created by avitzur on 4/24/2016.
 */
function AggrHistoryView() {
    var me = this;
    /***CONSTANTS***/

    /***Externally Set****/
    //Structure
    var externalDiv;
    //Util
    var papaComponent;
    //Data
    var cardData;

    /***Internally Set****/
    //Structure
    var noDataDiv;
    var chartDiv;
    //Components
    var chart = new AggrHistoryChart();
    //Util
    var dataManager = AggrDataManager.getInstance();

    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.setData = function (cardDataInput) {
        cardData = cardDataInput;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.redraw = function () {
        redraw();
    };

    this.setPapaComponent = function (papaComponentI) {
        papaComponent = papaComponentI;
    };

    this.cancelZoom = function () {
        chart.cancelZoom();
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        chartDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            });

        chart.setExternalDiv(chartDiv);
       
        noDataDiv = externalDiv.append("div");
       
       
        fillNoDataMessage();
        determineState();
    }

    function fillNoDataMessage() {
        var line1 = noDataDiv.append("p")
            .style({
                "margin-bottom": 10 + "px"
            })
            .text("No holdings yet.");

        var line2 = noDataDiv.append("p")
            .style({
                margin: 0
            })
            .text("Please fill in portfolio info by clicking the pencil icon.");
    }

    /***UI State Change***/
    function determineState(){
        if (UserDBData.summary.totalValue > 0){
            chartDiv.style("display", "");
            noDataDiv.style("display", "none");
            chart.drawComponent();
        }else{
            chartDiv.style("display", "none");
            noDataDiv.style("display", ""); 
        }
    }

    /**Draw*****/
    function redraw() {

    }
}