$(document).ready(function() {
  let menu = 'main';
  //function for hide and show
  let show = function (h,s){
    $(h).hide();
    $(s).show("slide", {direction: "right"}, 200);
  };
  
  let menuReset = function(){
    if ($( '#hamburger' ).hasClass("fa-times")){
      $( '#hamburger' ).toggleClass("fa-times fa-bars");
      $('#menu').hide("slide", {direction: "right"}, 200);
    }
  };
  //Check for either a click or Enter
  //main menu check
  $(function(){
    $('#menuToggle').on('keypress click', function(e){
      if (e.which === 13 || e.type === 'click') {
        if ($( '#hamburger' ).hasClass("fa-bars")){
          $( '#hamburger' ).toggleClass("fa-bars fa-times");
          $('#menu').show("slide", {direction: "right"}, 200);
        }
        else {
          $( '#hamburger' ).toggleClass("fa-bars fa-times");
          $('#menu').hide("slide", {direction: "right"}, 200);
          $('#main').show();
          $('#language').hide();
          menu = 'main';
        }
  
      }
    });
  });
  
  //remove focus if clicked outside
  $('#menu').blur(function () {
    console.log('menu reset to fire');
    menuReset();
  });
  // $(document).on('blur', '#menu', menuReset());
  //language selection
  $(function(){
    $('#selectLanguage').on('keypress click', function(){
      if (menu === 'main'){
        show('#main','#language');
       menu = 'language';
      }
    });
  });
  //language return
  $(function(){
    $('#lang-back').on('keypress click', function(){
      if (menu === 'language'){
        show('#language','#main');
        menu = 'main';
      }
    });
  });
  
  
});