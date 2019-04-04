/**
 * Created by yoni_ on 4/27/2016.
 */
function TwitterEmbedHelper() {
    var me = this;
    /***CONSTANTS***/
    //Layout
    var FEED_HEADER_HEIGHT = 65;
    var TOP_PAD = 10;

    /***Externally Set****/
    //Structure
    var externalDiv;
    //Util
    var papaComponent;
    //Layout
    var feedHeight;
    var feedWidth;

    /***Internally Set****/
    //Structure
    var embedPapaDiv;
    var embedDisappearingA;
    //State
    var viewingSymbolList;

    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.setLayoutParams = function (feedWidthI, feedHeightI) {
        feedWidth = feedWidthI;
        feedHeight = feedHeightI;
    };

    this.redraw = function () {
        redraw();
    };

    this.setPapaComponent = function (papaComponentI) {
        papaComponent = papaComponentI;
    };

    this.activate = function () {
        activate();
    };

    this.revealFeed = function(){
        revealFeed();
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        embedPapaDiv = externalDiv.append("div")
            .style({
            position: "absolute",
            top: TOP_PAD + "px",
            left: 0 + "px",
            right: 0 + "px",
            bottom: 0 + "px",
            overflow: "hidden"
        })
            .classed("twitterEmbedPapaDiv", true);

        embedDisappearingA = embedPapaDiv.append("a")
            .attr({
                "data-chrome": "nofooter noborders transparent",
                "theme": "dark",
                "data-widget-id": "725345271912226816",
                "href": "https://twitter.com/search?q=%24NASDAQ%20OR%20%24MSFTOR%20%24GE"
            })
            .classed("twitter-timeline", true);

    }

    /**Draw*****/
    function redraw() {

    }

    function activate() {
        embedDisappearingA.attr({
            height: feedHeight + FEED_HEADER_HEIGHT - 2 * TOP_PAD,
            width: feedWidth
        });

        embedPapaDiv.style({
            display: "none"
        });

        loadTwitter();
    }

    function revealFeed(){
        embedPapaDiv.style("display", "")
    }

    /***Twitter***/
    function loadTwitter() {
        var d = document;
        var s = "script";
        var id = "twitter-wjs";

        var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
        if (!d.getElementById(id)) {
            js = d.createElement(s);
            js.id = id;
            js.src = p + "://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);
        }else{
            twttr.widgets.load();
        }
    }
}