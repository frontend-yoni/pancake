/**
 * Created by yavitzur on 15/06/2017.
 */
var symbolToCurrentValue = {};
var symbolTo1YearDataPoints = {};
var symbolTo5DaysDataPoints = {};
var symbolTo20DaysDataPoints = {};

var symbolTo5YearsDataPoints = {};
var symbolTo30YearsDataPoints = {};
var symbolTo3YearsDataPoints = {};

var symbolTo10YearsDataPoints = {};
var symbolTo20YearsDataPoints = {};

var symbolTo5DaysDataPointsTrimmed = {};
var symbolTo20DaysDataPointsTrimmed = {};

function getCurrentValue(symbol) {
    if (!symbolToCurrentValue[symbol]) {
        var value = generateAValue(1, 100);
        symbolToCurrentValue[symbol] = value;
    }

    return symbolToCurrentValue[symbol];
}

/** Generators **/
/* Quarterly */
function generate40YearsDataPoints(symbol) {
    var valuesAndDates = generate40YearsValues(symbol);
    var values = valuesAndDates[0];
    var dates = valuesAndDates[1];
    var historyPoints = [];
    var point;
    for (var i = 0; i < values.length; i++) {
        point = generateDataPoint(values[i], dates[i], WINSTON_INTERVAL.QUARTER);
        historyPoints.push(point);
    }

    if (!symbolTo30YearsDataPoints[symbol]) {
        symbolTo30YearsDataPoints[symbol] = historyPoints;
    }

    return symbolTo30YearsDataPoints[symbol];

}

function generate40YearsValues(symbol) {
    var values = [];
    var dates = getQuarterlyDates();
    var currentValue = getCurrentValue(symbol);
    var dailyPoints = generateFullYearDataPoints(symbol);
    var yearBackValue = dailyPoints[0].close;
    var totalChange = winstonRandom(1.5, 23);
    var startValue = yearBackValue / totalChange;

    var value;
    var pointCount = dates.length;
    values.push(startValue);
    for (var i = 1; i < pointCount - 1; i++) {
        value = generateMidPointValue(startValue, currentValue, i / pointCount, values[values.length - 1], WINSTON_INTERVAL.QUARTER);
        if (i == 156) {
            value = yearBackValue;
        }
        values.push(value);
    }
    values.push(currentValue);

    return [values, dates];
}

function getQuarterlyDates() {
    var dates = [];
    var currentDate = new Date();
    dates.push(currentDate);
    var startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    var quarterIndex = Math.floor(currentDate.getMonth() / 4);
    var startOfQuarter = new Date(currentDate.getFullYear(), quarterIndex * 3, 1);

    if (currentDate.getDate() != 1) {
        dates.push(startOfQuarter);
    }
    var date = shiftXMonth(startOfQuarter, -3);
    for (var i = 0; i < 141; i++) {
        dates.push(date);
        date = shiftXMonth(date, -3);
    }

    dates.reverse();
    return dates;
}

/** Monthly **/
function generate20YearsDataPoints(symbol) {
    var valuesAndDates = generate20YearsValues(symbol);
    var values = valuesAndDates[0];
    var dates = valuesAndDates[1];
    var historyPoints = [];
    var point;
    for (var i = 0; i < values.length; i++) {
        point = generateDataPoint(values[i], dates[i], WINSTON_INTERVAL.MONTH);
        historyPoints.push(point);
    }

    if (!symbolTo20YearsDataPoints[symbol]) {
        symbolTo20YearsDataPoints[symbol] = historyPoints;
    }

    return symbolTo20YearsDataPoints[symbol];

}

function generate20YearsValues(symbol) {
    var values = [];
    var dates = getMonthlyDates();
    var currentValue = getCurrentValue(symbol);
    var dailyPoints = generateFullYearDataPoints(symbol);
    var yearBackValue = dailyPoints[0].close;
    var totalChange = winstonRandom(1.2, 18);
    var startValue = yearBackValue / totalChange;

    var value;
    var pointCount = dates.length;
    values.push(startValue);
    for (var i = 1; i < pointCount - 1; i++) {
        value = generateMidPointValue(startValue, currentValue, i / pointCount, values[values.length - 1], WINSTON_INTERVAL.MONTH);
        if (i == 12 * 29) {
            value = yearBackValue;
        }
        values.push(value);
    }
    values.push(currentValue);

    return [values, dates];
}

