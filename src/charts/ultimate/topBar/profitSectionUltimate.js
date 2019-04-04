/**
 * Created by yoni_ on 3/25/2016.
 */
/**
 * Created by avitzur on 2/21/2016.
 */
function ProfitSectionUltimate() {
    var me = this;
    /***CONSTANTS***/
    //Layout
    var HEIGHT = 20;
    var WIDTH_FOR_SHORT_CARD = 145;
    var REGULAR_WIDTH = 190;

    /***Externally Set****/
    //Structure
    var externalDiv;
    //Data
    var cardData;
    //Util
    var papaToolbar;

    /***Internally Set****/
    //Layout
    var contentAreaWidth;
    //Util
    var costQtyComponent = new CostQtyComponent();

    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.setCardData = function (cardDataInput) {
        cardData = cardDataInput;

        contentAreaWidth = REGULAR_WIDTH;
        if (cardData.width == 1) {
            contentAreaWidth = WIDTH_FOR_SHORT_CARD;
        }
    };

    this.setDropdownCount = function (count) {

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

    /***Inner public functions***/


    /**Construction**/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        createCostQtyArea();
    }


    /**Draw*****/
    function redraw() {

    }

    function createCostQtyArea() {
        var costQtyArea = externalDiv.append("div")
            .style({
                position: "relative",
                height: HEIGHT + "px",
                width: contentAreaWidth + "px",
                "font-size": 12 + "px",
                bottom: 2 + "px",
                margin: 0,
                left: 0
            });

        if (cardData.width == 1) {
            costQtyArea.style("left", -7 + "px");
        }

        var symbol = cardData.symbol;
        var userStockData = SymbolToUserData[symbol];
        costQtyComponent.setData(userStockData);
        costQtyComponent.setCardData(cardData);
        costQtyComponent.setExternalDiv(costQtyArea.node(), contentAreaWidth, HEIGHT);
        costQtyComponent.drawComponent();
    }
}