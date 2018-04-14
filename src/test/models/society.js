var expect = require("chai").expect;

var models = require("../../models");

describe("Society model", function() {
  it("creates a society", function(done) {
    models.society.create({
      name: "Test Society",
      slug: "Test-Society",
      type: 0
    }).then(function(society) {
      expect(society.name).to.equal("Test Society");
      expect(society.description).to.be.null;
      done();
    }).catch(done);
  });

  it("gets a society by slug", function(done) {
    models.society.findOne({where: {slug: "Test-Society"}}).then(function(society) {
      expect(society.name).to.equal("Test Society");
      done();
    }).catch(done);
  });

  it("updates a society", function(done) {
    models.society.findOne({where: {slug: "Test-Society"}}).then(function(society) {
      return society.update({
        name: "New Name",
        slug: "New-Name",
        description: "<b>description</b>",
        facebook: null,
        twitter: "https://www.twitter.com/",
        email: null,
        type: 0
      });
    }).then(function(society) {
      expect(society.slug).to.equal("New-Name");
      done();
    }).catch(done);
  });

  it("gets all societies", function(done) {
    models.society.findAll().then(function(societies) {
      expect(societies.length).to.be.above(0);
      done();
    }).catch(done);
  });

  it("gets societies by type", function(done) {
    models.society.findAll({where: {type: 0}}).then(function(societies) {
      expect(societies.length).to.be.above(0);
      done();
    }).catch(done);
  });

  it("deletes a society", function(done) {
    models.society.findOne({where: {slug: "New-Name"}}).then(function(society) {
      return society.destroy();
    }).then(function() {
      return models.society.findAll({where: {slug: "New-Name"}});
    }).then(function(societies) {
      expect(societies).to.have.length(0);
      done();
    }).catch(done);
  });
});