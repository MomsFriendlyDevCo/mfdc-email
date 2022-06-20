var email = require('..');
var expect = require('chai').expect;

global.config = require('./config');

describe('Disabled email > Send', function() {
	before(function() {
		config.email.enabled = false;
		config.email.method = 'sendmail';
	});

	it('should send a plain email', ()=>
		email()
			.send({
				subject: 'Plain email test via mfdc-email',
				text: 'Hello World',
			})
			.then(res => {
				expect(res).to.have.nested.property('config.text', 'Hello World');
			})
	);

	it('should send a HTML email', ()=>
		email()
			.send({
				subject: 'HTML email test via mfdc-email',
				html: '<p>Hello <b>World</b></p>',
			})
			.then(res => {
				expect(res).to.have.nested.property('config.html', '<p>Hello <b>World</b></p>');
			})
	);
});

describe('Disabled email > chainable', function() {
	before(function() {
		config.email.enabled = false;
		config.email.method = 'sendmail';
	});

	it('should send a plain email', ()=>
		email()
			.subject('Plain chainable method email test via mfdc-email')
			.text('Hello World')
			.send()
			.then(res => {
				expect(res).to.have.nested.property('config.subject', 'Plain chainable method email test via mfdc-email');
				expect(res).to.have.nested.property('config.text', 'Hello World');
			})
	);

	it('should send a HTML email', ()=>
		email()
			.subject('HTML chainable method email test via mfdc-email')
			.html('<p>Hello <b>World</b></p>')
			.send()
			.then(res => {
				expect(res).to.have.nested.property('config.html', '<p>Hello <b>World</b></p>');
			})
	);
});

describe('Template views', function() {
	before(function() {
		config.email.enabled = false;
		config.email.method = 'sendmail';
	});

	it('should correctly template the email', ()=>
		email()
			.to('Joe Random <joe@random.com>')
			.subject('Password Recovery')
			.template(__dirname + '/views/password-recovery.txt')
			.templateParams({
				name: 'Joe Random',
				signoff: 'The MFDC Team',
				url: 'http://domain.com/reset/TOKEN',
			})
			.send()
			.then(res => {
				expect(res).to.be.an('object');
				expect(res).to.have.property('body');
				expect(res.body).to.be.a('string');
				expect(res.body).to.match(/Joe Random/);
				expect(res.body).to.match(/The MFDC Team\n$/);
			})
	);
});

describe('State reset', function() {
	before(function() {
		config.email.enabled = false;
		config.email.method = 'sendmail';
	});

	it('should send an email to joe@mfdc.biz', ()=>
		email()
			.to('joe@mfdc.biz')
			.subject('Hello World')
			.text('Hello World')
			.send()
			.then(res => {
				expect(res).to.have.nested.property('config.subject', 'Hello World');
			})
	);

	it('state should have reset', function() {
		var newEmail = email();
		expect(newEmail.config.to).to.not.be.equal('joe@mfdc.biz');
	});
});
