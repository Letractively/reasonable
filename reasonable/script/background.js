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
      var temp = JSON.parse(localStorage.trolls);
      temp[request.name] = "black";
      if (request.link) {
        temp[request.link] = "black";
      }
      localStorage.trolls = JSON.stringify(temp);
      sendResponse({success: true});
      break;
    case "removeTroll":
      var temp = JSON.parse(localStorage.trolls);
      if (request.name in temp) {
        if (request.name in trolls) {
          temp[request.name] = "white";
        } else {
          delete temp[request.name];
        }
      }
      if (request.link in temp) {
        if (request.link in trolls) {
          temp[request.link] = "white";
        } else {
          delete temp[request.link];
        }
      }
      localStorage.trolls = JSON.stringify(temp);
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