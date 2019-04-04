/**
 * Created by avitzur on 2/18/2016.
 */
/**
 * Created by ReznikFamily on 16/12/2015.
 */
function CompareDataManager() {

    this.getComparableDataLists = function (dataLists) { //Returns an array with 2 entries. [dataList1, dataList2]
        return getComparableDataLists(dataLists);
    };

    this.alignDataListsByEditing = function (dataLists) {
        return alignDataListsByEditing(dataLists);
    };

    /**Functions**/
    function getComparableDataLists(dataLists) {
        var compareDataLists = [];
        dataLists = alignDataListsByEditing(dataLists);

        var baseIndex = calculateBaseLineIndex(dataLists);

        var list;
        for (var i=0;i<dataLists.length;i++){
            list = dataLists[i];
            list = getComparableDataList(list, baseIndex);
            compareDataLists.push(list);
        }

        return compareDataLists;
    }

    function getComparableDataList(dataList, baseIndex) {
        var comparableDataList = [];
        var baseValue = dataList[baseIndex].close;
        var currentData;
        var currentValue;
        var comparableData;
        for (var i = 0; i < dataList.length; i++) {
            currentData = dataList[i];
            comparableData = new ComparableDataPoint();
            currentValue = currentData.close;
            if (currentData.close != undefined) {
                comparableData.close = calculateChangePercentage(baseValue, currentValue);
                comparableData.date = new Date(currentData.date); //Maybe don't need new Date?
            } else {
                comparableData.close = undefined;
            }
            comparableDataList.push(comparableData);
        }

        return comparableDataList;
    }

    function alignDataListsByEditing(dataLists) {
        var editedLists = [];
        var mainList = dataLists[0];
        editedLists.push(mainList);

        var editedList;
        for (var i = 1; i < dataLists.length; i++) {
            editedList = editSecondList(mainList, dataLists[i]);
            editedLists.push(editedList);
        }

        return editedLists;
    }

    /**Util**/
    function editSecondList(dataList1, dataList2) {
        var startIndex2 = dataList2.length - dataList1.length;
        if (startIndex2 > 0) { //secondary is longer then main
            dataList2 = dataList2.slice(startIndex2, dataList2.length);
        } else { //main is longer then secondary
            while (startIndex2 < 0) {
                addAsFirstToArray(dataList2, createEmptyData());
                startIndex2++;
            }
        }

        return dataList2;
    }

    function calculateBaseLineIndex(dataLists) {
        var baseIndex = 0;
        var currentBase;
        for (var i = 1; i < dataLists.length; i++) {
            currentBase = getSingleBaseLineIndex(dataLists[i]);
            baseIndex = iMath.max(baseIndex, currentBase);
        }
        baseIndex = iMath.min(dataLists[0].length - 1, baseIndex);
        return baseIndex;
    }

    function getSingleBaseLineIndex(dataList) {
        var baseIndex = 0;
        while (baseIndex < dataList.length && dataList[baseIndex].close == undefined) {
            baseIndex++;
        }

        if (baseIndex == dataList.length){
            baseIndex = 0;
        }

        return baseIndex;
    }

    function createEmptyData() {
        var emptyData = new ComparableDataPoint();
        emptyData.close = undefined;
        return emptyData;
    }
}

function ComparableDataPoint() {
    this.close;
    this.date;
}

CompareDataManager.getInstance = function () {
    if (!CompareDataManager.instance) {
        CompareDataManager.instance = new CompareDataManager();
    }
    return CompareDataManager.instance;
};