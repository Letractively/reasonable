const trollListUrl = "http://www.brymck.com/reasonable/trolls.json";
var $save = $("#saveButton");
var $troll = $("#troll");

function enableSave() {
  $save.removeAttr("disabled");
}

function modifyTroll(key, list) {
  $("td.name").each(function() {
    var $this = $(this);
    if ($this.text() === key) {
      $this.closest("tr").children("td." + list).addClass("selected").siblings("td.controll").removeClass("selected");
    }
  });
  enableSave();
}

function buildTroll(key, value) {
  var $trollConstructor = $("<tr>")
    .append($("<td>").addClass("name").text(key))
    .append($("<td>").addClass("controll black" + (value === "black" ? " selected" : ""))
      .append($("<a>").click(function() { modifyTroll(key, "black"); }).append($("<span>").text("black"))))
    .append($("<td>").addClass("controll white" + (value === "white" ? " selected" : ""))
      .append($("<a>").click(function() { modifyTroll(key, "white"); }).append($("<span>").text("white"))))
    .append($("<td>").addClass("controll auto" + (value === "auto" ? " selected" : ""))
      .append($("<a>").click(function() { modifyTroll(key, "auto"); }).append($("<span>").text("auto"))));
  return $trollConstructor;
}

function addTroll() {
  $("#trolls").append(buildTroll($troll.val(), "black"));
  $troll.val(null);
  return false;
}

function testForEnter() {
  alert(e);
}

function load() {
  try {
    var settings = {};
    for (var key in localStorage) {
      settings[key] = localStorage[key];
    }
    $.each(settings, function(key, value) {
      var $option = $("#" + key);
      switch ($option.attr("id")) {
        case "trolls":
          var trolls = JSON.parse(value);
          $.each(trolls, function(tkey, tvalue) {
            $option.append(buildTroll(tkey, tvalue));
          });
          break;
        case "showAltText":
        case "showUnignore":
        case "showPictures":
        case "showYouTube":
        case "updatePosts":
          $option.attr("checked", value == "true");
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
  var tempTrolls = {};
  $("#options input[type=checkbox]").each(function() {
    var $this = $(this);
    temp[$this.attr("id")] = $this.attr("checked");
  });
  $("#trolls tr").each(function() {
    var $this = $(this);
    var key = $("td.name", $this).text();
    var $selected = $("td.controll.selected", $this);
    var value = ($selected.size() === 0 ? "auto" : $selected.text());
    tempTrolls[key] = value;
  });
  temp.trolls = JSON.stringify(tempTrolls);
  for (var key in temp) {
    localStorage[key] = temp[key];
  }
  $save.attr("disabled", "disabled");
  alert("Saved successfully!");
  window.close();
  return false;
}

$(document).ready(function() {
  load();
  // updateTrollList();
  $troll.bind("keydown", function(e) {
    if (e.which === 13) {
      addTroll();
    }
  });
});