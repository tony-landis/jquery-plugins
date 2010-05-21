//
// jQuery plugin to take a normal input field containing 24 hour formatted time (HH:MM:SS), 
// and create options for the selection of hour, minute, AM/PM,
// updating the user's selection back to 24 hour format in the input field.
//
// (c) Copyright 2009 Tony Landis, website: http://www.tonylandis.com
// License: GPL
//
// Please leave this header intact.
// If you use this class I would be interested to see your implementation!
//

(function($) {

	$.fn.selecttime = function(options) {
		$opts = $.extend({}, $.fn.selecttime.defaults, options);
		var $field = this;

		// hide the input field
		$field.hide();

		// get ids
		var id_am_pm = $(this).attr('id') + 'ap';
		var id_mins = $(this).attr('id') + 'mn';
		var id_hours = $(this).attr('id') + 'hr';

		// generate the select options
		var i=0;
		var mins, hours;
		for(i=0; i<60; i+= $opts['increment']) { 
			var min=i;
			if (i < 10) min = "0"+ i;
			mins += '<option value='+ i +'>'+min+'</option>';
		}
		
		// Show 12 first, since 12 am < 1 am and 12 pm < 1 pm. 
		// Never realized how non-intuitive 12 hour clock system is... 24 hour format should be standard.
		hours += '<option value="12">12</option>'; 
		for(i=1; i<=11; i+=1) { 
			hours += '<option value='+ i +'>'+i+'</option>';
		}
	
		// add to the DOM
		$field.after('<select id="'+ id_am_pm +'"><option value="am">AM</option><option value="pm">PM</option></select>');
		$field.after('<select id="'+ id_mins  +'">'+mins+'</select>');
		$field.after('<select id="'+ id_hours +'">'+hours+'</select>');

		// get the current values
		var cur = $field.val().split(":");
		var cur_min = Number(cur[1]);
		var cur_hour = Number(cur[0]);
		var cur_am_pm;
		if (cur_hour == 0) {
			cur_am_pm = 'am';
			cur_hour = 12;
		} else if (cur_hour == 12) {
			cur_am_pm = 'pm';
		} else if (cur_hour < 12) {
			cur_am_pm = 'am'
		} else if (cur_hour > 12) {
			cur_am_pm = 'pm';
			cur_hour -= 12;
		}
		
		// set the defaults
		$('#' + id_am_pm).val(cur_am_pm);
		$('#' + id_hours).val(cur_hour);
		$('#' + id_mins).val(cur_min);
		if (!$('#' + id_mins).val()) {
			// current minute not in the option list
			$('#' + id_mins).val(0);
		}
	
		// set the event handlers
		$('#'+id_am_pm + ', #'+id_hours+ ', #'+id_mins).change(function(e) {
			// handle change to hour, minute, or am/pm
			cur_am_pm = $('#' + id_am_pm).val();
			cur_min = Number( $('#' + id_mins).val() );
			cur_hour = Number( $('#' + id_hours).val() );
			if (cur_am_pm == 'pm') {
				if (cur_hour != 12) cur_hour += 12;	
			} else {
				if (cur_hour == 12) cur_hour = 0;
			}
			if (cur_min < 10) cur_min = "0" + cur_min;
			if (cur_hour < 10) cur_hour = "0" + cur_hour;
			// write to hidden field
			$field.val(cur_hour + ':' + cur_min + ':00');
			//window.console.log($field.val());
		});
		return $field;
	};
	
	//
	// config defaults
	//
	$.fn.selecttime.defaults = {
		'increment': 15, // 1|5|10|15|30
	};
}) (jQuery);
