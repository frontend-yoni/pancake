/**
 * Created by yavitzur on 19/06/2017.
 */
var symbolToStatsMcok = {};

function getStatsMock(symbol) {
    if (!symbolToStatsMcok[symbol]) {
        symbolToStatsMcok[symbol] = generateStatsMock(symbol);
    }

    return symbolToStatsMcok[symbol];
}

function generateStatsMock(symbol) {
    var currentValue = symbolToCurrentValue[symbol];
    var dayMin = winstonRandom(0.8, 1) * currentValue;
    var dayMax = winstonRandom(1, 1.3) * currentValue;
    dayMin = trimToTwoDecimalDigits(dayMin);
    dayMax = trimToTwoDecimalDigits(dayMax);

    var yearMin = winstonRandom(0.5, 1) * currentValue;
    var yearMax = winstonRandom(1, 3.4) * currentValue;
    yearMin = trimToTwoDecimalDigits(yearMin);
    yearMax = trimToTwoDecimalDigits(yearMax);

    var marketCap = winstonRandom(10, 900);
    marketCap = trimToTwoDecimalDigits(marketCap);

    var peRation = winstonRandom(3, 30);
    peRation = trimToTwoDecimalDigits(peRation);

    var psRation = winstonRandom(3, 30);
    psRation = trimToTwoDecimalDigits(psRation);

    var pbRation = winstonRandom(3, 30);
    pbRation = trimToTwoDecimalDigits(pbRation);

    var mock = {
        "Open": currentValue,
        "DaysRange": dayMin + " - " + dayMax,
        "YearRange": yearMin + " - " + yearMax,
        "MarketCapitalization": marketCap + "M",
        "PERatio": peRation,

        "PriceSales": psRation,
        "PriceBook": pbRation,
        "EarningsShare": trimAndRandom(1, 20),
        "Volume": trimAndRandom(MIN_VOLUME, MAX_VOLUME),
        "AverageDailyVolume": trimAndRandom(MIN_VOLUME, MAX_VOLUME),
        "AfterHoursChangeRealtime": trimAndRandom(-5, 5),
        "EBITDA": trimAndRandom(0, 35),
        "BookValue": trimAndRandom(0, 35),
        "DividendShare": trimAndRandom(0, 5) + "%",
        "DividendYield": trimAndRandom(0, 5) + "%",


        "PercentChangeFromYearLow": trimAndRandom(2, 180) + "%",
        "PercebtChangeFromYearHigh": trimAndRandom(-50, -2) + "%",
        "DividendPayDate": (new Date().getMonth() + 1) + "/"  + new Date().getDate() + "/" + new Date().getFullYear(),
        "PEGRatio": trimAndRandom(0, 35),
        "ShortRatio": trimAndRandom(0, 35),
        "Ask": trimToTwoDecimalDigits(trimAndRandom(1, 1.02) * currentValue),
        "Bid": trimToTwoDecimalDigits(trimAndRandom(0.98, 1) * currentValue),
        "PercentChangeFromTwoHundreddayMovingAverage": trimAndRandom(2, 50) + "%",
        "PercentChangeFromFiftydayMovingAverage": trimAndRandom(2, 50) + "%"
    };

    return mock;

    /* Inner function */
    function trimAndRandom(start, end) {
        return trimToTwoDecimalDigits(winstonRandom(start, end));
    }
}