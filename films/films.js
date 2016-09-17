var headers = ["Title", "Year", "Rated", "Released", "Runtime", "Genre", "Director", "Writer", "Actors", "Plot", "Language", "Country", "Awards", "Poster", "Metascore", "imdbRating", "imdbVotes", "imdbID", "Type", "tomatoMeter", "tomatoImage", "tomatoRating", "tomatoReviews", "tomatoFresh", "tomatoRotten ", "tomatoConsensus", "tomatoUserMeter", "tomatoUserRating", "tomatoUserReviews", "tomatoURL", "DVD", "BoxOffice", "Production", "Website", "View Order", "My Rating"]
var ordered_headers = ["View Order", "Title", "Director", "Year", "Released", "Runtime", "Genre", "Writer", "Actors", "Plot", "Rated", "Language", "Country", "Awards", "DVD", "BoxOffice", "Production", "imdbVotes", "imdbID", "Type", "tomatoMeter", "tomatoImage", "tomatoReviews", "tomatoFresh", "tomatoRotten ", "tomatoConsensus", "tomatoUserMeter", "tomatoUserRating", "tomatoUserReviews", "tomatoURL", "Website", "Poster", "Metascore", "imdbRating", "tomatoRating", "My Rating"]
var loading = 2;

$(document).ready(function () {
    drawTable();
    searchBox = $("#movie_table_filter").children().children();
    searchBox.addClass("form-control");
    //$(".pre-outer").fadeOut("slow");
});

function drawSearchBox() {
	width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    inHeader = $("#header").find("#movie_table_filter").length == 1;

	if (width > 750 && !inHeader)
    	$("#movie_table_filter").appendTo("#header");
	else if (width <= 750 && inHeader)
    	$("#movie_table_filter").prependTo("#movie_table_wrapper");
}

function drawTable() {
    $('#movie_table').dataTable({
		order: [[ordered_headers.indexOf("View Order"), "desc"]],
        pageResize: true,
        bLengthChange: false,
		responsive: {
        	details: {
				display: $.fn.dataTable.Responsive.display.modal( {
                	header: function ( row ) {
                    	return row.data()[1];
                	}
            	} ),
                renderer: function ( api, rowIdx, columns ) {
                    var div = $('<div/>');
                    var img_wrapper = $('<div/>');
                    img_wrapper.addClass("modal-image-wrapper");
                    var img = $('<img />', {src : getColumnByTitle(columns, "Poster").data});
                    img_wrapper.append(img);
                    div.append(img_wrapper);

                    var text_wrapper = $('<div/>');
                    text_wrapper.addClass('modal-text-wrapper');
                    var data = $.map( columns, function ( col, i ) {
                        if (["View Order", "Type", "tomatoURL", "Website", "Poster"].indexOf(col.title) >= 0)
                            return '';
                        return '<p>'+'<b>'+col.title+': '+'</b>'+col.data+'</p>';
                    } ).join('');
                    text_wrapper.append(data);

                    div.append(text_wrapper);
                    
                    return div;
                }
        	}
    	},
        fnPreDrawCallback: function(){
            console.log("Pre: " + loading);
            if (loading > 0) {
                $("#main").hide();
            }              
			drawSearchBox();
        },
        fnDrawCallback: function(){
            console.log("Post: " + loading);
            if (loading > 0 ) {
                $("#main").fadeIn("slow", function() { $(".pre-outer").hide() });
                loading--;
            }
        },
		columnDefs: [
        	{ responsivePriority: 1, targets: ordered_headers.indexOf("View Order") },
        	{ responsivePriority: 2, className: "all", searchable: true, targets: ordered_headers.indexOf("Title") },
        	{ responsivePriority: 3, className: "all", targets: ordered_headers.indexOf("My Rating") },
        	{ responsivePriority: 4, type: "nan", targets: ordered_headers.indexOf("Year") },
        	{ responsivePriority: 5, searchable: true, targets: ordered_headers.indexOf("Director") },
        	{ responsivePriority: 6, type: "nan", targets: ordered_headers.indexOf("tomatoMeter") },
        	{ responsivePriority: 7, type: "nan", targets: ordered_headers.indexOf("imdbRating") },
        	{ responsivePriority: 8, type: "nan", targets: ordered_headers.indexOf("Metascore") },
        	{ responsivePriority: 9, searchable: true, targets: ordered_headers.indexOf("Actors") },
        	{ responsivePriority: 10, type: "min", targets: ordered_headers.indexOf("Runtime") },
        	{ responsivePriority: 11, targets: ordered_headers.indexOf("Genre") },
			{ targets: "_all", searchable: false }
    	]                                      
    });                                        
}                                              

function getColumnByTitle(arr, title) {
    for (var i=0, iLen=arr.length; i<iLen; i++) {
        if (arr[i].title == title) return arr[i];
    }
}

jQuery.extend( jQuery.fn.dataTableExt.oSort, {
	"min-pre": function ( a ) {
        return parseFloat(a.replace(" min",""));
    },
 
    "min-asc": function ( a, b ) {
        return a - b;
    },
 
    "min-desc": function ( a, b ) {
        return b - a;
    }
} );

jQuery.extend( jQuery.fn.dataTableExt.oSort, {
	"nan-pre": function ( a ) {
        return isNaN(a) ? -1.0 : parseFloat(a);
    },
 
    "nan-asc": function ( a, b ) {
        return a - b;
    },
 
    "nan-desc": function ( a, b ) {
        return b - a;
    }
} );
