var email = require('..');
var expect = require('chai').expect;

global.config = require('./config');

describe('Mailgun > Send', function() {
	before(function() {
		config.email.enabled = true;
		config.email.method = 'mailgun';
	});

	it('should send a plain email', ()=> {
		this.timeout(10 * 1000);

		return email()
			.params({user: {name: 'Joe'}})
			.send({
				subject: 'Plain email test via mfdc-email',
				text: 'Hello {{user.name}}',
			})
			.then(res => {
				expect(res).to.be.an('object');
				expect(res).to.have.property('id');
				expect(res).to.have.property('message');
				expect(res.message).to.match(/^Queued/);
			});
	});

	it('should send a HTML email', ()=> {
		this.timeout(10 * 1000);

		return email()
			.send({
				subject: 'HTML email test via mfdc-email',
				html: '<p>Hello <b>World</b></p>',
			})
			.then(res => {
				expect(res).to.be.an('object');
				expect(res).to.have.property('id');
				expect(res).to.have.property('message');
				expect(res.message).to.match(/^Queued/);
			})
	});

	it('should complain if a domain is passed that begins with http(s)://', function() {
		global.config.mailgun.domain = 'http://api.mailgun.net/v3/acme.com';
		expect(email).to.throw(/should not contain/);

		global.config.mailgun.domain = 'https://api.mailgun.net/v3/acme.com';
		expect(email).to.throw(/should not contain/);

		global.config.mailgun.domain = 'api.mailgun.net/v3/acme.com';
		expect(email).to.throw(/should not contain/);
	});
});
