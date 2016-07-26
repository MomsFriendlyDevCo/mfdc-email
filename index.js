/**
* Generic email dispatch library
* This is a very thin wrapper around NodeMailer.
*/

var _ = require('lodash');
var colors = require('colors');
var fs = require('fs');
var fspath = require('path');
var mustache = require('mustache');
var nodemailer = require('nodemailer');
var nodemailerMailgun = require('nodemailer-mailgun-transport');
var nodemailerSendmail = require('nodemailer-sendmail-transport');

var hasInit = false; // Have called init()
var hasReset = false; // Have called reset()
var transporter;

var config; // Main config structure to use
var configLocations = ['config', 'app.config']; // Array of places to look for config Is expected to contain at least a 'email' object and possibly 'mailgun'

var defaults = {};

/**
* Initalize the emailer
* If this is called multiple times it restarts the mail transport
* @return {Object} This chainable object
*/
function init() {
	// Locate config {{{
	configLocations.forEach(function(key) {
		if (_.has(global, key)) {
			module.exports._config = config = _.get(global, key);
			return false;
		}
	});
	if (_.isUndefined(config)) throw new Error('Cannot find email config in', configLocations);
	// }}}

	if (!hasReset) reset();

	// Work out mail transport {{{
	if (config.email.enabled) {
		switch (config.email.method) {
			case 'mailgun':
				if (
					/^https?:\/\//.test(config.mailgun.domain) ||
					/mailgun/.test(config.mailgun.domain)
				) throw new Error("Mailgun domain should not contain 'http(s)://' prefix or mailgun. Should resemble the domain name e.g. 'acme.com'");

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
				next('Unknown mail transport method: ' + config.email.method);
		}
	}
	// }}}

	hasInit = true;

	return this;
}


/**
* Reset all defaults
* @return {Object} This chainable object
*/
function reset() {
	defaults = {
		from: config.email.from,
		to: config.email.to,
		subject: config.email.subject || '',
		cc: config.email.cc || [],
		bcc: config.email.bcc || [],
	};

	hasReset = true;

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
* @param {string} [mail.template] File on disk to use to load the email template. This is parsed as a mustache template (extension determines the format, .txt=plain text, .html=rich content)
* @param {Object} [mail.templateParams] Object containing any dynamic parameters to be passed to the mustache template specified in mail.template
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

	if (mail.template) {
		var content = fs.readFileSync(mail.template, 'utf-8');
		content = mustache.render(content, mail.templateParams);

		var ext = fspath.parse(mail.template).ext;
		if (ext == '.txt') {
			mail.text = content;
		} else if (ext == '.html') {
			mail.html = content;
		} else {
			throw new Error('Unknown template file format: ' + mail.template + '. Use either .txt or .html files');
		}
	} else if (_.isEmpty(mail.text) && _.isEmpty(mail.html)) {
		throw new Error('Neither mail.html, mail.text or mail.template is specified when trying to send an email');
	}

	if (!config.email.enabled) {
		console.log(colors.blue('[Email]'), 'Mail sending disabled. Would deliver email', colors.cyan('"' + mail.subject + '"'), 'to', colors.cyan(mail.to));
		if (_.isFunction(callback)) callback(null, mail.text || mail.html);
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
	if (!hasReset) reset();

	if (_.isObject(property)) {
		_.merge(defaults, property);
	} else {
		defaults[property] = value;
	}

	// Cant have mutually exclusive html / text combo
	if (property == 'html') {
		delete defaults.text;
	} else if (property == 'text') {
		delete defaults.html;
	}

	return self;
}

var self = module.exports = {
	init: init,
	send: send,
	set: set,
	reset: reset,

	to: _.partial(set, 'to'),
	from: _.partial(set, 'from'),
	cc: _.partial(set, 'cc'),
	bcc: _.partial(set, 'bcc'),
	subject: _.partial(set, 'subject'),
	text: _.partial(set, 'text'),
	html: _.partial(set, 'html'),
	template: _.partial(set, 'template'),
	templateParams: _.partial(set, 'templateParams'),

	_config: config,
};
