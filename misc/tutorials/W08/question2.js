function setup() {
	setupColors();
	setupFonts();
}

function setupColors() {
	// link the color picker to the text
	var colorPicker = document.getElementById("color_picker")
	colorPicker.onchange = function() {
		var color = colorPicker.value;
		setTextColor(color)
	};

	// load user's previous color preferences from local storage
	var initialColor = localStorage.getItem("color");
	colorPicker.value = initialColor
	setTextColor(initialColor);	
}

function setupFonts() {
	// link the font selector to the text
	var fontPicker = document.getElementById("font_picker")
	fontPicker.onchange = function() {
		var font = fontPicker.value;
		setFont(font)
	};
	
	// load user's previous color preferences from local storage
	var initialFont = localStorage.getItem("font");
	fontPicker.value = initialFont
	setFont(initialFont);	
}

function setTextColor(color) {
	var textBlocks = document.getElementsByClassName("text");
	for (var i = 0; i < textBlocks.length; i++) {
		textBlocks[i].style.color = color;
	}
}

function setFont(font) {
        var textBlocks = document.getElementsByClassName("text");
        for (var i = 0; i < textBlocks.length; i++) {
                textBlocks[i].style.fontFamily = font;
        }

}



function cleanup() {
	if (!document.getElementById("storage_box").checked) {
		localStorage.setItem("color", document.getElementById("color_picker").value);
		localStorage.setItem("font", document.getElementById("font_picker").value);
	} else {
		localStorage.clear();
	}
}
