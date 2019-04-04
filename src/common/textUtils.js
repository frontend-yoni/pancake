var iMath = Math;
var GOOD_COLOR = /*"#00B287"*/"#3ab161";
var BAD_COLOR = /*"#F34C5C"*/"#dc514d";
var UNCHANGED_COLOR = "#000000";
var SCROLL_BAR_WIDTH = 17;

var d3DateFormat = d3.time.format("%m/%d/%Y");
var d3DateFormatIntraday = d3.time.format("%m/%d %H:%M");
var d3DateFormatMonthly = d3.time.format("%b %Y");
var d3DateFormatWeekNum = d3.time.format("%U");
var d3NewsDateFormat = d3.time.format("%a %b %e %H:%M");

var isOldIE = (navigator.appName.indexOf("Internet Explorer") != -1);
var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
var isIE = isOldIE || isIE11; //old IEs don't support pointer-events
//CONSTANTS
var CLONE_ID_SUFFIX = "_CLONE_";
//COLOR CONSTANTS
var MAIN_VIEW_TITLE_COLOR = "#2171b5";
//Classes
var SELECTED_BUTTON_CLASS = "selectedButtonClass";
var REFRESHING_VALUE_GOOD_CLASS = "refreshingValueGoodClass";
var REFRESHING_VALUE_BAD_CLASS = "refreshingValueBadClass";
//Time
var HOUR_TIME_STAMP = 1000 * 60 * 60;
var DAY_TIME_STAMP = HOUR_TIME_STAMP * 24;
//Data
var uniqueIDGlobal = 0;

/**Number formatting**/
function trimToTwoDecimalDigits(num){
    num = iMath.round(num * 100) ;
    num = num / 100;
    return num;
}

function formatNiceNumber(number, isPrecise) {
    var formatStr;
    var decimalDigits = 2;
    var absNum = iMath.abs(number);

    if (number >= 1000) {
        decimalDigits--;
        if (number >= 10000) {
            decimalDigits--;
        }
    } else if (isPrecise && absNum < 10) {
        decimalDigits++;
        if (absNum < 1) {
            decimalDigits++;
        }
    }

    if (absNum < 10000) {
        formatStr = formatXDecimalDigits(number, decimalDigits);
    } else {
        var roundedNumber = iMath.floor(number);
        formatStr = d3.format(",")(roundedNumber);
    }


    return formatStr;
}

function formatXDecimalDigits(number, decimalDigits) {
    number = roundNumberByDecimalDigits(number, decimalDigits);
    var formattedNumberStr = number.toString();

    //Add decimal zeros if needed
    if (number == iMath.floor(number) && decimalDigits > 0) {
        formattedNumberStr += ".0";
    }
    if (number * 10 == iMath.floor(number * 10) && number < 1000) {
        formattedNumberStr += "0";
    }

    if (number >= 1000) {
        var lastIndex = formattedNumberStr.length - 1;
        var decimalIndex = formattedNumberStr.indexOf(".");
        if (decimalIndex < 0) {
            decimalIndex = lastIndex;
        }
        formattedNumberStr = formattedNumberStr.substr(0, decimalIndex - 3) + "," + formattedNumberStr.substr(decimalIndex - 3, lastIndex);
    }

    return formattedNumberStr;
}
function roundNumberByDecimalDigits(number, decimalDigits) {
    var multiplier = iMath.pow(10, decimalDigits);
    number *= multiplier;
    number = iMath.floor(number) / multiplier;
    return number;
}

/**Number formatting End.**/

/**Dates**/
function getDateString(timeOrStr) {
    return d3DateFormat(new Date(timeOrStr));
}

function getDateStringIntraDay(timeOrStr) {
    return d3DateFormatIntraday(new Date(timeOrStr));
}

function getDateStringMonthly(timeOrStr) {
    var date = new Date(timeOrStr);
    var goBackOneMonthTime = date.getTime() - 10 * DAY_TIME_STAMP;
    var correctMonthDate = new Date(goBackOneMonthTime);
    return d3DateFormatMonthly(correctMonthDate);
}

