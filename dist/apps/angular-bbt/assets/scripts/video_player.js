var loginCnt=0;

function generate_flowplayer_key() {
	var domain = window.location.host.match(/[^.]+\.[^.]+$/);
	return hex_md5(domain + "5def6b5b437d601a914").substring(11, 30);
}

function cleanPlayer() {
	// initialize stored fields so they aren't visible
	$('#ratingBtn').show();
	$('#ratingLabel').html("Rate Video");
	$('#star_rating').show();
	$('#star_rating').prop('selectedIndex', 0);
	//$('#video_name_field').attr({value:""});  // don't clear out for repeat
	$('#employee_id_field').attr({value:""});
}

function trunc_version (version)
{
	var ret_ver = "";
	var ver_array = version.split(".");
  if (ver_array.length == 1) {
	ret_ver = ver_array[0];
  } else if (ver_array.length > 1) {
	ret_ver = ver_array[0] + "." + ver_array[1];
  }
  return ret_ver;
}

function reportVideoStats(employeeID) {
	var video_name = "";
	var start_date = "";
	var end_date = "";
	var star_rating = "";
	var employeeIDStr = "";
	var result = "";

	if ($.isNumeric(employeeID) == true) {
		employeeIDStr = "&employee_id=" + employeeID;
	}
	var reqRatings = $("#requireRatings").text();
	var lmsServer = $("#lmsServer").text();
	var content_id = $('#content_id_field').val();
	video_name = $('#video_name_field').val();
	start_date = $('#start_date_field').val();
	end_date = $('#end_date_field').val();
	var parser = new UAParser();
	result = parser.getResult();

	var dataString = employeeIDStr + '&video_name=' + video_name + '&content_id=' +
		content_id + '&start_date=' + start_date + '&end_date=' + end_date +
		'&device=HS3000&os=' + result.os.name + ' ' + trunc_version(result.os.version)
		+ '&browser=' + result.browser.name + ' ' + trunc_version(result.browser.version);

	submitReportingData(dataString);

	// assume lms event
	if (video_name.search("/opt/VA/c") < 0 && lmsServer.length > 0 && content_id.length > 0 && employeeID != 0) {
		// ajax
		$.ajax({
			url: "/video_player/submit_lms_event_reporting_data",
			type: "GET",
			dataType: "json",
			data: "employee_id=" + employeeID + "&content_id=" + content_id,

			success: function(response) {
				if (response.code == 200) {
					alert("Login SUCCEEDED.");
				} else {
					if (typeof(response.message) != "undefined")
						// LMS Server returns this
						alert("Login FAILED. " + response.message);
					else
						// Test Server returns and is expected by EPG
						alert("Login FAILED. " + response.text);
				}
			},
			error: function(response) {
				// put the error in the alert
				alert("Employee: " + employeeID + ", FAILED login. HTTP return code=" + response.code);
			}
		});
	}
	cleanPlayer();
}

function checkLogin() {
	var employee_id = "";

	employee_id = $('#employee_id_field').val();

	// initial validation
	if (employee_id == "")
	{
		// do not write to the database some field is missing
		alert('Please enter your Employee ID');
	}
	//else if ($.isNumeric(employee_id) == false)
	else if (!$.isNumeric(employee_id))
		alert('Your Employee ID must be a number');
	else if (employee_id.length > 10)
		alert('Your Employee ID must be 10 characters or less');
	else
	{
		// ajax get_employee_name(emp_id) returns emp_name
		var emp_name = "";
		$.ajax({
			url: '/video_player/get_employee_name',
			data: "emp_id="+employee_id,
			success: function(response) {
				emp_name = response;
				if (emp_name != ""){
					var confirm_employee_name = confirm("Are you " + emp_name + "?");
					if(confirm_employee_name) {
						reportVideoStats(employee_id);
					}
				}
				else if (employee_id != "") {
					var confirm_new_employee = confirm("Are you sure " + employee_id + " is correct?");

					if(confirm_new_employee) {
						reportVideoStats(employee_id);
					}
				}
			},
			error: function(response) {
			}
		});
	} // end of else

}  // end of click event

function submitReportingData(dataString) {
	// write the data to the database
	$.ajax({
		url: "/video_player/submit_reporting_data",
		dataType: "xml",
		type: "GET",
		data: dataString,
		success: function(	response) {
			//$('#employeeForm').hide();
			// this fixes the ipad navbar jumping bug
			// but may cause another bug that blocks the form from saving.
			//location.reload(); // don't to reload with the new interface
			var error = $(response).find("errors");
			if (error.length > 0) {
				alert("Login FAILED: " + error[0].childNodes[0].nodeValue);
			} else {
				var empID = $('#employee_id_field').val();
				if (empID != "" &&
					confirm("Login SUCCEEDED.  Login another user?")) {

					// clear out the login id to prepare for next LOG_INFO
					$('#employee_id_field').val('');
					$('#employee_id_field').focus();
				} else if ($('#loginModal').is(':visible')){
					// cancel login dialog, no further logins desired
					$("#loginCancelBtn").click();
					//$('#myModal').modal('hide');
				}
			}
			//$('#myModal').hide();
		},
		error: function(response) {
			alert("Login FAILED");
			$('#employee_id_field').val('');
			$('#employee_id_field').focus();
		}
	});
	// close the modal only if the ajax fires and multiple login disabled
	//$('#loginModal').modal('hide') // there is no modal with the new interface
}

