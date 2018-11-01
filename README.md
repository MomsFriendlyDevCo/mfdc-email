@momsfriendlydevco/email
========================
This module is a thin wrapper around the [nodemailer](https://github.com/nodemailer/nodemailer) module which loads its config from the locations specified in the [Doop project](https://github.com/MomsFriendlyDevCo/Doop).


Quickstart guide
----------------
If you're project is already setup with appropriate config (see [Expected Config](#expected-config)) you should just be able to call the module as follows:


```javascript
var email = require('@momsfriendlydevco/email');

email()
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
var email = require('@momsfriendlydevco/email');

email()
	.to('Joe Random <joe@random.com>')
	.subject('HTML chainable method email test via mfdc-email')
	.html('<p>Hello <b>World</b></p>')
	.send(function(err, res) {
		// Do something with the result
	});
```

Debugging
---------
This module uses the [Debug](https://www.npmjs.com/package/debug) NPM. Simply set the environment variable to `DEBUG=email` (or any valid enabling glob) to see the output.

```
> DEBUG=email mocha test/mailgun.js
  Mailgun > Send
  email Email
  email =======================================
  email To: matt@mfdc.biz
  email Subject: Plain email test via mfdc-email
  email -----------------
  email Hello Joe
  email ------ End ------
  email  +0ms
```


Using template views
--------------------
Specifying the `template` property either as a key in the `send()` object or via the chainable `.template()` method, will specify the file on disk to be used when composing the email.

* The type of email to send is determined by the file extension. `.txt` files are plain text and `.html` files are rich content.
* All templates are rendered via [Mustache](http://mustache.github.io) with the parameters used taken from the `templateParams` option.
* Mustache will automatically escape all variables. If you wish to use an unsecaped variable like a URL encase it in three levels of brackets rather than two e.g. `{{{url}}}`

```javascript
var email = require('@momsfriendlydevco/email');

email()
	.to('Joe Random <joe@random.com>')
	.subject('Password Recovery')
	.template(config.root + '/views/emails/password-recovery.txt')
	.templateParams({
		name: 'Joe Random',
		signoff: 'The MFDC team',
	})
	.send();
```


API
===

send(email, callback)
---------------------
Dispatch an email. This is as functionally similar to the Nodemailer `send()` command as possible. Use this if lower level access is required.
Returns a promise.

to, from, cc, bcc, subject, text, html()
----------------------------------------
All these methods are chainable:

```javascript
var email = require('@momsfriendlydevco/email');

email()
	.to('someone@somewhere.com')
	.subject('something')
	.send();
```


params, templateparams
----------------------
Populate the Handlebars replacement engine with a given object.


template
--------
Specify a template file to read to obtain the email body. The file extension should be `.txt` or `.html` to determine the body type.
Specify `.params` (or `.templateParams`) to populate the Handlebars replacement engine.

```javascript
var email = require('@momsfriendlydevco/email');

email()
	.to('someone@somewhere.com')
	.subject('something')
	.template('/a/file/somewhere.txt')
	.params({username: 'joe'})
	.send();
```


init()
------
Reinitialize the mail transport and reset all defaults to the global values.


Expected Config
---------------
This module expects the following `global.config` / `global.app.config` variables to be specified to operate:

| Method    | Key                              | Type           | Description |
|-----------|----------------------------------|----------------|-------------|
| All       | `email.enabled`                  | Boolean        | Temporarily disable the sending of email. If falsy this will message to the console and not actually send anything |
|           | `email.method`                   | String         | What transport profile to use, see `init()` for details |
|           | `email.{to,from,subject,cc,bcc}` | String / Array | Default fields to use if unspecified |
|           | `email.template`                 | String         | Read a template file and render it as the email content |
| Mailgun   | `mailgun.apiKey`                 | String         | The API key for the Mailgun profile |
|           | `mailgun.domain`                 | String         | The Mailgun domain, usually something like 'acme.com' (no 'http://' prefix or Mailgun suffix) |
