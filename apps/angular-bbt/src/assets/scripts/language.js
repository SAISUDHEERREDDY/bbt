$(document).ready(function () {
  const languages = {
    'en': 'ENGLISH',
    'fr': 'FRENCH',
    'es': 'SPANISH'
  };
  const lang = $.i18n().locale;
  $.each(languages, function (i, l) {
    let li = '<li>' +
      '<a href="#" data-locale="' + i + '"><span data-i18n="'+ l +'">' +
      '</span><i id="' + i + '" class="fas fa-check-circle align-right lang-check"></i>' +
      '</a></li>';
    $('#language').append(li);
    if(i === lang){
    $('#' + i).show();}
  });
});
//fixes placement when french is used
let language_settings = function(l){
  if (l === 'fr'){
    $('.clock').css('right','440px');
    $('.date').css('left', '430px');
  }
  else {
    $('.clock').css('right','400px');
    $('.date').css('left', '419px');
  }
};
let set_cookie = function(l){
  $.cookie('language', l , {path:'/'});
};
const set_locale = function (locale) {
  if (locale) {
    $.i18n().locale = locale;
    language_settings(locale);
    set_cookie(locale)
  }
  $('body').i18n();
};

//Looks for a cookie and sets the language
if($.cookie('language')){
  set_locale($.cookie('language'))
}
else $.cookie('language','en', {path:'/'});

let set_check = function (locale){
  $('#language i').hide();
  $('#' + locale).show();
};

//Loads the language files
jQuery(function ($) {
  $.i18n().load({
    'en': 'i18n/en.json',
    'fr': 'i18n/fr.json',
    'es': 'i18n/es.json'
  }).done(function () {
    set_locale();
    $('.lang').on('click', 'a', function (e) {
      e.preventDefault();
      if($(this).data('locale')){
        $.i18n().locale = $(this).data('locale');
        set_locale($.i18n().locale);
        set_check($.i18n().locale);
      }
    })
  }).fail(function () {
    console.error('Failed to load translations')
  });
});
