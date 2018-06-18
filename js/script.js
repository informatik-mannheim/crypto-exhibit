var BigInteger = forge.jsbn.BigInteger;

jQuery.reduce = function(array, callback, initial){
	initial = typeof initial==='undefined'?0:initial;
	jQuery.each(array, function(index, value) {
		initial = callback.call(this, initial, value, index); });
	return initial;
};
jQuery.fn.reduce = function(callback, initial){
	return jQuery.reduce(this, callback, initial);
};

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
/** 
	parameter(1) -> all parameters of tab 1
	parameter(1, true) -> all parameter groups of tab 1
	parameter(1, 'rsa') -> all rsa parameters of tab 1
	parameter(1, 'rsa', true) -> all rsa parameter groups of tab 1
	parameter(1, 'rsa', 'p') -> rsa parameter p of tab 1
	parameter(1, 'rsa', 'p', true) -> rsa parameter group p of tab 1
*/
jQuery.parameter = function(tab, algorithm, name, group) {
	if(typeof algorithm=='boolean') { name = algorithm; algorithm = null; }
	if(typeof name=='boolean') { group = name; name = null; }
	var type = (!group?'parameter':'group');
	return algorithm&&name?jQuery.element(tab, type+[algorithm, name].join('_')):
		jQuery('[id^="'+type+(algorithm?algorithm+'_':String())+'"][id$="-'+tab+'"]'+(!group?':input':String()));
}

function randomBytes(count) {
	return convert(forge.random.getBytesSync(count)).from('text').to('hex');
}
function randomPrime(bits) {
	return jQuery.Deferred(function(defer) {
		forge.prime.generateProbablePrime(bits, function(err, num) {
			if(!err) defer.resolve(num.toString()); else defer.reject(err);
		});
	}).promise();
}
function rsaRandomE(tab) {
	return jQuery.Deferred(function(defer) {
		(function wait() {
			var p = jQuery.parameter(tab, 'rsa', 'p').val(), q = jQuery.parameter(tab, 'rsa', 'q').val();
			if(p&&q) {
				var n = new BigInteger(p).multiply(new BigInteger(q));
				defer.resolve(n.toString());
			} else setTimeout(wait, 50);
		})();
	}).promise();
}

function convert(str) {
	if(!('functions' in convert)) convert.functions = {
		'hex': {
			'text': function(str) {
				var str = str.replace(/[^0-9A-F]/ig, String()); var output = [];
				if(!str||/^0+$/.test(str)) return String();
				for(var offset=0, length=str.length; offset<length; offset+=2)
					output.push(String.fromCharCode(parseInt(str.substr(offset, 2), 16)));
				return output.join(String());
			},
			'dec': function(str) { return new BigInteger(str.replace(/ /g, String()), 16).toString(); },
		},
		'dec': {
			'hex': function(str) {
				return convert(new BigInteger(str).toString(16)).to('hex');
			},
			'text': function(str) { return convert(str).from('dec').to('hex', 'text'); },
		},
		'text': {
			'hex': function(str) {
				var output = [];
				for(var offset=0, length=str.length; offset<length; offset++)
					output.push(('0'+Number(str.charCodeAt(offset)).toString(16)).substr(-2));
				return output.join(' ').toUpperCase();
			},
			'dec': function(str) { return convert(str).from('text').to('hex', 'dec'); },
		},
		false: {
			'hex': function(str) { return str.replace(/[^0-9A-F]/ig, String()).replace(/(.{2})/g, '$1 ').trim().toUpperCase(); },
			'dec': function(str) { return str.replace(/[^0-9]/g, String()).trim(); },
			'text': function(str) { return str; }
		}
	};

	var to = function(from) {
		return {
			to: function() {
				jQuery.each(arguments, function(index, to) {
					if(from!=to) {
						str = convert.functions
							[from][to](str);
						from = to;
					}
				}); return str;
			}
		};
	};
	return {
		from: function(from) {
			return to(from);
		}, to: to(false).to
	};
}

(function($) {
	'use strict'; // Start of use strict

	// Initialize document
	$(document).ready(function() {
		toggleStep(1, 1, false); // hide tab 1
		toggleStep(2, 1, false); // hide tab 2
		toggleCompare(false, false); // hide compare
		toggleHelp(1, null, false); // hide non-generic helps
		jQuery('textarea[data-mode]').each(function() {
			var id = jQuery(this).attr('id').split('-');
			changeMode(id[1], id[0], jQuery(this).data('mode'));
		});
	});

	// Enable tooltips & popovers
	//$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="popover"]').popover();
})(jQuery); // End of use strict

var steps = (function(step) {
	return {
		algorithm: step=1,
		input: ++step,
		parameters: ++step,
		execute: ++step,
		output: ++step
	};
}());

function toggleEncryptDecrypt(tab) {
	jQuery.element(tab, 'encryptdecrypt').find('span').text(jQuery.element(tab, 'encrypt').prop('checked')?'Encrypt':'Decrypt');
}

function getAlgorithm(tab) {
	return jQuery.element(tab, 'algorithm').val();
}

