/**
* Generic email dispatch library
* This is a very thin wrapper around NodeMailer.
*/

var _ = require('lodash');
var colors = require('chalk');
var fs = require('fs');
var fspath = require('path');
var mustache = require('mustache');
var nodemailer = require('nodemailer');
var nodemailerMailgun = require('nodemailer-mailgun-transport');
var nodemailerSendmail = require('nodemailer-sendmail-transport');

var transporter;

var appConfig; // Global config to use when resetting (locations determined by appConfig)
var appConfigLocations = ['config', 'app.config']; // Array of places to look for config Is expected to contain at least a 'email' object and possibly 'mailgun'

/**
* Initalize the emailer
* If this is called multiple times it restarts the mail transport
* @return {Object} This chainable object
*/
function init() {
	// Locate config if we dont have one {{{
	if (_.isUndefined(appConfig)) {
		appConfigLocations.forEach(function(key) {
			if (_.has(global, key)) {
				appConfig = _.get(global, key);
				return false;
			}
		});
		if (_.isUndefined(appConfig)) throw new Error('Cannot find email config in', appConfigLocations);
	}
	// }}}

	this.config = { // Reset basics
		from: appConfig.email.from,
		to: appConfig.email.to,
		subject: appConfig.email.subject || '',
		cc: appConfig.email.cc || [],
		bcc: appConfig.email.bcc || [],
	};

	// Work out mail transport {{{
	if (appConfig.email.enabled) {
		switch (appConfig.email.method) {
			case 'mailgun':
				if (
					/^https?:\/\//.test(appConfig.mailgun.domain) ||
					/mailgun/.test(appConfig.mailgun.domain)
				) throw new Error("Mailgun domain should not contain 'http(s)://' prefix or mailgun. Should resemble the domain name e.g. 'acme.com'");

				transporter = nodemailer.createTransport(nodemailerMailgun({
					auth: {
						api_key: appConfig.mailgun.apiKey,
						domain: appConfig.mailgun.domain,
					},
				}));
				break
			case 'sendmail':
				transporter = nodemailer.createTransport(nodemailerSendmail());
				break;
			default:
				next('Unknown mail transport method: ' + appConfig.email.method);
		}
	}
	// }}}

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
	// Argument mangling {{{
	if (_.isFunction(mail)) {
		callback = mail;
		mail = {};
	} else if (_.isObject(mail)) {
		_.merge(this.config, mail);
	} else if (_.isEmpty(mail)) {
		callback = _.noop;
	}
	// }}}

	['cc', 'bcc'].forEach(f => { // Delete blank fields
		if (this.config[f] && _.isEmpty(this.config[f])) delete this.config[f];
	});

	if (this.config.template) {
		var content = fs.readFileSync(this.config.template, 'utf-8');
		content = mustache.render(content, this.config.templateParams);

		var ext = fspath.parse(this.config.template).ext;
		if (ext == '.txt') {
			this.config.text = content;
		} else if (ext == '.html') {
			this.config.html = content;
		} else {
			throw new Error('Unknown template file format: ' + this.config.template + '. Use either .txt or .html files');
		}
	} else if (_.isEmpty(this.config.text) && _.isEmpty(this.config.html)) {
		throw new Error('Neither mail.html, mail.text or mail.template is specified when trying to send an email');
	}

	if (!_.get(appConfig, 'email.enabled')) {
		console.log(colors.blue('[Email]'), 'Mail sending disabled. Would deliver email', colors.cyan('"' + this.config.subject + '"'), 'to', colors.cyan(this.config.to));
		if (_.isFunction(callback)) setTimeout(() => callback(null, this.config.text || this.config.html));
	} else {
		console.log(colors.blue('[Email]'), 'Sending', colors.cyan('"' + this.config.subject + '"'), 'to', colors.cyan(this.config.to));
		setTimeout(() => {
			transporter.sendMail(this.config, callback || _.noop);
		});
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
		_.merge(this.config, property);
	} else {
		this.config[property] = value;
	}

	// Cant have mutually exclusive html / text combo
	if (property == 'html') {
		delete this.config.text;
	} else if (property == 'text') {
		delete this.config.html;
	}

	return this;
}

function MFDCEmail(settings) {
	this.config = settings || {}; // Gets populated from globals via init

	this.init = init;
	this.send = send;
	this.set = set;

	this.to = _.partial(set, 'to');
	this.from = _.partial(set, 'from');
	this.cc = _.partial(set, 'cc');
	this.bcc = _.partial(set, 'bcc');
	this.subject = _.partial(set, 'subject');
	this.text = _.partial(set, 'text');
	this.html = _.partial(set, 'html');
	this.template = _.partial(set, 'template');
	this.templateParams = _.partial(set, 'templateParams');

	this.init();

	return this;
};


module.exports = function() {
	return new MFDCEmail();
}
