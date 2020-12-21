var email = require('..');
var expect = require('chai').expect;

global.config = require('./config');

describe('SMTP > Send', function() {
	before(function() {
		config.email.enabled = true;
		config.email.method = 'smtp';
	});

	it('should send a plain email', function(done) {
		email()
			.send({
				subject: 'Plain email test via mfdc-email',
				text: 'Hello World',
			}, function(err, res) {
				expect(err).to.be.not.ok;
				// FIXME: Not sure what res should be
				done();
			});
	});

	it('should send a HTML email', function(done) {
		email()
			.send({
				subject: 'HTML email test via mfdc-email',
				html: '<p>Hello <b>World</b></p>',
			}, function(err, res) {
				expect(err).to.be.not.ok;
				// FIXME: Not sure what res should be
				done();
			});
	});
});