$(document).ready(function() {
	// Prepare to report data
	$("#ratingBtn").bind("click", function() {
		var event_name = $("#video_name_field").val();
		var stars = $("#star_rating").val();
		if (stars > 0) {
			var dataString = 'video_name=' + event_name + '&star_rating=' + stars;
			submitReportingData(dataString);
			$("#ratingBtn").hide();
			$("#star_rating").hide();
			$("#ratingLabel").html(stars + " star rating submitted");
		} else {
			alert("No rating was selected");
		}
	});

	$("#reportBtn").bind("click", function() {
		loginCnt++;
		checkLogin();
	});

	$("#loginCancelBtn").bind("click", function() {
		$('#employee_id_field').val(''); // clear out edit field
		if (loginCnt === 0) {
			loginCnt++;
			reportVideoStats(0); // stats still need to report just not login
		}
	});

	// keypress didn't work for ESC (27)
	$("#employeeForm").bind("keyup", function(e) {
		if (e.keyCode == 13) {
			checkLogin();
			loginCnt++;
			return false; // ignore default event
		} else if (e.keyCode == 27) {
			if (loginCnt === 0) {
					reportVideoStats(0); // report something if nothing prevously
			}
		}
	});

	// CHOOSE listItem (video), this is for Live not VOD
	$(document).on("click", ".listItem", function(){
		$('#playerContainer').html("");

		var video_src = (this.id);

		var video_file_name;
		var video_dur;

		var reqRatings = $("#requireRatings").text() == "true";
		var reqEmployeeID = $("#requireEmployeeID").text() == "true";
		var firstEventName = $(this).parent().parent().find(".firstEvent").val();
		var firstEventStartTime = $(this).parent().parent().find(".firstEventStartTime").val();
		var firstEventStopTime = $(this).parent().parent().find(".firstEventStopTime").val();
		var firstEventTimeCode = $(this).parent().parent().find(".firstEventTimeCode").val();
		if (firstEventName) {
			$('#video_name_field').attr({value:firstEventName});
			$('#start_time_field').attr({value:firstEventStartTime});
			$('#stop_time_field').attr({value:firstEventStopTime});
			$('#content_id_field').attr({value:firstEventTimeCode});
		}

		var start_date = new Date;
		$('#start_date_field').attr({value:start_date});

		$(".modal-footer").hide();
		if ((reqRatings || reqEmployeeID) && firstEventName) {
			if (reqRatings) {
				$(".modal-footer").show(); // ratings is enabled
			}
			if (!reqEmployeeID) {
				$("#empLabel").hide();
				$("#employee_id_field").hide();
			}
		}

		// Under Chrome, sometimes a minature video window renders. It fixes itself
		// by with this width adjustment which forces a redraw.  Multiple adjustments
		// are done here so that the user doesn't have to wait the full time for
		// correct rendering.
		setTimeout(function(){ $("#player").css({width:641}); }, 3000);
		setTimeout(function(){ $("#player").css({width:640}); }, 7000);
		setTimeout(function(){ $("#player").css({width:641}); }, 11000);
		setTimeout(function(){ $("#player").css({width:640}); }, 20000);
		if (video_src.search("http://") >= 0 || video_src.search("rtmp://") >= 0) {
			video_file_name = $(this).text()
			video_dur = "";
		} else {
			video_file_name = $(this).children('.thumbnailLegend').text();
			video_dur = $(this).children('.videoDuration').text();
		}
		var thumbnail = $(this).find('img').attr('src');

		part1 = "<a href='"+video_src+"'"
		part2 = "style='display:block;width:640px;height:360px'"
		part3 = "id='player'>"
		part4 = "</a>"
		$('#playerContainer').append(part1+part2+part3+part4);

		var start_date = "";
		var end_date = "";
		//var flow_player_key = $('#flow_player_key').text();
		var flow_player_key = generate_flowplayer_key();

		//var player = $f("player", "../javascripts/flowplayer/flowplayer.unlimited-3.2.12.swf", {
		var player = $f("player", "../javascripts/flowplayer/flowplayer.unlimited-3.2.18.swf", {
		//var player = $f("player", "../javascripts/flowplayer/flowplayer-3.2.15.swf", { // originally
		// product key from your account
			key: flow_player_key,
			showErrors:false,

			clip: {
				autoPlay:true,
				autoBuffering:true,
				live: true,
				onStart: function() {
					var sd = new Date();
					var start_date = sd;
					//$('#start_date_field').attr({value:start_date});
					if (video_src.search(".mp3") >= 0) {
						$f().getControls().setAutoHide({enabled: false});
					}
					this.setVolume(100);
					this.unmuted();
				},
				coverImage: { url: thumbnail, scaling: 'fit' }, // fit, orig, scale also options
				onFinish: function() {
					var ed = new Date();
					end_date = ed;
					this.unload();
					$(".modal-footer").show();
					gatherVideoStats(start_date, end_date, video_src);
				}
			},
			plugins: {
				rtmp: {
					url: "../javascripts/flowplayer/flowplayer.rtmp-3.2.13.swf"
				},
				audio: {
					url: '../javascripts/flowplayer/flowplayer.audio-3.2.11.swf'
				},
				controls: {
					url: "../javascripts/flowplayer/flowplayer.controls-3.2.16.swf"
				}
			},
			canvas: {
				backgroundColor: '0x000000',
				backgroundGradient: 'none' // low, med, high, or [0.0,1.0] opacity values
			},

			onError: function(err) {
				if (err == "200") {
					$("#playerContainer").html("<div class='alert alert-error'>This file format cannot be played on this device.</div>");
				}
				else if (err == "100" || err == "201" || err == "202" || err == "300" || err == "301" || err == "302" || err == "303")
				{
					$("#playerContainer").html("<div class='alert alert-error'>This file format cannot be played on this device.</div>");
				}
			}
		}).ipad();
		if (video_dur.length == 0)
		$('.modal-header').html("<a class='close' data-dismiss='modal'>Close</a>" +
		"<label class='videoName'>" + video_file_name + "</label>");
	else
		$('.modal-header').html("<a class='close' data-dismiss='modal'>Close</a>" +
			"<label class='videoName'>" + video_file_name + " ("+ video_dur+")</label>");

		$('#myPlayer').modal({
			backdrop: "static",
			keyboard: true,
			show: 'fade'
		}).addClass('modal-big');

		$('#myPlayer').on('hidden', function() {
			// submit reporting data if an event
			var startDate = $('#start_date_field').val();
			var ed = new Date();
			var endDate = ed;
			var videoSrc = $('#video_name_field').val();
			var lmsServer = $("#lmsServer").text();
			var classTimeId = $('#content_id_field').val();
			$('#end_date_field').attr({value:endDate});

			if (videoSrc.length > 0 && (lmsServer.length == 0 || classTimeId.length > 0)) {
				reqEmployeeID = $("#requireEmployeeID").text();
				if (reqEmployeeID == "true") {
					$('.modal-header').html(
					   "<label class='videoName'><b>" + videoSrc + "</b></label>");
					$('#loginModal').modal({
						backdrop: "static",
						keyboard: true,
						show: 'fade'
					}).addClass('modal-medium');
					$('#employee_id_field').focus();
				} else {
					gatherVideoStats(startDate, endDate, videoSrc);
					reportVideoStats();
				}
			}
		});

		$('#myPlayer').on('keydown', function(e) {
			if (e.keyCode == 27) {  // ESC
				window.close();
			}
		})

		return false;

	});

	function gatherVideoStats(start_date, end_date, video_name) {
		// check for required_fields
		var reqRatings = $("#requireRatings").text();
		var reqEmployeeID = $("#requireEmployeeID").text();
		// both fields are required
		if (reqRatings == "true" && reqEmployeeID == "true") {
			// write video_name, start_date, end_date to form
			$('#video_name_field').attr({value:video_name});
			$('#start_date_field').attr({value:start_date});
			$('#end_date_field').attr({value:end_date});
			$('#employeeForm').fadeIn('slow');
		}
		// employee_id only
		else if (reqRatings != "true" && reqEmployeeID == "true") {
			$(".star").hide();
			$(".star-rating-control").hide();
			$('#ratingLabel').hide();
			$('#video_name_field').attr({value:video_name});
			$('#start_date_field').attr({value:start_date});
			$('#end_date_field').attr({value:end_date});
			$('#employeeForm').fadeIn('slow');
		}
		// ratings only
		else if (reqRatings == "true" && reqEmployeeID != "true") {
			$('#video_name_field').attr({value:video_name});
			$('#start_date_field').attr({value:start_date});
			$('#end_date_field').attr({value:end_date});
			$('#empLabel').hide();
			$('#employee_id_field').hide();
			$('#employeeForm').fadeIn('slow');
		}
	}


});  /* end .ready() */
