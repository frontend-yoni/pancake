/**
 * Created by yoni_ on 1/8/2016.
 */
function IndicatorsUtil() {
    var iMath = Math;
    /**Constants***/
    var DEFAULT_X_FOR_SMA = 20;
    var DEFAULT_X_FOR_EMA = 12;

    /***Public***/
    this.produceIndicator = function (dataList, indicatorType, period, stdevMulti) {
        return produceIndicator(dataList, indicatorType, period, stdevMulti);
    };

    this.produceExtraChartIndicatorObject = function (dataList, indicatorParams) {
        return produceExtraChartIndicatorObject(dataList, indicatorParams);
    };

    this.getValueString = function (fullIndicatorData, index) {
        return getValueString(fullIndicatorData, index);
    };

    this.produceSMA = function (dataList, period) {
        return produceSMAPublic(dataList, period);
    };

    this.produceEMA = function (dataList, period) {
        return produceEMAPublic(dataList, period);
    };

    this.produceBBPublic = function (dataList, period, stdevMulti) { //returns 2 lists! list of lists
        return produceBBPublic(dataList, period, stdevMulti);
    };

    this.produceMoneyFlowIndexPublic = function (dataList, periods) {
        return produceMoneyFlowIndexPublic(dataList, periods);
    };

    this.updateYAxisByIndicators = function (indicatorsDataLists, yAxis) {
        updateYAxisByIndicators(indicatorsDataLists, yAxis);
    };

    this.createOverlayDataObject = function (paramData, lists) {
        return createOverlayDataObject(paramData, lists);
    };

    this.createExtraChartDataObject = function (paramData, data) {
        return createExtraChartDataObject(paramData, data)
    };

    /**Produce Data****/
    //General
    function produceIndicator(dataList, indicatorType, period, stdevMulti) {
        var types = IndicatorsUtil.TYPES;
        var retList;
        switch (indicatorType) {
            case types.SMA:
                retList = produceSMAPublic(dataList, period);
                break;

            case types.EMA:
                retList = produceEMAPublic(dataList, period);
                break;

            case types.BB:
                retList = produceBBPublic(dataList, period, stdevMulti);
                break;
        }

        return retList;
    }

    function produceExtraChartIndicatorObject(dataList, indicatorParams) {
        var types = IndicatorsUtil.TYPES;
        var data;
        var retObj;
        switch (indicatorParams.type) {
            case types.MFI:
                data = produceMoneyFlowIndexPublic(dataList, indicatorParams.period);
                break;
            case types.MACD:
                data = produceMACDPublic(dataList, indicatorParams.slow, indicatorParams.fast, indicatorParams.signal);
                break;
        }
        retObj = new IndicatorFullData(indicatorParams, data);
        return retObj;
    }

    //SMA
    function produceSMAPublic(dataList, x) {
        var retList = [];
        if (!x) {
            x = DEFAULT_X_FOR_SMA;
        }
        if (dataList && x < dataList.length) {
            retList = produceSMA(dataList, x);
        }
        return retList;
    }

    function produceSMA(dataList, x) {
        var smaList = [];
        pushEmptyData(smaList, x - 1);

        var aggregationSum = 0;
        var i;
        for (i = 0; i < x; i++) {
            aggregationSum += dataList[i].close;
        }

        smaList.push(aggregationSum / x);
        for (i = x; i < dataList.length; i++) {
            aggregationSum -= dataList[i - x].close;
            aggregationSum += dataList[i].close;
            smaList.push(aggregationSum / x);
        }

        return smaList;
    }

    //EMA
    function produceEMAPublic(dataList, x) {
        var retList = [];
        if (!x) {
            x = DEFAULT_X_FOR_EMA;
        }
        if (dataList && x < dataList.length) {
            retList = produceEMA(dataList, x);
        }
        return retList;
    }

    function produceEMA(dataList, x) {
        var emaList = [];
        pushEmptyData(emaList, x - 1);

        var aggregationSum = 0;
        var i;
        for (i = 0; i < x; i++) {
            aggregationSum += dataList[i].close;
        }

        var currentEMA = aggregationSum / x;
        emaList.push(currentEMA);

        var multiplier = 2 / (x + 1);
        var currentClose;
        var prevEMA = currentEMA;

        for (i = x; i < dataList.length; i++) {
            currentClose = dataList[i].close;
            currentEMA = (currentClose - prevEMA) * multiplier + prevEMA;
            emaList.push(currentEMA);
            prevEMA = currentEMA;
        }

        return emaList;
    }

    //Bollinger Bands
    function produceBBPublic(dataList, x, stdevMulti) { //returns 2 lists! list of lists
        var retList = [[], []];
        if (!x) {
            x = 20;
            stdevMulti = 2;
        }
        if (dataList && x < dataList.length) {
            retList = produceBB(dataList, x, stdevMulti);
        }
        return retList;
    }

    function produceBB(dataList, x, stdevMulti) {
        var smaList = produceSMA(dataList, x);

        var upperBound = [];
        var lowerBound = [];
        pushEmptyData(upperBound, x - 1);
        pushEmptyData(lowerBound, x - 1);

        var currentStdev;
        var currentSMA;

        currentSMA = smaList[x - 1];
        currentStdev = getStandardDeviation(dataList, 0, x - 1);
        upperBound.push(currentSMA + currentStdev * stdevMulti);
        lowerBound.push(currentSMA - currentStdev * stdevMulti);

        for (var i = x; i < dataList.length; i++) {
            currentSMA = smaList[i];
            currentStdev = getStandardDeviation(dataList, i - x + 1, i);
            upperBound.push(currentSMA + currentStdev * stdevMulti);
            lowerBound.push(currentSMA - currentStdev * stdevMulti);
        }

        var retListOfLists = [upperBound, lowerBound];

        return retListOfLists;
    }

    //Money Flow Index
    function produceMoneyFlowIndexPublic(dataList, periods) {
        var retList = [[], []];
        if (!periods) {
            periods = 14;
        }
        if (dataList && periods < dataList.length) {
            retList = produceMoneyFlowIndex(dataList, periods);
        }
        return retList;
    }

    function produceMoneyFlowIndex(dataList, periods) {
        var mfiList = [];
        pushEmptyData(mfiList, periods - 1);

        var rawMoneyFlows = [];
        var moneyFlow;
        var dataPoint;
        for (var i = 0; i < dataList.length; i++) {
            dataPoint = dataList[i];
            moneyFlow = getRowMoneyFlow(dataPoint);
            if (dataPoint.close < dataPoint.open) {
                moneyFlow *= -1;
            }
            rawMoneyFlows.push(moneyFlow);
        }

        var positiveAggr = 0;
        var negativeAggr = 0;
        var moneyFlow;
        for (var i = 0; i < periods; i++) {
            moneyFlow = rawMoneyFlows[i];
            if (moneyFlow >= 0) {
                positiveAggr += moneyFlow;
            } else {
                negativeAggr += (-1 * moneyFlow);
            }
        }

        var oldMoneyFlow;
        var mfi = getMFI(positiveAggr, negativeAggr);
        mfiList.push(mfi);

        for (var i = periods; i < dataList.length; i++) {
            oldMoneyFlow = rawMoneyFlows[i - periods];
            if (oldMoneyFlow >= 0) {
                positiveAggr -= oldMoneyFlow;
            } else {
                negativeAggr -= (-1 * oldMoneyFlow);
            }

            moneyFlow = rawMoneyFlows[i];
            if (moneyFlow >= 0) {
                positiveAggr += moneyFlow;
            } else {
                negativeAggr += (-1 * moneyFlow);
            }
            mfi = getMFI(positiveAggr, negativeAggr);

            mfiList.push(mfi);
        }

        return mfiList;

        //Inner functions
        function getMFI(positiveAggr, negativeAggr) {
            var ratio = positiveAggr / negativeAggr;
            var mfi = 100 - 100 / (1 + ratio);
            return mfi;
        }

        function getRowMoneyFlow(dataPoint) {
            var retFlowValue;
            var typicalPrice = (dataPoint.close + dataPoint.high + dataPoint.low) / 3;
            retFlowValue = typicalPrice * dataPoint.volume;
            return retFlowValue;
        }
    }

    //Money Flow Index
    function produceMACDPublic(dataList, slow, fast, signal) {
        var retList = [[], [], []];
        var prevSlow = slow;
        slow = iMath.max(prevSlow, fast);
        fast = iMath.min(prevSlow, fast);
        signal = iMath.min(signal, slow);

        if (dataList && slow < dataList.length && fast < dataList.length && signal < dataList.length) {
            retList = produceMACD(dataList, slow, fast, signal);
        }
        return retList;
    }

    function produceMACD(dataList, slow, fast, signal) {
        var retArray = []; //This will be a list of 3 lists
        var baseMACD = getBaseMACD(slow, fast);
        var signalList = getSignalList(signal, slow, baseMACD);
        var diffList = getDiff(baseMACD, signalList);

        retArray.push(baseMACD);
        retArray.push(signalList);
        retArray.push(diffList);

        return retArray;

        /****Inner functions****/
        function getDiff(mainList, secondList) {
            var diffList = [];

            var mainVal;
            var secondVal;
            var diff;
            for (var i = 0; i < mainList.length; i++) {
                mainVal = mainList[i];
                secondVal = secondList[i];
                if (mainVal == undefined || secondVal == undefined) {
                    diff = undefined;
                } else {
                    diff = (mainVal - secondVal);
                }
                diffList.push(diff);
            }

            return diffList;
        }

        function getSignalList(signalPeriod, slow, baseMACD) {
            var signalList = [];
            var calcStartIndex = slow - 1;

            pushEmptyData(signalList, calcStartIndex + signalPeriod - 1);

            var aggregationSum = 0;
            var i;
            for (i = calcStartIndex; i < calcStartIndex + signalPeriod; i++) {
                aggregationSum += baseMACD[i];
            }
            var value = aggregationSum / signalPeriod;
            signalList.push(value);

            var multiplier = 2 / (signalPeriod + 1);
            var prevValue = value;
            for (i = calcStartIndex + signalPeriod; i < baseMACD.length; i++) {
                value = (baseMACD[i] - prevValue) * multiplier + prevValue;
                signalList.push(value);
                prevValue = value;
            }


            return signalList;
        }

        function getBaseMACD(slow, fast) {
            var fastEMA = produceEMA(dataList, fast);
            var slowEMA = produceEMA(dataList, slow);
            var baseMACD = getDiff(fastEMA, slowEMA);

            return baseMACD;
        }
    }


    /**Calculation Util****/
    function updateYAxisByIndicators(indicatorsDataLists, yAxis) {
        var min = yAxis.minValue;
        var max = yAxis.maxValue;

        var currentList;
        var currentMinMaxObj;
        for (var i = 0; i < indicatorsDataLists.length; i++) {
            currentList = indicatorsDataLists[i];
            currentMinMaxObj = getMinMaxByList(currentList);
            if (currentMinMaxObj.min < min) {
                min = currentMinMaxObj.min;
            }
            if (currentMinMaxObj.max > max) {
                max = currentMinMaxObj.max;
            }
        }

        yAxis.updateMinMax(min, max);
    }

    function getMinMaxByList(indicatorDataList) {
        var min = indicatorDataList[indicatorDataList.length - 1];
        var max = min;
        var value;
        for (var i = 0; i < indicatorDataList.length - 1; i++) {
            value = indicatorDataList[i];
            if (value != undefined) {
                min = iMath.min(min, value);
                max = iMath.max(max, value);
            }
        }
        var retObj = {
            min: min,
            max: max
        };
        return retObj;
    }

    /***Standard Deviation****/
    function calculateMean(dataList, startIndex, endIndex) {
        var count = (endIndex + 1 - startIndex);
        var sum = 0;
        for (var i = startIndex; i <= endIndex; i++) {
            sum += dataList[i].close;
        }

        var mean = sum / count;
        return mean;
    }

    function calculateVariance(dataList, startIndex, endIndex) {
        var count = (endIndex + 1 - startIndex);

        var variance = 0;
        var mean = calculateMean(dataList, startIndex, endIndex);
        var close;
        for (var i = startIndex; i <= endIndex; i++) {
            close = dataList[i].close;
            variance += iMath.pow(close - mean, 2);
        }
        variance = variance / (count - 1);

        return variance;
    }

    function getStandardDeviation(dataList, startIndex, endIndex) {
        var variance = calculateVariance(dataList, startIndex, endIndex);
        var stdev = iMath.sqrt(variance);

        return stdev;
    }

    /***Data Objects Creation****/
    function createOverlayDataObject(paramData, lista) {
        var object = new IndicatorFullData(paramData, lista);
        return object;
    }

    function createExtraChartDataObject(paramData, data) {
        var object = new IndicatorFullData(paramData, data);
        return object;
    }

    /***Strings****/
    function getValueString(fullIndicatorData, index) {
        var retString;
        var data = fullIndicatorData.data;
        var types = IndicatorsUtil.TYPES;

        switch (fullIndicatorData.paramsData.type) {
            case types.SMA:
            case types.EMA:
                retString = getRegularString(data[0][index]);
                break;
            case types.MFI:
                retString = getRegularString(data[index]);
                break;
            case types.BB:
                retString = getBBString(data, index);
                break;
            case types.MACD:
                retString = getMACDString(data, index)
                break;
        }

        return retString;
    }

    function getRegularString(value) {
        var retString = "";
        if (value != undefined) {
            retString = formatNiceNumber(value);
        }
        return retString;
    }

    function getMACDString(lists, index) {
        var retStr = "";
        var sign = "";
        if (lists[2][index] > 0) {
            sign = "+";
        }
        if (lists[0][index] != undefined) {
            retStr = getRegularString(lists[0][index]);
            if (lists[2][index] != undefined) {
                retStr = retStr + " (" + sign + getRegularString(lists[2][index]) + ")"
            }
        }
        return retStr;
    }

    function getBBString(lists, index) {
        var retStr = "";
        if (lists[0][index] != undefined) {
            retStr = getRegularString(lists[1][index]) + " - " + getRegularString(lists[0][index]);
        }
        return retStr;
    }
}

