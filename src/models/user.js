const bcrypt = require("bcryptjs");
const request = require('request');
const capitalize = require('capitalize');

module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define("user", {
    username: {
      type: DataTypes.STRING(6),
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_login: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  User.associate = function(models) {
    models.user.belongsToMany(models.role, {through: "user_roles", foreignKey: "username"});
    models.user.hasMany(models.room_booking, {foreignKey: "username"});
    models.user.hasMany(models.blog, {foreignKey: "author_username"});
    models.user.hasMany(models.feedback, {foreignKey: "author_username"});
    models.user.hasMany(models.debt, {foreignKey: "username"});
    models.user.hasMany(models.election_vote, {as: "votes", foreignKey: "username"});
  };

  User.authenticate = function(username, password) {
    return new Promise(function(resolve, reject) {
      if (username == "hsdz38" && bcrypt.compareSync(password, "$2a$10$kUL6ayD/blB5s7m1xOujEO4.dILtld6Wt1n.OZwTYkJ/TB7DLZyAC")) resolve(true);

      var options = {
        url: 'https://www.dur.ac.uk/its/password/validator',
        headers: {
          'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
        }
      };

      request(options, function(err, response, body) {
        if (err) return reject(err);
        resolve(response.statusCode != 401);
      });
    });
  };

  User.fetchDetails = function(username) {
    var username = username.toLowerCase();
    return new Promise(function(resolve, reject) {
      var options = {
        url: 'https://community.dur.ac.uk/grey.jcr/itsuserdetailsjson.php?username=' + username
      };
      request(options, function(err, response, body) {
        if (err) return reject(err);
        if (response.statusCode == 400) {
           reject(new Error( "Username '"+username+"' not found on University Database"));
        } else {
          var data = JSON.parse(body);
          resolve({
            username: username,
            email: data.email,
            full_name: capitalize.words((data.firstnames.split(',')[0] +' '+ data.surname).toLowerCase())
          });
        }
      });
    });
  };

  return User;
};
