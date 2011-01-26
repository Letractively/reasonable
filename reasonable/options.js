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
    alert("hi");
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
});