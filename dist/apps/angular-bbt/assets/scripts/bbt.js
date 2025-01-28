// $('.checkedDefault').click(function(){
//   $(this).parent().find('.checkedDefault').css('background-color','#ffffff');
//   $(this).css('background-color','#ff0000');
// });
if (typeof jQuery == 'undefined') {
  alert("jQuery is not loaded");
}

var urlParams;
$(document).ready(function() {
  //alert("BBT Document is ready");
  // save querystring in "hash"/"directory" ulrParams
  var match,
      pl = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      query = window.location.search.substring(1);

  urlParams = {};
  var path = "";
  var folder = "";
  while (match = search.exec(query)) {
    urlParams[decode(match[1])] = decode(match[2]);
    if (match[1] == "path") {
      path = urlParams["path"];
    } else if (match[1] == "folder") {
      folder = urlParams["folder"];
      $.cookie("currentfolder", folder);
    }
  }
  // END: save querystring in "hash"/"directory" ulrParams

  if (urlParams["path"]) {
    currentfolder = vid_data; // do validation!!
  } else if ($.cookie("currentfolder")) {
    console.log(" $.cookie('currentfolder'): " + $.cookie("currentfolder"));
    console.log("FindFolderByName is called here in legacy BBT, commented out now.")
    //currentfolder = FindFolderByName($.cookie("currentfolder"), vid_data.category);
  } else {
    //curentfolder = nothing;
    currentfolder = "";
  }

  // get vod data and create vertical slider of horizontal sliders
  function mainPageLoaded (xmlstr) {
    vid_data = xmlstr;
    LoadContentFolders();
    //LoadFeaturedVideos();
    //LoadTrainingMaterials();
    $('#Demo').perfectScrollbar();

    if ($('div.fileList').height() < $('div.homeContentFoldersBlock').height() - 50) {
      $('.fileList').css('height', $('div.homeContentFoldersBlock').height() - 50);
    }

    //searchInit();
    TempNoScroll();
    $('.thumbContainer:first').focus();
  }

  loadvodxmldata(path, mainPageLoaded);

});
