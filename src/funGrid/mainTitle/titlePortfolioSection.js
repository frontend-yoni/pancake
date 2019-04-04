/**
 * Created by yoni_ on 12/8/2015.
 */
function TitlePortfolioSection() {
    var me = this;

    /**Constants**/
    var ROW_HEIGHT = 18;
    var TRIANGLE_UP_COLOR = "green";
    var TRIANGLE_DOWN_COLOR = "red";

    /**Externally set***/
    var externalDiv;

    /**Internally set***/
    //Structure
    var valueP;
    var changeP;
    var shapeUtil = ShapesUtil.getInstance();

    //TextValues
    var valueStr;
    var changeStr;
    var changePercentageStr;

    /**Public functions***/
    this.setExternalDiv = function (externalDivInput) {
        externalDiv = externalDivInput;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.update = function(){
        aggregatePortfolioData();
    };

    /**Inner functions***/
    function drawComponent() {
        var titleP = externalDiv.append("p")
            .style({
                display: "table",
                "font-size": 13 + "px",
                "text-decoration": "underline",
                "padding-top": 2 + "px",
                "padding-bottom": 3 + "px",
                margin: "auto"
            })
            .text("Total Value");

        valueP = externalDiv.append("p")
            .style({
                display: "table",
                "font-weight": "bold",
                "font-size": 13 + "px",
                "padding-bottom": 2 + "px",
                margin: "auto"
            });

        changeP = externalDiv.append("p")
            .style({
                display: "table",
                "font-weight": "bold",
                "font-size": 13 + "px",
                margin: "auto"
            });
    }


    function getChange(change) {
        var formattedChange = formatNiceNumber(change);
        if (change > 0) {
            formattedChange = "+" + formattedChange;
        }
        return formattedChange + "%";
    }

    function createTriangle(change, triangleDiv) {
        var direction;
        var color;
        if (change > 0) {
            direction = shapeUtil.DIRECTION.TOP;
            color = TRIANGLE_UP_COLOR;
            changeP.style("color", GOOD_COLOR);
        }
        else {
            direction = shapeUtil.DIRECTION.BOTTOM;
            color = TRIANGLE_DOWN_COLOR;
            changeP.style("color", BAD_COLOR);
        }
        clearSlate(triangleDiv);
        shapeUtil.createTriangle(triangleDiv, 8, 8, direction, color);
    }

    /**Data processing***/
    function aggregatePortfolioData() {
       /* var value = 0;
        var gain = 0;
        var originalValue = 0;
        var stockData;
        var symbol;
        for (var i = 0; i < userSymbolsList.length; i++) {
            symbol = userSymbolsList[i];
            stockData = (SymbolToData[symbol]);
            value += stockData.getTotalValue();
            gain += stockData.getTotalGain();
            originalValue += stockData.getOriginalTotalValue();
        }
        valueStr = formatNiceNumber(value);
        changeStr = getChange(gain * 100 / originalValue);

        valueP.text(valueStr);
        changeP.text(changeStr);

        if (gain > 0) {
            changeP.style("color", "Green");
        }
        else {
            changeP.style("color", "Red");
        }*/
    }
}


TitlePortfolioSection.getInstance = function () {
    if (!TitlePortfolioSection.instance) {
        TitlePortfolioSection.instance = new TitlePortfolioSection();
    }
    return TitlePortfolioSection.instance;
};