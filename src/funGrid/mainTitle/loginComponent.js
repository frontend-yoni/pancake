/**
 * Created by mizrasha on 21/12/2015.
 */
function LoginComponent() {

    var BUTTON_WIDTH = 206;
    var BUTTON_HEIGHT = 38;
    var BUTTON_BORDER_RADIUS = 5;
    var WINDOW_PADDING = 20;
    var PADDING_IN_BUTTON = 10;

    var BUTTON_DATA = [
        {url: "/auth/yahoo", text: "Sign in Using Yahoo!", backgroundColor: " #500095", marginBottom: 10},
        {url: "/auth/google", text: "Sign in Using Google", backgroundColor: "#ec4a56", marginBottom: 10},
        {url: "/auth/facebook", text: "Sign in Using Facebook", backgroundColor: "#306ba6", marginBottom: 10},
        {url: "/auth/twitter", text: "Sign in Using Twitter", backgroundColor: " #55acee", marginBottom: 10},
    ];

    var externalDiv;

    this.setExternalDiv = function (externalDivInput) {
        externalDiv = externalDivInput;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    function drawComponent() {
        applyStyleToPapa();
        createLoginButtons();
    }

    function applyStyleToPapa() {
        externalDiv.style({
            padding: WINDOW_PADDING + "px",
            border: "5px solid peachpuff",
            "box-shadow": "rgba(0,0,0,0.5) 3px 4px 2px",
            background: "rgba(230,230,230,0.9)"
        }).classed("loginButtons", true);
    }

    function createLoginButtons() {
        var buttonDiv;
        for (var i = 0; i < BUTTON_DATA.length; i++) {
            var buttonData = BUTTON_DATA[i];
            buttonDiv = createLoginButton(buttonData);
        }
    }

    function createLoginButton(buttonData) {
        var buttonA = externalDiv.append("a")
            .attr({
                href: buttonData.url
            })
            .style({
                "text-decoration": "none"
            });
        var buttonDiv = buttonA.append("div")
            .style({
                position: "relative",
                height: BUTTON_HEIGHT + "px",
                width: BUTTON_WIDTH + "px",
                border: "1px solid rgb(204, 204, 204)",
                color: "rgb(102, 102, 102)",
                "border-radius": BUTTON_BORDER_RADIUS + "px",
                cursor: "pointer",
                "box-sizing": "border-box",
                background: buttonData.backgroundColor,
                "margin-bottom": buttonData.marginBottom  + "px"
            })
            .classed("loginButtonClass", true);
        buttonDiv.append("p")
            .style({
                "font-weight": "bold",
                margin: "0px",
                width: "100%",
                "padding": PADDING_IN_BUTTON + "px",
                color: "white"
            })
            .text(buttonData.text);

        return buttonDiv;
    }
}