function getMonthlyDates() {
    var dates = [];
    var currentDate = new Date();
    dates.push(currentDate);
    var startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    if (currentDate.getDate() != 1) {
        dates.push(startOfMonth);
    }
    var date = shiftXMonth(startOfMonth, -1);
    var monthCount = 12 * 20;
    for (var i = 0; i < monthCount; i++) {
        dates.push(date);
        date = shiftXMonth(date, -1);
    }

    dates.reverse();
    return dates;
}

/* Weekly */
function generate3YearsDataPoints(symbol) {
    if (!symbolTo3YearsDataPoints[symbol]) {
        var tenBack = generate10YearsDataPoints(symbol);
        var threeBack = [];
        var WEEK = 1000 * 60 * 60 * 24 * 7;
        var nowTime = new Date().getTime();
        var point;

        for (var i = tenBack.length - 1; i > 0; i--) {
            point = tenBack[i];

            if (nowTime - point.date.getTime() <= WEEK * 53 * 3) {
                threeBack.push(point);
            } else {
                break;
            }
        }
        threeBack.reverse();

        symbolTo3YearsDataPoints[symbol] = threeBack;
    }

    return symbolTo3YearsDataPoints[symbol];

}

function generate5YearsDataPoints(symbol) {
    if (!symbolTo5YearsDataPoints[symbol]) {
        var tenBack = generate10YearsDataPoints(symbol);
        var fiveBack = [];
        var WEEK = 1000 * 60 * 60 * 24 * 7;
        var nowTime = new Date().getTime();
        var point;

        for (var i = tenBack.length - 1; i > 0; i--) {
            point = tenBack[i];

            if (nowTime - point.date.getTime() <= WEEK * 53 * 5) {
                fiveBack.push(point);
            } else {
                break;
            }
        }
        fiveBack.reverse();

        symbolTo5YearsDataPoints[symbol] = fiveBack;
    }

    return symbolTo5YearsDataPoints[symbol];
}

function generate10YearsDataPoints(symbol) {
    if (!symbolTo10YearsDataPoints[symbol]) {
        var valuesAndDates = generate10YearsValues(symbol);
        var values = valuesAndDates[0];
        var dates = valuesAndDates[1];
        var historyPoints = [];
        var point;
        for (var i = 0; i < values.length; i++) {
            point = generateDataPoint(values[i], dates[i], WINSTON_INTERVAL.WEEK);
            historyPoints.push(point);
        }

        symbolTo10YearsDataPoints[symbol] = historyPoints;
    }

    return symbolTo10YearsDataPoints[symbol];

}

function generate10YearsValues(symbol) {
    var values = [];
    var dates = getWeeklyDates();
    var currentValue = getCurrentValue(symbol);
    var dailyPoints = generateFullYearDataPoints(symbol);
    var yearBackValue = dailyPoints[0].close;
    var totalChange = winstonRandom(0.68, 5.12);
    var startValue = yearBackValue / totalChange;

    var value;
    var pointCount = dates.length;
    values.push(startValue);
    for (var i = 1; i < pointCount - 1; i++) {
        value = generateMidPointValue(startValue, currentValue, i / pointCount, values[values.length - 1], WINSTON_INTERVAL.WEEK);
        if (i == 53 * 9) {
            value = yearBackValue;
        }
        values.push(value);
    }
    values.push(currentValue);

    return [values, dates];
}

