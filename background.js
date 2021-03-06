chrome.browserAction.onClicked.addListener(function(tab) {
   chrome.tabs.executeScript(null, {file: "main.js"});
});
chrome.runtime.onMessage.addListener(
    function(request, sender, callback)
    {
    if (request.action == "xhttp") {
        var xhttp = new XMLHttpRequest();
        var method = request.method ? request.method.toUpperCase() : 'GET';

        xhttp.onload = function() {
            console.log("Loaded URl: " + request.url);
            console.log("Professor: " + request.professor);
            callback({
                response: xhttp.responseText,
                searchPageURL: request.link,
                professorIndex: request.index});
        };
        xhttp.onerror = function() {
            console.log("error");
            callback();
        };
        console.log("Attempting to open URL: " + request.url);
        xhttp.open(method, request.url, true);
        if (method == 'POST') {
            xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhttp.send(request.data);
        return true;
    }
    }
);
