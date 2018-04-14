var expect = require("chai").expect;

var models = require("../../models");

describe("Models index", function() {
  it("creates a database connection", function(done) {
    models.sequelize.authenticate().then(done).catch(done);
  });

  it("returns the society model", function() {
    expect(models.society).to.be.ok;
  });
});