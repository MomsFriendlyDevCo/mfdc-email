// Return a fake config for testing purposes
var _ = require('lodash');

module.exports = _.merge({
	name: 'mfdc-email',
	title: 'MFDC-Email module',
	email: {
		enabled: true,
		method: 'mailgun',
		to: 'matt@mfdc.biz',
		from: 'noreply@mfdc.biz',
		cc: [],
	},
	mailgun: {
		apiKey: 'FIXME:STORE THIS IN THE PRIVATE.JS FILE!!!',
		domain: 'FIXME:STORE THIS IN THE PRIVATE.JS FILE!!!',
	},
	outlook365: {
		user: 'FIXME:STORE THIS IN THE PRIVATE.JS FILE!!!',
		pass: 'FIXME:STORE THIS IN THE PRIVATE.JS FILE!!!',
	},
	smtp: {
		host: 'FIXME:STORE THIS IN THE PRIVATE.JS FILE!!!',
		port: 587,
		secure: true,
		user: 'FIXME:STORE THIS IN THE PRIVATE.JS FILE!!!',
		pass: 'FIXME:STORE THIS IN THE PRIVATE.JS FILE!!!',
	},
}, require('./private.js'));
