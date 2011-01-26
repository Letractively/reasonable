const debugOn = false;
var settings;
var debug;
var trolls = [];

function Debug(toggle) {
  this.on = toggle;
  
  if (this.on) {
    var _this = this;
    this.$div = $("<div>").addClass("ableDebug").attr("id", "debug").css("top", $("body").scrollTop() + "px");
    $("body").append(this.$div);

    $(document).scroll(function() {
      _this.$div.css("top", $("body").scrollTop() + "px");
    });
  }
}

Debug.prototype.write = function(text) {
  if (this.on) {
    this.$div.append($("<p>").text(text)).attr("scrollTop", this.$div.attr("scrollHeight") - this.$div.height());
  }
};

function getSettings(response, defaults) {
  var temp;
  var reset = false;

  // Use saved settings if they exist
  try {
    temp = JSON.parse(response);
  } catch(e) {
    temp = {};
  }
  
  // Set to default if undefined
  $.each(defaults, function() {
    if (temp[this.name] == undefined) {
      temp[this.name] = this.value;
      reset = true;
    }
  });

  // Set and save settings
  settings = temp;
  if (reset) {
    chrome.extension.sendRequest({type: "reset", settings: JSON.stringify(temp)});
  }
}

function altText(toggle) {
  if (toggle) {
    $("img[alt^=]").each(function() {
      var $img = $("<img>").attr("src", this.src);
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
    $comment.addClass("ableHighlight").find(".ableShow").text("show all");
    while (depth > 0 && iter <= 100) {
      $comment = $comment.prev();
      if (parseInt($comment.attr("class").replace(" troll", "").substr(-1)) === depth - 1) {
        $comment.addClass("ableHighlight").find(".ableShow").text("show all");
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
    $(".ableHighlight").removeClass("ableHighlight").find(".ableShow").text("show direct only");
    $("html, body").animate({scrollTop: $(window).scrollTop() + showHeight + "px"});
  };

  $("h2.commentheader").each(function() {
    var $pipe = $("<span>").addClass("pipe").text("|");
    var $a = $("<a>").addClass("ableShow").click(function(e) {
      var $this = $(this);
      if ($this.parent().parent().hasClass("ableHighlight")) {
        showAll.call(this);
      } else {
        showDirects.call(this);
      }
    }).text("show direct only");
    $(this).append($pipe).append($a);
  });
}

function updatePosts(toggle) {
  if (toggle) {
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

        while (match != null) {
          var ids = idRe.exec(match);
          match = re.exec(data);
          comments.push({html: match, id: ids[1]});
        }

        debug.write("Loaded " + comments.length + " comments, compared to " + $container.children().length);
        
        $.each(comments, function() {
          $curNode = $("#" + this.id);
          
          if ($curNode.length === 0) {
            debug.write("Comment " + this.id + " doesn't exist");
            var $addNode = $(this.html);
            if ($prevNode !== null) {
              debug.write("Inserting after " + $prevNode.attr("id"))
              $prevNode.after($addNode);
              $prevNode = $addNode();
            } else {
              $container.append($addNode);
              $prevNode = $container.children("div:first");
            }
          } else {
            $prevNode = $curNode;
          }
        });
      }
    });

    setTimeout(function() { updatePosts(toggle); }, 60000);
  }
}

function blockTrolls() {
  // Build object literal containing a list of trolls
  var temp = settings.blockList.replace(/,\s/g, ",").split(",");
  var blockList = {};
  for (var i = 0; i < temp.length; i++) {
    blockList[temp[i]] = "";
  }

  $($("h2.commentheader strong")).each(function() {
    // Ignore reason's CDATA to generate A tags and retrieve poster name
    var name = ($(this).children("a").size() > 0 ? $("a", this).text() : $(this).text());
    
    // If poster is a troll, strip A tag, add troll class, and remove comment body
    if (name in blockList) {
      $(this).html(name).closest("div").addClass("troll").children("p").remove();
    };
  });
}

function optionsLink() {
  // Show link to options page in bottom right corner of screen
  var $link = $("<div>").addClass("ableOptions").css("top", $("body").scrollTop() + $(window).height() + "px")
    .append($("<a>").attr({href: chrome.extension.getURL("options.html"), id: "optionsLink", target: "_blank"}).text("Set options"));
  $("body").append($link);
  $(document).scroll(function() {
    $link.css("top", $("body").scrollTop() + $(window).height() + "px");
  });
}

$(document).ready(function() {
  debug = new Debug(debugOn);

  // Content scripts can't access local storage directly,
  // so we have to wait for info from the background script before proceeding
  chrome.extension.sendRequest({type: "settings"}, function(response) {
    getSettings(response, [
      {name: "showAltText", value: true},
      {name: "updatePosts", value: false},
      {name: "blockList", value: "Lonewacko, Max, Rather, shrike, ."}
    ]);
    blockTrolls();
    altText(settings.showAltText);
    viewThread();
    if (window.location.href.indexOf("#comment") !== -1) {
      setTimeout(function() { updatePosts(toggle); }, 60000);
    }
    optionsLink();
  });
});