/**
 * Created by yoni_ on 3/18/2016.
 */
function UniversalSortSection() {
    /***CONSTANTS***/
    var TITLE_TEXT_WIDTH = 100;
    var BUTTON_WIDTH = 62;
    var BUTTON_HEIGHT = 24;
    var PAD_BETWEEN_BUTTONS = 10;
    /***Externally Set****/
    //Structure
    var externalDiv;
    //Util
    var papaComponent;

    /***Internally Set****/
    var todaySection;
    var totalSection;
    //Data
    var sortTypeSelected;
    var sortOrderSelected;

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
        todaySection = externalDiv.append("div");
        totalSection = externalDiv.append("div");

        prepSection(todaySection, "Today Change", SORT_BY_OPTIONS.TODAY_CHANGE);

        prepSection(totalSection, "Total Gain", SORT_BY_OPTIONS.TOTAL_GAIN);
    }

    function prepSection(sectionDiv, titleText, sortBy) {
        sectionDiv.style({
            position: "relative",
            height: BUTTON_HEIGHT + 10 + "px"
        });

        var titleP = sectionDiv.append("p")
            .style({
                position: "absolute",
                margin: 0,
                top : 4 + "px",
                "font-size": 14 + "px",
                left: 0
            })
            .text(titleText + ":");

        createButton(sectionDiv, TITLE_TEXT_WIDTH,
            "ASC", SORT_BY_DIRECTION.ASCENDING, sortBy);

        createButton(sectionDiv, TITLE_TEXT_WIDTH + BUTTON_WIDTH + PAD_BETWEEN_BUTTONS,
            "DESC", SORT_BY_DIRECTION.DESCENDING, sortBy);
    }

    function createButton(sectionDiv, left, text, sortDirection, sortBy) {
        var button = sectionDiv.append("div")
            .style({
                position: "absolute",
                width: BUTTON_WIDTH + "px",
                height: BUTTON_HEIGHT + "px",
                "border-radius": 5 + "px",
                left: left + "px"
            })
            .attr({
                "sortBy": sortBy,
                "sortDirection": sortDirection
            })
            .on("click", onSortClick)
            .classed("pancakeButton", true);

        var buttonP = button.append("p")
            .style({
                position: "absolute",
                margin: 0,
                top: 4 + "px",
                "font-size": 12 + "px",
                left: 22 + "px"
            })
            .text(text);

        var tipBorderWidth = 6;
        var tipColor = "#666666";
        var tip = button.append("div")
            .style({
                position: "absolute",
                background: "none",
                left: 5 + "px",
                top: 8 + "px",
                "border-left": tipBorderWidth + "px solid transparent",
                "border-right": tipBorderWidth + "px solid transparent"
            });


        if (sortDirection == SORT_BY_DIRECTION.ASCENDING) {
            tip.style({
                "border-bottom": tipBorderWidth + "px solid " + tipColor
            });
            button.attr("title", "Ascending");
        } else {
            tip.style({
                "border-top": tipBorderWidth + "px solid "  + tipColor
            });
            button.attr("title", "Descending");
        }
    }

    /**Draw*****/
    function redraw() {

    }

    /**Action***/
    function performAction(){
        sortFromTitle(sortTypeSelected, sortOrderSelected)
    }

    /**Event Listener***/
    function onSortClick(){
        var target = d3.event.currentTarget;
        sortTypeSelected = +target.getAttribute("sortBy");
        sortOrderSelected = +target.getAttribute("sortDirection");

        papaComponent.hideCardActionPopup();
        requestAnimationFrame(performAction);

    }
}