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

function openTab(evt, tabName) {
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

    lexereditor.refresh();
    parsereditor.refresh();
    lexerinputeditor.refresh();
    try { svgPanZoom('svg', {minZoom: 0.1, maxZoom: 1}); } catch(err){}
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

function lexerCompile() {
    $("#LexerMessages").html("<b><p style=\"font-size:20px\">Compiling...</p></b>");
    $.post("lexer", {"lexer": lexereditor.getValue()}, function(result) {
        if (result["code"] == 1)
            $("#LexerMessages").html("<b><p style=\"font-size:20px\">Compilation failed!</p></b>" + result["stderr"] + "<br>" + result["stdout"]);
        else {
            $("#LexerMessages").html("<b><p style=\"font-size:20px\">Success!</p></b>Go to the next tab to see the FSM.");
            var g = graphlibDot.read(result["stdout"])

            image = Viz(result["stdout"]);
            $("#LexerVisualGraph").html(image);
        }
    });
}
