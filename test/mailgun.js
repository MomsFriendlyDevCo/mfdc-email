var email = require('..');
var expect = require('chai').expect;

require('./config');

describe('Mailgun > Send', function() {
	it('Should send a plain email', function(done) {
		email.send({
			subject: 'Plain email test via mfdc-email',
			text: 'Hello World',
		}, function(err, res) {
			expect(err).to.be.not.ok;
			console.log('RES', res);
			done();
		});
	});

	it('Should send a HTML email', function(done) {
		email.send({
			subject: 'HTML email test via mfdc-email',
			html: '<p>Hello <b>World</b></p>',
		}, function(err, res) {
			expect(err).to.be.not.ok;
			console.log('RES', res);
			done();
		});
	});
});
