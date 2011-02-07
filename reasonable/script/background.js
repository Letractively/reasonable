const getUrl = "http://www.brymck.com/reasonable/get";
const giveUrl = "http://www.brymck.com/reasonable/give"
const submitDays = 3;
const maxHistory = 20;
var trolls;

// Clear old settings
// Delete this sometime in early March 2011
if (localStorage.settings) {
  var temp = JSON.parse(localStorage.settings);

  for (var key in temp) {
    switch (key) {
      case "hideAuto":
      case "showAltText":
      case "showUnignore":
      case "showPictures":
      case "showYouTube":
      case "keepHistory":
      case "highlightMe":
      case "showGravatar":
      case "updatePosts":
        localStorage[key] = temp[key];
        break;
      case "blockList":
        var l = temp[key].split(/,\s/);
        var arr = {};
        for (var i = 0; i < l.length; i++) {
          arr[l[i]] = "black";
        }
        localStorage.trolls = JSON.stringify(arr);
        break;
      default:
        break;
    }
  }
  localStorage.removeItem("settings");
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
      $.ajax({
        type: "post",
        url: giveUrl,
        data: {
          black: request.name + (request.link ? "," + request.link : ""),
          white: "",
          auto: "",
          hideAuto: localStorage.hideAuto
        }
      });
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
      $.ajax({
        type: "post",
        url: giveUrl,
        data: {
          black: "",
          white: request.name + (request.link ? "," + request.link : ""),
          auto: "",
          hideAuto: localStorage.hideAuto
        }
      });
      sendResponse({success: true});
      break;
    case "setSearch":
      localStorage.name = request.name;
      sendResponse({success: true});
      break;
    case "keepHistory":
      var temp;
      var datetime = new Date();
      var alreadyExists = false;
      
      // Load history if it exists, otherwise set up a temp array
      if (localStorage.history) {
        temp = JSON.parse(localStorage.history);
      } else {
        temp = [];
      }
      
      $.each(temp, function(index, value) {
        // Ignore if permalink was from a point in the past or
        // is identical to one that already exists
        // This prevents old posts from showing up with a current timestamp
        if (value.permalink >= request.permalink) {
          alreadyExists = true;
        }
      });
      
      if (!alreadyExists) {
        // Limit history length
        while (temp.length > maxHistory) {
          temp.shift();
        }
        
        temp.push({timestamp: datetime.getTime(), url: request.url, permalink: request.permalink});
      }
      localStorage.history = JSON.stringify(temp);
      sendResponse({success: true, exists: alreadyExists, timestamp: datetime.getTime()});
      break;
    case "reset":
      $.each(request.settings, function(key, value) {
        if (key === "trolls") {
          // Make sure we don't accidentally delete any trolls
          var temp = JSON.parse(localStorage.trolls);
          for (var key in value) {
            temp[key] = value[key];
          }
          localStorage.trolls = JSON.stringify(temp);
        } else if (key === "history") {
          localStorage.history = JSON.stringify(value);
        } else {
          localStorage[key] = value;
        }
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
  if (localStorage.shareTrolls) {
    var black = [];
    var white = [];
    var auto = [];
    var temp = JSON.parse(localStorage.trolls);
    
    for (var troll in temp) {
      switch (temp[troll]) {
        case "black":
          black.push(troll);
          break;
        case "white":
          white.push(troll);
          break;
        case "auto":
          auto.push(troll);
          break;
        default:
          break;
      }
    }
    
    var current = new Date();
    if (localStorage.submitted == undefined) {
      localStorage.submitted = 0;
    }
    
    // Only share troll list every set number of days
    if (current.getTime() - localStorage.submitted > submitDays * 86400000) {
      $.ajax({
        type: "post",
        url: giveUrl,
        data: {
          black: black.join(","),
          white: white.join(","),
          auto: auto.join(","),
          hideAuto: localStorage.hideAuto
        },
        dataType: "text",
        success: function(data) {
          localStorage.submitted = current.getTime();
        },
        error: function(data) {
          // error handler
        }
      });
    }
  }

  $.ajax({
    url: getUrl,
    dataType: "json",
    success: function(data) {
      try {
        var temp = JSON.parse(localStorage.trolls);
        
        // Remove non-trolls
        $.each(temp, function(key, value) {
          if (value === "auto" && !(key in data)) {
            delete temp[key];
          }
        });
        
        // Add new trolls
        $.each(data, function(key, value) {
          if (!(key in temp)) {
            temp[key] = "auto";
          }
        });
        
        trolls = temp;
        localStorage.trolls = JSON.stringify(temp);
      } catch(e) {
        // Error handling
      }
    },
    error: function() {
      trolls = {};
    }
  });
}

main();