function setTextColor() {
	var color = document.getElementById("color_picker").value;
	var textBlocks = document.getElementsByClassName("text");
	for (var i = 0; i < textBlocks.length; i++) {
		textBlocks[i].style.color = color;
	}
}

function setFont() {
	var font = document.getElementById("font_picker").value;
        var textBlocks = document.getElementsByClassName("text");
        for (var i = 0; i < textBlocks.length; i++) {
                textBlocks[i].style.fontFamily = font;
        }

}

function setup() {
	document.getElementById("color_picker").onchange
		= function() {setTextColor();};

	document.getElementById("font_picker").onchange
		= function() {setFont()};
}
