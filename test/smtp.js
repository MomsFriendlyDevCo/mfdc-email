var email = require('..');
var expect = require('chai').expect;

global.config = require('./config');

describe('SMTP > Send', function() {
	before(function() {
		config.email.enabled = true;
		config.email.method = 'smtp';
	});

	it('should send a plain email', ()=>
		email()
			.send({
				subject: 'Plain email test via mfdc-email',
				text: 'Hello World',
			})
	);

	it('should send a HTML email', ()=>
		email()
			.send({
				subject: 'HTML email test via mfdc-email',
				html: '<p>Hello <b>World</b></p>',
			})
	);
});
