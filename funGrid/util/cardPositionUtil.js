/**
 * Created by avitzur on 9/24/2015.
 */
function CardPositionUtil() {
    var CELL_SIZE = 210;

    var columnCount;
    var cellWidth;
    var totalRowCount;

    var nextCardWidth = 2;
    var nextCardHeight = 2;
    var nextCardRow;
    var nextCardColumn;

    //Matrix
    this.setColumnCount = function (numInput) {
        columnCount = numInput;
    };

    this.setCellWidth = function (numInput) {
        cellWidth = numInput;
    };

    this.setNextCardSize = function (width, height) {
        nextCardWidth = width;
        nextCardHeight = height;
    };

    this.getCardByCell = function (matrix, column, row) {
        return getCardByCell(matrix, column, row);
    };

    this.getNextCell = function (column, row) {
        return getNextCell(column, row);
    };

    this.getPrevCell = function (column, row) {
        return getPrevCell(column, row);
    };

    this.insertCardToMatrix = function (matrix, cardObject) {
        insertCardToMatrix(matrix, cardObject);
    };

    this.createEmptyMatrix = function () {
        return createEmptyMatrix();
    };

    this.isCellOccupied = function (matrix, column, row) {
        return isCellOccupied(matrix, column, row);
    };

    this.copyMatrix = function (matrix) {
        return copyMatrix(matrix);
    };

    this.positionCardObject = function (card, prevCard, matrix) {
        positionCardObject(card, prevCard, matrix);
    };

    this.setColumnAndRow = function (card, prevCard, matrix) {
        setColumnAndRow(card, prevCard, matrix);
    };

    //Card List
    this.insertCardToList = function (cardObjectList, cardObject, index) {
        insertCardToList(cardObjectList, cardObject, index);
    };

    this.detachCardFromList = function (cardObjectList, index) {
        detachCardFromList(cardObjectList, index);
    };

    this.findIndexToInsertBefore = function (cardObjectList, column, row) {
        return findIndexToInsertBefore(cardObjectList, column, row);
    };

    this.shouldInsertBefore = function (overlappingCardObject, dragHandleX) {
        return shouldInsertBefore(overlappingCardObject, dragHandleX);
    };

    this.getCardIndex = function (cardObjectList, cardData) {
        return getCardIndex(cardObjectList, cardData);
    };

    this.getActualHeight = function (gridCellsMatrix, PAD_BETWEEN_CELLS, EXTRA_BOTTOM_PADDING) {
        return getActualHeight(gridCellsMatrix, PAD_BETWEEN_CELLS, EXTRA_BOTTOM_PADDING);
    };

    this.getNextCardRowAndColumn = function () {
        return [nextCardRow, nextCardColumn];
    };

    this.getRowAndColumn = function (mouseX, mouseY, gridCellsMatrix) {
        return getRowAndColumn(mouseX, mouseY, gridCellsMatrix);
    };

    /*Card List*/
    function shouldInsertBefore(overlappingCardObject, dragHandleX) { //Only in case the overlapping cell is in the bottom right quadrant, we insert after
        var overlappingCardX = overlappingCardObject.column * cellWidth;
        var overlappingCardWidth = overlappingCardObject.width * cellWidth;

        var isOnLeft = (dragHandleX <= overlappingCardX + overlappingCardWidth / 2); //We're on the left, than we should be before

        return isOnLeft;
    }

    //Find where should we push a component based on it's column/row  (where should it be in the ordered list, the index is the first entry that will shift right)
    function findIndexToInsertBefore(cardObjectList, column, row) {
        var card;
        var retIndex = cardObjectList.length;
        for (var i = 0; i < cardObjectList.length; i++) {
            card = cardObjectList[i];
            if ((card.row > row) || (card.row == row && card.column >= column)) {
                retIndex = i;
                break;
            }
        }

        //This means we're the last entry
        return retIndex;
    }

    function detachCardFromList(cardObjectList, index) {
        cardObjectList.splice(index, 1);
    }

    function insertCardToList(cardObjectList, cardObject, index) {
        cardObjectList.splice(index, 0, cardObject);
    }

    /*End.*/

    /*Grid Matrix*/
    function getCardByCell(matrix, column, row) {  //Return undefined if there's no component
        var component;
        if (column < matrix.length && row < matrix[column].length) {  //make sure we're still in the grid play area
            component = matrix[column][row];
        }
        return component;
    }

    function getNextCell(column, row) {   //returns [column, row]
        var cellArr;
        if (column < columnCount) {
            cellArr = [column + 1, row];
        } else {
            cellArr = [0, row + 1];
        }
        return cellArr;
    }

    function getPrevCell(column, row) {   //returns [column, row]
        var cellArr;
        if (column > 0) {
            cellArr = [column - 1, row];
        } else if (row > 0) {
            cellArr = [columnCount - 1, row - 1];
        } else {
            cellArr = [0, 0];
        }

        return cellArr;
    }

    function insertCardToMatrix(matrix, cardObject) {
        var column = cardObject.column;
        var row = cardObject.row;
        for (var i = column; i < column + cardObject.width; i++) {
            for (var j = row; j < row + cardObject.height; j++) {
                matrix[i][j] = cardObject;
            }
        }
    }

    function createEmptyMatrix() {
        var matrix = [];
        for (var i = 0; i < columnCount; i++) {
            matrix[i] = [];
        }
        return matrix;
    }

    function isCellOccupied(matrix, column, row) {
        return matrix[column][row] != undefined;
    }

    function copyMatrix(originalMatrix) {
        var copyMatrix = [];
        var newColumnArray;
        var originalColumnArray;

        for (var i = 0; i < originalMatrix.length; i++) {
            newColumnArray = [];
            originalColumnArray = originalMatrix[i];
            for (var j = 0; j < originalColumnArray.length; j++) {
                newColumnArray.push(originalColumnArray[j]);
            }
            copyMatrix.push(newColumnArray);
        }
        return copyMatrix;
    }

    function insertComponentMatrix(cardObject, matrix) {   //This is shit, must take in to account the size of the screen and stuff
        var column = cardObject.column;
        var row = cardObject.row;
        for (var i = column; i < column + cardObject.width; i++) {
            for (var j = row; j < row + cardObject.height; j++) {
                matrix[i][j] = cardObject;
            }
        }
    }

    //Check if the we can position the card beginning at a given cell (the cell is defined by row and column).
    //(Whether the top left cell of the card can be positioned in the given cell without overlapping previously positioned cards)
    function canFitComponentHere(matrix, card, column, row) {
        var width = card.width;
        var height = card.height;
        var canIt = true; //Lets assume we can fit and check if it's actually isn't
        //Verify there's enough columns left in the row
        if (column + width > columnCount) {
            canIt = false;
        } else {
            //Now verify the whole card fits
            for (var currentColumn = column; currentColumn < column + width; currentColumn++) {
                for (var currentRow = row; currentRow < row + height; currentRow++) {
                    if (isCellOccupied(matrix, currentColumn, currentRow)) {
                        canIt = false;
                        break;
                    }
                }
            }
        }
        return canIt;
    }

    //Update the row and column position of a card, according to the the position of the previous card, and the width/height
    function positionCardObject(card, prevCard, matrix) {
        setColumnAndRow(card, prevCard, matrix);
        insertComponentMatrix(card, matrix);
    }

    function setColumnAndRow(card, prevCard, matrix) {
        var width = card.width;
        var row;
        var column;
        if (prevCard) {
            row = prevCard.row;  //We always try to fit in the same row, and only if we can't we go to the next row
            column = prevCard.column + prevCard.width;
        } else {
            column = 0;
            row = 0;
        }

        while (!canFitComponentHere(matrix, card, column, row)) {
            if (column + 1 + width <= columnCount) { //There's space in the current row (at least for the top part of the card)
                column++;
            } else {
                column = 0;
                row++;
            }
        }
        card.column = column;
        card.row = row;
    }

    /*End.*/

    /**Layout calculations***/
    function getRowAndColumn(mouseX, mouseY, gridCellsMatrix) {
        var column = iMath.floor(mouseX / CELL_SIZE);
        column = iMath.min(column, gridCellsMatrix.length - 1);
        column = iMath.max(column, 0);

        var row = iMath.floor(mouseY / CELL_SIZE);
        row = iMath.min(row, totalRowCount - 1);
        row = iMath.max(row, 0);

        return [row, column];
    }

    function getActualHeight(gridCellsMatrix, PAD_BETWEEN_CELLS, EXTRA_BOTTOM_PADDING) {
        var currentHeight;
        var maxHeight = 0;
        var columnArray;
        var bottomCardOfColumn;
        var cardBottomRow;
        for (var column = 0; column < columnCount; column++) {
            columnArray = gridCellsMatrix[column];
            bottomCardOfColumn = columnArray[columnArray.length - 1];
            if (bottomCardOfColumn) {
                cardBottomRow = (bottomCardOfColumn.row + bottomCardOfColumn.height);
                currentHeight = cardBottomRow * cellWidth;
                if (currentHeight > maxHeight) {
                    maxHeight = currentHeight;
                    totalRowCount = cardBottomRow;
                }
            }
        }

        calculateNextCardPosition(gridCellsMatrix);
        cardBottomRow = (nextCardRow + nextCardHeight);
        currentHeight = cardBottomRow * cellWidth;
        if (currentHeight > maxHeight) {
            maxHeight = currentHeight;
            totalRowCount = cardBottomRow;
        }

        return maxHeight + 2 * PAD_BETWEEN_CELLS + EXTRA_BOTTOM_PADDING; //need extra padding in the bottom
    }

    function calculateNextCardPosition(gridCellsMatrix) {
        nextCardWidth = iMath.min(columnCount, nextCardWidth);
        var nextCardMock = {
            width: nextCardWidth,
            height: nextCardHeight
        };
        var actualLstCard = CardDataList[CardDataList.length - 1];
        setColumnAndRow(nextCardMock, actualLstCard, gridCellsMatrix);
        nextCardRow = nextCardMock.row;
        nextCardColumn = nextCardMock.column;
    }

    /**Layout calculations Ens.***/

    function getCardIndex(cardObjectList, cardDataObject) {
        return cardObjectList.indexOf(cardDataObject);
    }
}

CardPositionUtil.getInstance = function () {
    if (!CardPositionUtil.instance) {
        CardPositionUtil.instance = new CardPositionUtil();
    }

    return CardPositionUtil.instance;
};
