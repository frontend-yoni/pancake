/**
 * Created by yoni_ on 3/18/2016.
 */
function UniversalCardsActionWindow() {
    var me = this;
    /***CONSTANTS***/
    var WINDOW_WIDTH = 310;
    var PAD_FROM_EDGES = 10;
    /***Externally Set****/
    //Structure
    var externalDiv;
    //Util
    var papaTitleComponent;

    /***Internally Set****/
    //Structure
    var papaDiv;
    var sortSection;
    var unifySizeSection;
    var unifyRangeSectionDiv;
    var unifyChartTypeSectionDiv;
    //Util
    var sortComponent = new UniversalSortSection();
    var cardSizeComponent = new UniversalCardSizeSection();
    var rangeComponent = new UniversalRangeSection();
    var chartTypeComponent = new UniversalChartTypeSection();

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

    this.setPapaComponent = function (papaComponent) {
        papaTitleComponent = papaComponent;
    };

    /***Inner public function***/
    this.hideCardActionPopup = function () {
        papaTitleComponent.hideCardActionPopup();
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        papaDiv = externalDiv.append("div");
        sortSection = papaDiv.append("div");
        unifySizeSection = papaDiv.append("div");
        unifyRangeSectionDiv = papaDiv.append("div");
        unifyChartTypeSectionDiv = papaDiv.append("div");

        applyPapaStyle();
        prepSection(sortSection, "Sort by");
        prepSection(unifySizeSection, "Set common card size");
        prepSection(unifyRangeSectionDiv, "Set common range");
        prepSection(unifyChartTypeSectionDiv, "Set common chart type");

        sortComponent.setExternalDiv(sortSection);
        sortComponent.setPapaComponent(me);
        sortComponent.drawComponent();

        cardSizeComponent.setExternalDiv(unifySizeSection);
        cardSizeComponent.setPapaComponent(me);
        cardSizeComponent.drawComponent();

        rangeComponent.setExternalDiv(unifyRangeSectionDiv);
        rangeComponent.setPapaComponent(me);
        rangeComponent.drawComponent();

        chartTypeComponent.setExternalDiv(unifyChartTypeSectionDiv);
        chartTypeComponent.setPapaComponent(me);
        chartTypeComponent.drawComponent();
    }

    function applyPapaStyle() {
        papaDiv.style({
            position: "absolute",
            right: 0,
            width: WINDOW_WIDTH + "px",
            padding: PAD_FROM_EDGES + "px",
            border: "1px solid rgb(153, 153, 153)",
            "box-shadow": "rgba(0, 0, 0, 0.298039) 1px 1px 1px 1px",
            background: "white"
        })
    }

    function prepSection(sectionDiv, titleText) {
        sectionDiv.style({
            position: "relative",
            "margin-top": 10 + "px",
            "padding-top": 10 + "px",
            "padding-bottom": 10 + "px",
            "border-top": "1px solid #cccccc"
        });

        var titleP = sectionDiv.append("p")
            .style({
                position: "absolute",
                margin: 0,
                "font-size": 12 + "px",
                "padding-left": 2 + "px",
                "padding-right": 2 + "px",
                top: -8 + "px",
                background: "white",
                color: "#666666",
                left: 10 + "px"
            })
            .text(titleText);
    }

    /**Draw*****/
    function redraw() {

    }
}