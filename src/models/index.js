const Sequelize = require('sequelize');
const path = require("path");
const db = {};
const files = [
  "blog.js",
  "booking.js",
  "debt.js",
  "election.js",
  "election_position.js",
  "election_position_nominee.js",
  "election_vote.js",
  "event.js",
  "feedback.js",
  "file.js",
  "folder.js",
  "role.js",
  "room.js",
  "room_booking.js",
  "society.js",
  "ticket.js",
  "ticket_option.js",
  "ticket_option_choice.js",
  "user.js",
  "valentines_pair.js",
  "valentines_status.js",
  "valentines_swap.js"
];

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "postgres",
  operatorsAliases: false,
  logging: console.debug,

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  define: {
    timestamps: false,
    underscored: true
  }
});

files.forEach(file => {
  var model = sequelize['import'](path.join(__dirname, file));
  db[model.name] = model;
});

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = db;
