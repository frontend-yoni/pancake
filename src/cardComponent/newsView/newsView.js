/**
 * Created by avitzur on 12/27/2015.
 */
/**
 * Created by yoni_ on 12/26/2015.
 */
function NewsView() {
    /**CONSTANTS***/
    var SCROLL_SPACE_WIDTH = 30;
    var NEWS_PAPA_CLASS = "newsPapaClass";
    /**Externally Set***/
    //Data
    var cardData;
    //Structure
    var externalDiv;

    /**Internally Set***/
    //Structure
    var parentDiv;
    var contentDiv;
    //Layout
    var parentDivHeight;
    var parentDivWidth;
    //Data
    var newsDataList;
    //State

    /**Public Function**/
    this.setExternalDiv = function (divInputD3) {
        externalDiv = divInputD3;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.setCardData = function (cardDataInput) {
        cardData = cardDataInput;
        newsDataList = cardData.news;
    };

    /**Construction**/
    function drawComponent() {
        performConstruct();
    }

    function performConstruct() {
        var externalDivDOM = externalDiv.node();
        clearSlate(externalDiv);

        parentDivHeight = externalDivDOM.clientHeight;
        parentDivWidth = externalDivDOM.clientWidth;


        parentDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            }).classed(NEWS_PAPA_CLASS, true)
            .on("mousewheel", onMouseWheel);

        contentDiv = parentDiv.append("div")
            .style({
                width: parentDivWidth - SCROLL_SPACE_WIDTH + "px"
            });

        createAllNewsEntries();
    }


    /**Fill With Data***/
    function createAllNewsEntries() {
        for (var i = 0; i < newsDataList.length; i++) {
            createNewsEntry(newsDataList[i]);
        }
    }

    function createNewsEntry(newsData) {
        var date = new Date(newsData.publishedDate);
        var dateStr = d3NewsDateFormat(date);
        var linkURL = newsData.link;
        var titleText = newsData.title;

        var singleNewsDiv = contentDiv.append("div")
            .style({
                "position": "relative",
                "margin-bottom": 5 + "px"
            });

        var tileElement = singleNewsDiv.append("a")
            .attr({
                "href": linkURL,
                "target": "aaa" + getUniqueIDGlobal()
            })
            .style({
                "font-size": 15 + "px",
                "font-family": "Arial",
                "text-decoration": "none"
            })
            .text(titleText);

        var dateElement = singleNewsDiv.append("p")
            .style({
                "font-size": 12 + "px",
                "color": "gray",
                "padding": 0,
                "margin": 0,
                "margin-top": 2 + "px"
            })
            .text(dateStr);

        var separator = singleNewsDiv.append("div")
            .style({
                width: "100%",
                height: 1 + "px",
                background: "#cccccc",
                "margin-top": 5+ "px",
                "margin-bottom": 5 + "px"
            })
    }

    /**Event Listener**/
    function onMouseWheel() {
        var parentDivDOM = parentDiv.node();
        var directionIsForward = (d3.event.deltaY > 0);
        var currentScrollTop = parentDivDOM.scrollTop;
        if (directionIsForward && currentScrollTop + parentDivDOM.clientHeight >= parentDivDOM.scrollHeight) {
            d3.event.preventDefault();
        }
        if (!directionIsForward && currentScrollTop == 0) {
            d3.event.preventDefault();
        }
    }
}