function getDateStringQuarterly(timeOrStr) {
    var date = new Date(timeOrStr);
    var goBackOneMonthTime = date.getTime() - 10 * DAY_TIME_STAMP;
    var correctMonthDate = new Date(goBackOneMonthTime);

    var year = correctMonthDate.getFullYear();
    var month = correctMonthDate.getMonth();
    var quarter = iMath.floor(month / 3) + 1;

    var dateStr = "Q" + quarter + " " + year;
    return dateStr;
}

function getDateStringWeekly(timeOrStr) {
    var date = new Date(timeOrStr);
    var year = date.getFullYear();
    var week = +d3DateFormatWeekNum(date) + 1;

    var dateStr = "W" + week + " " + year;
    return dateStr;
}

function getDateStringByParams(timeOrStr, periodicity, doesRepresentRange) {
    var retDateStr;
    switch (periodicity) {
        case PERIODICITY.INTRA_DAY:
            retDateStr = getDateStringIntraDay(timeOrStr);
            break;

        case PERIODICITY.DAILY:
            retDateStr = getDateString(timeOrStr);
            break;

        case PERIODICITY.MONTHLY:
            if (doesRepresentRange) {
                retDateStr = getDateStringMonthly(timeOrStr);
            } else {
                retDateStr = getDateString(timeOrStr);
            }
            break;

        case PERIODICITY.QUARTERLY:
            if (doesRepresentRange) {
                retDateStr = getDateStringQuarterly(timeOrStr);
            } else {
                retDateStr = getDateString(timeOrStr);
            }
            break;

        case PERIODICITY.WEEKLY:
            if (doesRepresentRange) {
                retDateStr = getDateStringWeekly(timeOrStr);
            } else {
                retDateStr = getDateString(timeOrStr);
            }
            break;
    }

    return retDateStr;
}

function getActualPeriodicityForDrill(drillPeriodicity, dataList) {
    if (drillPeriodicity == PERIODICITY.MONTHLY || drillPeriodicity == PERIODICITY.QUARTERLY) {
        if (StockData.getIsWeekly(dataList)) {
            drillPeriodicity = PERIODICITY.WEEKLY;
        } else if (StockData.getIsMonthly(dataList)) {
            drillPeriodicity = PERIODICITY.MONTHLY;
        }
    }
    return drillPeriodicity;
}

function getPeriodicityGlobal(range, dataList) {
    var timeRange = RestAPIs.TIME_RANGE;
    var retPeriodicity;
    switch (range) {
        case timeRange.D1:
        case timeRange.D5:
            retPeriodicity = PERIODICITY.INTRA_DAY;
            break;

        case timeRange.M1:
        case timeRange.M3:
        case timeRange.Y1:
            retPeriodicity = PERIODICITY.DAILY;
            break;

        case timeRange.Y5:
            if (StockData.getIsWeekly(dataList)) {
                retPeriodicity = PERIODICITY.WEEKLY;
            } else {
                retPeriodicity = PERIODICITY.MONTHLY;
            }
            break;

        case timeRange.MAX:
            if (StockData.getIsWeekly(dataList)) {
                retPeriodicity = PERIODICITY.WEEKLY;
            } else if (StockData.getIsMonthly(dataList)) {
                retPeriodicity = PERIODICITY.MONTHLY;
            } else {
                retPeriodicity = PERIODICITY.QUARTERLY;
            }
            break;
    }

    if (retPeriodicity == undefined){
        retPeriodicity = getPeriodicityByYahooRangeStr(range);
    }

    return retPeriodicity;
}

function getPeriodicityByYahooRangeStr(rangeStr){
    var retPeriodicity = PERIODICITY.DAILY;
    if (rangeStr.indexOf("d") > -1){
        retPeriodicity = PERIODICITY.INTRA_DAY;
    }

    return retPeriodicity;
}

