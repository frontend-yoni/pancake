/**
 * Created by avitzur on 12/6/2015.
 */
function RemoveCardService() {
    var me = this;
    //Constants
    var REMOVE_BUTTON_CLICKED = "cardRemoveButtonClicked";
    var REVIVE_BUTTON_CLICKED = "cardReviveButtonClicked";

    //Layout
    var REMOVE_AREA_HEIGHT = 16;
    var REMOVE_ICON_SIZE = 14;

    //Structure elements
    var body = d3.select("body");
    var removeAreaDiv;
    var iconDiv;
    var undoMessageArea;
    //Structure elements (externally set)
    var canvasDiv;

    //State
    var hoveredCardData;

    //utils
    var dragUtil = DragAndDropUtil.getInstance();
    var resizeUtil = ResizeUtil.getInstance();
    var shapeUtil = ShapesUtil.getInstance();
    var revertActionService = RevertActionService.getInstance();

    //(Externally set)
    var onRemoveFunction;
    var onRevertFunction;

    //public properties
    this.REMOVE_BUTTON_CLICKED = REMOVE_BUTTON_CLICKED;
    this.REVIVE_BUTTON_CLICKED = REVIVE_BUTTON_CLICKED;
    //End.

    /*Public functions*/
    this.createElements = function () {
        createElements();
    };

    this.attachToCard = function (cardObject) {
        attachToCard(cardObject);
    };

    this.hide = function () {
        hide();
    };

    this.setCanvasDiv = function (divHTML) {
        canvasDiv = d3.select(divHTML);
    };

    this.setOnRemoveFunction  = function(foofoo){
        onRemoveFunction = foofoo;
    };

    this.setOnRevertFunction  = function(foofoo){
        onRevertFunction = foofoo;
    };

    /*End.*/

    /*UI Visualizations */
    function attachToCard(cardObject) {
        hoveredCardData = cardObject;
        var innerDivHTML = cardObject.innerDiv.node();
        innerDivHTML.appendChild(removeAreaDiv.node());

        removeAreaDiv.style({
            display: ""
        })
    }

    function hide() {
        removeAreaDiv.style({
            display: "none"
        });
    }

    function createElements() {
        var removeSectionDivHTML = document.createElement("div");  //This one will be detached and reattached to the focused div
        removeAreaDiv = d3.select(removeSectionDivHTML);

        removeAreaDiv.style({
            position: "absolute",
            display: "none",
            height: REMOVE_AREA_HEIGHT + "px",
            width: REMOVE_AREA_HEIGHT + "px",
            top: 3 + "px",
            right: 5 + "px",
            cursor: "pointer"
        }).attr({
            title: "Remove"
        })
            .classed(resizeUtil.REMOVE_FROM_RESIZE_CLONE, true)
            .classed(dragUtil.ELEMENTS_TO_REMOVE_CLASS, true)
            .classed("iconButton", true)
            .on("click", onClick);

        var iconPad = (REMOVE_AREA_HEIGHT - REMOVE_ICON_SIZE) / 2;
        iconDiv = removeAreaDiv.append("div")
            .style({
                position: "absolute",
                top: iconPad + "px",
                right: iconPad + "px",
                height: REMOVE_ICON_SIZE + "px",
                width: REMOVE_ICON_SIZE + "px"
            });

        shapeUtil.createGarbageCan(iconDiv, REMOVE_ICON_SIZE, REMOVE_ICON_SIZE + 2, "#222222");
    }

    /*End.*/


    /**State Change**/
    function showMessage(){
        revertActionService.showMessage("Removed Card", onUndoClick);
    }

    /**Event Listeners***/
    function onClick() {
        onRemoveFunction(hoveredCardData);
        showMessage();
    }

    function onUndoClick(){
        onRevertFunction();
    }
}

RemoveCardService.getInstance = function () {
    if (!RemoveCardService.instance) {
        RemoveCardService.instance = new RemoveCardService();
    }

    return RemoveCardService.instance;
};