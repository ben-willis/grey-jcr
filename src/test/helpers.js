var mail = require('../helpers/mail');

var expect = require("chai").expect;

describe('Mail Methods', function() {

    it("can send emails", function() {
        mail.send('b.c.willis@durham.ac.uk', 'Test', 'This is a test email!')
    });
});
