// Centers in the window
jQuery.fn.center = function() {
  var $window = $(window);
  this.css({
    top: ($window.height() - this.outerHeight()) / 2 + $window.scrollTop() + "px",
    left: ($window.width() - this.outerWidth()) / 2 + $window.scrollLeft() + "px"
  })  
  return this;
};

// Keeps centered even if the user scrolls or resizes the window
jQuery.fn.keepCentered = function() {
  $(window).scroll(function() { this.center(); }).resize(function() { this.center(); });
  return this;
};

jQuery.fn.fitToWindow = function() {
  this.css("height", this.height() + $(document).height() - $("html").outerHeight() + "px");
  return this;
};

jQuery.fn.keepFitToWindow = function() {
  $(window).scroll(function() { this.fitToWindow(); }).resize(function() { this.fitToWindow(); });
  return this;
};