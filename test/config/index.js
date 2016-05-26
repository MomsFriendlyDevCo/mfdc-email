// Make a fake config for testing purposes
global.config = {
	name: 'mfdc-email',
	title: 'MFDC-Email module',
	email: {
		enabled: false,
		method: 'mailgun',
		to: 'matt@mfdc.biz',
		from: 'noreply@mfdc.biz',
		cc: [],
	},
	mailgun: {
		apiKey: 'FIXME:STORE THIS IN THE PRIVATE.JS FILE!!!',
		domain: 'FIXME:STORE THIS IN THE PRIVATE.JS FILE!!!',
	},
};

require('./private.js');
