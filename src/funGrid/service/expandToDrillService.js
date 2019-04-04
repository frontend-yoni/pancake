/**
 * Created by avitzur on 12/30/2015.
 */
/**
 * Created by avitzur on 12/6/2015.
 */
function ExpandToDrillService() {
    var me = this;
    //Constants

    //Layout
    var ICON_AREA_WIDTH = 20;
    var ICON_AREA_HEIGHT = 14;

    //Structure elements
    var body = d3.select("body");
    var expandAreaDiv;
    var iconDiv;
    //Structure elements (externally set)
    var canvasDiv;

    //State
    var hoveredCardData;

    //utils
    var dragUtil = DragAndDropUtil.getInstance();
    var resizeUtil = ResizeUtil.getInstance();
    var shapeUtil = ShapesUtil.getInstance();
    var drillDownWindow = DrillWindow.getInstance();

    //(Externally set)
    var onRemoveFunction;
    var onRevertFunction;

    //public properties

    //End.

    /*Public functions*/
    this.createElements = function () {
        createElements();
    };

    this.attachToCard = function (cardDataObject) {
        if (!cardDataObject.getIsSummary()){
            attachToCard(cardDataObject);
        }
    };

    this.hide = function () {
        hide();
    };

    this.setCanvasDiv = function (divHTML) {
        canvasDiv = d3.select(divHTML);
    };

    this.setOnRemoveFunction = function (foofoo) {
        onRemoveFunction = foofoo;
    };

    this.setOnRevertFunction = function (foofoo) {
        onRevertFunction = foofoo;
    };

    /*End.*/

    /*UI Visualizations */
    function attachToCard(cardObject) {
        hoveredCardData = cardObject;
        var innerDivHTML = cardObject.innerDiv.node();
        innerDivHTML.appendChild(expandAreaDiv.node());

        expandAreaDiv.style({
            display: ""
        });
    }

    function hide() {
        expandAreaDiv.style({
            display: "none"
        });
    }

    function createElements() {
        var expandAreaDivHTML = document.createElement("div");  //This one will be detached and reattached to the focused div
        expandAreaDiv = d3.select(expandAreaDivHTML);

        expandAreaDiv.style({
            position: "absolute",
            display: "none",
            height: ICON_AREA_HEIGHT + "px",
            width: ICON_AREA_WIDTH + "px",
            top: 5 + "px",
            left: 5 + "px",
            //visibility: "hidden",
            cursor: "pointer"
        }).attr({
                title: "Go Full Screen"
            })
            .classed(resizeUtil.REMOVE_FROM_RESIZE_CLONE, true)
            .classed(dragUtil.ELEMENTS_TO_REMOVE_CLASS, true)
            .classed("iconButton", true)
            .on("click", onClick);

        iconDiv = expandAreaDiv.append("div")
            .style({
                position: "absolute",
                top: 0 + "px",
                right: 0 + "px",
                height: ICON_AREA_HEIGHT + "px",
                width: ICON_AREA_WIDTH + "px"
            });

        shapeUtil.createExpandIcon(iconDiv, ICON_AREA_WIDTH, ICON_AREA_HEIGHT, "#222222");
    }

    /*End.*/


    /**State**/
    function getIsReady(cardObject) {
        var symbol = cardObject.symbol;
        var isIt = SymbolToData[symbol] != undefined;
        return isIt;
    }

    /**Event Listeners***/
    function onClick() {
        drillDownWindow.introducePanel(hoveredCardData.data.symbol);
        shapeUtil.clearAllExpandIconsText();
    }
}

ExpandToDrillService.getInstance = function () {
    if (!ExpandToDrillService.instance) {
        ExpandToDrillService.instance = new ExpandToDrillService();
    }

    return ExpandToDrillService.instance;
};