const getUrl = "http://www.brymck.com/reasonable/get";
var actions = {
  black: { label: "hide", value: "black" },
  white: { label: "show", value: "white" },
  auto:  { label: "auto", value: "auto"  }
};
var $save = $("#save");
var $troll = $("#troll");
var trollList = {};

function sortTrolls(trolls) {
  var sortFunction = function(x, y) {
    var a = String(x).toUpperCase();
    var b = String(y).toUpperCase();
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return 0;
    }
  };
  var black = [];
  var white = [];
  var auto = [];
  var temp = {};

  // Add troll list from online to current list
  $.each(trollList, function(key, value) {
    if (!(key in trolls)) {
      trolls[key] = actions.auto.value;
    }
  });
  
  $.each(trolls, function(key, value) {
    if (key !== "") { // Prevent blanks from being stored as trolls
      switch (value) {
        case actions.black.value:
          black.push(key);
          break;
        case actions.white.value:
          white.push(key);
          break;
        case actions.auto.value:
          auto.push(key);
          break;
        default:
          break;
      }
    }
  });

  black.sort(sortFunction);
  white.sort(sortFunction);
  auto.sort(sortFunction);
  
  $.each(black, function(index, value) { temp[value] = actions.black.value; });
  $.each(auto, function(index, value) { temp[value] = actions.auto.value; });
  $.each(white, function(index, value) { temp[value] = actions.white.value; });
  

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

function buildControll($td, key, value, comp) {
  return $td.append($("<input>").attr({
      id: key + "_" + comp.value,
      type: "radio",
      checked: (value === comp.value),
      name: key,
      value: comp.value
    })).append($("<label>").attr("for", key + "_" + comp.value).addClass("actions").text(comp.label));
  /*
  return $("<td>").addClass("controll " + comp.value + (value === comp.value ? " selected" : ""))
    .attr("title", "Ignore all posts by " + key)
    .click(function() { modifyTroll(key, comp.value); }).text(comp.label);
  */
}

function buildTroll(key, value) {
  var $trollConstructor = $("<tr>").append($("<td>").addClass("name").text(key));
  var $td = $("<td>");
  $td = buildControll($td, key, value, actions.black);
  $td = buildControll($td, key, value, actions.white);
  $td = buildControll($td, key, value, actions.auto);
  
    /*
    .append(buildControll(key, value, actions.black))
    .append(buildControll(key, value, actions.white))
    .append(buildControll(key, value, actions.auto))
    .append($("<td>").addClass("remove")
      .attr("title", "Remove, but note that " + key + " may reappear here if found on the remote list")
      .click(function() { $(this).closest("tr").remove(); }).text("X"));
    */
  return $trollConstructor.append($td);
}

function addTroll() {
  $("#trolls tbody").append(buildTroll($troll.val(), actions.black.value));
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
          // Trolls are stored as stringified object
          var trolls = sortTrolls(JSON.parse(value));
          
          // Add each troll to the troll list
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
    temp[$this.attr("id")] = Boolean($this.attr("checked"));
  });
  $("input:radio:checked").each(function() {
    tempTrolls[$(this).attr("name")] = $(this).val();
  });
  temp.trolls = JSON.stringify(tempTrolls);
  localStorage.clear();
  for (var key in temp) {
    localStorage[key] = temp[key];
  }
  $save.attr("disabled", "disabled");
  alert("Saved successfully!\n\nReload any open reason.com pages to reflect any changes you've made");
  window.close();
  return false;
}

$(document).ready(function() {
  $.ajax({
    url: getUrl,
    dataType: "json",
    success: function(data) {
      trollList = data;
      load();
      $troll.bind("keydown", function(e) {
        if (e.which === 13) {
          addTroll();
        }
      });
    },
    error: function() {
      trollList = {};
      load();
      $troll.bind("keydown", function(e) {
        if (e.which === 13) {
          addTroll();
        }
      });
    }
  });
});