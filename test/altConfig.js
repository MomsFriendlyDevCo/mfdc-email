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
		email
			.init()
			.send({
				subject: 'Alternate config email test',
				text: 'Hello World',
			}, function(err, res) {
				expect(err).to.be.not.ok;
				expect(res).to.be.an.object;

				expect(email).to.be.an.object;
				expect(email).to.have.property('_config');
				expect(email._config).to.be.an.object;
				expect(email._config.altConfig).to.be.true;
			});
	});
});