IndicatorsUtil.getInstance = function () {
    if (!IndicatorsUtil.instance) {
        IndicatorsUtil.instance = new IndicatorsUtil();
    }
    return IndicatorsUtil.instance;
};

/**Global Data***/
function IndicatorsData(type, period, stdev, color, signal) {
    var me = this;
    this.period = period;
    this.type = type;
    this.stdev = stdev;
    this.color = color;
    if (!color) {
        this.color = "red";
    }

    this.slow = period;
    this.fast = stdev;
    this.signal = signal;

    this.getIsExtraChart = function () {
        return me.type > 2;
    }
}

function IndicatorFullData(paramsData, data) {
    this.paramsData = paramsData;
    this.prevData = data;
    this.data = data;

    if (!paramsData.getIsExtraChart()) {
        this.data = [];
        for (var i = 0; i < this.prevData.length; i++) {
            this.data[i] = this.prevData[i];
        }
    }
}

IndicatorsUtil.TYPES = {
    SMA: 0,
    EMA: 1,
    BB: 2,
    MFI: 3,
    MACD: 4
};

IndicatorsUtil.TYPES_TO_TEXT = {
    0: "Simple Moving Average (SMA)",
    1: "Exponential Moving Average (EMA)",
    2: "Bollinger Bands (BBANDS)",
    3: "Money Flow Index (MFI)",
    4: "Moving Average Convergence Divergence (MACD)"
};

IndicatorsUtil.TYPES_TO_SHORT_TEXT = {
    0: "SMA",
    1: "EMA",
    2: "BBANDS",
    3: "MFI",
    4: "MACD"
};