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
  var $this = this;
  $(window).scroll(function() { $this.center(); }).resize(function() { $this.center(); });
  return this;
};