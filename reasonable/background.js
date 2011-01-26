chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case "settings":
      if (localStorage["settings"]) {
        sendResponse(localStorage["settings"]);
      } else {
        sendResponse({});
      }
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