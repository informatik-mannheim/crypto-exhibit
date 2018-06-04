jQuery.fn.reveal = function(animate) {
	return this.fadeIn(animate?null:0);
};
jQuery.fn.conceal = function(animate) {
	return this.fadeOut(animate?'fast':0, function() {
		// called for every element animated
		jQuery(this).attr("style", "display:none!important");
	});
};
jQuery.fn.revealOrConceal = function(visible, animate) {
	if(visible) { this.reveal(animate); }
	       else { this.conceal(animate); }
};

jQuery.id = function(tab, step, name) {
	return (arguments.length<3?step:name+step)+'-'+tab;
}
jQuery.element = function(tab, step, name) {
	return jQuery('#'+jQuery.id.apply(this, arguments));
}

function toDec(str) {
	return str.replace(/[^0-9]/g, String()).trim();
}
function toHex(str) {
	return str.replace(/[^0-9A-F]/ig, String()).replace(/(.{2})/g, '$1 ').trim().toUpperCase();
}

function convert(str) {
	if(!('functions' in convert)) convert.functions = {
		'text': {
			'hex': function(str) {
				var result = [];
				for(var offset=0, length=str.length; offset<length; offset++)
					result.push(('0'+Number(str.charCodeAt(offset)).toString(16)).substr(-2));
				return result.join(' ').toUpperCase();
			},
			'dec': function(str) {
				return convert(str).from('text').to()
			},
		},
		'hex': {
			'text': function(str) {
				str = str.replace(/[^0-9A-F]/ig, String()); var result = [];
				for(var offset=0, length=str.length; offset<length; offset+=2)
					result.push(String.fromCharCode(parseInt(str.substr(offset, 2), 16)));
				return result.join(String());
			},
			'dec': function(str) {
				return bigInt(str.replace(/ /g, String()), 16).toString();
			},
		}
		'dec': {
			'hex': function(str) {
				return toHex(bigInt(str).toString(16));
			},
			'text':
		},
	};

	var to = function(functions) {
		return function(to) {
			return functions[to](str);
		};
	};
	return {
		from: function(from) { return to(convert.functions[from]) },
		to: to(convert.functions['plain'])
	};
}

(function($) {
	'use strict'; // Start of use strict

	// Initialize document
	$(document).ready(function() {
		toggleStep(1, 1, false); // hide tab 1
		toggleStep(2, 1, false); // hide tab 2
		toggleCompare(false, false); // hide compare
	});

	// Enable tooltips & popovers
	//$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="popover"]').popover();
})(jQuery); // End of use strict

function toggleEncryptDecrypt(tab) {
	jQuery.element(tab, 'encryptDecrypt').find('span').text(jQuery.element(tab, 'encrypt').prop('checked')?'Encrypt':'Decrypt');
}

function getMode(tab, step) {
	return jQuery('input[name='+jQuery.id(tab, step, 'mode')+']:checked').val();
}
function changeMode(tab, step, mode) {
	if(arguments.length<3) mode = getMode(tab, step);

	var old = jQuery.element(tab, step, 'mode').data('mode')||'text';
	jQuery.element(tab, step, mode).prop('checked', true);
	jQuery.element(tab, step, 'mode').data('mode', mode);

	var editor = jQuery.element(tab, step, 'editor');
	if(old==)
	editor.val(hex?textToHex(editor.val()):hexToText(editor.val()));

	editor.toggleClass('text-monospace', mode=='hex');
}
function convertInput(tab, step) {
	var editor = jQuery.element(tab, step, 'editor');
	switch(getMode(tab, 2)) {
		case 'text': return;
		case 'dec': editor.val(toDec(editor.val())); break;
		case 'hex': editor.val(toHex(editor.val())); break;
	}
}
function toggleCompare(compare, animate) {
	if(arguments.length<2) { animate = compare; compare = !jQuery('#step1-2:visible').length; }
	jQuery('#compare i').removeClass('fa-plus-circle fa-minus-circle').addClass('fa-'+(!compare?'plus':'minus')+'-circle');
	jQuery('#compare a').text(!compare?'Add another tab to compare.':'Hide the comparison tab.');
	jQuery('#step1-2').revealOrConceal(compare, animate);
	if(compare) stepInput(2, 1); // simulate input to check if next step is also ready
	else toggleStep(2, 1, false, animate);
}
function toggleStep(tab, step, done, animate) {
	if(!done) { // hide all upcoming steps
		jQuery('div[id^="step"][id$="-'+tab+'"]:gt('+(step-1)+')').conceal(animate).promise().done(function() {
			// wait for all steps to hide, before revealing dummys without an animation, in order to not cause "wobbeling"
			jQuery('div[id^="dummy"][id$="-'+tab+'"]:gt('+(step-1)+')').reveal();
		});
		jQuery('div[id^="help"]:gt('+Math.max(step-1, jQuery('div[id^="step"][id$="-'+(tab%2+1)+'"]:visible').length-1)+')').conceal(animate);
	} else { // show the next step
		jQuery.element(tab, step+1, 'step').reveal(animate);
		jQuery.element(tab, step+1, 'dummy').conceal();
		jQuery('#help'+(step+1)).reveal(animate);
		stepInput(tab, step+1); // simulate input to check if next step is also ready
	}
}
function stepInput(tab, step) {
	var done = false;
	switch(step) {
		case 1: done = !!jQuery.element(tab, 'algorithm').val(); break;
		case 2: done = !!jQuery.element(tab, 'input').val(); break;
		case 3: done = true; break;
		case 4: done = !!jQuery.element(tab, 'output').val(); break;
		case 5: done = true; break;
	} toggleStep(tab, step, done, true);
}
function encryptDecrypt(tab) {
	var encrypt = jQuery.element(tab, 'encrypt').prop('checked');
	jQuery.element(tab, 5, 'text').prop('checked', !encrypt);
	jQuery.element(tab, 5, 'hex').prop('checked', encrypt);
	jQuery.element(tab, 'output').val('01 02');
}