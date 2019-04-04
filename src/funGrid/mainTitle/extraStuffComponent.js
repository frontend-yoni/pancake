/**
 * Created by yoni_ on 1/30/2016.
 */
function ExtraStuffComponent() {
    /**Constants****/
    var COMPONENT_WIDTH = 220;

    /**Externally Set****/
    var externalDiv;
    //Util
    var papaTitleComponent;

    /**Internally Set****/
    //Structure
    var papaDiv;
    //(logout)
    var logSectionDiv;
    //(Portfolio)
    var portfolioSectionDiv;
    var portfolioValueP;
    var totalChangeP;
    var todayChangeP;
    //Add Summary Card
    var addSummarySection;

    //Util
    var shapeUtil = ShapesUtil.getInstance();


    /**Public Function****/
    this.setExternalDiv = function (externalDivInput) {
        externalDiv = externalDivInput;
    };

    this.setPapaComponent = function (papaComponent) {
        papaTitleComponent = papaComponent;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.updateByNewData = function(){
        updatePortfolioText();
    };

    /**Construction****/
    function drawComponent() {
        performConstruct();
    }

    function performConstruct() {
        papaDiv = externalDiv.append("div")
            .style({
                position: "relative",
                padding: 5 + "px",
                width: COMPONENT_WIDTH + "px",
                cursor: "default",
                "box-shadow": "rgba(0,0,0,0.5) 1px 1px 1px",
                height: "100%",
                color: "#FFFFFF",
                background: "rgba(0, 0, 0, 0.8)"
            });

        if (+UserID) {
            createLogoutSection();
        }else{
            createSignInSection();
        }

        createPortfolioSection();

        createAddSummarySection();
    }

    function createSignInSection() {
        logSectionDiv = papaDiv.append("div")
            .style({
                "margin-top": 5 + "px",
                "margin-bottom": 5 + "px",
                "padding-bottom": 5 + "px",
                "text-align": "center",
                "border-bottom": "1px solid #999999"
            });

        var signInButton = logSectionDiv.append("div")
            .style({
                position: "relative",
                width: 70 + "px",
                "text-align": "center",
                margin: "auto",
                "margin-bottom": 5 + "px",
                "font-size": 14 + "px",
                padding: 5 + "px",
                "border-radius": 2 + "px",
                "font-family": "Arial",
                "box-sizing": "border-box",
                cursor: "pointer"
            })
            .classed("blueButtonClass", true)
            .on("click", onSignInClick)
            .text("Sign In");
    }

    /**Log Out***/
    function createLogoutSection() {
        logSectionDiv = papaDiv.append("div")
            .style({
                "margin-top": 5 + "px",
                "margin-bottom": 5 + "px",
                "padding-bottom": 5 + "px",
                "border-bottom": "1px solid #999999"
            });
        var logoutButton = logSectionDiv.append("p")
            .style({
                "text-align": "center",
                color: "#81D4FA",
                margin: 0,
                "text-decoration": "underline",
                cursor: "pointer"
            })
            .text("Sign Out")
            .on("click", onLogOutClick);
    }

    /**Portfolio***/
    function createPortfolioSection() {
        portfolioSectionDiv = papaDiv.append("div")
            .style({
                "margin-top": 5 + "px",
                "margin-bottom": 5 + "px",
                "padding-bottom": 5 + "px",
                color: "#cccccc",
                "border-bottom": "1px solid #999999"
            });

        var mainTitle = portfolioSectionDiv.append("p")
            .style({
                margin: 0,
                "font-size": 14 + "px"
            })
            .text("Total Value");

        portfolioValueP = portfolioSectionDiv.append("p")
            .style({
                margin: 0,
                "margin-top": 5 + "px",
                "margin-bottom": 5 + "px",
                color: "#ffffff",
                "font-weight": "bold"
            })
            .text("Loading...");

        var totalChangeTitle = portfolioSectionDiv.append("p")
            .style({
                margin: 0,
                "font-size": 14 + "px"
            })
            .text("Total Gain");

        totalChangeP = portfolioSectionDiv.append("p")
            .style({
                margin: 0,
                "font-size": 14 + "px",
                "margin-top": 5 + "px",
                "margin-bottom": 5 + "px",
                "font-weight": "bold"
            })
            .text("Loading...");

        var todayChangeTitle = portfolioSectionDiv.append("p")
            .style({
                margin: 0,
                "font-size": 14 + "px"
            })
            .text("Today Change");

        todayChangeP = portfolioSectionDiv.append("p")
            .style({
                margin: 0,
                "font-size": 14 + "px",
                "margin-top": 5 + "px",
                "margin-bottom": 5 + "px",
                "font-weight": "bold"
            })
            .text("Loading...");

        updatePortfolioText();
    }

    /**Add Summary Card***/
    function createAddSummarySection() {
        var iconSize = 20;
        addSummarySection = papaDiv.append("div")
            .style({
                "margin-top": 5 + "px",
                "margin-bottom": 5 + "px",
                "padding-bottom": 10 + "px",
                "padding-top": 5 + "px",
                "border-bottom": "1px solid #999999"
            });

        var button = addSummarySection.append("div")
            .style({
                position: "relative",
                width: 180 + "px",
                height: 32 + "px",
                "border-radius": 5 + "px",
                "text-align": "center",
                margin: "auto"
            })
            .on("click", onAddSummaryCardClick)
            .classed("pancakeButton", true);

        var pillar = button.append("div")
            .style({
                display: "inline-block",
                height: "100%",
                width: 0,
                "vertical-align": "middle"
            });

        var icon = button.append("div")
            .style({
                display: "inline-block",
                width: iconSize + "px",
                height: iconSize + "px",
                "vertical-align": "middle",
                "margin-left": 5 + "px",
                "margin-right": 5 + "px",
                background: "none"
            });

        shapeUtil.createPlusSign(icon, iconSize, iconSize, "#666666", 2);

        var buttonP = button.append("p")
            .style({
                display: "inline-block",
                "vertical-align": "middle",
                margin: 0,
                top: 4 + "px",
                "font-size": 14 + "px",
                color: "black"
            })
            .text("Add Summary Card");
    }

    /***Update UI***/
    function updatePortfolioText() {
        var userSummary = UserDBData.summary;
        if (userSummary && userSummary.totalValue >= 0){
            var totalValueText = formatNiceNumber(userSummary.totalValue);
            var totalChangeText = concatChangeAndPercentage(userSummary.totalGain, userSummary.totalGainPercentage);
            var todayChangeText = concatChangeAndPercentage(userSummary.todayChange, userSummary.todayChangePercentage);

            todayChangeP.text(todayChangeText);
            totalChangeP.text(totalChangeText);
            portfolioValueP.text(totalValueText);

            var todayColor = getValueTextColorDarkBG(userSummary.todayChangePercentage, 0);
            var totalColor = getValueTextColorDarkBG(userSummary.totalGainPercentage, 0);

            todayChangeP.style("color", todayColor);
            totalChangeP.style("color", totalColor);
        }
    }

    /**Calculations****/


    /**Event listener******/
    function onLogOutClick(){
        logout();
    }

    function onSignInClick(){
        papaTitleComponent.onSignInClick();
    }

    function onAddSummaryCardClick(){
        papaTitleComponent.addSummaryCard();
    }
}

ExtraStuffComponent.getInstance = function (papaComponent) {
    if (!ExtraStuffComponent.instance) {
        ExtraStuffComponent.instance = new ExtraStuffComponent(papaComponent);
    }
    return ExtraStuffComponent.instance;
};