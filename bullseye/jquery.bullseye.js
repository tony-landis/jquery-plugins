//
// bullsEye - an interactive table jQuery plugin
//
// (c) Copyright 2009 Tony Landis, website: http://www.tonylandis.com
// License: GPL
// Please leave this header intact.
// If you use this class I would be interested to see your implementation!
//

(function($) {
	
	
	$.fn.bullseye = function(options) {
		
		// override bullseyes's default settings
		var opts = $.extend({}, $.fn.bullseye.defaults, options);
		$table = this;
		
		// set the private max rows/cols values
		opts.max_cols = $table.find('th.'+ opts.class_th_col).length - opts.use_cols;
		opts.max_rows = $table.find('th.'+ opts.class_th_row).length - opts.use_rows;
		
		// set cell row/col
		row=-1;
		this.find('tr').each(function() {
			col = 0;
			$(this).find('td').each(function() {
				$(this).attr('rel', row + ',' + col);
				col += 1;
			});
			row += 1
		});
		
		// column heading handling, set column number and listeners
		var col = 0;
		$table.find('th.'+ opts.class_th_col).each(function() {
			
			// set col number for expression lookup later
			$(this).attr('rel', col);
			
			// set column heading listeners
			$(this).bind('mouseover', function() {
				var icol = $(this).attr('rel');
				
				// loop on all cells
				$table.find('td[rel$=,'+ icol +']').each(function(){
					var xy = $.fn.bullseye.get_cell_xy( $(this) );
					
					if( $(this).attr('class') == opts.class_td_hot) {
						// this is a hot cell, highlight it and draw a line to it from the row heading
						$table.find('th.'+ opts.class_th_row + '[rel='+ xy.row +']').addClass('th-sel'); 
						$.fn.bullseye.lines_draw_col($table, opts, icol, xy.row);
					} else {
						// hidden cell
						$table.find('th.'+ opts.class_th_row + '[rel='+ xy.row +']').addClass('th-hid');
					}
					$(this).addClass('sv');
				});
			}).bind('mouseout', function() {
				$table.find('td.sv').each(function(){
					$(this).removeClass('sv');
				});
				$table.find('th.'+ opts.class_th_row).each(function() {
					$(this).removeClass('th-sel').removeClass('th-hid');
				});
				$.fn.bullseye.lines_clear($table);
			});
			col += 1;
		});
		
		
		
		
		// row heading handling, set row number and listeners
		var row = 0;
		$table.find('th.'+ opts.class_th_row ).each(function() {
			
			// set col number for expression lookup later
			$(this).attr('rel', row);
			
			// set column heading listeners
			$(this).bind('mouseover', function() {
				var irow = $(this).attr('rel');
				
				// loop on all cells
				$table.find('td[rel^='+ irow +',]').each(function(){
					var xy = $.fn.bullseye.get_cell_xy( $(this) );
					if( $(this).attr('class') == opts.class_td_hot) {
						// this is a hot cell, highlight it and draw a line to it from the row heading
						$table.find('th.'+ opts.class_th_col + '[rel='+ xy.col +']').addClass('th-sel'); 
						$.fn.bullseye.lines_draw_row($table, opts, irow, xy.col);
					} else {
						// hidden cell
						$table.find('th.'+ opts.class_th_col + '[rel='+ xy.col +']').addClass('th-hid');
					}
					$(this).addClass('sv');
				});
			}).bind('mouseout', function() {
				$table.find('td.sv').each(function(){
					$(this).removeClass('sv');
				});
				$table.find('th.'+ opts.class_th_col).each(function() {
					$(this).removeClass('th-sel').removeClass('th-hid');
				});
				$.fn.bullseye.lines_clear($table);
			});
			row += 1;
		});



		// set cell-level listeners
		return this.find('td.' + opts.class_td_hot).each(function() {
		
			$cell = $(this);
			var xy = $.fn.bullseye.get_cell_xy($cell);
			
			$cell.bind('mouseover', function() {
				// add the selected class to this cell's column and row headings
				$table.find('th.'+ opts.class_th_col + '[rel='+ xy.col +']').addClass('th-sel');
				$table.find('th.'+ opts.class_th_row + '[rel='+ xy.row +']').addClass('th-sel');
				// draw the lines from this cell's column and row headings to this cell
				$.fn.bullseye.lines_draw_row($table, opts, xy.row, xy.col);
				$.fn.bullseye.lines_draw_col($table, opts, xy.col, xy.row);
			}).bind('mouseout', function() {
				// remove the selected class from this cell's column and row headings
				$table.find('th.'+ opts.class_th_col + '[rel='+ xy.col +']').each(function() { $(this).removeClass('th-sel') });
				$table.find('th.'+ opts.class_th_row + '[rel='+ xy.row +']').each(function() { $(this).removeClass('th-sel') });
				// clear the lines to this cell
				$.fn.bullseye.lines_clear($table);
			});
			
			// Conditional hover action
			// Enable with {'cellhover':true}
			// Requires Brian Cherne's excellent hoverIntent class: http://cherne.net/brian/resources/jquery.hoverIntent.html
			// hoverIntent is included in this distribution for the sake of convenience 
			if (opts.cell_hover == true)
			{
				$cell.hoverIntent({
					sensitivity: opts.cell_hover_sensitivity, 
					interval: opts.cell_hover_interval,
					over: function(e) {
							child = $(this).children(":first")[0];
							$.fn.bullseye.set_hover_position($table, opts, this, child);
						},
					out: function(e) {
							var child = $(this).children(":first")[0];
							var pos = $(this).position();
							$(child).stop().fadeOut('slow');
						}
					}
				);
			}
				
		});
	};
	 
	
	// 
	$.fn.bullseye.set_hover_position = function(table, opts, parent, child)
	{ 	
		xy = $.fn.bullseye.get_cell_xy(parent);
		var row = xy.row
		var col = xy.col
		
		// determine start col
		start_col = col - ( (opts.use_cols-1) / 2 );
		while ( start_col < 0 ) start_col += 1; 
		if( start_col >= opts.max_cols) start_col = opts.max_cols;
		end_col = start_col + opts.use_cols-1;
		 
		// determine start row 
		start_row = row - ( (opts.use_rows-1) / 2 );
		while ( start_row < 0 ) start_row += 1;
		if( start_row >= opts.max_rows) start_row = opts.max_rows;
		end_row = start_row + opts.use_rows-1;
		 
		// get the start row,col cell
		var start = table.find('td[rel='+start_row+','+start_col+']')[0];
		var start_pos = $(start).position();
		
		// get the end row,col
		var end =  table.find('td[rel='+end_row+','+end_col+']')[0];
		var end_pos = $(end).position();
		
		if (opts.cell_hover_effect == 'zoom')
		{
			// zoom in the cell hover content
			var pos = $(parent).position();
			$(child).css({  
				'top': pos.top,
				'left': pos.left,
				'height': parent.scrollHeight  + 'px',
				'width': parent.scrollWidth  + 'px',
				'opacity': .95
			});
			$(child).animate({  
				'top': start_pos.top,
				'left': start_pos.left,
				'margin-top': '-2px',
				'margin-left': '-2px',
				'height': (end_pos.top - start_pos.top  + (end.scrollHeight - 10)) +'px',
				'width':  (end_pos.left - start_pos.left + (end.scrollWidth - 10)) +'px'
			});

		} 
		else if (opts.cell_hover_effect == 'fade') 
		{
			// fade in the cell hover content
			$(child).css({
		 		'top': start_pos.top,
				'left': start_pos.left,
				'height': (end_pos.top - start_pos.top  + (end.scrollHeight - 10)) +'px',
				'width':  (end_pos.left - start_pos.left + (end.scrollWidth - 10)) +'px'
			}).fadeIn();
		
		} else {
			// error
		}
		
	};
	
	
	// get the row/col of the selected cell
	$.fn.bullseye.get_cell_xy = function(cell) {
		var s =  $(cell).attr('rel').split(',');
		return {
			'row': s[0], 
			'col': s[1]
		}
	};
	
	// draw horizontal lines
	$.fn.bullseye.lines_draw_row = function(table, opts, row, col) {
		
		// get the height of this row
		var parent = table.find('th.' + opts.class_th_row)[0];
		var width = parent.clientWidth;
		var height = parent.clientHeight;
		var center = width/2;
		  
		var count = 0; 
		table.find('td[rel$=,'+col+']').each(function(){
			if (count < row) { 
				$(this).addClass("line-col"); 
			}
			count++;
		});
	}
	
	// draw vertical lines
	$.fn.bullseye.lines_draw_col = function(table, opts, col, row) {
		var count = 0; 
		table.find('td[rel^='+row+'],').each(function(){
			if (count < col) $(this).addClass("line-row");
			count++;
		});
	}
	
	// clear all lines
	$.fn.bullseye.lines_clear = function (table) {
		table.find('td[class*=line]').each(function(){
			$(this).removeClass("line-col");
			$(this).removeClass("line-row");
		});
	}
	
	
 	//
	// bullseye default settings
	//
	$.fn.bullseye.defaults = {
		
		// cell hover settings
		'cell_hover': true,				// (true|false) enable/disable cell level display of extra content on mouseover
		'cell_hover_effect': 'fade', 	// (fade|zoom) the effect to use when showing/hiding the extra content
		'cell_hover_sensitivity':1,		// (int) passed directly to hoverIntent
		'cell_hover_interval':120,		// (int) passed directly to hoverIntent
		'use_cols':3,					// (an uneven number >= 3) how many columns to span
		'use_rows':5,					// (an uneven number >= 3) how many rows to span

		// class names
		'class_td_hot': 'hot',
		'class_th_row': 'row',
		'class_th_col': 'col',

		// private
		'max_rows':0,
		'max_cols':0
	};
	
}) (jQuery);