function getWeeklyDates() {
    var dates = [];
    var currentDate = new Date();
    dates.push(currentDate);
    var startDate = currentDate.getDate() - currentDate.getDay();
    var startOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), startDate);
    if (startDate != currentDate.getDate()) {
        dates.push(startOfWeek);
    }
    var date = shiftXDays(startOfWeek, -7);
    var weekCount = 53 * 10;
    for (var i = 0; i < weekCount; i++) {
        dates.push(date);
        date = shiftXDays(date, -7);
    }

    dates.reverse();
    return dates;
}
/* 20 days */
function generateTrimmed5Days(symbol) {
    if (!symbolTo5DaysDataPointsTrimmed[symbol]) {
        var fiveDays = generate5DaysDataPoints(symbol);
        symbolTo5DaysDataPointsTrimmed[symbol] = trimTooManyMinutesValues(fiveDays);
    }
    return symbolTo5DaysDataPointsTrimmed[symbol];
}

function generateTrimmed20Days(symbol) {
    if (!symbolTo20DaysDataPointsTrimmed[symbol]) {
        var twentyDays = generate20DaysDataPoints(symbol);
        symbolTo20DaysDataPointsTrimmed[symbol] = trimTooManyMinutesValues(twentyDays);
    }
    return symbolTo20DaysDataPointsTrimmed[symbol];
}

function generate5DaysDataPoints(symbol) {
    if (!symbolTo5DaysDataPoints[symbol]) {
        var monthBack = generate20DaysDataPoints(symbol);
        var fiveDaysBack = [];
        var WEEK = 1000 * 60 * 60 * 24 * 7;
        var nowTime = new Date().getTime();
        var point;

        for (var i = monthBack.length - 1; i > 0; i--) {
            point = monthBack[i];

            if (nowTime - point.date.getTime() <= WEEK) {
                fiveDaysBack.push(point);
            } else {
                break;
            }
        }
        fiveDaysBack.reverse();
        symbolTo5DaysDataPoints[symbol] = fiveDaysBack;
    }

    return symbolTo5DaysDataPoints[symbol];
}

function generate20DaysDataPoints(symbol) {
    if (!symbolTo20DaysDataPoints[symbol]) {
        symbolTo20DaysDataPoints[symbol] = generateXDaysDataPoints(symbol, 30);
    }

    return symbolTo20DaysDataPoints[symbol];
}

function generateXDaysDataPoints(symbol, x) {
    var valuesAndDates = generateXDaysValues(symbol, x);
    var values = valuesAndDates[0];
    var dates = valuesAndDates[1];
    var historyPoints = [];
    var point;
    for (var i = 0; i < values.length; i++) {
        point = generateDataPoint(values[i], dates[i], WINSTON_INTERVAL.MINUTES);
        historyPoints.push(point);
    }

    return historyPoints;
}

function generateXDaysValues(symbol, x) {
    var values = [];
    var datesAndCount = getDatesArrayForXDays(x);
    var dates = datesAndCount[0];
    var dayCount = datesAndCount[1];
    var currentValue = getCurrentValue(symbol);
    var dailyPoints = generateFullYearDataPoints(symbol);
    var startValue = dailyPoints[dailyPoints.length - 1 - dayCount].close;


    var value;
    var pointCount = dates.length;
    values.push(startValue);
    for (var i = 1; i < pointCount - 1; i++) {
        value = generateMidPointValue(startValue, currentValue, i / pointCount, values[values.length - 1], WINSTON_INTERVAL.MINUTES);
        values.push(value);
    }
    values.push(currentValue);

    return [values, dates];
}

function getDatesArrayForXDays(x) {
    var currentDate = new Date();
    var startDate = shiftXDays(currentDate, -x);
    var dates = [];
    var todayArray = getTodayArray();

    var date;
    var dayCount = 0;
    for (var i = 0; i < x; i++) {
        date = shiftXDays(startDate, i);
        if (getIsActiveDate(date)) {
            pushAll(dates, getDayArray(date));
            dayCount++;
        }
    }

    pushAll(dates, todayArray);
    if (todayArray.length > 0) {
        dayCount++;
    }
    return [dates, dayCount];

    /* Inner functions */
    function pushAll(arr, anotherArr) {
        for (var i = 0; i < anotherArr.length; i++) {
            arr.push(anotherArr[i]);
        }
    }
}

