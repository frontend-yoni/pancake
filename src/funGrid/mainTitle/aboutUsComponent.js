/**
 * Created by avitzur on 12/10/2015.
 */
/**
 * Created by mizrasha on 10/12/2015.
 */
function AboutUsComponent() {

    var COMPANY_NAME = "Pancake Finance";
    var PRODUCT_VERSION = "(beta)";
    var ABOUT_US_TEXT = "Drag and drop, stretch and zoom!";
    var MORE_TEXT = "Making finance fun for everyone.";
    var CONTACT_MAIL = "office@pancake-finance.com";

    var COMPONENT_WIDTH = 300;
    var COMPONENT_HEIGHT = 210;
    var COMPANY_NAME_FONT_SIZE = 20;
    var P_MARGIN_TOP_AND_BOTTOM = 16;

    var externalDiv;
    var closeButton;

    //Util
    var papaComponent;

    this.setExternalDiv = function (externalDivInput) {
        externalDiv = externalDivInput;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    function drawComponent() {
        createAboutUsInformation();
    }

    this.setPapaComponent = function (componentObj) {
        papaComponent = componentObj;
    };

    function createAboutUsInformation() {
        var aboutUsDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: 0,
                width: COMPONENT_WIDTH + "px",
                height: COMPONENT_HEIGHT + "px",
                "text-align": "center",
                "font-weight": "600",
                "font-family": "arial",
                "box-shadow": "0 1px 20px 0 rgba(0,0,0,0.15), inset 0 -1px 0 0 rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.5), 0 0 0 1px rgba(0,0,0,0.16)",
                "padding-left": 10 + "px",
                "padding-right": 10 + "px",
                "padding-top": 15 + "px",
                "box-sizing": "border-box",
                "border-radius": 6 + "px",
                color: "#FFFFFF",
                "text-shadow": "rgba(0,0,0,0.15) 0 1px 0",
                background: "#00cdff"
            });

        var closeButton = aboutUsDiv.append("p")
            .style({
                position: "absolute",
                right: 7 + "px",
                top: 1 + "px",
                "font-size": 16 + "px",
                cursor: "pointer",
                color: "black",
                margin: 0,
                "font-family": "sans-serif"
            })
            .text("X")
            .on("click", papaComponent.hideAboutPopup);

        var pancake = aboutUsDiv.append("p")
            .style({
                "font-size": COMPANY_NAME_FONT_SIZE + "px",
                "font-weight": "bold",
                margin: 0,
                "margin-bottom": 1 + "px",
                "color": "#FFFFFF",
                "text-decoration": "underline"
            })
            .text(COMPANY_NAME);

        var beta = aboutUsDiv.append("p")
            .style({
                "margin-top": 0 + "px",
                "font-weight": "500",
                "color": "#EEEEEE",
                "margin-bottom": P_MARGIN_TOP_AND_BOTTOM + "px"
            })
            .text(PRODUCT_VERSION);

        var inspirationalText = aboutUsDiv.append("p")
            .style({
                "font-family": "sans-serif",
                "font-size": 17 + "px",
                "margin-top": P_MARGIN_TOP_AND_BOTTOM + "px",
                "margin-bottom": P_MARGIN_TOP_AND_BOTTOM / 2 + "px"
            })
            .text(ABOUT_US_TEXT);

        var moreText = aboutUsDiv.append("p")
            .style({
                "font-family": "sans-serif",
                "font-size": 17 + "px",
                "margin-top": P_MARGIN_TOP_AND_BOTTOM / 2 + "px",
                "margin-bottom": P_MARGIN_TOP_AND_BOTTOM + "px"
            })
            .text(MORE_TEXT);

        var mailDiv = aboutUsDiv.append("div")
            .style({
                "margin-top": P_MARGIN_TOP_AND_BOTTOM + "px",
                "margin-bottom": P_MARGIN_TOP_AND_BOTTOM + "px"
            });

        mailDiv.append("a")
            .attr({
                href: "mailto:" + CONTACT_MAIL
            })
            .style({
                color: "#3333FF"
            })
            .text(CONTACT_MAIL)
            .classed("pancakeMailLink", true);


        if (!+UserID) {
            var startFreshButton = aboutUsDiv.append("p")
                .style({
                    position: "relative",
                    bottom: 5 + "px",
                    margin: "auto",
                    height: 32 + "px",
                    "line-height": 32 + "px",
                    "padding-left": 5 + "px",
                    "padding-right": 5 + "px",
                    "border-radius": 2 + "px",
                    "font-family": "Arial",
                    "box-sizing": "border-box",
                    width: 120 + "px",
                    color: "#666666",
                    cursor: "pointer"
                })
                .classed("pancakeButton", true)
                .attr("title", "Remove All Items")
                .on("click", onStartFreshClick)
                .text("Get Started!")
        }


    }

    function onStartFreshClick() {
        papaComponent.hideAboutPopup();
        requestAnimationFrame(papaComponent.onStartFresh);
    }
}