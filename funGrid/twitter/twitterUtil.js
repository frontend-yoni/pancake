/**
 * Created by yoni_ on 4/27/2016.
 */
function TwitterUtil() {
    var me = this;
    /***CONSTANTS***/
    var CLICKED_INSIDE_TWITTER = "CLICKED_INSIDE_TWITTER";
    //Layout
    var BUTTON_SIZE = 32;
    var PAD_FROM_EDGES = 5;
    var WINDOW_TOP = 60;
    var WINDOW_WIDTH = 320;
    var WINDOW_CONTENT_PAD = 5;
    //Style
    var WINDOW_BG_GRADIENT = "linear-gradient(#000000, #333333)";

    /***Externally Set****/
    //Structure
    var parentDiv;
    //Util
    var papaComponent;

    /***Internally Set****/
    //Layout
    var buttonRight = PAD_FROM_EDGES;
    var windowBottom = PAD_FROM_EDGES + BUTTON_SIZE + PAD_FROM_EDGES;
    //Structure
    var buttonDiv;
    var windowDiv;
    var windowContentDiv;
    //State
    var isWindowOpen;
    //Util
    var embedHelper = new TwitterEmbedHelper();

    /***Public Functions****/
    this.setExternalDivs = function (parentDivI) {
        parentDiv = parentDivI;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.hideButton = function () {
        if (buttonDiv) {
            buttonDiv.style("display", "none");
        }
    };

    this.showButton = function () {
        if (buttonDiv) {
            buttonDiv.style("display", "");
        }
    };

    this.setPapaComponent = function (papaComponentI) {
        papaComponent = papaComponentI;
    };

    this.updatePosition = function (hasScroll) {
        updatePosition(hasScroll);
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        buttonDiv = parentDiv.append("div")
            .style({
                position: "absolute",
                bottom: PAD_FROM_EDGES + "px",
                right: buttonRight + "px",
                width: BUTTON_SIZE + "px",
                height: BUTTON_SIZE + "px",
                border: "1px solid #999999",
                "border-radius": "50%"
            })
            .on("click", onButtonClick)
            .classed("twitterButton", true)
            .on("mousedown", onInnerMouseDown);

        var iconDiv = buttonDiv.append("div")
            .style({
                position: "absolute",
                left: 4 + "px",
                top: 4 + "px"
            })
            .classed("twitterIcon", true);

        windowDiv = parentDiv.append("div");
        fillWindow();
    }

    function fillWindow() {
        windowDiv.style({
                position: "absolute",
                right: buttonRight + "px",
                top: WINDOW_TOP + "px",
                bottom: windowBottom + "px",
                width: WINDOW_WIDTH + "px",
                "box-shadow": "0 0 2px 2px rgba(0,0,0,0.5)",
                "z-index": UsefulUIUtil.blockingDivZIndex - 1,
                display: "none"
            })
            .attr("name", "twitterWindow")
            .on("mousedown", onInnerMouseDown);

        var windowBG = windowDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                bottom: 0 + "px",
                right: 0 + "px",
                top: 0 + "px",
                "background-image": WINDOW_BG_GRADIENT,
                opacity: 0.93
            });

        windowContentDiv = windowDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                bottom: WINDOW_CONTENT_PAD + "px",
                right: WINDOW_CONTENT_PAD + "px",
                top: WINDOW_CONTENT_PAD + "px"
            });

        embedHelper.setExternalDiv(windowContentDiv);
        embedHelper.drawComponent();
    }

    /**Draw*****/
    function redraw() {

    }

    /***Positions***/
    function updatePosition(hasScroll) {
        buttonRight = PAD_FROM_EDGES;
        if (hasScroll) {
            buttonRight = PAD_FROM_EDGES + SCROLL_BAR_WIDTH;
        }
        buttonDiv.style("right", buttonRight + "px");
        windowDiv.style("right", buttonRight + "px");
    }

    /***UI State Change***/
    function hideWindow() {
        windowDiv.style("display", "none");
    }

    /**Animation***/
    function animateWindowOpen() {
        windowDiv.style("display", "");
        var windowHeight = windowDiv.node().clientHeight;
        var startTop = WINDOW_TOP + windowHeight;

        embedHelper.setLayoutParams(WINDOW_WIDTH - WINDOW_CONTENT_PAD, windowHeight - WINDOW_CONTENT_PAD);
        embedHelper.activate();

        windowDiv.style({
            top: startTop + "px",
            right: buttonRight + "px",
            width: BUTTON_SIZE + "px"
        });


        windowDiv.transition()
            .duration(400)
            .ease("cubic-out")
            .tween("pook", function (d) {
                var topInterpolate = d3.interpolate(startTop, WINDOW_TOP);
                return function (t) {
                    var newTop = topInterpolate(t);
                    windowDiv.style("top", newTop + "px");
                }
            });

        windowContentDiv.transition()
            .delay(400)
            .duration(400)
            .ease("cubic-out")
            .tween("pook", function (d) {
                var widthInterpolate = d3.interpolate(BUTTON_SIZE, WINDOW_WIDTH);
                var rightInterpolate = d3.interpolate(buttonRight, buttonRight - SCROLL_BAR_WIDTH);
                return function (t) {
                    var newWidth = widthInterpolate(t);
                    var newRight = rightInterpolate(t);
                    windowDiv.style({
                        width: newWidth + "px",
                        right: newRight + "px"
                    });
                    if (t == 1) {
                        onWindowOpened();
                    }
                }
            });

        attachEventToBody();
        FunGrid.getInstance().pushOutScroll();
    }

    /**Event Management***/
    function attachEventToBody(){
        d3.select("body").on("mousedown.twitterArea", onBodyMouseDown)
    }

    function detachEventToBody(){
        d3.select("body").on("mousedown.twitterArea", null)
    }

    /***Event Listener***/
    function onButtonClick() {
        if (windowDiv.style("display") == "none") {
            animateWindowOpen();
        } else {
            hideWindow();
            detachEventToBody();
            FunGrid.getInstance().pullBackScroll();
        }
    }

    function onInnerMouseDown() {
        d3.event[CLICKED_INSIDE_TWITTER] = true;
    }

    function onBodyMouseDown() {
        if (!d3.event[CLICKED_INSIDE_TWITTER]) {
            hideWindow();
            detachEventToBody();
            FunGrid.getInstance().pullBackScroll();
        }
    }

    /**Animation Complete***/
    function onWindowOpened() {
        embedHelper.revealFeed();
    }
}

TwitterUtil.getInstance = function () {
    if (!TwitterUtil.instance) {
        TwitterUtil.instance = new TwitterUtil();
    }

    return TwitterUtil.instance;
};
