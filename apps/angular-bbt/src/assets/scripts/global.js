//Allow the arrow keys to move focus
$(document).keydown(
  function(e)
  {
    console.log("global.js, keyCode=" + e.keyCode)
    if (e.keyCode == 39) {
      console.log("Arrow Clicked");
      console.log($(document.activeElement));
      $("body").next().focus();
      
    }
    if (e.keyCode == 37) {
      $("body").prev().focus();
      
    }
  }
);
