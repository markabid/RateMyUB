var profVariableName = "MTG_INSTR$" //variable instructor is stored under in HUB
var profName = ""; // The name of the professor currently being searched
var searchPageURL = ""; // The url for the search page at ratemyprofessors
var profRating = ""; // The rating of the professor
var numberProfessorReviews = ""; //number of reviews the professor has

//checks if instructor is stored under certain variable since this changes based upon how you get to the results page
if(document.getElementById('ptifrmtgtframe').contentWindow.document.getElementById(profVariableName + 0) != null){
  RunScript();
}
else{
  profVariableName = "MTGPAT_INSTR$"
  RunScript();
}

//RunScript();

function RunScript()
{
 	var professorIndex = 0;
	var currentProfessor = "";

	while (profName != "undefined")
	{
		getProfessorName(professorIndex)
		currentProfessor = profName;
		if(profName != "Staff" && profName != "undefined")
		{
			getProfessorSearchPage(professorIndex, currentProfessor);
		}
		professorIndex++;
	}
}

function getProfessorName(indexOfProfessor)
{
	try
	{
		profName = document.getElementById('ptifrmtgtframe').contentWindow.document.getElementById(profVariableName + indexOfProfessor).innerHTML;
		return profName;
	}
	catch (err)
	{
		profName = "undefined"
	}
}

/**
 * Sends a message to the background page (see background.js), to retrieve the professor search page from ratemyprofessor.com
 */
function getProfessorSearchPage(professorIndex, CurrentProfessor)
{
	chrome.runtime.sendMessage({
		method: 'POST',
		action: 'xhttp',
		url: 'http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=university%20at%20buffalo&queryoption=HEADER&query=' + CurrentProfessor + '&facetSearch=true',
		data: '',
		link: searchPageURL,
		index: professorIndex
	}, function(response) {
			var myHTML = response.response;

			var tempDiv = document.createElement('div');

			tempDiv.innerHTML = myHTML.replace(/<script(.|\s)*?\/script>/g, '');

			var professorClass = tempDiv.getElementsByClassName("listing PROFESSOR")[0].getElementsByTagName('a')[0];

			searchPageURL =  "http://www.ratemyprofessors.com" + professorClass.getAttribute('href');

			getProfessorRating(response.professorIndex, searchPageURL)
		});
}

function getProfessorRating(professorIndex, SearchPageURL)
{
	chrome.runtime.sendMessage({
		method: 'POST',
		action: 'xhttp',
		url: searchPageURL,
		data: '',
		link: SearchPageURL,
		index: professorIndex

}, function(response) {
		var myHTML = response.response;

		var tempDiv = document.createElement('div');

		tempDiv.innerHTML = myHTML.replace(/<script(.|\s)*?\/script>/g, '');

		tempDiv.childNodes;

		// check if professor rating is a number
		if(!isNaN(tempDiv.getElementsByClassName("grade")[0].innerHTML))
		profRating = tempDiv.getElementsByClassName("grade")[0].innerHTML;
    numberProfessorReviews = tempDiv.getElementsByClassName("table-toggle rating-count active")[0].innerHTML; //gets professor review count string
    var numberProfessorReviewsFinal = "";
    for(var i=0; i<numberProfessorReviews.length; i++){ //converts string to just number of review count
      if(numberProfessorReviews.charAt(i) >= '0' && numberProfessorReviews.charAt(i) <= '9'){
        numberProfessorReviewsFinal = numberProfessorReviewsFinal + numberProfessorReviews.charAt(i);
      }
    }

		var professorID = document.getElementById('ptifrmtgtframe').contentWindow.document.getElementById(profVariableName + response.professorIndex);

		addRatingToPage(professorID, profRating, response.searchPageURL, numberProfessorReviewsFinal);
	});
}

function addRatingToPage(professorID, ProfessorRating, SearchPageURL, numberProfessorReviewsFinal)
{
	console.log(SearchPageURL)
	var span = document.createElement('span'); // separate professor name and score in the HTML

	var link = document.createElement('a');

	var space = document.createTextNode(" "); //space between professor name and rating

	var professorRatingTextNode = document.createTextNode(ProfessorRating + " (" + numberProfessorReviewsFinal + " Reviews)" ); // The text with the professor rating + rating count

	if(ProfessorRating < 3.0)
	{
		link.style.color = "#8A0808"; // red = bad
	}
	else if (ProfessorRating >= 3.0 && ProfessorRating < 4 )
	{
		link.style.color = "#FFBF00"; // yellow/orange = okay
	}
	else if (ProfessorRating >= 4 && ProfessorRating <= 5 )
	{
		link.style.color = "#298A08"; // green = good
	}

	span.style.fontWeight = "bold"; // bold it

	link.href = SearchPageURL; // make the link
	link.target = "_blank"; // open a new tab when clicked

	// append everything together
	link.appendChild(professorRatingTextNode);
	span.appendChild(space);
	span.appendChild(link);
	professorID.appendChild(span);
}
