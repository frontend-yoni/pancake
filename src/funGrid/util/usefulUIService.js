/**
 * Created by mizrasha on 01/06/2015.
 */
function UsefulUIUtil() {
    var me = this;
    var isOldIE = (navigator.appName.indexOf("Internet Explorer") != -1); //old IEs don't support pointer-events

    var blockingDiv;
    var body;

    var isActive;
    var currentCursor;

    //Public functions
    this.enableBlockingDiv = function (cursorType) {
        enableBlockingDiv(cursorType);
    };

    this.disableBlockingDiv = function () {
        disableBlockingDiv();
    };

    this.drawComponent = function () {
        drawComponent();
    };

    //Main functions
    function drawComponent() {
        //Make sure there's only one instance of the blocking div
        if (!UsefulUIUtil.blockingDiv) {
            body = d3.select("body");
            blockingDiv = body.append("div")
                .style({
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    "z-index": UsefulUIUtil.blockingDivZIndex
                })
                .attr("name", "UsefulUIServiceBlockingDiv");

            disableBlockingDiv();
            UsefulUIUtil.blockingDiv = blockingDiv;
        }
    }

    function enableBlockingDiv(cursorType) {
        if (!isActive || cursorType != currentCursor){
            drawComponent();
            blockingDiv.style({
                "display": ""
            });
            body.style({
                "-moz-user-select": "none",
                "-webkit-user-select": "none",
                "-ms-user-select": "none"
            });

            if (cursorType) {
                body.style("cursor", cursorType);
                blockingDiv.style("cursor", cursorType);
            }

            isActive = true;
            currentCursor = cursorType;
        }

    }

    function disableBlockingDiv() {
        if (isActive){
            if (blockingDiv){
                blockingDiv.style("cursor", null);
                blockingDiv.style("display", "none");
            }

            if (body){
                body.style({
                    "cursor": null,
                    "-moz-user-select": null,
                    "-webkit-user-select": null,
                    "-ms-user-select": null
                });
            }

            isActive = false;
            currentCursor = null;
        }
    }
}

UsefulUIUtil.blockingDivZIndex = 100;

UsefulUIUtil.getInstance = function () {
    if (!UsefulUIUtil.instance) {
        UsefulUIUtil.instance = new UsefulUIUtil();
    }

    return UsefulUIUtil.instance;
};