function getDayArray(dateObject) {
    var dates = [];
    var endDate = new Date(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate(), 16, 0);
    var date = endDate;
    while (date.getHours() >= 9 && date.getHours() <= 16) {
        dates.push(date);
        date = shiftXMinutes(date, -15);
    }
    dates.reverse();
    return dates;
}

function getTodayArray() {
    var todayArray = [];
    var nowDate = new Date();
    var hour = nowDate.getHours();
    if ((hour >= 9 && hour < 16 ) || (hour == 16 && nowDate.getMinutes() == 0)) {
        todayArray.push(nowDate);

        var minute = nowDate.getMinutes();
        var roundMinute = Math.floor(minute / 15) * 15;
        var prevDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), hour, roundMinute);

        if (roundMinute != minute) {
            todayArray.push(prevDate);
        }

        var date = shiftXMinutes(prevDate, -15);
        while (date.getHours() >= 9 && date.getHours() <= 16) {
            todayArray.push(date);
            date = shiftXMinutes(date, -15);
        }

    }

    todayArray.reverse();
    return todayArray;
}

function trimTooManyMinutesValues(arr) {
    var retArr = [];
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        if (i % 3 == 0) {
            retArr.push(arr[len - 1 - i]);
        }
    }

    retArr.reverse();
    return retArr;
}

/* 1 Year */
function generateFullYearDataPoints(symbol) {
    if (!symbolTo1YearDataPoints[symbol]) {
        var valuesAndDates = generateYearValues(symbol);
        var values = valuesAndDates[0];
        var dates = valuesAndDates[1];
        var historyPoints = [];
        var point;
        for (var i = 0; i < values.length; i++) {
            point = generateDataPoint(values[i], dates[i], WINSTON_INTERVAL.DAY);
            historyPoints.push(point);
        }
        symbolTo1YearDataPoints[symbol] = historyPoints;
    }

    return symbolTo1YearDataPoints[symbol];
}


function generateYearValues(symbol) {
    var values = [];
    var dates = [];
    var currentValue = getCurrentValue(symbol);
    var totalChange = winstonRandom(0.78, 1.42);
    var startValue = currentValue / totalChange;


    var todayDate = new Date();
    var startDate = shiftXDays(todayDate, -365);
    values.push(startValue);
    dates.push(startDate);

    var date;
    var value;
    for (var i = 1; i < 365; i++) {
        date = shiftXDays(startDate, i);
        if (getIsActiveDate(date)) {
            value = generateMidPointValue(startValue, currentValue, i / 365, values[values.length - 1], WINSTON_INTERVAL.DAY);
            values.push(value);
            dates.push(date);
        }
    }

    values.push(currentValue);
    dates.push(date);

    return [values, dates];
}

/* General */

function generateMidPointValue(startValue, endValue, t, prevValue, interval) {
    var value;
    var anchor = getValueByProgress(startValue, endValue, t);
    var isGain = (Math.random() < INTERVAL_TO_GAIN_CHANCE[interval]);
    if (isGain) {
        value = applyGain(prevValue, interval);
    } else {
        value = applyLoss(prevValue, interval)
    }

    var diffFromAnchor = value - anchor;
    if (diffFromAnchor > anchor * 0.2) {
        value = value - Math.random() * diffFromAnchor;
    } else if (diffFromAnchor < -anchor * 0.2) {
        value = value - Math.random() * diffFromAnchor;
    }

    return value;
}

function generateDataPoint(value, date, interval) {
    var isGain = (Math.random() > INTERVAL_TO_GAIN_CHANCE[interval]);
    var volume = generateVolume();
    var changeRange = generateChangeRange(volume, interval);
    var open;
    var high;
    var low;

    var split = winstonRandom(0, 0.5);
    var mainDiff = value * changeRange * split;
    var secondDiff = value * changeRange * (1 - split);

    if (isGain) {
        high = value + mainDiff;
        low = value - secondDiff;
        open = winstonRandom(low, value - (value - low) / 2);
    } else {
        high = value + secondDiff;
        low = value - mainDiff;
        open = winstonRandom(value + (high - value) / 2, high);
    }

    var dataPoint = new HistoryDataPoint(date, value, open, high, low, volume);

    return dataPoint;
}

