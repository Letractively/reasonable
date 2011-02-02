// Test URLs and get YouTube YIDs
const pictureRe = /^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpg|gif|png)$/i;
const youtubeRe = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9-_]+)/i;
const collapse = "show direct thread";
const uncollapse = "show all";
const ignore = "ignore";
const unignore = "unignore";
const ignoreClass = "ignore";
const imgTimeoutLength = 5;

var settings;
var trolls = [];
var lightsOn = false;

function getName($strong) {
  var temp;

  if ($strong.children("a").size() > 0) {
    temp = $("a", $strong).text();
  } else {
    temp = $strong.text();
  }
  
  // Strip beginning and ending spaces
  temp = temp.replace(/^\s|\s$/g, "");
  
  return temp;
}

function getLink($strong) {
  var temp = "";

  if ($strong.children("a").size() > 0) {
    temp = $("a", $strong).attr("href");
  }

  // For blogwhore filtering, get domain name if link is a URL
  var match = temp.match(/^https?:\/\/(www\.)?([^\/]+)?/i);
  if (match) {
    temp = JSON.stringify(match[2]);
  } else {
    temp = temp.replace("mailto:", "");
  }

  temp = temp.replace(/"/g, "");

  return temp;
}

function showImagePopup(img) {
  var $window = $(window);
  var $box = $("div#ableLightsOutBox");
  var $img = $("<img>").load(function() {
    var $this = $(this);
    
    // Have to use setTimeout because height and width from the load event are both 0
    // Once we've waited a second after loading, though, it should work and be
    // able to center the image
    $("div#ableLightsOut").css("height", $(document).height()).fadeTo("fast", 0.5);
    $box.empty().append($img).fadeTo(5, 0.01, function() {
      var $this = $(this);
      $this.center().fadeTo("fast", 1);
    }).fadeTo("fast", 1);
    lightsOn = true;
  }).attr("src", $(img).attr("src"));
}

function getSettings(response, defaults) {
  var temp;
  var reset = false;

  // Use saved settings if they exist
  try {
    temp = response.settings;
  } catch(e) {
    temp = {};
  }
  
  $.each(defaults, function() {
    switch (temp[this.name]) {
      case undefined:
        // Set to default if undefined
        temp[this.name] = this.value;
        reset = true;
        break;
      case "true":
        // See below for case "false", which is the more important case
        temp[this.name] = true;
        break;
      case "false":
        // Prevent boolean true from being stored as text
        // Without this, things like
        // if (settings.updatePosts) { ... }
        // will always evaluate as true and execute
        temp[this.name] = false;
        break;
      default:
        if ((this.name) === "trolls") {
          var arr = JSON.parse(temp.trolls);
          temp.trolls = {};
          
          // 
          for (var key in arr) {
            if (arr[key] === "black" || (temp.hideAuto && arr[key] === "auto")) {
              temp.trolls[key] = arr[key];
            }
          }
          if (temp.hideAuto) {
            for (var key in this.value) {
              if (!(key in temp.trolls)) {
                temp.trolls[key] = "auto";
              }
            }
          }
        }
        break;
    }
  });
  
  // Set and save settings
  settings = temp;
  if (reset) {
    chrome.extension.sendRequest({type: "reset", settings: temp});
  }
}

function showMedia() {
  if (settings.showPictures || settings.showYouTube) {
    $("div.com-block p a").each(function() {
      var $this = $(this);
      if (settings.showPictures) {
        if (pictureRe.test($this.attr("href"))) {
          var $img = $("<img>").addClass("ableCommentPic").attr("src", $this.attr("href"));
          $this.parent().after($img);
        }
      }
      if (settings.showYouTube) {
        var matches = youtubeRe.exec($this.attr("href"));
        
        if (matches != null) {
          var $youtube = $("<iframe>").addClass("youtube-player").attr({
            title: "YouTube video player",
            type: "text/html",
            width: "480",
            height: "390",
            src: "http://www.youtube.com/embed/" + matches[1],
            frameborder: "0"
          });
          
          $this.parent().after($youtube);
        }
      }
    });
    
    $("div.com-block p:not(:has(a)):contains(http)").each(function() {
      var $this = $(this);
      if (settings.showPictures) {
        if (pictureRe.test($this.text())) {
          var $img = $("<img>").addClass("ableCommentPic").attr("src", $this.text());
          $this.after($img);
        }
      }
    });
  }
}

function altText() {
  if (settings.showAltText) {
    $("div.post img[alt]").each(function() {
      var $img = $("<img>").attr("src", this.src).click(function() { showImagePopup(this); });
      var $div = $("<div>").addClass("ablePic").append($img).append(this.alt);
      $(this).replaceWith($div);
    });
  }
}

function viewThread() {
  // Shows only the direct thread
  var showDirects = function() {
    var curScroll = $(window).scrollTop();
    var hideHeight = 0;
    var iter = 0;
    var $comment = $(this).parent().parent();
    
    // Get last digit for depth, ignoring the added class for trolls
    var depth = parseInt($comment.attr("class").replace(" troll", "").substr(-1));
    $comment.addClass("ableHighlight").find(".ableShow").text(uncollapse);
    while (depth > 0 && iter <= 100) {
      $comment = $comment.prev();
      if (parseInt($comment.attr("class").replace(" troll", "").substr(-1)) === depth - 1) {
        $comment.addClass("ableHighlight").find(".ableShow").text(uncollapse);
        depth--;
      } else {
        hideHeight += $comment.height();
        
        // You can't get the height of a hidden element, so store height
        // in data attribute for when you want to unhide it later
        $comment.data("height", $comment.height()).slideUp();
      }
      iter++;
    }
    $("html, body").animate({scrollTop: curScroll - hideHeight + "px"});
  };
  
  // Unhides everything
  var showAll = function() {
    var showHeight = 0;
    var $hidden = $(this).parent().parent().siblings(":hidden");
    $hidden.each(function() {
      var $this = $(this);
      $this.slideDown();
      
      // Have to reference data attribute because .height() will return 0
      showHeight += $this.data("height");
    });
    $(".ableHighlight").removeClass("ableHighlight").find(".ableShow").text(collapse);
    $("html, body").animate({scrollTop: $(window).scrollTop() + showHeight + "px"});
  };

  $("h2.commentheader:not(:has(a.ignore))").each(function() {
    var $strong = $("strong:first", this);
    var name = getName($strong);
    var link = getLink($strong);
    var $pipe1 = $("<span>").addClass("pipe").text("|");
    var $pipe2 = $("<span>").addClass("pipe").text("|");
    var $show = $("<a>").addClass("ableShow").click(function(e) {
      var $this = $(this);
      if ($this.parent().parent().hasClass("ableHighlight")) {
        showAll.call(this);
      } else {
        showDirects.call(this);
      }
    }).text(collapse);
    var $ignore = $("<a>").addClass(ignoreClass).data("name", name).data("link", link).click(function(e) {
      var $this = $(this);
      var $strong = $this.siblings("strong:first");
      var name = $(this).data("name");
      var link = $(this).data("link");
      if ($this.text() === ignore) {
        chrome.extension.sendRequest({type: "addTroll", name: name, link: link}, function(response) {
          if (response.success == true) {
            settings.trolls[name] = "black";
            if (link) {
              settings.trolls[link] = "black";
            }
            blockTrolls(true);
          } else {
            alert("Adding troll failed! Try doing it manually in the options page for now. :(");
          }
        });
      } else {
        chrome.extension.sendRequest({type: "removeTroll", name: name, link: link}, function(response) {
          if (response.success == true) {
            delete settings.trolls[name];
            delete settings.trolls[link];
            blockTrolls(true);
          } else {
            alert("Removing troll failed! Try doing it manually in the options page for now. :(");
          }
        });
      }
    }).text(ignore);
    $(this).append($pipe1).append($show).append($pipe2).append($ignore);
  });
}

function updatePosts() {
  if (settings.updatePosts) {
    $.ajax({
      url: window.location.href,
      success: function(data) {
        var re = /<div class=\"com-block[\s\S]*?<\/div>[\s\S]*?<\/div>/gim;
        var idRe = /id=\"(comment_[0-9].*?)\"/
        var match = re.exec(data);
        var comments = [];
        var $curNode;
        var $prevNode = null;
        var $container = $("#commentcontainer");
        var updateLinks = false;

        while (match != null) {
          var ids = idRe.exec(match);
          comments.push({html: match, id: ids[1]});
          match = re.exec(data);
        }
        
        $.each(comments, function() {
          var html = this.html.toString().replace(/\/\/[\s\S]*?\]\]>/, "temp");
          $curNode = $("#" + this.id);
          
          if ($curNode.size() === 0) {
            updateLinks = true;
            if ($prevNode !=  null) {
              $prevNode.after(html);
              $prevNode = $prevNode.next();
            } else {
              $container.append(html);
              $prevNode = $container.children("div:first");
            }
          } else {
           $prevNode = $curNode;
          }
        });
        
        viewThread();
        blockTrolls(false);
      }
    });

    setTimeout(function() { updatePosts(); }, 60000);
  }
}

