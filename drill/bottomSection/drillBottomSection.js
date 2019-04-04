/**
 * Created by yoni_ on 1/1/2016.
 */
function DrillBottomSection() {
    /**Constants**/
    var BOTTOM_SECTION_TITLE_HEIGHT = 40;
    var STATS_SECTION_HEIGHT = 200;
    var STATS_SECTION_WIDTH = 610;
    var PAD_BETWEEN_SECTIONS = 10;
    var BOTTOM_SECTION_HEIGHT = STATS_SECTION_HEIGHT + BOTTOM_SECTION_TITLE_HEIGHT;

    /**Externally Set***/
    //Structure
    var externalDiv;
    //Data
    var stockData;

    /**Internally Set***/
    //Structure
    var titlesDiv;
    var statsDiv;
    var newsDiv;
    //Layout
    var newsWidhth;
    //Utils
    var statsView = new StatsView();
    var newsView = new NewsView();

    /**Public Function**/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.setData = function (stockDataInput) {
        stockData = stockDataInput;
    };

    this.createFramework = function () {
        createFramework();
    };

    this.fillNewsArea = function (newsDataList) {
        fillNewsArea(newsDataList);
    };

    this.fillStatsArea = function (statsData) {
        fillStatsArea(statsData);
    };

    this.fillTitles = function () {
        fillTitles();
    };

    this.clearAll = function () {
        clearSlate(newsDiv);
        clearSlate(statsDiv);
        clearSlate(titlesDiv);
    };

    /***Construct***/
    function createFramework() {
        performConstruct();

    }

    function performConstruct() {
        clearSlate(externalDiv);

        titlesDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: BOTTOM_SECTION_TITLE_HEIGHT + "px"
            });

        statsDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                bottom: 0,
                left: 0,
                height: STATS_SECTION_HEIGHT + "px",
                width: STATS_SECTION_WIDTH + "px"
            });

        newsDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                bottom: 0,
                left: STATS_SECTION_WIDTH + PAD_BETWEEN_SECTIONS + "px",
                right: 0,
                height: STATS_SECTION_HEIGHT + "px"
            });
    }

    function fillTitles() {
        var titlePHeight = BOTTOM_SECTION_TITLE_HEIGHT - 10;

        var statsTitleP = titlesDiv.append("p")
            .style({
                position: "absolute",
                left: 0,
                width: STATS_SECTION_WIDTH + "px",
                margin: 0,
                height: titlePHeight + "px",
                "line-height": titlePHeight + "px",
                "border-bottom": "1px solid #cccccc"
            }).text("STATS");

        var newsTitleP = titlesDiv.append("p")
            .style({
                position: "absolute",
                right: 0,
                left: STATS_SECTION_WIDTH + PAD_BETWEEN_SECTIONS + "px",
                margin: 0,
                height: titlePHeight + "px",
                "line-height": titlePHeight + "px",
                "border-bottom": "1px solid #cccccc"
            }).text("NEWS");
    }


    /**Draw by data***/
    function fillNewsArea(newsDataList) {
        clearSlate(newsDiv);

        var userData = new UserCardDataObject(stockData.symbol, 3, 1);
        var cardData = new CardDataObject(userData, stockData);
        cardData.news = newsDataList;

        newsView.setExternalDiv(newsDiv);
        newsView.setCardData(cardData);
        newsView.drawComponent();
    }

    function fillStatsArea(statsData) {
        clearSlate(statsDiv);

        var userData = new UserCardDataObject(stockData.symbol, 3, 1);
        var cardData = new CardDataObject(userData, stockData);

        statsView.setExternalDiv(statsDiv, STATS_SECTION_WIDTH, STATS_SECTION_HEIGHT);
        statsView.setCardData(cardData);
        statsView.drawComponent();
    }
}