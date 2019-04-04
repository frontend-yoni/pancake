/**
 * Created by yoni_ on 4/29/2016.
 */
/**
 * Created by yoni_ on 3/18/2016.
 */
function UniversalRangeSection() {
    var timeRange = RestAPIs.TIME_RANGE;
    /***CONSTANTS***/
    var BUTTON_WIDTH = (310 - 30) / 7;
    var BUTTON_HEIGHT = 24;
    /***Externally Set****/
    //Structure
    var externalDiv;
    //Util
    var papaComponent;

    /***Internally Set****/
    //Structure
    var papaDiv;
    //State
    var selectedRange;

    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.redraw = function () {
        redraw();
    };

    this.setPapaComponent = function (papaComponentInput) {
        papaComponent = papaComponentInput;
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        papaDiv = externalDiv.append("div")
            .style({
                margin: "auto",
                "text-align": "center",
                "margin-top": 5 + "px"
            });
        constructButtos();
    }

    function constructButtos() {
        createButton("1D", timeRange.D1, "1 Day");
        createButton("5D", timeRange.D5, "5 Day");
        createButton("1M", timeRange.M1, "1 Month");
        createButton("3M", timeRange.M3, "3 Months");
        createButton("1Y", timeRange.Y1, "1 Year");
        createButton("5Y", timeRange.Y5, "5 Years");
        createButton("MAX", timeRange.MAX, "MAX");
    }

    function createButton(text, rangeData, title) {
        var button = papaDiv.append("div")
            .style({
                position: "relative",
                display: "inline-block",
                height: BUTTON_HEIGHT + "px",
                width: BUTTON_WIDTH + "px",
                "border-radius": 5 + "px",
                "margin-right": 5 + "px",
                "text-align": "center"
            })
            .attr("title", title)
            .datum(rangeData)
            .on("click", onClick)
            .classed("pancakeButton", true);

        if (rangeData == timeRange.MAX){
            button.style("margin-right", 0);
        }

        var buttonP = button.append("p")
            .style({
                margin: 0,
                position: "relative",
                bottom: 1 + "px",
                height: BUTTON_HEIGHT + "px",
                "line-height": BUTTON_HEIGHT + "px",
                "font-size": 12 + "px"
            })
            .text(text);
    }

    /**Draw*****/
    function redraw() {

    }

    /**Action***/
    function performAction() {
        var funGrid = FunGrid.getInstance();
        funGrid.applyUnifiedRange(selectedRange);
    }

    /**Event Listener***/
    function onClick() {
        var target = d3.event.currentTarget;
        selectedRange = d3.select(target).datum();

        papaComponent.hideCardActionPopup();
        requestAnimationFrame(performAction);

    }
}