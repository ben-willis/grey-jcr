var db = require('../helpers/db');
var request = require('request');
var capitalize = require('capitalize');
var httpError = require('http-errors');

/* User Object */

var User = function (data) {
    this.email = data.email;
    this.username = data.username;
    this.name = data.name;
}

User.prototype.changeName = function (new_name) {
    self = this;
    return db('users').where('username', this.username).update({
        name: new_name
    }).then(function() {
        self.name = new_name
    })
}

User.prototype.delete = function(){
    return db('users').del().where('username', this.username);
}

User.prototype.getDebt = function() {
    return db('debts')
        .sum('amount')
        .where('username', this.username)
        .first()
        .then(function(data) {
            if(!data['sum("amount")']) return 0;
            return data['sum("amount")'];
        });
}

User.prototype.getDebts = function() {
    return db('debts')
        .select(['amount', 'name', 'message'])
        .where('username', this.username);
}

User.prototype.addDebt = function(data) {
    return db('debts').insert({
        username: this.username,
        name: data.name,
        message: data.message,
        amount: data.amount
    })
}

User.prototype.payDebt = function(data) {
    return db('debts').insert({
        username: this.username,
        name: data.name,
        message: data.message,
        amount: -data.amount
    })
}

User.prototype.deleteDebtById = function(debt_id) {
    return db('debts').where({
        id: debt_id
    }).del();
}

User.prototype.assignPosition = function(position_id) {
    return db('user_positions').insert({
        username: this.username,
        position_id: position_id
    });
}

User.prototype.getPositions = function() {
    return db('user_positions')
        .where({'username': this.username})
        .join('positions', 'user_positions.position_id', '=', 'positions.id')
        .select('positions.id', 'positions.title', 'positions.slug', 'positions.level');
}

User.prototype.removePosition = function(position_id) {
    return db('user_positions').where({
        username: this.username,
        position_id: position_id
    }).del();
}

/* Static Methods */

User.create = function(username) {
    return this.fetch_details(username).then(function(data) {
        if (data.college != "Grey College") throw httpError(400, "You must be a member of Grey College");

        return db('users').insert({
            username: username,
            email: data.email,
            name: capitalize.words((data.firstnames.split(',')[0] +' '+ data.surname).toLowerCase())
        }).returning(['username','email', 'name']);

    }).then(function(data) {
        return new User(data[0])
    });
}

User.fetch_details = function(username) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: 'https://community.dur.ac.uk/grey.jcr/itsuserdetailsjson.php?username=' + username
        }

        request(options, function(err, response, body) {
            if (response.statusCode == 400) {
                reject(httpError(400, "Username not found on University Database"));
            } else {
                resolve(JSON.parse(body));
            }
        });
    });
}

User.findByUsername = function (username) {
    return db('users')
        .first()
        .where({'username': username})
        .then(function(data) {
            if (!data) throw httpError(400, "Username not found in local database");
            return new User(data)
        });
}

User.search = function(query) {
    return db('users')
        .select(["name", "email", "username"])
        .whereRaw("LOWER(name) LIKE '%' || LOWER(?) || '%' ", query)
        .orWhereRaw("LOWER(username) LIKE '%' || LOWER(?) || '%' ", query)
        .then(function(results) {
            return results.map(function(data) {
                return new User(data);
            })
        });
}

User.authorize = function(username, password) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: 'https://www.dur.ac.uk/its/password/validator',
            headers: {
                'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
            }
        }

        request(options, function(err, response, body) {
            if (response.statusCode == 401) {
                reject(httpError(401));
            } else {
                resolve();
            }
        });
    });

}

module.exports = User;
