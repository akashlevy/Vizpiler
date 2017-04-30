requirejs.config({
	//By default load any module IDs from js/lib
	baseUrl: 'js',
	//except, if the module ID starts with "app",
	//load it from the js/app directory. paths
	//config is relative to the baseUrl, and
	//never includes a ".js" extension since
	//the paths config could be for a directory.
	paths: {
		d3: '../bower_components/d3/d3',
		"dot-checker": '../bower_components/graphviz-d3-renderer/dist/dot-checker',
		"layout-worker": '../bower_components/graphviz-d3-renderer/dist/layout-worker',
		worker: '../bower_components/requirejs-web-workers/src/worker',
		renderer: '../bower_components/graphviz-d3-renderer/dist/renderer'
	}
});

var lexereditor = CodeMirror.fromTextArea(lexercode,
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
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

function lexerCompile() {
    $.post("lexer", {"lexer": lexereditor.getValue()}, function(result) {
        if (result["code"] == 1)
            $("#LexerMessages").html("<b><p style=\"font-size:20px\">Compilation failed!</p></b>" + result["stderr"] + "<br>" + result["stdout"]);
        else {
            $("#LexerMessages").html("<b><p style=\"font-size:20px\">Success!</p></b>Go to the next tab to see the FSM.");
            var g = graphlibDot.read(result["stdout"])
            
            //image = Viz(result["stdout"], { format: "png-image-element" });
            //$("#LexerVisual").prepend(image);

            require(["renderer"], function (renderer) {
                dotSource = result["stdout"];
                // initialize svg stage. Have to get a return value from renderer.init 
                //   to properly reset the image.
                zoomFunc = renderer.init({element:"#LexerVisual", extend:[0.1, 10]});

                // update stage with new dot source
                renderer.render(dotSource);
            });  
        }
    });
}