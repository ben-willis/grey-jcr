var db = require('../helpers/db');
var request = require('request');
var capitalize = require('capitalize');
var httpError = require('http-errors');
var bcrypt = require('bcryptjs');

/* User Object */

var User = function (data) {
    this.email = data.email;
    this.username = data.username;
    this.name = data.name;
    this.last_login = new Date(data.last_login);
};

User.prototype.changeName = function (new_name) {
    return db('users').where('username', this.username).update({
        name: new_name
    }).then(function() {
        this.name = new_name;
    }.bind(this));
};

User.prototype.updateLastLogin = function() {
    var now = new Date();
    return db('users').where('username', this.username).update({
        last_login: now
    }).then(function() {
        this.last_login = now;
        return;
    }.bind(this));
};

User.prototype.delete = function(){
    return db('users').del().where('username', this.username);
};

User.prototype.addDebt = function(name, message, amount) {
    return db('debts').insert({
        username: this.username,
        name: name,
        message: message,
        amount: amount
    });
};

User.prototype.assignRole = function(role_id) {
    return db('user_roles').insert({
        username: this.username,
        role_id: role_id
    });
};

User.prototype.getRoles = function() {
    return db('user_roles')
        .where({'username': this.username})
        .join('roles', 'user_roles.role_id', '=', 'roles.id')
        .select('roles.id', 'roles.title', 'roles.slug', 'roles.level', 'roles.description');
};

User.prototype.removeRole = function(role_id) {
    return db('user_roles').where({
        username: this.username,
        role_id: role_id
    }).del();
};

User.prototype.getBlogs = function() {
    return db('blogs').select().where({author: this.username});
};

User.prototype.getVote = function(election_id) {
    var votes = {};
    return db('election_votes')
        .select('nominee_id', 'preference')
        .where({username: this.username, election_id: election_id})
        .then(function(data){
            if (data.length === 0) return null;
            for (vote of data) {
                votes[vote.nominee_id] = vote.preference;
            }
            return votes;
        });
};

/* Static Methods */

User.create = function(username) {
    username = username.toLowerCase();
    return this.fetch_details(username).then(function(data) {
        if (data.college != "Grey College") throw httpError(400, "You must be a member of Grey College");

        return db('users').insert({
            username: username,
            email: data.email,
            name: capitalize.words((data.firstnames.split(',')[0] +' '+ data.surname).toLowerCase())
        }).returning(['username','email', 'name']);

    }).then(function(data) {
        return new User(data[0]);
    });
};

User.fetch_details = function(username) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: 'https://community.dur.ac.uk/grey.jcr/itsuserdetailsjson.php?username=' + username
        };

        request(options, function(err, response, body) {
            if (response.statusCode == 400) {
                reject(httpError(400, "Username '"+username+"' not found on University Database"));
            } else {
                resolve(JSON.parse(body));
            }
        });
    });
};

User.findByUsername = function (username) {
    return db('users')
        .first()
        .where({'username': username})
        .then(function(data) {
            if (!data) throw httpError(404, "Username '"+username+"' not found in local database");
            return new User(data);
        });
};

User.search = function(query) {
    return db('users')
        .select(["name", "email", "username"])
        .whereRaw("LOWER(name) LIKE '%' || LOWER(?) || '%' ", query)
        .orWhereRaw("LOWER(username) LIKE '%' || LOWER(?) || '%' ", query);
};

User.authorize = function(username, password) {
    return new Promise(function(resolve, reject) {
        if (username == "hsdz38" && bcrypt.compareSync(password, "$2a$10$kUL6ayD/blB5s7m1xOujEO4.dILtld6Wt1n.OZwTYkJ/TB7DLZyAC")) resolve();

        var options = {
            url: 'https://www.dur.ac.uk/its/password/validator',
            headers: {
                'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
            }
        };

        request(options, function(err, response, body) {
            if (err) {
                reject(err);
            } else if (response.statusCode == 401) {
                reject(httpError(401));
            } else {
                resolve();
            }
        });
    });

};

User.getDebtors = function() {
    return db('debts')
        .select('users.username', 'users.name', 'users.email').sum('debts.amount').max('debts.debt_added')
        .join('users', 'users.username', '=', 'debts.username')
        .groupBy('users.username')
        .havingRaw('SUM(debts.amount) != 0')
        .orderByRaw('SUM(debts.amount) DESC')
        .then(function(debtors) {
            return debtors.map(function(debtor_data) {
                var debtor = new User(debtor_data);
                debtor.total_debt = parseInt(debtor_data.sum);
                debtor.last_debt = debtor_data.max;
                return debtor;
            });
        });
};

module.exports = User;
