const trollListUrl = "http://www.brymck.com/reasonable/trolls.json";
var trolls;

// Clear old settings
if (localStorage.settings) {
  localStorage.clear();
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case "settings":
      if (localStorage) {
        sendResponse({
          settings: localStorage,
          trolls: trolls
        });
      } else {
        sendResponse({trolls: trolls});
      }
      break;
    case "addTroll":
      var temp = JSON.parse(localStorage);
      if (temp.blockList === "") {
        temp.blockList = request.name;
      } else {
        temp.blockList += ", " + request.name;
      }
      if (request.link !== "") {
        temp.blockList += ", " + request.link;
      }
      localStorage = JSON.stringify(temp);
      sendResponse({success: true});
      break;
    case "removeTroll":
      var temp = JSON.parse(localStorage);
      temp.blockList = temp.blockList.replace(request.name, "");
      if (request.link !== "") {
        temp.blockList = temp.blockList.replace(request.link, "");
      }
      // Delete leading and trailing apostrophes
      temp.blockList = temp.blockList.replace(/^[,\s]*|[,\s]*$/g, "");
      localStorage = JSON.stringify(temp);
      sendResponse({success: true});
      break;
    case "reset":
      $.each(request.settings, function(key, value) {
        localStorage[key] = (key === "trolls" ? JSON.stringify(value) : value);
      });
      break;
    default:
      sendResponse({}); // snub
      break;
  }
});

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (tab.url.indexOf("reason.com") > -1) {
    chrome.pageAction.show(tabId);
  }
});

function main() {
  $.getJSON(trollListUrl, function(data) {
    trolls = data;
  });
}

main();