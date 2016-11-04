var csv = require('csv');
var fs = require('fs');
var request = require("request")

var Globalize = require( "globalize" );
var writtenNumber = require('written-number');

Globalize.load( require( "cldr-data" ).entireSupplemental() );
Globalize.load( require( "cldr-data" ).entireMainFor( "en" ) );

Globalize.locale( "en" );

writtenNumber.defaults.lang = 'en';

// Spreadsheet with data
url = "https://docs.google.com/spreadsheets/d/1jlSotIkfLHD6TK_bR9uCxHp3_X_6p2rngYYeJYJ_E98/pub?gid=0&single=true&output=csv"

var questions = []

// Opens the CSV file
request({url: url}, function (error, response, body) {
	if (error) {
	    console.log(error)
	}
  // Parses the CSV data
  csv.parse(body, function(err, data){
  	if (err) {
      return console.log(err);
    }
    // Makes the answers complete
    for (question_num in data) {
    	// Skips the header row
    	if (question_num != 0){
    		var answer = data[question_num][4]
    		var unit = data[question_num][3]
    		var question = {"id": data[question_num][0], "question": data[question_num][1], "image": data[question_num][2], "answers": []}
    		// Creates a loop for the false answers
		    for (var i = .01 ; i <= 100 ; i*=10) {
		    	var numerical_form = Globalize.numberFormatter({ maximumFractionDigits: 5 })( answer * i )
		    	if (answer * i > 10) {
		    		var written_form = writtenNumber(answer * i)
			    } else {
			    	var written_form = answer * i
			    }
			    numerical_form += " " + unit
			    written_form += " " + unit
			    // Makes the corresponding comparison form
			    var comparison_amount = data[question_num][7]
			    var comparison = data[question_num][6]
			    var category = data[question_num][9]
			    var comparison_ratio = Globalize.numberFormatter({ maximumFractionDigits: 1 })((answer * i) / comparison_amount)
			    var comparison_text = "About " + comparison_ratio + " times the " + comparison
			    var right_answer = (i == 1 ? true : false)
		    	question["answers"].push({"numerical_form": numerical_form, "written_form": written_form, "comparison_text": comparison_text, "right_answer": right_answer})
		    }

	    	questions.push(question)
	    }

    }
    // Prints to file
    var stream = fs.createWriteStream("questions.json");
	stream.once('open', function(fd) {
	  stream.write(JSON.stringify(questions));
	  stream.end();
	});
  });  	
});