var email = require('..');
var expect = require('chai').expect;

global.config = require('./config');

describe('Disabled email > Send', function() {
	before(function() {
		config.email.enabled = false;
		config.email.method = 'sendmail';
	});

	it('should send a plain email', function(done) {
		email
			.init()
			.send({
				subject: 'Plain email test via mfdc-email',
				text: 'Hello World',
			}, function(err, res) {
				expect(err).to.be.not.ok;
				expect(res).to.be.equal('Hello World');
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
				expect(res).to.be.equal('<p>Hello <b>World</b></p>');
				done();
			});
	});
});

describe('Disabled email > chainable', function() {
	before(function() {
		config.email.enabled = false;
		config.email.method = 'sendmail';
	});

	it('should send a plain email', function(done) {
		email
			.init()
			.subject('Plain chainable method email test via mfdc-email')
			.text('Hello World')
			.send(function(err, res) {
				expect(err).to.be.not.ok;
				expect(res).to.be.equal('Hello World');
				done();
			});
	});

	it('should send a HTML email', function(done) {
		email
			.init()
			.subject('HTML chainable method email test via mfdc-email')
			.html('<p>Hello <b>World</b></p>')
			.send(function(err, res) {
				expect(err).to.be.not.ok;
				expect(res).to.be.equal('<p>Hello <b>World</b></p>');
				done();
			});
	});
});

describe('Template views', function() {
	before(function() {
		config.email.enabled = false;
		config.email.method = 'sendmail';
	});

	it('should correctly template the email', function(done) {
		email
			.init()
			.to('Joe Random <joe@random.com>')
			.subject('Password Recovery')
			.template(__dirname + '/views/password-recovery.txt')
			.templateParams({
				name: 'Joe Random',
				signoff: 'The MFDC Team',
				url: 'http://domain.com/reset/TOKEN',
			})
			.send(function(err, body) {
				expect(err).to.be.not.ok;
				expect(body).to.be.a.string;
				expect(body).to.match(/Joe Random/);
				expect(body).to.match(/The MFDC Team\n$/);
				done();
			});
	});
});
