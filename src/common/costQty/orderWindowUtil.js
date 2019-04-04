/**
 * Created by avitzur on 5/1/2016.
 */
function OrderWindowUtil() {
    var me = this;
    /***CONSTANTS***/
    var IS_MOUSE_DOWN_IN_WINDOW = "isMouseDownInOrderWindow";
    //Layout
    var WINDOW_WIDTH = 320;
    var WINDOW_HEIGHT = 320;
    var OPEN_ICON_SIZE = 16;
    var SCREEN_PAD = 30;

    var me = this;

    /***Internally Set****/
    //Structure
    var windowDiv;
    var body;
    //State
    var isOpen;
    //Data
    var userStockData;
    //Util
    var orderComponent = new OrderComponent();
    //Layout
    var screenWidth;
    var screenHeight;

    /***Public Functions****/
    this.openWindow = function (symbol, clientX, clientY) {
        openWindow(symbol, clientX, clientY);
    };

    this.closeWindow = function () {
        closeWindow();
    };

    this.executeOrder = function(qty, price){
        closeWindow();

        userStockData.cost = price;
        userStockData.qty = qty;

        updatePortfolioDataGlobal(userStockData.symbol);
        informActionToSave();
    };

    this.drawComponent = function () {
        drawComponent();
    };

    //Main functions
    function drawComponent() {
        //Make sure there's only one instance of the blocking div
        if (!UsefulUIUtil.windowDiv) {
            body = d3.select("body");
            windowDiv = body.append("div")
                .style({
                    position: "absolute",
                    width: WINDOW_WIDTH + "px",
                    height: WINDOW_HEIGHT + "px",
                    background: "white",
                    border: "1px solid #333333",
                    "box-shadow": "rgba(0,0,0,0.5) 0 0 5px 5px",
                    "z-index": UsefulUIUtil.blockingDivZIndex - 1
                })
                .attr("name", "OrderWindowDiv")
                .on("mousedown", onInnerMouseDown);

            orderComponent.setExternalDiv(windowDiv);
            orderComponent.setPapaComponent(me);

            closeWindow();
            UsefulUIUtil.windowDiv = windowDiv;
        }
    }

    function openWindow(symbol, clientX, clientY) {
        userStockData = getUserDataBySymbolGlobal(symbol);
        if (!isOpen) {
            attachEventToBody();
            
            drawComponent();
            windowDiv.style({
                "display": ""
            });

            var stockData = getStockDataBySymbolGlobal(symbol);
            orderComponent.setStockData(stockData);
            orderComponent.drawComponent();

            setPosition(clientX, clientY);

            isOpen = true;
        }

    }

    function closeWindow() {
        if (isOpen) {
            detachEventToBody();
            if (windowDiv) {
                windowDiv.style("display", "none");
            }

            isOpen = false;
        }
    }
    
    /**Event Management***/
    function attachEventToBody(){
        body.on("mousedown.OrderWindowUtil", onBodyMouseDown);
    }

    function detachEventToBody(){
        body.on("mousedown.OrderWindowUtil", null);
    }

    /**Positioning****/
    function setPosition(clientX, clientY) {
        screenWidth = window.innerWidth - SCREEN_PAD;
        screenHeight = window.innerHeight - SCREEN_PAD;

        var top = clientY + OPEN_ICON_SIZE;
        var left = clientX - WINDOW_WIDTH / 2;

        if (top + WINDOW_HEIGHT > screenHeight) { //if too low, position on top
            top = clientY - OPEN_ICON_SIZE - WINDOW_HEIGHT;
        }
        left = iMath.min(screenWidth - WINDOW_WIDTH, left);
        left = iMath.max(SCREEN_PAD, left);

        windowDiv.style({
            left: left + "px",
            top: top + "px"
        });
    }

    /**Event Listeners****/
    function onBodyMouseDown() {
        if (!d3.event[IS_MOUSE_DOWN_IN_WINDOW]){
            closeWindow();
        }
    }

    function onInnerMouseDown(){
        d3.event[IS_MOUSE_DOWN_IN_WINDOW] = true;
    }
}


OrderWindowUtil.getInstance = function () {
    if (!OrderWindowUtil.instance) {
        OrderWindowUtil.instance = new OrderWindowUtil();
    }

    return OrderWindowUtil.instance;
};