function generateVolume() {
    var isHigh = Math.random() > 0.7;
    var volume;
    if (isHigh) {
        volume = winstonRandom(MIN_VOLUME, MAX_VOLUME)
    } else {
        volume = winstonRandom(MIN_VOLUME, AVG_VOLUME)
    }
    return volume;
}

function generateChangeRange(volume, interval) {
    var changeRange = winstonRandom(0.025, 0.038);
    if (volume > AVG_VOLUME) {
        if (volume > TOP_VOLUME) {
            changeRange = winstonRandom(0.025, 0.052);
        } else {
            changeRange = winstonRandom(0.025, 0.058);
        }
    }


    if (interval == WINSTON_INTERVAL.DAY) {
        changeRange *= 1.5;
    }
    if (interval == WINSTON_INTERVAL.MONTH) {
        changeRange *= 3;
    }
    if (interval == WINSTON_INTERVAL.WEEK) {
        changeRange *= 3;
    }
    if (interval == WINSTON_INTERVAL.QUARTER) {
        changeRange *= 6;
    }
    return changeRange;
}

function generateAValue(start, end) {
    var value = winstonRandom(start, end);
    value = Math.floor(value * 100);
    value /= 100;
    return value;
}

/** Calculations **/
function applyGain(value, interval) {
    var max = INTERVAL_TO_GAIN_MAX[interval];
    var gainPercent = winstonRandom(0, max);
    return value + value * gainPercent;
}

function applyLoss(value, interval) {
    var max = INTERVAL_TO_GAIN_MAX[interval];
    max *= 0.9;
    var lossPercent = winstonRandom(0, max);
    return value - value * lossPercent;
}

function winstonRandom(start, end) {
    var diff = end - start;
    var value = start + Math.random() * diff;
    return value;
}

function getValueByProgress(startValue, endValue, t) {
    return startValue + (endValue - startValue) * t;
}

function getIsActiveDate(date) {
    return (date.getDay() != 0 && date.getDay() != 6);
}

/** Date **/
function getNextWeek(dateObject) {
    return shiftXDays(dateObject, 7);
}

function getPrevWeek(dateObject) {
    return shiftXDays(dateObject, -7);
}

function shiftXDays(dateObject, shiftDayCount) {
    var newDateObject = new Date(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate() + shiftDayCount);
    return newDateObject;
}

function shiftXMonth(dateObject, shiftMonthCount) {
    var newDateObject = new Date(dateObject.getFullYear(), dateObject.getMonth() + shiftMonthCount, dateObject.getDate());
    return newDateObject;
}

function shiftXMinutes(dateObject, shiftMinutesCount) {
    var newDateObject = new Date(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate(), dateObject.getHours(), dateObject.getMinutes() + shiftMinutesCount);
    return newDateObject;
}

var WINSTON_INTERVAL = {
    MINUTES: "MINUTES",
    DAY: "DAY",
    WEEK: "WEEK",
    MONTH: "MONTH",
    QUARTER: "QUARTER"
};

var INTERVAL_TO_GAIN_MAX = {
    MINUTES: 0.022,
    DAY: 0.06,
    WEEK: 0.2,
    MONTH: 0.23,
    QUARTER: 0.36
};

var INTERVAL_TO_GAIN_CHANCE = {
    MINUTES: 0.52,
    DAY: 0.53,
    WEEK: 0.54,
    MONTH: 0.55,
    QUARTER: 0.56
};

var MIN_VOLUME = 2586900;
var MAX_VOLUME = 43670000;
var AVG_VOLUME = (MAX_VOLUME + MIN_VOLUME) / 2;
var TOP_VOLUME = MIN_VOLUME + (MAX_VOLUME - MIN_VOLUME) * 0.8;