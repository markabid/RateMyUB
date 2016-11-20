var professorName = ""; // The name of the professor currently being searched
var ratingsPageURL = "";// The url for the actual ratemyprofessors rating page
var searchPageURL = ""; // The url for the search page at ratemyprofessors
var professorRating = ""; // The rating of the professor
var numberProfessorReviews = ""; //number of reviews the professor has
var professorMethodID = "MTG_INSTR$" //variable instructor is stored under in HUB

RunScript();

function RunScript()
{
 	var professorIndex = 0;
	var currentProfessor = "";

	while (professorName != "undefined")
	{
    console.log(getProfessorName(professorIndex));
		getProfessorName(professorIndex)
		currentProfessor = professorName;
		if(professorName != "Staff" && professorName != "undefined")
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
		professorName = document.getElementById('ptifrmtgtframe').contentWindow.document.getElementById(professorMethodID + indexOfProfessor).innerHTML;
		return professorName;
	}
	catch (err)
	{
		professorName = "undefined"
	}
}

/**
 * This function sends a message to the background page (see background.js), to retrieve the professor search page from ratemyprofessor.com
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

			var professorClass = tempDiv.getElementsByClassName("listing PROFESSOR")[0].getElementsByTagName('a')[0]; // etc. etc.

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

		// check if professor rating is a number.
		if(!isNaN(tempDiv.getElementsByClassName("grade")[0].innerHTML))
		professorRating = tempDiv.getElementsByClassName("grade")[0].innerHTML;
    numberProfessorReviews = tempDiv.getElementsByClassName("table-toggle rating-count active")[0].innerHTML; //gets professor review count string
    var numberProfessorReviewsFinal = "";
    for(var i=0; i<numberProfessorReviews.length; i++){ //converts string to just number of review count
      if(numberProfessorReviews.charAt(i) >= '0' && numberProfessorReviews.charAt(i) <= '9'){
        numberProfessorReviewsFinal = numberProfessorReviewsFinal + numberProfessorReviews.charAt(i);
      }
    }

		var professorID = document.getElementById('ptifrmtgtframe').contentWindow.document.getElementById(professorMethodID + response.professorIndex);

		addRatingToPage(professorID, professorRating, response.searchPageURL, numberProfessorReviewsFinal);
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