function blockTrolls(smoothTransitions) {
  var showHeight = 0;

  $($("h2.commentheader strong")).each(function() {
    var $this = $(this);
    var $ignore = $this.siblings("a." + ignoreClass);
    var name = $ignore.data("name");
    var link = $ignore.data("link");

    if (name in settings.trolls || (link !== "" && link in settings.trolls)) {
      // If poster is a troll, strip A tag, add troll class, and hide comment body
      var $body = $this.html(name).siblings("a.ignore").text(unignore).closest("div").addClass("troll").children("p, blockquote");
      if (!settings.showUnignore) {
        $this.siblings("a.ignore").hide().prev("span.pipe").hide();
      }
      
      if (smoothTransitions) {
        $body.slideUp();
      } else {
        $body.hide();
      }
    } else if (smoothTransitions && $ignore.text() === unignore) {
      // Unhide unignored trolls
      $this.siblings("a.ignore").text(ignore).closest("div").removeClass("troll").children("p, blockquote").slideDown();
    }
  });
}

function lightsOut() {
  var $overlay = $("<div>").attr("id", "ableLightsOut").css("height", $(document).height());
  var $box = $("<div>").attr("id", "ableLightsOutBox").keepCentered();
  
  // Routine for turning lights on
  var turnLightsOn = function() {
    lightsOn = false;
    $overlay.fadeOut();
    $box.fadeOut();
  };
  
  $("body").append($box.click(turnLightsOn)).append($overlay);
  
  // Turns lights back on if escape key is pressed
  $(window).keydown(function(e) {
    if (lightsOn && e.which === 27) {
      turnLightsOn();
    }
  });
}

function main() {
  // Only run these if there is a comment section displayed
  var commentOnlyRoutines = function() {
    viewThread();
    blockTrolls(false);
    setTimeout(function() { updatePosts(); }, 60000);
  };

  // Content scripts can't access local storage directly,
  // so we have to wait for info from the background script before proceeding
  chrome.extension.sendRequest({type: "settings"}, function(response) {
    getSettings(response, [
      {name: "hideAuto", value: true},
      {name: "showAltText", value: true},
      {name: "showUnignore", value: true},
      {name: "updatePosts", value: false},
      {name: "showPictures", value: true},
      {name: "showYouTube", value: true},
      {name: "trolls", value: response.trolls}
    ]);
    lightsOut();
    altText();
    showMedia();

    // Run automatically if comments are open, otherwise bind to the click
    // event for the comment opener link
    if (window.location.href.indexOf("#comment") !== -1) {
      commentOnlyRoutines();
    } else {
      $("a[href=#commentcontainer]").click(commentOnlyRoutines);
    }
  });
}

main();