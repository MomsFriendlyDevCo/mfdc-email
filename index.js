/**
* Generic email dispatch library
* This is a very thin wrapper around NodeMailer.
*/

var _ = require('lodash');
var colors = require('colors');
var nodemailer = require('nodemailer');
var nodemailerMailgun = require('nodemailer-mailgun-transport');
var nodemailerSendmail = require('nodemailer-sendmail-transport');

var hasInit = false; // Have called init()
var transporter;

var defaults = {};

/**
* Initalize the emailer
* If this is called multiple times it restarts the mail transport
* @return {Object} This chainable object
*/
function init() {
	defaults = {
		from: config.email.from,
		to: config.email.to,
		subject: config.email.subject || '',
		cc: config.email.cc || [],
		bcc: config.email.bcc || [],
	};

	// Work out mail transport {{{
	if (config.email.enabled) {
		switch (config.email.method) {
			case 'mailgun':
				transporter = nodemailer.createTransport(nodemailerMailgun({
					auth: {
						api_key: config.mailgun.apiKey,
						domain: config.mailgun.domain,
					},
				}));
				break
			case 'sendmail':
				transporter = nodemailer.createTransport(nodemailerSendmail());
				break;
			default:
				next('Unknown mail transport method: ' + config.library.request.method);
		}
	}
	// }}}

	hasInit = true;

	return this;
}


/**
* Send an email
* All addresses can be plain email addresses ('foo@bar.com') or aliased ('Mr Foo Bar <foo@bar.com>')
* Either mail.html or mail.text must be specified
*
* @param {Object,function} mail The mail object to dispatch or the callback if you wish to use all the defaults
* @param {string} [mail.html] HTML payload of the email
* @param {srting} [mail.text] Plain text payload of the email
* @param {string} [mail.from] The from portion of the email (defaults to config.email.from if unspecified)
* @param {string} [mail.to] The to portion of the email (defaults to config.email.to if unspecified)
* @param {string} [mail.subject] The from portion of the email (defaults to config.email.subject if unspecified)
* @param {string} [mail.cc] The from portion of the email (defaults to config.email.cc if unspecified)
* @param {string} [mail.bcc] The from portion of the email (defaults to config.email.bcc if unspecified)
* @param {function} [callback] Optional callback to invoke on completion
* @return {Object} This chainable object
*/
function send(mail, callback) {
	if (!hasInit) init();

	// Argument mangling {{{
	if (_.isFunction(mail)) {
		callback = mail;
		mail = defaults;
	} else if (_.isObject(mail)) {
		_.defaults(mail, defaults);
	} else if (_.isEmpty(mail)) {
		callback = _.noop;
	}
	// }}}


	['cc', 'bcc'].forEach(function(f) { // Delete blank fields
		if (_.isEmpty(mail[f])) delete mail[f];
	});

	if (_.isEmpty(mail.text) && _.isEmpty(mail.html)) throw new Error('Neither mail.html or mail.text is specified when trying to send an email');

	if (!config.email.enabled) {
		console.log(colors.blue('[Email]'), 'Mail sending disabled. Would deliver email', colors.cyan('"' + mail.subject + '"'), 'to', colors.cyan(mail.to));
		return _.attempt(callback);
	} else {
		console.log(colors.blue('[Email]'), 'Sending', colors.cyan('"' + mail.subject + '"'), 'to', colors.cyan(mail.to));
		transporter.sendMail(mail, callback || _.noop);
	}

	return this;
}


/**
* Set a key of the defaults object to the specified value
* This function can either take a complex object to merge or single key/value combos
* @param {Object|string} property Either an object to merge or the name of the property to set
* @param {mixed} [value] The value to set if property is a string
* @return {Object} This chainable object
*/
function set(property, value) {
	if (_.isObject(property)) {
		_.merge(defaults, property);
	} else {
		defaults[property] = value;
	}
	return this;
}

module.exports = {
	init: init,
	send: send,
	set: set,

	to: _.partial(set, 'to'),
	from: _.partial(set, 'from'),
	cc: _.partial(set, 'cc'),
	bcc: _.partial(set, 'bcc'),
	subject: _.partial(set, 'subject'),
	text: _.partial(set, 'text'),
	html: _.partial(set, 'html'),
};
