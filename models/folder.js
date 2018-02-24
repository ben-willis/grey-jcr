var db = require('../helpers/db');
var httpError = require('http-errors');

/* Folder Object*/
var Folder = function (data) {
    this.id = data.id;
    this.name = data.name;
    this.owner = data.owner;
    this.parent_id = data.parent_id;
}

Folder.prototype.createSubfolder = function(name) {
    return db('folders').insert({
        name: name,
        parent_id: this.id,
        owner: this.owner
    }).returning('id').then(function(id) {
        return new Folder({
            id: id[0],
            name: name,
            owner: this.owner,
            parent_id: this.parent_id
        });
    });
};

Folder.prototype.getSubfolders = function() {
    return db('folders').select().where({parent_id: this.id}).then(function(subfolders) {
        return Promise.all(
            subfolders.map(function(subfolder) {
                return new Folder(subfolder);
            })
        );
    });
};

Folder.prototype.removeSubfolder = function(subfolder_id) {
    return db('folders').where({id: subfolder_id}).del();
};

Folder.prototype.createFile = function(name, description, path) {
    return db('files').insert({
        name: name,
        folder_id: this.id,
        description: description,
        path: path
    }).returning('id').then(function(id) {
        return {
            id: id[0],
            name: name,
            folder_id: this.id,
            description: description,
            path: path
        };
    });
};

Folder.prototype.getFiles = function() {
    return db('files').select().where({folder_id: this.id});
};

Folder.prototype.removeFile = function(file_id) {
    return db('files').where({id: file_id}).del();
};

/* Static Methods */

Folder.findById = function(folder_id) {
    return db('folders').first().where({id: folder_id}).then(function(data) {
        return new Folder(data);
    });
};

Folder.findForRole = function(role_id) {
    return db('folders').first().where({owner: role_id}).then(function(data) {
        if (!data) return {};
        return new Folder(data);
    });
};

Folder.create = function(name, owner) {
    return db('folders').insert({
        name: name,
        owner: owner
    }).returning('id').then(function(id) {
        return new Folder({
            id: id[0],
            name: name,
            owner: owner,
            parent_id: 0
        });
    });
};

module.exports = Folder;
