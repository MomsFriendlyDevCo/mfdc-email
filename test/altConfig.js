var email = require('..');
var expect = require('chai').expect;

delete global.config;
global.app = { // Setup alternative config stucture
	config: require('./config'),
};

describe('Alternative config locations', function() {
	before(function() {
		global.app.config.email.enabled = false; // Dont actually do anything
		global.app.config.altConfig = true;
	});

	it('should load alternate config locations', function() {
		var myEmail = email()
			.send({
				subject: 'Alternate config email test',
				text: 'Hello World',
			}, function(err, res) {
				expect(err).to.be.not.ok;
				expect(res).to.be.an.object;

				expect(myEmail).to.be.an.object;
				expect(myEmail).to.have.property('config');
				expect(myEmail.config).to.be.an.object;
				expect(myEmail.config.altConfig).to.be.true;
			});
	});
});