function isSameTradingDay(firstDate, secondDate) {
    var maxDistanceBetweenDatesInSameDay = 1000 * 60 * 60 * 10;
    var isIt = (secondDate.getTime() - firstDate.getTime() <= maxDistanceBetweenDatesInSameDay);

    return isIt;
}

function getTodayTradingEndTime(todayDataList, symbol) {
    var lastIndexWithData = todayDataList.length - 1;
    var lastDateWithData = todayDataList[lastIndexWithData].date;
    var lastTimeStamp = lastDateWithData.getTime();

    var lastIndexInAxis = StockData.getNumberOfPointsInADay(symbol) - 1;
    var roughEndTimeStamp = lastTimeStamp + (lastIndexInAxis - lastIndexWithData) * StockData.DAILY_DATA_INTERVAL;
    var roughEndDate = new Date(roughEndTimeStamp);
    var endDate = new Date(roughEndDate.getFullYear(), roughEndDate.getMonth(), roughEndDate.getDate(), roughEndDate.getHours());

    return endDate;
}
/**Dates end.**/

/**String Utils**/
function concatChangeAndPercentage(change, percentage, isCurrency) {
    var fullText;
    var changeValueText = formatNiceNumber(change, isCurrency);
    var percentageText = formatNiceNumber(percentage);
    if (change < 0) {
        percentageText = percentageText.replace("-", "");
    } else {
        changeValueText = "+" + changeValueText;
    }
    fullText = changeValueText + " (" + percentageText + "%)";
    return fullText;
}

function doesContainSubStr(bigStr, subStr, isCaseSensitive) {
    var doesIt;
    if (isCaseSensitive) {
        doesIt = bigStr.indexOf(subStr) >= 0;
    } else {
        doesIt = bigStr.toLowerCase().indexOf(subStr.toLowerCase()) >= 0;
    }
    return doesIt;
}

//Draw utils
function moveToStr(x, y) {
    return "M" + [x, y].join(",");
}

function lineToStr(x, y) {
    return "L " + [x, y].join(",");
}

function curveToStr(tipX, tipY, x, y) {
    return "Q " + [tipX, tipY, x, y].join(",");
}

function positionGroupGlobal(group, x, y) {
    var tanslateStr = "translate(" + x + ", " + y + ")";
    group.attr("transform", tanslateStr);
}

/**String Utils End.**/

/**Event Utils**/
function dispatchEventByNameAndData(d3TargetElement, eventName, data) {
    var event = document.createEvent("Event");
    event.initEvent(eventName, true, true);
    event.detail = {
        "data": data
    };
    d3TargetElement.node().dispatchEvent(event);
}
/**Event Utils End.**/

/**Layout Utils**/
function getStyleNumberValue(d3TargetElement, styleName) {
    var stylesTRING = d3TargetElement.style(styleName);
    var numValue = +stylesTRING.replace("px", "");
    return numValue;
}
/**Layout Utils End.**/

/**Clone Manipulation***/
function updateInnerDivOfCardClone(innerDivHTML, cloneDiv, removeElementsClass) {
    var clonedInnerDivHtmlElement = innerDivHTML.cloneNode(true);
    cloneDiv.select("." + GridCard.INNER_DIV_CLASS).remove();
    cloneDiv.node().appendChild(clonedInnerDivHtmlElement);
    resetClipPathIDsForClone(cloneDiv);

    cloneDiv.selectAll("." + removeElementsClass)
        .remove();
}