function getMode(tab, name) {
	return jQuery('input[name='+jQuery.id(tab, name+'mode')+']:checked').val();
}
function changeMode(tab, name, mode) {
	if(arguments.length<3) mode = getMode(tab, name);

	var old = jQuery.element(tab, name+'mode').data('mode')||'text';
	jQuery.element(tab, name+mode).prop('checked', true);
	jQuery.element(tab, name+'mode').data('mode', mode);

	var editor = jQuery.element(tab, name);
	editor.val(convert(editor.val()).from(old).to(mode));
	editor.toggleClass('text-monospace', mode=='hex');
}
function convertEditor(tab, name) {
	var editor = jQuery.element(tab, name);
	editor.val(convert(editor.val()).to(getMode(tab, name)));
}
function toggleCompare(compare, animate) {
	if(arguments.length<2) { animate = compare; compare = !jQuery('#step'+steps.algorithm+'-2:visible').length; }
	jQuery('#compare i').removeClass('fa-plus-circle fa-minus-circle').addClass('fa-'+(!compare?'plus':'minus')+'-circle');
	jQuery('#compare a').text(!compare?'Add another tab to compare.':'Hide the comparison tab.');
	jQuery('#step'+steps.algorithm+'-2').revealOrConceal(compare, animate);
	if(compare) stepInput(2, steps.algorithm); // simulate input to check if next step is also ready
	else toggleStep(2, steps.algorithm, false, animate);
}
/**
  toggleStep(1, 2, false, true/false) -> hide step 2 on tab 1 and all upcoming steps
  toggleStep(1, 2, 'eq', true/false) -> hide only step 2 on tab 1 (used for parameters)
  toggleStep(1, 2, true, true/false) -> show step 2 on tab 1 and check for upcoming step if done too
*/
function toggleStep(tab, step, done, animate) {
	if(!done||typeof done=='string') { // hide (all upcoming) steps
		jQuery('div[id^="step"][id$="-'+tab+'"]:'+(done||'gt')+'('+(step-1)+')').conceal(animate).promise().done(function() {
			// wait for all steps to hide, before revealing dummys without an animation, in order to not cause "wobbeling"
			jQuery('div[id^="dummy"][id$="-'+tab+'"]:'+(done||'gt')+'('+(step-1)+')').reveal();
		});
		jQuery('div[id^="help"]:'+(done||'gt')+'('+Math.max(step-1, jQuery('div[id^="step"][id$="-'+(tab%2+1)+'"]:visible').length-1)+')').conceal(animate);
	} else { // show the next step
		jQuery.element(tab, step+1, 'step').reveal(animate);
		jQuery.element(tab, step+1, 'dummy').conceal();
		jQuery('#help'+(step+1)).reveal(animate);
		stepInput(tab, step+1); // simulate input to check if next step is also ready
	}
}
function toggleParameters(tab, algorithm, animate) {
	var parameters = jQuery.parameter(tab, algorithm, true);
	if((parameters=jQuery.parameter(tab, algorithm, true)).length) { // switch animation, in case parameters are shown ...
		animate = jQuery.parameter(tab).filter(':visible').length&&animate; // animate in case other parameters are already visible, otherwise the reveal animation of the step will do
		jQuery.parameter(tab, true).conceal(animate).promise().done(function() {
			parameters.each(function() {
				var parameter = jQuery(this).find('[data-value]:input'), value;
				if(!parameter.val()&&(value=parameter.data('value'))) {
					if(/(.*)$/i.test(value)&&jQuery.isFunction((value=eval(value)).promise)) {
						value.then(function(value) { parameter.val(value); });
					} else parameter.val(value);
				}
			}).reveal(animate);
		});
	} else toggleStep(tab, steps.parameters, 'eq', animate); // ... otherwise hide the complete step (with animation)
}
function toggleHelp(tab, algorithm, animate) {
	var count = 3, selector = {
		help: 'div[id^="help"]', more: 'button',
		reveal: '[data-help="all"], [data-help="'+algorithm+'"]',
		conceal: '[data-help][data-help!="all"][data-help!="'+algorithm+'"]'
	};
	jQuery.when.apply(this, [ jQuery(selector.conceal).conceal(animate).promise() ].concat(
		jQuery(selector.help).map(function() {
			return jQuery(this).children(selector.reveal).filter(':gt('+(count-1)+')').stop().conceal(animate).promise();
		})
	)).done(function() {
		jQuery(selector.help).each(function() {
			var help = jQuery(this);
			help.children(selector.reveal).filter(':lt('+count+')').reveal(animate);
			help.children(selector.more).revealOrConceal(!!help
				.children(selector.reveal).filter(':gt('+(count-1)+')').length, animate);
		});
	});
}

function showMore(step) {
	jQuery('#help'+step).children('button').conceal(true).end()
		.children('[data-help="all"], [data-help="'+getAlgorithm()+'"]').reveal(true);
}

function stepInput(tab, step) {
	var done = false, algorithm = getAlgorithm(tab);
	switch(step) {
		case steps.algorithm:
			toggleParameters(tab, algorithm, true);
			toggleHelp(tab, algorithm, true);
			done = !!algorithm; break;
		case steps.input:
			done = !!jQuery.element(tab, 'input').val();
			if(done&&!jQuery.parameter(tab, algorithm, true).length) {
				stepInput(tab, step+1);
				return;
			} break;
		case steps.parameters:
			done = jQuery.parameter(tab, algorithm).reduce(function(current) {
				return current&&!!jQuery(this).val();
			}, true); break;
		case steps.execute:
			done = !!jQuery.element(tab, 'output').val(); break;
		case steps.output:
			done = true; break;
	} toggleStep(tab, step, done, true);
}

function encryptDecrypt(tab) {
	var encrypt = jQuery.element(tab, 'encrypt').prop('checked');
	changeMode(tab, 'output', getMode(tab, 'input')!='dec'?(encrypt?'hex':'text'):'dec');

	jQuery.element(tab, 'output').val('01 02');
}