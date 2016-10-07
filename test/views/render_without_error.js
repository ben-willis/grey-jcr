var pug = require('pug');
var merge = require('merge');
var prettydate = require('pretty-date');
var path = require('path');

var chai = require("chai");
var expect = chai.expect;

var locals = {
    user: {
        name: "Fake User",
        email: "fake@user.com",
        username: "fake12"
    },
    prettydate: prettydate
}

describe('mcr views', function() {
    it('renders without errors', function() {
        pug.renderFile(path.join(__dirname, '../../views/mcr/index.pug'), merge(locals, {}));
    })
})

describe('other views', function() {
    it('renders without errors', function() {
        pug.renderFile(path.join(__dirname, '../../views/promo.pug'), merge(locals, {}));
        pug.renderFile(path.join(__dirname, '../../views/menu.pug'), merge(locals, {}));
        pug.renderFile(path.join(__dirname, '../../views/login.pug'), merge(locals, {}));
        pug.renderFile(path.join(__dirname, '../../views/header.pug'), merge(locals, {}));
        pug.renderFile(path.join(__dirname, '../../views/footer.pug'), merge(locals, {}));
        pug.renderFile(path.join(__dirname, '../../views/error.pug'), merge(locals, {
            message: "Fake Error",
            error: {
                status: 413,
                stack: "Nah"
            }
        }));
    })
})