//Update the clipPath IDS since their IDs will overlap with the original ones
function resetClipPathIDsForClone(cloneDiv) {
    if (!isIE) {
        var clipPathElements = getElementsByTagNameFromClone(cloneDiv, "clipPath");
        var clipPathElement;
        for (var i = 0; i < clipPathElements.length; i++) {
            clipPathElement = clipPathElements[i];
            clipPathElement.id = clipPathElement.id + CLONE_ID_SUFFIX;
        }

        var pathElements = getElementsByTagNameFromClone(cloneDiv, "path");
        var pathElement;
        var clipPathText;
        var clipPathID;
        for (var i = 0; i < pathElements.length; i++) {
            pathElement = pathElements[i];
            clipPathID = pathElement.getAttribute("clipPathID");
            if (clipPathID) {
                clipPathID = clipPathID + CLONE_ID_SUFFIX;
                clipPathText = "url(#" + clipPathID + ")";
                pathElement.setAttribute("clip-path", clipPathText);
            }
        }
    }
}

function getElementsByTagNameFromClone(d3Div, tagName) {
    var d3Tags = d3Div.selectAll(tagName);
    var tagElements = d3Tags[0];
    return tagElements;
}
/**Clone Manipulation End.***/

/**Data to UI utils***/
function getValueTextColor(value, baseLineValue) {
    var retColor = UNCHANGED_COLOR; //In case there is no base line, or value is equal to baseline
    if (baseLineValue !== undefined) {
        if (value > baseLineValue) {
            retColor = GOOD_COLOR;
        } else if (value < baseLineValue) {
            retColor = BAD_COLOR;
        }
    }
    return retColor;
}

function getValueTextColorDarkBG(value, baseLineValue) {
    var retColor = "white"; //In case there is no base line, or value is equal to baseline
    if (baseLineValue !== undefined) {
        if (value > baseLineValue) {
            retColor = "#00C853";
        } else if (value < baseLineValue) {
            retColor = "#FF8A80";
        }
    }
    return retColor;
}
/**Data to UI utils***/

/**DOM Manipulation***/
function clearSlate(d3Element) {
    var htmlPapa = d3Element.node();
    while (htmlPapa.firstChild) {
        htmlPapa.removeChild(htmlPapa.firstChild);
    }
}

function moveChildToBeFirst(childD3) {
    var childHTML = childD3.node();
    var papaDiv = childHTML.parentNode;
    papaDiv.insertBefore(childHTML, papaDiv.childNodes[0]);
}

function moveChildToBeLast(childD3) {
    var childHTML = childD3.node();
    var papaDiv = childHTML.parentNode;
    papaDiv.appendChild(childHTML);
}

function setValueRefreshClassGlobal(d3Element, prevChange, currentChange) {
    if (currentChange > prevChange + 0.01) {
        d3Element.classed(REFRESHING_VALUE_GOOD_CLASS, true);
    } else if(prevChange > currentChange + 0.01){
        d3Element.classed(REFRESHING_VALUE_BAD_CLASS, true);
    }
}
/**DOM Manipulation End.***/

/***DOM Traversal***/
function getIsChildOfPapaClass(childD3, papaClass){
    var isIt;
    var currentElement = childD3;
    var papaElement;
    while(currentElement.node().tagName != "BODY" && !currentElement.classed(papaClass)){
        papaElement = currentElement.node().parentNode || currentElement.node().parentElement;
        currentElement = d3.select(papaElement);
    }
    isIt = currentElement.classed(papaClass);
    return isIt;
}

/***DOM Traversal End.***/

/**Data Object Utils***/
function pushEmptyData(list, emptyCount) {
    for (var i = 0; i < emptyCount; i++) {
        list.push(undefined);
    }
}

function addAsFirstToArray(array, entry) {
    addToArrayByIndex(array, entry, 0)
}
function addToArrayByIndex(array, entry, index) {
    array.splice(index, 0, entry);
}
function removeFromArrayByIndex(array, index) {
    array.splice(index, 1);
}

function repositionArrayEntryByIndex(array, initialIndex, newIndex) {
    var entry = array[initialIndex];
    removeFromArrayByIndex(array, initialIndex);
    addToArrayByIndex(array, entry, newIndex);
}

