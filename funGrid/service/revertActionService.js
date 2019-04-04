/**
 * Created by ReznikFamily on 15/12/2015.
 */
function RevertActionService() {
    var me = this;
    //Constants
    var UNDO_MESSAGE_DURATION = 6000;
    var MESSAGE_AREA_HEIGHT = 30;
    var UNDO_BUBBLE_WIDTH = 245;

    //Layout
    //Color
    var UNDO_MESSAGE_BG_COLOR = "rgba(242,144,24, 0.9)";
    var UNDO_MESSAGE_BG_COLOR_HOVER = "rgba(242,144,24, 1)";
    //Class
    var PAPA_DIV_CLASS = "RevertActionServicePapa";
    var UNDO_SECTION_AREA_CLASS = "undoActionAreaClass";


    /***Externally Set Set***/
    //Structure elements
    var body = d3.select("body");
    var fullFrameDiv;

    //Data
    var revertFunction;

    /***Internally Set***/
    //Structure elements
    var undoMessageArea;
    var undoBubbleDiv;
    var messageP;
    //utils
    var timer;
    var shapeUtil = ShapesUtil.getInstance();

    /*Public functions*/
    this.showMessage = function (messageText, callBackFunction, width) {
        revertFunction = callBackFunction;
        showMessage(messageText, width);
    };

    this.hide = function () {
        hide();
    };

    this.setFrameDiv = function (fullFrameDivHTML) {
        fullFrameDiv = d3.select(fullFrameDivHTML);
        createElements();
    };
    /*End.*/

    /*UI Visualizations */

    function hide() {
        undoMessageArea.style({
            top: -40 + "px",
            visibility: "hidden"
        });
    }

    function createElements() {
        fullFrameDiv.select("." + PAPA_DIV_CLASS).remove();

        undoMessageArea = fullFrameDiv.append("div")
            .style({
                position: "absolute",
                transition: "top 0.4s, visibility 0.4s",
                top: -40 + "px",
                visibility: "hidden",
                left: 0,
                right: 0,
                height: 0,
                "z-index": GridCard.TOP_Z_INDEX + 10
            })
            .classed(PAPA_DIV_CLASS, true);

        undoBubbleDiv = undoMessageArea.append("div")
            .style({
                width: UNDO_BUBBLE_WIDTH + "px",
                height: MESSAGE_AREA_HEIGHT + "px",
                background: UNDO_MESSAGE_BG_COLOR,
                "font-size": 18 + "px",
                margin: "auto",
                border: "1px solid " + "#666666",
                "border-radius": 2 + "px",
                "box-shadow": "rgba(0, 0, 0, 0.1) 1px 1px 0px",
                color: "#ffffff",
                cursor: "default"
            })
            .on("mouseenter", onUndoMouseOver)
            .on("mouseleave", onUndoMouseOut);

        messageP = undoBubbleDiv.append("p")
            .style({
                color: "#ffffff",
                display: "inline-block",
                margin: "6px 11px 0px 20px"
            });

        var separatorLine = undoBubbleDiv.append("div")
            .style({
                position: "relative",
                "background-color": "#cccccc",
                width: 1 + "px",
                margin: 0,
                height: 16 + "px",
                display: "inline-block",
                "vertical-align": "middle",
                bottom: 1 + "px"
            });

        var actionSection = undoBubbleDiv.append("div")
            .style({
                "padding-left": 10 + "px",
                display: "inline-block",
                "cursor": "pointer"
            })
            .classed(UNDO_SECTION_AREA_CLASS, true)
            .on("click", onUndoClick);

        var UNDO_ICON_SIZE = 16;
        var undoIcon = actionSection.append("div")
            .style({
                position: "relative",
                top: 2 + "px",
                display: "inline-block",
                "margin-right": 8 + "px",
                width: UNDO_ICON_SIZE + "px",
                height: 16 + "px"
            });
        shapeUtil.createBackArrow(undoIcon, UNDO_ICON_SIZE + 2, UNDO_ICON_SIZE, "#FFFFFF");

        var undoTextP = actionSection.append("p")
            .style({
                color: "#ffffff",
                margin: 0,
                display: "inline-block"
            })
            .text("Undo");

    }

    /*End.*/


    /**State Change**/
    function activateTimer(durationMultiplier) {
        if (durationMultiplier == undefined) {
            durationMultiplier = 1;
        }
        var duration = UNDO_MESSAGE_DURATION * durationMultiplier;

        clearTimeout(timer);
        timer = setTimeout(hideMessage, duration);
    }

    function showMessage(messageStr, width) {
        undoMessageArea.style({
            top: 0,
            visibility: "visible"
        });
        messageP.text(messageStr);

        if (width) {
            undoBubbleDiv.style("width", width + "px");
        } else {
            undoBubbleDiv.style("width", UNDO_BUBBLE_WIDTH + "px");
        }

        activateTimer();
        informActionToSave();
    }

    function hideMessage() {
        clearTimeout(timer);
        hide();
    }

    /**Event Listeners***/
    function onUndoClick() {
        hideMessage();
        revertFunction();
        informActionToSave();
    }

    function onUndoMouseOver() {
        clearTimeout(timer);
        undoBubbleDiv.style("background", UNDO_MESSAGE_BG_COLOR_HOVER);
    }

    function onUndoMouseOut() {
        activateTimer(0.5);
        undoBubbleDiv.style("background", UNDO_MESSAGE_BG_COLOR);
    }
}

RevertActionService.getInstance = function () {
    if (!RevertActionService.instance) {
        RevertActionService.instance = new RevertActionService();
    }

    return RevertActionService.instance;
};