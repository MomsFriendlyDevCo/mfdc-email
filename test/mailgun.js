var email = require('..');
var expect = require('chai').expect;

require('./config');

describe('Mailgun > Send', function() {
	before(function() {
		config.email.enabled = true;
		config.email.method = 'mailgun';
	});

	it('should send a plain email', function(done) {
		email
			.init()
			.send({
				subject: 'Plain email test via mfdc-email',
				text: 'Hello World',
			}, function(err, res) {
				expect(err).to.be.not.ok;
				expect(res).to.be.an.object;
				expect(res).to.have.property('id');
				expect(res).to.have.property('message');
				expect(res.message).to.match(/^Queued/);
				done();
			});
	});

	it('should send a HTML email', function(done) {
		email
			.init()
			.send({
				subject: 'HTML email test via mfdc-email',
				html: '<p>Hello <b>World</b></p>',
			}, function(err, res) {
				expect(err).to.be.not.ok;
				expect(res).to.be.an.object;
				expect(res).to.have.property('id');
				expect(res).to.have.property('message');
				expect(res.message).to.match(/^Queued/);
				done();
			});
	});
});
