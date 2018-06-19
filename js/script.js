var BigInteger = forge.jsbn.BigInteger;

Array.sliceArguments = function(args) {
	return Array.prototype.slice.apply(args,
		Array.prototype.slice.call(arguments, 1));
};
Array.spliceArguments = function(args) {
	var array = jQuery.makeArray(args);
	Array.prototype.splice.apply(array,
		Array.sliceArguments(arguments, 1))
	return array;
};
Array.concatArguments = function(args) {
	return Array.prototype.concat.apply(jQuery.makeArray(args),
		Array.sliceArguments(arguments, 1));
};

String.prototype.format = function() {
	var args = arguments;
	return this.replace(/\$(\d+)/g, function(match, number) { 
		return typeof args[number-1]!='undefined'?args[number-1]:match;
	});
};
String.prototype.rot = function(places) {
	return this.replace(/[a-zA-Z]/g, function(character){
		return String.fromCharCode((character<='Z'?90:122)>=(character=
			character.charCodeAt(0)+((places%26+26)%26))?character:character-26);
	});
}

var steps = (function(step) {
	return {
		algorithm: step=1,
		input: ++step,
		parameters: ++step,
		execute: ++step,
		output: ++step
	};
}());

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

function elementId(tab, name) {
	if(typeof tab=='string') { return elementId.apply(
		this, Array.spliceArguments(arguments, 0, 0, 0)) }
	var parts = jQuery.reduce(Array.sliceArguments(arguments, 2),
		function(current, part) { return part?current+'-'+part:current; }, name)
	return tab?'$2\\[$1\\]'.format(tab, parts):parts;
}
function elementsSelector(tab, name) {
	if(typeof tab=='string') { return elementsSelector.apply(
		this, Array.spliceArguments(arguments, 0, 0, 0)) }
	var selector = ['[id|="$1"]'.format(name)];
	if(tab) selector.push('[id$="[$1]"]'.format(tab));
	jQuery.each(Array.sliceArguments(arguments, 2), function(index, part) {
		if(part) selector.push(/^:/.test(part)?part:'[id*="-$1"]'.format(part));
	}); return selector.join(String());
}
function matchElementId(id) {
	return /(.+)\[(\d+)\]/.exec(id);
}

jQuery.element = function(tab, name) {
	return jQuery('#'+elementId.apply(this, arguments));
}
jQuery.elements = function(tab, name) {
	return jQuery(elementsSelector.apply(this, arguments));
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
	return name?jQuery.element(tab, group!==true?'parameter':'group', algorithm, name):
		jQuery.elements(tab, !group?'parameter':'group', algorithm, group!==true?':input':null);
}
/**
 * returns a parameter value as text (editors are converted to text / bytes)
 */
function parameterValue(tab, algorithm, name) {
	var parameter = jQuery.parameter(tab, algorithm, name);
	if(parameter.prop('tagName')=='TEXTAREA')
	     return convert(parameter.val()).from(getMode(tab, matchElementId(parameter.attr('id'))[1])).to('text');
	else if(parameter.attr('type')=='checkbox')
	     return parameter.is(':checked');
	else return parameter.val();
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
			'dec': function(str) { return new BigInteger(str.replace(/ /g, String()), 16).toString(); },
			'text': function(str) { return forge.util.hexToBytes(str.replace(/[^0-9A-F]/ig, String())); },
		},
		'dec': {
			'hex': function(str) { return convert(new BigInteger(str).toString(16)).to('hex'); },
			'text': function(str) { return convert(str).from('dec').to('hex', 'text'); },
		},
		'text': {
			'hex': function(str) { return convert(forge.util.bytesToHex(str)).to('hex'); },
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
				}); return str; /*arguments.length?convert.functions //last step is always to convert it to the output format
					[false][arguments[arguments.length-1]](str):*/
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
			var that = jQuery(this), id = matchElementId(that.attr('id'));
			changeMode(parseInt(id[2]), id[1], that.data('mode'));
		});
		// all rows start with d-none, in order to prevent flashing up on page load
		jQuery('.container>.row').hide().removeClass('d-none').reveal(true);
	});

	// Enable tooltips & popovers
	//$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="popover"]').popover();
})(jQuery); // End of use strict

function toggleEncryptDecrypt(tab) {
	jQuery.element(tab, 'encryptdecrypt').find('span').text(jQuery.element(tab, 'encrypt').prop('checked')?'Encrypt':'Decrypt');
}

function getAlgorithm(tab) {
	return jQuery.element(tab, 'algorithm').val();
}

function getMode(tab, name) {
	return jQuery('input[name=$1]:checked'.format(elementId.apply(this,
		Array.concatArguments(arguments, 'mode')))).val();
}
function changeMode(tab, name, mode) {
	if(arguments.length<3) { return changeMode(tab, name, getMode(tab, name)); }

	var editor = jQuery.element.apply(this, Array.spliceArguments(arguments, arguments.length-1)),
		group = editor.next('div'), radio = group.find('input[type="radio"][id*="-$1"]'.format(mode));

	var old = group.data('mode')||'text';
	radio.prop('checked', true);
	group.data('mode', mode);

	editor.val(convert(editor.val()).from(old).to(mode));
	editor.toggleClass('text-monospace', mode=='hex');
}

