// global vars:
var ratingSubmitted = false;
var urlParams;
var flowPlyr;
//var srcRoot = "/bbt";
var srcRoot = "http://10.131.123.143";
//var srcRoot = "http://172.19.254.1";

// save querystring in "hash"/"directory" ulrParams
var match,
	pl = /\+/g,  // Regex for replacing addition symbol with a space
	search = /([^&=]+)=?([^&]*)/g,
	decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
	query = window.location.search.substring(1);

urlParams = {};
var path = "/";
match = search.exec(query);
if (match[1] == "path") {
	path = match[2];
}
// END: save querystring in "hash"/"directory" ulrParams

// search page will pass in comma separated folder path, others just folder

function rateStars(stars) {
	//$('#RateVideoNow').html('Rating: ');
	var times = 5;
	for (var i=1; i <= times ;i++)
	{
		if (i <= stars) {
			//$('#RateVideoNow').append("<img class='starSize' src='/images/bbt_star_on.png'>");
			$('#RateVideoNow img:nth-of-type(' + i + ')').attr("src", "/images/bbt_star_on.png");
		}
		else {
			//$('#RateVideoNow').append("<img class='starSize' src='/images/star_off.png'>");
			$('#RateVideoNow img:nth-of-type(' + i + ')').attr("src", "/images/star_off.png");
		}
	}
}

function drawStars(stars) {
	var times = 5;
	for (var i=1; i <= times ;i++)
	{
		if (i <= stars) {
			$("#RateThisVideo img:nth-of-type(" + i + ")").attr("src", "/images/bbt_star_on.png");
		}
		else {
			$("#RateThisVideo img:nth-of-type(" + i + ")").attr("src", "/images/star_off.png");
		}
	}
}

window.onload = function() {
	document.getElementsByTagName('body')[0].onkeyup = function(e) {
		var ev = e || event;
		if(ev.keyCode == 27) {//&& ev.ctrlKey) {
			//do something...
			window.close();
		}
	}
};

