var panZoomLex;

// Define properties of CodeMirror editors
var lexereditor = CodeMirror.fromTextArea(lexercode,
{
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    mode: "text/x-c++src",
    theme: "dracula"
});
var lexerinputeditor = CodeMirror.fromTextArea(lexerinput,
{
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    mode: "text/x-c++src",
    theme: "dracula"
});
var parsereditor = CodeMirror.fromTextArea(parsercode,
{
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    mode: "text/x-c++src",
    theme: "dracula"
});

// Show and hide tabs
function openTab(evt, tabName) {
    // Make tabs visible/invisible
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tabcontent = document.getElementsByClassName("codecontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    // Refresh CodeMirror displays
    lexereditor.refresh();
    parsereditor.refresh();
    lexerinputeditor.refresh();

    // Refresh graphs and remove titles
    try { panZoomLex = svgPanZoom('#LexerVisualGraph > svg', {minZoom: 0.1, maxZoom: 1}); } catch(err){}
    try { panZoomLex = svgPanZoom('#ParserVisualGraph > svg', {minZoom: 0.1, maxZoom: 1}); } catch(err){}
    $("g title").remove();
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

// Variables for the lex graph
var lexGraph;
var lexI;
var lexText;
var lexTokens;
var lexState;
var lexNextState;

// Handle compiled code
function lexerCompile() {
    // Show "Compiling..."
    $("#LexerMessages").html("<b><p style=\"font-size:20px\">Compiling...</p></b>");

    // Make request to server
    $.post("lexer", {"lexer": lexereditor.getValue()}, function(result) {
        // If failure, display failure message
        if (result["code"] != 0)
            $("#LexerMessages").html("<b><p style=\"font-size:20px\">Compilation failed!</p></b>" + result["stderr"] + "<br>" + result["stdout"]);
        // If success, display "Success!" and render/process graph
        else {
            $("#LexerMessages").html("<b><p style=\"font-size:20px\">Success!</p></b>Go to the next tab to see the FSM.");
            lexGraph = graphlibDot.read(result["stdout"])
            image = Viz(result["stdout"]);
            $("#LexerVisualGraph").html(image);
            $("#startLexBut").attr("disabled", false);
        }
    });
}

// Start lexical analyzer in browser
function startLexing() {
    // Change start button to stop button
    $startbut = $("#startLexBut");
    $startbut.text('Stop Lexing');
    $startbut.attr("onclick", "stopLexing();");
        
    // Enable step buttons
    $("#stepLexBut").attr("disabled", false);
    $("#stepEndLexBut").attr("disabled", false);

    // Initialize lexing variables
    lexI = -1;
    lexText = lexerinputeditor.getValue();
    lexTokens = [];
    lexState = "init";
    lexNextState = lexGraph.outEdges(lexState)[0].w;

    // Do special stepLexer step
    stepLexer(true);
}

// Stop lexical analyzer
function stopLexing() {
    // Change stop button to start button
    $startbut = $("#startLexBut");
    $startbut.text("Start Lexing");
    $startbut.attr("onclick", "startLexing();");

    // Disable step buttons
    $("#stepLexBut").attr("disabled", true);
    $("#stepEndLexBut").attr("disabled", true);

    // Clear text
    $("#lexingOutput").html("");
    $("#lexingCodeOutput").text("");

    // Reset graph to original
    $("#LexerVisualGraph").find(".node").find("ellipse").attr("fill", "none");
}

// Run the lexer on one character
function stepLexer(graphit) {
    // If done, don't do anything
    if (lexState == "error" || lexI == lexText.length) return;

    // Increment the character processed and update the state
    lexI++;
    lexState = lexNextState;

    // Highlight the graph
    if (graphit) {
        $("#LexerVisualGraph").find(".node").find("ellipse").attr("fill", "none");
        $("#LexerVisualGraph").find(".node:contains('" + lexState + "')").find("ellipse").attr("fill", "red");
    }

    // Compute next state
    var nextchar = lexText[lexI];
    lexNextState = null;
    var outedges = lexGraph.outEdges(lexState);
    for (i in outedges) {
        edgeLabel = lexGraph.edge(outedges[i]).label;
        var re = new RegExp('[' + eval("'" + edgeLabel.replace("'","\\'") + "'") + ']');
        if (re.exec(nextchar)) {
            lexNextState = outedges[i].w;
            break;
        }
    }

    // Output the relevant information
    if (lexI >= lexText.length) curchar = "EOF";
    else curchar = lexText[lexI];
    htmlOut = "<b>Current character:</b> '" + curchar + "'<br>\n";

    // If no next state, update state
    if (lexNextState == null) {
        if (lexGraph.node(lexState).peripheries == 2) {
            lexTokens.push(lexGraph.node(lexState).label);
            lexNextState = lexGraph.outEdges("init")[0].w;
            lexI--;
            nextStateStr = "";
        }
        // If state is bad, signal error
        else {
            lexTokens.push("ERROR");
            lexNextState = "error";
            nextStateStr = "ERROR";
        }
    }
    else nextStateStr = lexGraph.node(lexNextState).label;

    // Output the rest of the relevant information
    htmlOut += "<b>Current state:</b> " + lexGraph.node(lexState).label + "<br>\n";
    htmlOut += "<b>Next state:</b> " + nextStateStr + "<br>\n";
    htmlOut += "<b>Tokens out:</b> " + lexTokens.join(" ") + "<br>\n";
    htmlOut += "<b>Code:</b><br>\n";
    $("#lexingOutput").html(htmlOut);
    $("#lexingCodeOutput").text(lexText);
}

// Run step lexer to the end of the string
function stepEndLexer() {
    while (lexI < lexText.length) stepLexer(false);
}

// Handle compiled code
function parserCompile() {
    // Show "Compiling..."
    $("#ParserMessages").html("<b><p style=\"font-size:20px\">Compiling...</p></b>");

    // Make request to server
    $.post("parser", {"parser": parsereditor.getValue()}, function(result) {
        // If failure, display failure message
        if (result["code"] != 0)
            $("#ParserMessages").html("<b><p style=\"font-size:20px\">Compilation failed!</p></b>" + result["stderr"] + "<br>" + result["stdout"]);
        // If success, display "Success!" and render/process graph
        else {
            $("#ParserMessages").html("<b><p style=\"font-size:20px\">Success!</p></b>Go to the next tab to see the FSM.");
            parseGraph = graphlibDot.read(result["stdout"])
            image = Viz(result["stdout"]);
            $("#ParserVisualGraph").html(image);
        }
    });
}