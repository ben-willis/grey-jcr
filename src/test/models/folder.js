var models = require('../../models');

var expect = require("chai").expect;

describe("Folder and File models", function() {
  var testFolderId = null;

  it("creates a folder", function(done) {
    models.folder.create({
      name: "Test Folder"
    }).then(function(folder) {
        expect(folder.name).to.equal("Test Folder");
        testFolderId = folder.id;
        done();
    }).catch(done);
  });

  it("creates a file", function(done) {
    models.file.create({
      name: "Test File",
      description: "Test description",
      path: "dummy.gif",
      folder_id: testFolderId
    }).then(function(file) {
        expect(file.name).to.equal("Test File");
        done();
    }).catch(done);
  });

  it("lists files in a folder", function(done) {
    models.folder.findById(testFolderId).then(function(folder) {
      return folder.getFiles();
    }).then(function(files) {
      expect(files).to.not.have.length(0);
      done();
    }).catch(done);
  });

  it("can get a files folder", function(done) {
    models.file.findOne({where: {name: "Test File"}}).then(function(file) {
      return file.getFolder();
    }).then(function(folder) {
      expect(folder.name).to.equal("Test Folder");
      done();
    }).catch(done);
  });

  it("deletes a file", function(done) {
    models.file.findOne({where: {name: "Test File"}}).then(function(file) {
        return file.destroy();
    }).then(function() {
        done();
    }).catch(done);
  });

  it("deletes a folder", function(done) {
    models.folder.findById(testFolderId).then(function(folder) {
        return folder.destroy();
    }).then(function() {
        done();
    }).catch(done);
  });
});