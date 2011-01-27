const trollListUrl = "http://www.brymck.com/data/trolls.txt";
var recommendedList;

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case "settings":
      if (localStorage["settings"]) {
        sendResponse({
          settings: localStorage["settings"],
          recommendedList: recommendedList
        });
      } else {
        sendResponse({recommendedList: recommendedList});
      }
      break;
    case "addTroll":
      var temp = JSON.parse(localStorage["settings"]);
      if (temp.blockList === "") {
        temp.blockList = request.name;
      } else {
        temp.blockList += ", " + request.name;
      }
      if (request.link !== "") {
        temp.blockList += ", " + request.link;
      }
      localStorage["settings"] = JSON.stringify(temp);
      sendResponse({success: true});
      break;
    case "removeTroll":
      var temp = JSON.parse(localStorage["settings"]);
      temp.blockList = temp.blockList.replace(request.name);
      if (request.link !== "") {
        temp.blockList = temp.blockList.replace(request.link);
      }
      // Delete leading and trailing apostrophes
      temp.blockList = temp.blockList.replace(/^[,\s]*|[,\s]*$/g, "");
      localStorage["settings"] = JSON.stringify(temp);
      sendResponse({success: true});
      break;
    case "reset":
      localStorage["settings"] = request.settings;
      sendResponse({});
      break;
    default:
      sendResponse({}); // snub
      break;
  }
});

function main() {
  $.get(trollListUrl, function(data) {
    recommendedList = data.split("\n");
  });
}

main();