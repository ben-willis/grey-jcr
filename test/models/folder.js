var Folder = require('../../models/folder');
var db = require('../../helpers/db');

var expect = require("chai").expect;

describe('Static Folder Methods', function() {
    var test_folder_id = null;

    beforeEach(function(done) {
        db('folders').insert({
            name: "Test Folder",
            owner: 1
        }).returning('id').then(function(id) {
            test_folder_id = id[0];
            done();
        });
    });

    afterEach(function(done) {
        db('folders').del().then(function() {
            done();
        });
    })

    it("can find a folder by id", function(done) {
        Folder.findById(test_folder_id).then(function(folder) {
            expect(folder.name).to.equal("Test Folder");
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can find a folder for a position", function(done) {
        Folder.findForPosition(1).then(function(folder) {
            expect(folder.name).to.equal("Test Folder");
            done();
        }).catch(function(err){
            done(err);
        })
    })

    it("can create a top level folder", function(done) {
        Folder.create("Test Folder", null).then(function(folder) {
            expect(folder.name).to.equal("Test Folder");
            done();
        }).catch(function(err){
            done(err);
        })
    })
});

describe('Folder Object', function() {
    var test_folder = null;

    beforeEach(function(done) {
        db('folders').insert({
            name: "Test Folder",
            owner: null
        }).returning('id').then(function(id) {
            test_folder = new Folder({
                id: id[0],
                name: "Test Folder",
                parent_id: 0,
                owner: null
            });
            done();
        });
    });

    afterEach(function(done) {
        db('folders').del().then(function() {
            test_folder = null;
            done();
        });
    })

    it("can create sub Folders", function(done) {
        test_folder.createSubfolder("Test Subfolder").then(function(subfolder) {
            expect(subfolder.name).to.equal("Test Subfolder")
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can get sub folders", function(done) {
        db('folders').insert({
            name: "Test Subfolder1",
            parent_id: test_folder.id,
            owner: null
        }).then(function() {
            return test_folder.getSubfolders();
        }).then(function(subfolders) {
            expect(subfolders).to.have.length(1);
            done();
        }).catch(function(err){
            done(err);
        })
    })

    it("can remove folders", function(done) {
        db('folders').insert({
            name: "Test Subfolder1",
            parent_id: test_folder.id,
            owner: null
        }).returning('id').then(function(id) {
            return test_folder.removeSubfolder(id[0]);
        }).then(function() {
            return db('folders').select().where({parent_id: test_folder.id})
        }).then(function(subfolders) {
            expect(subfolders).to.have.length(0);
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can create files", function(done) {
        test_folder.createFile("Test File", "Description", "fakepath").then(function(file) {
            expect(file.name).to.equal("Test File")
            done();
        }).catch(function(err){
            done(err);
        })
    });

    it("can get files", function(done) {
        db('files').insert({
            name: "Test File1",
            folder_id: test_folder.id,
            path: 'fake'
        }).then(function() {
            return test_folder.getFiles();
        }).then(function(files) {
            expect(files).to.have.length(1);
            done();
        }).catch(function(err){
            done(err);
        })
    })

    it("can remove files", function(done) {
        db('files').insert({
            name: "Test File1",
            folder_id: test_folder.id,
            path: 'fake'
        }).returning('id').then(function(id) {
            return test_folder.removeFile(id[0]);
        }).then(function() {
            return db('files').select().where({folder_id: test_folder.id})
        }).then(function(files) {
            expect(files).to.have.length(0);
            done();
        }).catch(function(err){
            done(err);
        })
    });
})
