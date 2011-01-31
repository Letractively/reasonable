const trollListUrl = "http://www.brymck.com/reasonable/trolls.json";
var $save = $("#save");
var $troll = $("#troll");
var trollList = {};

function sortTrolls(trolls) {
  var black = [];
  var white = [];
  var auto = [];
  var temp = {};

  // Add troll list from online to current list
  $.each(trollList, function(key, value) {
    if (!(key in trolls)) {
      trolls[key] = "auto";
    }
  });
  
  $.each(trolls, function(key, value) {
    switch (value) {
      case "black":
        black.push(key);
        break;
      case "white":
        white.push(key);
        break;
      case "auto":
        auto.push(key);
        break;
      default:
        break;
    }
  });
  
  black.sort();
  white.sort();
  auto.sort();
  
  $.each(black, function(index, value) { temp[value] = "black"; });
  $.each(auto, function(index, value) { temp[value] = "auto"; });
  $.each(white, function(index, value) { temp[value] = "white"; });

  // Save sorted array
  localStorage.trolls = JSON.stringify(temp);
  
  return temp;
}

function modifyTroll(key, list) {
  $("td.name").each(function() {
    var $this = $(this);
    if ($this.text() === key) {
      $this.closest("tr").children("td." + list).addClass("selected").siblings("td.controll").removeClass("selected");
    }
  });
}

function buildTroll(key, value) {
  var $trollConstructor = $("<tr>")
    .append($("<td>").addClass("name").text(key))
    .append($("<td>").addClass("controll black" + (value === "black" ? " selected" : ""))
      .click(function() { modifyTroll(key, "black"); }).text("black"))
    .append($("<td>").addClass("controll white" + (value === "white" ? " selected" : ""))
      .click(function() { modifyTroll(key, "white"); }).text("white"))
    .append($("<td>").addClass("controll auto" + (value === "auto" ? " selected" : ""))
      .click(function() { modifyTroll(key, "auto"); }).text("auto"))
    .append($("<td>").addClass("remove").click(function() { $(this).closest("tr").remove(); }).text("X"));
  return $trollConstructor;
}

function addTroll() {
  $("#trolls").append(buildTroll($troll.val(), "black"));
  $troll.val(null);
  return false;
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
          var trolls = sortTrolls(JSON.parse(value));
          $.each(trolls, function(tkey, tvalue) {
            $option.append(buildTroll(tkey, tvalue));
          });
          break;
        default:
          // Assumes the default is a checkbox
          $option.attr("checked", value == "true");
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
  localStorage.clear();
  for (var key in temp) {
    localStorage[key] = temp[key];
  }
  $save.attr("disabled", "disabled");
  alert("Saved successfully!");
  window.close();
  return false;
}

$(document).ready(function() {
  $.getJSON(trollListUrl, function(data) {
    trollList = data;
    load();
    // updateTrollList();
    $troll.bind("keydown", function(e) {
      if (e.which === 13) {
        addTroll();
      }
    });
  });
});