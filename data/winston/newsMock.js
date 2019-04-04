/**
 * Created by yavitzur on 19/06/2017.
 */

var DAY_IN_MILLIS = 1000 * 60 * 60 * 24;
var HALF_DAY_IN_MILLIS = DAY_IN_MILLIS / 2;


var symbolToMockNews = {};

function generateMockNews(symbol) {
    var titleIndexes = initArray();

    if (!symbolToMockNews[symbol]) {
        var newsList = [];
        for (var i = 0; i < 12; i++) {
            newsList.push(generateNewsItem(symbol, i, popAnIndex()));
        }
        symbolToMockNews[symbol] = newsList;
    }

    return symbolToMockNews[symbol];

    /* Inner Functions */
    function initArray() {
        var arr = [];
        for (var i = 0; i < 12; i++) {
            arr.push(i);
        }
        return arr;
    }

    function popAnIndex(){
        var arrayPosition = Math.floor(Math.random() * titleIndexes.length);
        var retIndex = titleIndexes[arrayPosition];
        titleIndexes.splice(arrayPosition, 1);

        return retIndex;

    }
}

function generateNewsItem(symbol, index, titleIndex) {
    var date = generateDateByIndex(index);
    var newsData = {};
    newsData.publishedDate = date;
    newsData.title = generateTitle(symbol, titleIndex);
    newsData.link = getLinkBySymbol(symbol);

    return newsData;
}


function generateTitle(symbol, index) {
    var companyName = getNameFromSymbol(symbol);

    var options = [
        "Market Turns Upside-Down as Go-Go Tech Stocks Join Slow-Mo Funds",
        "This is how " + companyName + " CEO stays productive",
        companyName + " Joins 5 Other Mega Brands In Ditching the Olympics",
        "Walgreens, " + companyName + " Deel Saga Is Headed Into Its Final Hours",
        "Dow hits record high as tech stocks rebound",
        "Could " + companyName + "\'" + "s Client Devices Business Revenues Rise in Fiscal 2018?",
        companyName + ", Wal-Mart endure the aftermath of Amazon's Whole Foods buy; stocks still falling",
        companyName + " to ride artificial intelligence, cloud computing to higher share price: Morgan Stanley",
        companyName + ", HPE Partnership to Boost InfiniBand Adoption",
        "Buy " + companyName + " (" + symbol + ") Stock for a Nearly 20% Discount",
        companyName + " Stock Falls Following Deutsche Downgrade Due to 'Game Changing' Amazon, Whole Foods Deal",
        "This Is How " + companyName + " Will Feel Pain From Its Big Deal for Whole Foods: Market Recon"
    ];

    return options[index];
}

function generateDateByIndex(index) {
    var currentTime = new Date().getTime();
    var endTime = currentTime - index * (HALF_DAY_IN_MILLIS);
    var startTime = currentTime - (index + 1) * (HALF_DAY_IN_MILLIS);

    var time = winstonRandom(startTime, endTime);

    return new Date(time);
}

function getLinkBySymbol(symbol) {
    return "https://finance.yahoo.com/quote/" +
        symbol +
        "/news?p=" +
        symbol;
}

