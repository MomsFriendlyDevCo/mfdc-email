MFDC-Email
==========
This module is a thin wrapper around the [nodemailer](https://github.com/nodemailer/nodemailer) module which loads its config from the locations specified in the [MFDC Node project standard layout](https://github.com/MomsFriendlyDevCo/Momsronomicon/blob/master/style-node.md).


Quickstart guide
----------------
If you're project is already setup with appropriate config (see [Expected Config](#expected-config)) you should just be able to call the module as follows:


```javascript
var email = require('mfdc-email');

email
	.send({
		to: 'someone@somewhere.com',
		from: 'noreply@domain.com',
		subject: 'Plain email test via mfdc-email',
		text: 'Hello World',
	}, function(err, res) {
		// Do something with the result
	});
```

or using chainable methods:

```javascript
var email = require('mfdc-email');

email
	.to('Joe Random <joe@random.com>')
	.subject('HTML chainable method email test via mfdc-email')
	.html('<p>Hello <b>World</b></p>')
	.send(function(err, res) {
		// Do something with the result
	});
```


API
===

send(email, callback)
---------------------
Dispatch an email. This is as functionally similar to the Nodemailer `send()` command as possible. Use this if lower level access is required.

to, from, cc, bcc, subject, text, html()
----------------------------------------
All these methods are chainable:

```javascript
var email = require('mfdc-email');

email
	.to('someone@somewhere.com')
	.subject('something')
	.send();
```


Expected Config
---------------
This module expects the following `global.config` variables to be specified to operate:

| Method    | Key                              | Type           | Description |
| All       | `email.enabled`                  | Boolean        | Temporarily disable the sending of email. If falsy this will message to the console and not actually send anything |
|           | `email.method`                   | String         | What transport profile to use, see `init()` for details |
|           | `email.{to,from,subject,cc,bcc}` | String / Array | Default fields to use if unspecified |
| Mailgun   | `mailgun.apiKey`                 | String         | The API key for the Mailgun profile |
|           | `mailgun.domain`                 | String         | The Mailgun domain, usually something like 'acme.com' (no 'http://' prefix or mailgun suffix) |
