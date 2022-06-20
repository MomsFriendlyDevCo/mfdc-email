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

	it('should load alternate config locations', ()=>
		email()
			.send({
				subject: 'Alternate config email test',
				text: 'Hello World',
			})
			.then(res => {
				expect(res).to.be.an('object');
				expect(res).to.have.property('config');
				expect(res.config).to.be.an('object');
				// expect(res.config.altConfig).to.be.true;
			})
	);
});
