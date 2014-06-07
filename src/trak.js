function trak() {
	'use strict';

	/**
	 * dataAttrEvent
	 * This is called when any element with the [data-trak] attribute is clicked.
	 * It calls trak.event()
	 */
	function dataAttrEvent() {
		var _options  = JSON.parse(this.getAttribute('data-trak'));
		var _category = wildcard.call(this, _options.category);
		var _action   = wildcard.call(this, _options.action);
		var _label    = wildcard.call(this, _options.label);
		trak.event(_category, _action, _label);
	}

	var trakElements = document.querySelectorAll('[data-trak]');
	for (var i = 0; i < trakElements.length ; i++) {
		if (trakElements[i].addEventListener) {
			trakElements[i].addEventListener('click', dataAttrEvent, true);
		} else if (trakElements[i].attachEvent) {
			trakElements[i].attachEvent('onclick', dataAttrEvent);
		}
	}

	/**
	 * Function to convert wildcards into real values
	 * @param  string str
	 * @return string     The converted ouput from str
	 */
	function wildcard(str) {
		var output;

		switch(str) {
			case 'page.title':
				output = document.title;
				break;
			case 'page.href':
				output = window.location.href;
				break;
			case 'link.href':
				output = this.href;
				break;
			case 'link.title':
				output = this.title;
				break;
			case 'referrer':
				output = document.referrer ? document.referrer : 'No referrer';
				break;
			default:
				output = str;
				break;
		}
		return output;
	}
}


/**
 * trak.clean()
 * Cleans the input replacing spaces with a specified delimeter (see trak.options) and converts to lower case
 * @param  string str
 * @return string cleaned string
 */
trak.clean = function(str) {
	if (!trak.options.clean) {
		return str;
	} else {
		return str.toString().replace(/\s|'|"/g, this.options.delimeter).toLowerCase();
	}
};


/**
 * trak.event()
 * Wrapper function for various analytics APIs.
 * Enables you to add more than one, or change mid-project without changing anything else in your code
 * @param  string category        The category of the tracking event
 * @param  string action          The action of the tracking event
 * @param  string label           The label of the tracking event
 * @param  number value           Use this to assign a numerical value to a tracked page object
 * @param  boolean nonInteraction Used if trak.options.trackType = 'ga': you might want to send an event, but not impact your bounce rate.
 */
trak.event = function(category, action, label, value, nonInteraction, eventName) {
	value          = value || 0;
	nonInteraction = nonInteraction || false;
	eventName      = eventName || false;

	if (trak.options.trackType === 'ga' && typeof ga !== 'undefined') {
		ga('send', 'event', trak.clean(category), trak.clean(action), trak.clean(label), value, {'nonInteraction': nonInteraction});
		if (trak.options.debug) { console.log('ga event fired'); }
		/**
		 * Could use the below instead:
		 *
		ga('send', {
			'hitType': 'event',
			'eventCategory': trak.clean(category),
			'eventAction': trak.clean(action),
			'eventLabel': trak.clean(label),
			'eventValue': value,
			{
				'nonInteraction': nonInteraction
			}
		});
		*/
	} else if (trak.options.trackType === '_gaq' && typeof _gaq !== 'undefined') {
		_gaq.push(['_trackEvent', trak.clean(category), trak.clean(action), trak.clean(label), value]);
		if (trak.options.debug) { console.log('_gaq event fired'); }

	} else if (trak.options.trackType === 'gtm' && typeof dataLayer !== 'undefined') {
		dataLayer.push({
			'event': eventName
		});
		if (trak.options.debug) { console.log('gtm event fired'); }
	}

	/**
	 * Add any others that you would like here:
	 */
	trak.options.additionalTypes();

	if (trak.options.debug) {
		console.log('Debug:\n Category:', trak.clean(category), '\n Action:', trak.clean(action), '\n Label:', trak.clean(label), '\n GTM Event name:', eventName);
	}
};

/**
 * trak.options
 * These are the default options for trak.js
 * To override them, reassign these values in your code
 * @type {Object}
 */
trak.options = {
	clean           : true, // trak.options.clean     = false
	delimeter       : '_',  // trak.options.delimeter = '-'
	trackType       : 'ga', // trak.options.trackType = 'ga' Available options: ga, _gaq & gtm
	additionalTypes : undefined,
	debug           : true
};