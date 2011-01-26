const trollListUrl = "http://www.brymck.com/data/trolls.txt";
var $blockList = $("#blockList");
var $recommendList = $("#recommendList");

function addAllTrolls() {
  var temp = $blockList.val();
  
  if (temp === "") {
    temp = $recommendList.val();
  } else {
    temp += ", " + $recommendList.val();
  }
  
  $blockList.val(temp);
  $recommendList.val("").parents("li.hidden:first").slideUp();
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
    var settings = JSON.parse(localStorage["settings"]);
    $.each(settings, function(key, value) {
      var $input = $("#" + key);
      switch($input.attr("type")) {
        case "checkbox":
          $input.attr("checked", value);
          break;
        default:
          $input.val(value);
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
  localStorage["settings"] = JSON.stringify(temp);
  return false;
}

$(document).ready(function() {
  load();
  updateTrollList();
});