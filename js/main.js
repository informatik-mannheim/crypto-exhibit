var util = exports.util = require('./util'), convert = util.convert;

//#region Prototypes

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

String.prototype.toCamelCase = function() {
	return this.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
		return index==0?letter.toLowerCase():letter.toUpperCase();
	}).replace(/\s+/g, String());
};
String.prototype.toCapitalizedCase = function() {
	return this.replace(/(?:^\w|\b\w)/g, function(letter, index) {
		return letter.toUpperCase();
	});
};
String.prototype.format = function() {
	var args = arguments;
	return this.replace(/\$(\d+)/g, function(match, number) { 
		return typeof args[number-1]!='undefined'?args[number-1]:match;
	});
};

jQuery.reduce = function(array, callback, initial) {
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

//#endregion

//#region DOM Helpers

function elementId(tab, name) {
	if(typeof tab!=='string')  {
		var parts = jQuery.reduce(Array.sliceArguments(arguments, 2),
			function(current, part) { return part?current+'-'+part:current; }, name);
		return tab?'$2\\[$1\\]'.format(tab, parts):parts;
	} else return elementId.apply(this, Array.spliceArguments(arguments, 0, 0, false));
}
jQuery.element = function(tab, name) {
	return jQuery('#'+elementId.apply(this, arguments));
}
function elementsSelector(tab, name) {
	if(typeof tab!=='string') {
		var selector = ['[id|="$1"]'.format(name)];
		if(tab) selector.push('[id$="[$1]"]'.format(tab));
		jQuery.each(Array.sliceArguments(arguments, 2), function(index, part) {
			if(part) selector.push(/^:/.test(part)?part:'[id*="-$1"]'.format(part));
		}); return selector.join(String());
	} else return elementsSelector.apply(this, Array.spliceArguments(arguments, 0, 0, false))
}
jQuery.elements = function(tab, name) {
	return jQuery(elementsSelector.apply(this, arguments));
}
function matchElementId(id) {
	return /(.+)\[(\d+)\]/.exec(id);
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
	if(typeof algorithm==='boolean') { name = algorithm; algorithm = null; }
	if(typeof name==='boolean') { group = name; name = null; }
	return name?jQuery.element(tab, group!==true?'parameter':'group', algorithm, name):
		jQuery.elements(tab, !group?'parameter':'group', algorithm, group!==true?':input':null);
}
function matchParameterId(id) {
	return /(parameter|group)-(.+)-(.+)\[(\d+)\]/.exec(id);
}
/**
 * returns a parameter value as text (editors are converted to text / bytes)
 */
function parameterValue(tab, algorithm, name) {
	var value = function(parameter) {
		if(parameter.prop('tagName')=='TEXTAREA')
			return convert(parameter.val()).from(getMode(tab, matchElementId(parameter.attr('id'))[1])).to('text');
		else if(parameter.attr('type')=='checkbox')
			return parameter.is(':checked');
		else return parameter.val();
	};
	
	if(arguments.length<3) {
		var values = {};
		jQuery.parameter(tab, algorithm).each(function() {
			values[matchParameterId(jQuery(this).prop('id'))[3]] = value(jQuery(this));
		}); return values;
	} else return value(jQuery.parameter(tab, algorithm, name));
}

//#endregion

//#region Initialize

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

//#endregion

var steps = (function(step) {
	return {
		algorithm: step=1,
		input: ++step,
		parameters: ++step,
		apply: ++step,
		output: ++step
	};
}());

var algorithms = {}; // will be filled by required modules
function getAlgorithm(tab) {
	return jQuery.element(tab, 'algorithm').val();
}
function requireAlgorithm(algorithm) {
	return new Promise(function(resolve, reject) {
		require([ 'cjs!algorithms/'+algorithm+'.min' ], function(module) {
			algorithms[algorithm] = module;	
			resolve();
		});
	})
}
function applyAlgorithm(tab) {
	var algorithm = getAlgorithm(tab), action = getAction(tab), module = algorithms[algorithm],
		apply = jQuery.isPlainObject(module)?(module.apply||module[action]):module;
	if(!jQuery.isFunction(apply)) {
		//TODO
	}

	// clear editor and set to output mode
	var output = getMode(tab, 'input')!='dec'?(action=='encrypt'?'hex':'text'):'dec';
	changeMode(tab, 'output', output, true);

	jQuery.element(tab, 'output').val(convert(
		apply(editorValue(tab, 'input', module.input||'text'),
			parameterValue(tab, algorithm), action)
	).from(module.output||'text').to(output));
}

function getAction(tab) {
	return jQuery.element(tab, 'actions').find('input:checked').val();
}
function changeAction(tab, action) {
	if(arguments.length<2) action = getAction(tab);
	jQuery.element(tab, 'actions').find('input').prop('checked', false)
		.filter('[value="'+action+'"]').prop('checked', true);
	jQuery.element(tab, 'apply').find('span').text(action.toCapitalizedCase());
}
function getActions(tab) {
	var option = jQuery.element(tab, 'algorithm').find('option:selected');
	return (option.data('actions')||option.parent().data('actions')||'encrypt,decrypt').split(',');
}
function toggleActions(tab, comparing) {
	if(arguments.length<2) comparing = isComparing();
	var actions = getActions(tab), single = actions.length==1;
	jQuery.element(tab, 'step', steps.input).children('.lead').text(
		single?'Enter anything to '+actions[0]:'Choose to '+actions.join(' / '));
	// make actions invisible only, in case it is displayed on the other tab to keep alignment
	jQuery.element(tab, 'actions').removeClass('invisible d-none').toggleClass(
		comparing&&single&&!getActions(otherTab(tab)).length>1?'invisible':'d-none', single);
	var template = jQuery.element(tab, 'actions').find('.custom-radio').remove().filter(':nth(0)');
	jQuery.each(actions, function(index, action) {
		var name = action.toLowerCase()+'['+tab+']';
		template.clone().appendTo(jQuery.element(tab, 'actions'))
			.find('input').prop('id', name).val(action).end()
			.find('label').prop('for', name).text(action.toCapitalizedCase());
	}); changeAction(tab, actions[0]);
}

function getMode(tab, name) {
	return jQuery('input[name=$1]:checked'.format(elementId(tab, 'mode', name))).val();
}
function changeMode(tab, name, mode, clear) {
	if(arguments.length<3) mode = getMode(tab, name);

	var editor = jQuery.element(tab, name), group = editor.next('div'),
		radio = group.find('input[type="radio"][id*="-$1"]'.format(mode));

	var old = group.data('mode')||'text';
	radio.prop('checked', true);
	group.data('mode', mode);

	editor.val(!clear?convert(editor.val()).from(old).to(mode):null);
	editor.toggleClass('text-monospace', mode=='hex');
}

function convertEditor(tab, name) {
	var editor = jQuery.element(tab, name);
	editor.val(convert(editor.val()).to(getMode(tab, name)));
}
function editorValue(tab, name, mode) {
	return convert(jQuery.element(tab, name).val())
		.from(getMode(tab, name)).to(mode||'text');
}

function otherTab(tab) {
	return tab%2+1;
}
function isComparing() {
	return !!jQuery.elements(2, 'step', steps.algorithm, ':visible').length;
}
function toggleCompare(compare, animate) {
	if(arguments.length<2) { animate = compare; compare = !isComparing(); }
	jQuery('#compare i').removeClass('fa-plus-circle fa-minus-circle').addClass('fa-$1-circle'.format(!compare?'plus':'minus'));
	jQuery('#compare a').text(!compare?'Add another tab to compare.':'Hide the comparison tab.');
	jQuery.element(2, 'step', steps.algorithm).revealOrConceal(compare, animate);
	if(!compare) {
		toggleStep(2, steps.algorithm, false, animate); // also fade out other steps
		toggleActions(1, false); // toggle action on the first tab to hide actions if needed (pass "not comparing" as tab hiding is still in progress)
	} else stepInput(2, steps.algorithm); // simulate input to check if next step is also ready
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
		jQuery.elements('help', ':'+(done||'gt')+'('+Math.max(step-1, jQuery.elements(otherTab(tab), 'step', ':visible').length-1)+')').conceal(animate);
	} else { // show the next step
		jQuery.element(tab, 'step', step+1).reveal(animate);
		jQuery.element(tab, 'dummy', step+1).conceal();
		jQuery.element('help', step+1).reveal(animate);
		stepInput(tab, step+1); // simulate input to check if next step is also ready
	}
}
function toggleParameters(tab, algorithm, animate) {
	var parameters; if((parameters=jQuery.parameter(tab, algorithm, true)).length) { // switch animation, in case parameters are available ...
		animate = jQuery.parameter(tab).filter(':visible').length&&animate; // animate in case other parameters are already visible, otherwise the reveal animation of the step will do
		jQuery.parameter(tab, true).conceal(animate).promise().done(function() {
			parameters.each(function() {
				var parameter = jQuery(this).find('[data-value]:input'), value;
				if(!parameter.val()&&(value=parameter.data('value'))) {
					var fnValue = function(value) {
						if(!parameter.val()) { // incase the user has not done any imput in the meantime
							parameter.val(value);
							stepInput(tab, steps.input); // simulate an input step, in oder to continue to the next step, if all parameters are provided
						}
					};
					if(/\(.*\)$/i.test(value)&&jQuery.isFunction((value=util.limitedScopeEval(value/*, { parameters: parameterValue(tab, algorithm) }*/)||String()).promise))
						value.then(fnValue);
					else fnValue(value);
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
			//TODO loading
			((done=!!algorithm)?requireAlgorithm(algorithm):jQuery.Deferred().resolve()).then(function() {
				toggleActions(tab);
				toggleActions(otherTab(tab)); // toggle the action on the other tab as well, so that the action radio button appear / disappear
				toggleParameters(tab, algorithm, true);
				toggleHelp(tab, algorithm, true);
			}, function(e) {
				alert("Failed!!"+e)
				//TODO
			});
			break;
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
		case steps.apply:
			done = !!jQuery.element(tab, 'output').val(); break;
		case steps.output:
			done = true; break;
	} toggleStep(tab, step, done, true);
}

// steps & algorithms
exports.steps = steps;
exports.algorithms = algorithms;

// user interface functions
exports.stepInput = stepInput;
exports.changeAction = changeAction;
exports.applyAlgorithm = applyAlgorithm;
exports.changeMode = changeMode;
exports.convertEditor = convertEditor;
exports.toggleCompare = toggleCompare;
exports.showMore = showMore;

// functions for other modules
exports.parameterValue = parameterValue;