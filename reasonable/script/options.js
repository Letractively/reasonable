const trollListUrl = "http://www.brymck.com/data/trolls.txt";
var $blockList = $("#blockList");
var $recommendList = $("#recommendList");
var $save = $("#saveButton");

function enableSave() {
  $save.removeAttr("disabled");
}

function addAllTrolls() {
  var temp = $blockList.val();
  
  if (temp === "") {
    temp = $recommendList.val();
  } else {
    temp += ", " + $recommendList.val();
  }
  
  $blockList.val(temp);
  $recommendList.val("").parents("li.hidden:first").slideUp();
  enableSave();
}

function updateTrollList() {
  $.get(trollListUrl, function(data) {
    var tempList = $blockList.val().split(/,\s/);
    var recommendedTrolls = data.split("\n");
    var existingTrolls = {};
    var temp = "";
    
    $.each(tempList, function(index, value) {
      existingTrolls[value] = "";
    });
    
    $.each(recommendedTrolls, function(index, troll) {
      if (!(troll in existingTrolls)) {
        if (temp === "") {
          temp = troll;
        } else {
          temp += ", " + troll;
        }
      }
    });
    
    if (temp !== "") {
      $recommendList.val(temp).parents("li.hidden:first").slideDown();
    }
  });
}

function load() {
  try {
    var settings = JSON.parse(localStorage);
    $.each(settings, function(key, value) {
      var $option = $("#" + key);
      switch ($option.attr("id")) {
        case "trolls":
          var trolls = JSON.
          break;
        case "blacklist":
        case "whitelist":
          var tempList = value.split(/,\s/);
          $.each(tempList, function(key, troll) {
            $option.append($("<option>").val(troll).text(troll));
          });
          break;
        case "reclist":
          // do later
          break;
        case "showAltText":
        case "showUnignore":
        case "showPictures":
        case "showYouTube":
        case "updatePosts":
          $option.attr("checked", value);
          break;
        default:
          $option.val(value);
          break;
      }
    });
  } catch(e) {
  }
}

function save() {
  var temp = {};
  $("#options input[type!=submit], #options textarea").each(function() {
    var $this = $(this);
    switch($this.attr("type")) {
      case "checkbox":
        temp[$this.attr("id")] = $this.attr("checked");
        break;
      default:
        temp[$this.attr("id")] = $this.val();
        break;
    }
  });
  localStorage = JSON.stringify(temp);
  $save.attr("disabled", "disabled");
  alert("Saved successfully!");
  window.close();
  return false;
}

$(document).ready(function() {
  load();
  updateTrollList();
});