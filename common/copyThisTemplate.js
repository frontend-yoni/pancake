/**
 * Created by yoni_ on 2/5/2016.
 */
function CoptyThisTemplate() {
    var me = this;
    /***CONSTANTS***/

    /***Externally Set****/
    //Structure
    var externalDiv;
    //Util
    var papaComponent;

    /***Internally Set****/

    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.drawComponent = function(){
        drawComponent();
    };

    this.redraw = function(){
        redraw();
    };

    this.setPapaComponent = function (papaComponentI) {
        papaComponent = papaComponentI;
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {

    }

    /**Draw*****/
    function redraw() {

    }
}