function convertEditor(tab, name) {
	var editor = jQuery.element.apply(this, arguments);
	editor.val(convert(editor.val()).to(getMode.apply(this, arguments)));
}
/**
 * get editor value as text
 */
function editorValue(tab, name) {
	return convert(jQuery.element.apply(this, arguments).val())
		.from(getMode.apply(this, arguments)).to('text');
}

function toggleCompare(compare, animate) {
	if(arguments.length<2) { animate = compare; compare = !jQuery.elements(2, 'step', steps.algorithm, ':visible').length; }
	jQuery('#compare i').removeClass('fa-plus-circle fa-minus-circle').addClass('fa-$1-circle'.format(!compare?'plus':'minus'));
	jQuery('#compare a').text(!compare?'Add another tab to compare.':'Hide the comparison tab.');
	jQuery.element(2, 'step', steps.algorithm).revealOrConceal(compare, animate);
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
		jQuery.elements(tab, 'step', ':'+(done||'gt')+'('+(step-1)+')').conceal(animate).promise().done(function() {
			// wait for all steps to hide, before revealing dummys without an animation, in order to not cause "wobbeling"
			jQuery.elements(tab, 'dummy', ':'+(done||'gt')+'('+(step-1)+')').reveal();
		});
		jQuery.elements('help', ':'+(done||'gt')+'('+Math.max(step-1, jQuery.elements(tab%2+1, 'step', ':visible').length-1)+')').conceal(animate);
	} else { // show the next step
		jQuery.element(tab, 'step', step+1).reveal(animate);
		jQuery.element(tab, 'dummy', step+1).conceal();
		jQuery.element('help', step+1).reveal(animate);
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
					if(/(.*)$/i.test(value)&&jQuery.isFunction((value=eval(value)||String()).promise)) {
						value.then(function(value) { parameter.val(value); });
					} else parameter.val(value);
				}
			}).reveal(animate);
		});
	} else toggleStep(tab, steps.parameters, 'eq', animate); // ... otherwise hide the complete step (with animation)
}
function toggleHelp(tab, algorithm, animate) {
	var count = 3, selector = {
		reveal: '[data-help="all"], [data-help="'+algorithm+'"]',
		conceal: '[data-help][data-help!="all"][data-help!="'+algorithm+'"]'
	};
	jQuery.when.apply(this, [ jQuery(selector.conceal).conceal(animate).promise() ].concat(
		jQuery.elements('help').map(function() {
			return jQuery(this).children(selector.reveal).filter(':gt('+(count-1)+')').stop().conceal(animate).promise();
		})
	)).done(function() {
		jQuery.elements('help').each(function() {
			var help = jQuery(this);
			help.children(selector.reveal).filter(':lt('+count+')').reveal(animate);
			help.children('button').revealOrConceal(!!help
				.children(selector.reveal).filter(':gt('+(count-1)+')').length, animate);
		});
	});
}

function showMore(step) {
	jQuery.element('help', step).children('button').conceal(true).end()
		.children('[data-help="all"], [data-help="'+getAlgorithm()+'"]').reveal(true);
}

function stepInput(tab, step) {
	var done = false, algorithm = getAlgorithm(tab);
	switch(step) {
		case steps.algorithm:
			toggleParameters(tab, algorithm, true);
			toggleHelp(tab, algorithm, true);
			if(done=!!algorithm) {
				// if the algorithm is changed simulate another input some time later, in order
				// to cover dynamically asynchronously generated parameter default values
				setTimeout(function() { stepInput(tab, steps.input); }, 500);
			} break;
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
	var encrypt = jQuery.element(tab, 'encrypt').prop('checked'),
		input = editorValue(tab, 'input'), output = String(), algorithm, mode;
	changeMode(tab, 'output', mode=getMode(tab, 'input')!='dec'?(encrypt?'hex':'text'):'dec');

	switch(algorithm=getAlgorithm(tab)) {
		case 'aes': case 'des':
			var key = parameterValue(tab, algorithm, 'key'), iv = parameterValue(tab, algorithm, 'iv');

			var cipher = (encrypt?forge.cipher.createCipher:forge.cipher.createDecipher)(
				((algorithm=='des'&&parameterValue(tab, algorithm, 'triple'))?'3':String())+
					algorithm.toUpperCase()+'-'+parameterValue(tab, algorithm, 'mode'), key);
			cipher.start({iv: iv});
			cipher.update(forge.util.createBuffer(input));			
			if(cipher.finish()) {
				output = convert(cipher.output).from('text').to(mode);
			} else {
				//TODO ERROR
			}

			break;
		case 'rc2':
			var key = parameterValue(tab, algorithm, 'key'), iv = parameterValue(tab, algorithm, 'iv');
			
			var cipher = (encrypt?forge.rc2.createEncryptionCipher:forge.rc2.createDecryptionCipher)(key);
			cipher.start(iv);
			cipher.update(forge.util.createBuffer(input));			
			if(cipher.finish()) {
				output = convert(cipher.output).from('text').to(mode);
			} else {
				//TODO ERROR
			}

			break;
		case 'rot':
			changeMode(tab, 'output', 'text');

			output = input.rot(parseInt(parameterValue(tab, algorithm, 'places')));
	} jQuery.element(tab, 'output').val(output);
}