$(document).ready(function () {
	// save querystring in "hash"/"directory" ulrParams
	var match,
		pl = /\+/g,  // Regex for replacing addition symbol with a space
		search = /([^&=]+)=?([^&]*)/g,
		decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
		query = window.location.search.substring(1);

	urlParams = {};
	var path = "/";
	match = search.exec(query);
	if (match[1] == "path") {
		path = match[2];
	}

	if (query.search("folder=Local Content") >= 0) {
		$.cookie("currentfolder", "Local Content");
	}
	// END: save querystring in "hash"/"directory" ulrParams

	function dataLoaded (xmlstr) {

		// GET currentfolder
		vid_data = xmlstr;
		if ($.cookie("currentfolder")) {
			console.log(" $.cookie('currentfolder'): " + $.cookie("currentfolder"));
			//vid_data = xmlstr;
			currentfolder = vid_data;
		} else {
			currentfolder = vid_data; // was nothing;
		}
		console.log(currentfolder.name + " chosen.")

		//GET currentVideo
		if ($.cookie("currentvideo")) {
			currentvideo = FindVideoByFileName($.cookie("currentvideo"), currentfolder.category);
		} else {
			//currentvideo = ""; //nothing;
			currentvideo = FindVideoByFileName($.cookie("currentvideo"), path);
		}

		if (currentvideo != "undefined" && currentvideo != null) {
			console.log("Video " + currentvideo.name + " chosen.");
			$("#MainVideoTitle").html(currentvideo.desc);
			$("#MainVideoDescription").html(currentvideo.longdesc);
			drawStars(currentvideo.rating);
		}


		$("#VideoPlayerWrapper").html("<div style='display:block;' id='player'></div>");
		console.log($("#VideoPlayerWrapper").html());

		if (currentvideo != "undefined" && currentvideo != null) {
			//LoadRelatedVideos(currentfolder, currentvideo.name, path);
		}

		//DisplayBreadcrumbs(path, vid_data.breadcrumbs.list);

		// install flowplayer to an element with CSS class "player"
		//var myObj = { debug: true, key: "$648219863980483", swf: "/js/flowplayer/flowplayer.swf", embed: false, autoplay: true, ratio: 9/16, volume: 1, clip: { sources: [ { type: "video/mp4,video/flash" }], coverImage: { url: currentvideo.thumb, scaling: 'fit' } }, plugins: { audio: { url: '/javascripts/flowplayer/flowplayer.audio-3.2.11.swf' } }
		var	myObj = { start: "", contentid: "", key: "$648219863980483",
			swf: "/js/flowplayer/flowplayer.swf", embed: false, autoplay: true,
			ratio: 9/16, volume: 1, clip: { sources: [ { type: "video/mp4" }] },
			plugins: { audio: { url: '/javascripts/flowplayer/flowplayer.audio-3.2.11.swf' } }
		};

		myObj.key = generate_key(window.location.host);
		myObj.clip.sources[0].src = srcRoot + currentvideo.name;
		myObj.login = vid_data.config.employee_login;
		myObj.ratings = vid_data.config.ratings;
		myObj.enableFlash = vid_data.config.enable_flash;
		if (myObj.ratings == "true") {
			$("#RateThisVideo").show();
		} else {
			$("#RateThisVideo").hide();
		}
		// type video/flash doesn't work on mobile devices, fallback even on true .mp4 files
		audioFile = (currentvideo.name.search(".mp3") >= 0);
		if (audioFile ) {
			myObj.clip.sources[0].type = "audio/mp3";
		}

		if (currentvideo.passkey != undefined && currentvideo.passkey != "") {
			myObj.autoplay = false;
		}

		flowPlyr = $(".player").flowplayer(myObj);
		flowPlyr.on("ready", function (e, api) {
			myObj.start = new Date();
			if (currentvideo.content_id === undefined) {
				myObj.contentid = "";
			} else {
				myObj.contentid = currentvideo.content_id;
			}
			if (currentvideo.employee_id === undefined) {
				myObj.employee_id = 0;
			} else {
				myObj.employee_id = currentvideo.employee_id;
			}

			var screenWidth = $(window).width();
			var screenHeight = $(window).height();
			$('#VideoPlayerWrapper').css('width', screenWidth);
			$('#VideoPlayerWrapper').css('height', screenHeight);
		});

		//flowPlyr.on("click", function (e, api) {
		flowPlyr.on("click", function (e, api) {
			//$(".player").addClass("is-fullscreen");
			//flowPlyr.toggleFullscreen();
			//api.fullscreen();
			//window.close();
		});

		$("body").on("keypress", function (e) {
			if (e.keyCode == 27) { // /escape
				window.close();
			}
		});

		flowPlyr.on("finish", function (e, api) {
			/*
			var startDate = FormatDate(myObj.start);
			var stop = new Date();
			var stopDate = FormatDate(stop);
			$("#video_name_field").val(currentvideo.name);
			$("#content_id_field").val(myObj.contentid);
			$("#start_date_field").val(startDate);
			$("#end_date_field").val(stopDate);
			if (myObj.ratings == "true") {
				$("#requireRatings").html(true);
			}
			if (myObj.login == "true") {
				$("#requireEmployeeID").html(true);
				$('.modal-header').html(
					"<label class='videoName'><b>" + currentvideo.desc + "</b></label>");

				$('#loginModal').modal({
					backdrop: "static",
					keyboard: true,
					show: 'fade'
				}).addClass('modal-medium');
			} else {
				reportVideoStats(); // still need to report even if not logging in
			} */
			window.close();
		});

		if (currentvideo.passkey != undefined && currentvideo.passkey != "") {
			// popup passkey dialog if there is a passkey
			$('#passkey').val(currentvideo.passkey);
			$('#path').val(currentvideo.name);
			$('.modal-header').html(
				//"<label class='videoName'><b>" + video_src + "</b></label>");
				"<label class='videoName'><b>" + currentvideo.desc + "</b></label>");
			$('#passkeyModal').modal({
				backdrop: "static",
				keyboard: true,
				show: 'fade'
			}).addClass('modal-medium');
			$('#passkey_field').focus();

			$('#passkeyForm').fadeIn('slow');
		}
	} // end of dataLoaded

	// parse url window.location.href to get path parameter
	var loadpath = path
	if (breadcrumbs[0] == "FeaturedVideos" || $.cookie("currentfolder") == "FeaturedVideos") {
		loadpath = "slider";
		loadvodxmldata("slider", dataLoaded);
	} else {
		loadvodxmldata(path, dataLoaded);
	}

	//searchInit();

	$("#passkeyBtn").bind("click", function() {
		if (checkPasskey()) {
			$('#passkeyModal').modal('hide');
			myObj.play();
		}
	});

	$("#passkeyCancelBtn").bind("click", function() {
		$('#passkeyModal').modal('hide');
		window.history.back();
	});

	$("#passkeyForm").bind("keypress", function(e) {
		if (e.keyCode == 13) {
			if (checkPasskey())
				$('#passkeyModal').modal('hide');

			return false; // ignore default event
		}
	});

	function checkPasskey() {
		var retval = false; // assume failure
		passkey = $('#passkey_field').val();
		if (passkey != $('#passkey').val()) {
			alert('The entered passkey does not match. Please try again.');
			$('#passkey_field').val('');
		} else {
			// matches so play the content
			flowPlyr.data("flowplayer").play();
			retval = true;
		}
		return retval;
	}

	$("#RateThisVideo").mouseenter( function () {
		if (!ratingSubmitted) {
			$("#RateVideoNow").show();
			$("#RateThisVideo").hide();
		}
	});

	$("#RateVideoNow").mouseleave(function() {
		$("#RateThisVideo").show();
		$("#RateVideoNow").hide();
		return true;
	});

	$('#onestar').mouseenter(function () {
		rateStars(1);
	});

	$('#twostars').mouseenter(function () {
		rateStars(2);
	});

	$('#threestars').mouseenter(function () {
		rateStars(3);
	});

	$('#fourstars').mouseenter(function () {
		rateStars(4);
	});

	$('#fivestars').mouseenter(function () {
		rateStars(5);
	});

	$('#onestar').click(function () {
		rateStars(1);
		submitRating(currentvideo.name, 1);
	});

	$('#twostars').click(function () {
		rateStars(2);
		submitRating(currentvideo.name, 2);
	});

	$('#threestars').click(function () {
		rateStars(3);
		submitRating(currentvideo.name, 3);
	});

	$('#fourstars').click(function () {
		rateStars(4);
		submitRating(currentvideo.name, 4);
	});

	$('#fivestars').click(function () {
		rateStars(5);
		submitRating(currentvideo.name, 5);
	});

});
