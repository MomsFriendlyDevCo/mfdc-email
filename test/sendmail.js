var email = require('..');
var expect = require('chai').expect;

require('./config');

describe('Sendmail > Send', function() {
	before(function() {
		config.email.enabled = true;
		config.email.method = 'sendmail';
	});

	it('Should send a plain email', function(done) {
		email
			.init()
			.send({
				subject: 'Plain email test via mfdc-email',
				text: 'Hello World',
			}, function(err, res) {
				expect(err).to.be.not.ok;
				// FIXME: Not sure what res should be
				done();
			});
	});

	it('Should send a HTML email', function(done) {
		email
			.init()
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