function getValuesFromMapGlobal(object) {
    var retArray = [];
    var keys = Object.keys(object);
    var symbol;
    for (var i = 0; i < keys.length; i++) {
        symbol = keys[i];
        retArray.push(object[symbol]);
    }
    return retArray;
}

function isEmptyObject(object) {
    var isIt = (!object || Object.keys(object).length == 0);
    return isIt;
}

function getHasProperData(stockDataInput, range){
    if (!range){
        range = RestAPIs.TIME_RANGE.D5;
    }
    var historyData = getProperDataListByRange(stockDataInput, range);
    var dataAlreadyFetched = (historyData.length > 0);
    return dataAlreadyFetched;
}

function getProperDataListByRange(stockDataInput, range){
    var dataArray;
    var TIME_RANGE = RestAPIs.TIME_RANGE;
    switch (range) {
        case TIME_RANGE.D1:
            dataArray = stockDataInput.todayData;
            break;

        case TIME_RANGE.D5:
            dataArray = stockDataInput.intraDayData;
            break;

        case TIME_RANGE.M1:
        case TIME_RANGE.M3:
        case TIME_RANGE.Y1:
            dataArray = stockDataInput.dailyData;
            break;

        case TIME_RANGE.Y5:
            dataArray = stockDataInput.monthlyData;
            break;

        case TIME_RANGE.MAX:
            dataArray = stockDataInput.quarterlyData;
            break;
    }
    return dataArray;
}
/**Data Object Utils End.***/

/**Calculations***/
function calculateChangePercentage(baseValue, newValue) {
    var change = (newValue - baseValue);
    var percentage = (change / baseValue) * 100;
    return percentage;
}
/**Calculations End.***/

/***General Utils***/
function getUniqueIDGlobal() {
    return uniqueIDGlobal++;
}
/***General Utils End.***/

/***Cookies****/
var PANCAKES_YUMMY_COOKIE_ID = "PANCAKES_YUMMY_COOKIE_ID";


function createCookie(userID) {
    var expires;
    var days = 365;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = PANCAKES_YUMMY_COOKIE_ID + "=" + userID + expires + "; path=/";
}

function getCookie() {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(PANCAKES_YUMMY_COOKIE_ID + "=");
        if (c_start != -1) {
            c_start = c_start + PANCAKES_YUMMY_COOKIE_ID.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}
/***Cookies End.****/

/***Stats Util****/
var RANGE_DELIMITER = "-";
var NUMBER_DELIMITER = ",";

function processStats(stats){
    stats.DaysRange = formatRangeToNiceNumber(stats.DaysRange);
    stats.YearRange = formatRangeToNiceNumber(stats.YearRange);
    stats.Volume = formatStringNumber(stats.Volume);
    stats.AverageDailyVolume = formatStringNumber(stats.AverageDailyVolume);
    return stats;
}

function formatRangeToNiceNumber(range) {
    var rangeSplit = splitStringByChar(range, RANGE_DELIMITER);
    var rangeAsANiceNumber = "";
    var i;
    for(i = 0; i < rangeSplit.length; i++) {
        var firstRangeNumber = rangeSplit[i];
        rangeAsANiceNumber += formatNiceNumber(+firstRangeNumber);
        if(i+1 != rangeSplit.length) {
            rangeAsANiceNumber += " " + RANGE_DELIMITER + " ";
        }
    }
    return rangeAsANiceNumber;
}

function splitStringByChar(string, char) {
    var split = "";
    if (string){
        split = string.split(char);
    }
    return split;
}

function formatStringNumber(stringNumber) {
    var i;
    var formattedStringNumber = "";
    if (stringNumber) {
        for (i = 0; i < stringNumber.length; i++) {
            if ((i != 0) && (i % 3 == 0)) {
                formattedStringNumber = NUMBER_DELIMITER + formattedStringNumber;
            }
            formattedStringNumber = stringNumber.charAt(stringNumber.length - ( i + 1 )) + formattedStringNumber;
        }
    }
    return formattedStringNumber;
}
/***Stats Util End.****/