/**
 * Created by avitzur on 4/21/2016.
 */
function AggrChangeSection() {
    var me = this;
    /***CONSTANTS***/
    var FULL_ROW_WIDTH = 190;

    /***Externally Set****/
    //Structure
    var externalDiv;
    //Layout
    var isSingleRow;
    //Data
    var totalGain;
    var totalChange;
    //Util
    var papaComponent;

    /***Internally Set****/
    //Structure
    var firstRowDiv;
    var secondRowDiv;
    var todayChangeP;
    var totalGainP;

    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.setLayout = function(isSingleRowI){
        isSingleRow = isSingleRowI;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.redraw = function () {

    };

    this.setPapaComponent = function (papaComponentI) {
        papaComponent = papaComponentI;
    };

    /**Construction*****/
    function drawComponent() {
        construct();
    }

    function construct() {
        createPortfolioSection();
    }


    function createPortfolioSection() {
        externalDiv.style({
            color: "#333333"
        });

        firstRowDiv = externalDiv.append("div");

        var totalChangeTitle = firstRowDiv.append("p")
            .style({
                margin: 0,
                "font-size": 14 + "px"
            })
            .text("Total Gain");

        totalGainP = firstRowDiv.append("p")
            .style({
                margin: 0,
                "font-size": 14 + "px",
                "margin-top": 2 + "px",
                "margin-bottom": 5 + "px",
                "font-weight": "bold"
            });

        secondRowDiv = externalDiv.append("div");

        var todayChangeTitle = secondRowDiv.append("p")
            .style({
                margin: 0,
                "font-size": 14 + "px"
            })
            .text("Today Change");

        todayChangeP = secondRowDiv.append("p")
            .style({
                margin: 0,
                "font-size": 14 + "px",
                "margin-top": 2 + "px",
                "margin-bottom": 5 + "px",
                "font-weight": "bold"
            });

        if (isSingleRow){
            firstRowDiv.style({
                display: "inline-block",
                "margin-right": 15 + "px"
            });

            secondRowDiv.style({
                display: "inline-block"
            })
        }

        updatePortfolioText();
    }

    /***Update UI***/
    function updatePortfolioText() {
        var userSummary = UserDBData.summary;
        var totalChangeText = concatChangeAndPercentage(userSummary.totalGain, userSummary.totalGainPercentage);
        var todayChangeText = concatChangeAndPercentage(userSummary.todayChange, userSummary.todayChangePercentage);

        todayChangeP.text(todayChangeText);
        totalGainP.text(totalChangeText);

        var todayColor = getValueTextColor(userSummary.todayChangePercentage, 0);
        var totalColor = getValueTextColor(userSummary.totalGainPercentage, 0);

        todayChangeP.style("color", todayColor);
        totalGainP.style("color", totalColor);
    }
}