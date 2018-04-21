module.exports = (sequelize, DataTypes) => {
    var Ticket = sequelize.define("ticket", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        max_booking: {
            type: DataTypes.INTEGER,
            defaultValue: 8
        },
        min_booking: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        allow_debtors: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        allow_guests: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        open_booking: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        close_booking: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        guest_surcharge: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });

    Ticket.associate = function (models) {
        models.ticket.belongsToMany(models.event, {
            through: "event_tickets"
        });
        models.ticket.hasMany(models.ticket_option, {as: "options"});
        models.ticket.hasMany(models.booking);
    };

    return Ticket;
};

// /* Folder Object*/
// var Ticket = function (data) {
//     this.id = data.id;
//     this.name = data.name;
//     this.max_booking = data.max_booking;
//     this.min_booking = data.min_booking;
//     this.allow_debtors = data.allow_debtors;
//     this.allow_guests = data.allow_guests;
//     this.open_booking = data.open_booking;
//     this.close_booking = data.close_booking;
//     this.price = data.price;
//     this.guest_surcharge = data.guest_surcharge;
//     this.stock = data.stock;
//     this.options = [];
// };

// Ticket.prototype.update = function(name, options) {
//     return db('tickets').where({id: this.id}).update({
//         name: name,
//         max_booking: options.max_booking,
//         min_booking: options.min_booking,
//         allow_debtors: options.allow_debtors,
//         allow_guests: options.allow_guests,
//         open_booking: options.open_booking,
//         close_booking: options.close_booking,
//         price: options.price,
//         guest_surcharge: options.guest_surcharge,
//         stock: options.stock
//     }).then(function(id){
//         this.name = name;
//         this.max_booking = options.max_booking;
//         this.min_booking = options.min_booking;
//         this.allow_debtors = options.allow_debtors;
//         this.allow_guests = options.allow_guests;
//         this.open_booking = options.open_booking;
//         this.close_booking = options.close_booking;
//         this.price = options.price;
//         this.guest_surcharge = options.guest_surcharge;
//         this.stock = options.stock;
//     });
// };

// Ticket.prototype.delete = function() {
//     return db('tickets').where({id: this.id}).del();
// };

// Ticket.prototype.getEvents = function() {
//     return db('event_tickets').select('event_id').where({ticket_id: this.id}).then(function(data) {
//         return data.map(function(data) {
//             return data.event_id;
//         });
//     });
// };

// Ticket.prototype.getOptionsAndChoices = function() {
//     return db('ticket_options').select().where({ticket_id: this.id}).then(function(options) {
//         return Promise.all(
//             options.map(function(option) {
//                 return db('ticket_option_choices').select().where({option_id: option.id}).then(function(choices) {
//                     option.choices = choices;
//                     return option;
//                 });
//             })
//         );
//     });
// };

// Ticket.prototype.addOption = function(name) {
//     return db('ticket_options').insert({
//         name: name,
//         ticket_id: this.id
//     }).returning('id').then(function(ids) {
//         this.options.push({
//             id: ids[0],
//             name: name,
//             ticket_id: this.id,
//             choices: []
//         });
//         return;
//     }.bind(this));
// };

// Ticket.prototype.renameOption = function(option_id, new_name) {
//     return db('ticket_options').update({
//         name: new_name,
//     }).where({id: option_id}).then(function(ids) {
//         this.options.map(function(option) {
//             if (option.id == option_id) option.name = new_name;
//         });
//         return;
//     }.bind(this));
// };

// Ticket.prototype.removeOption = function(option_id) {
//     return db('ticket_options').del().where({id: option_id}).then(function() {
//         for (var i = 0; i < this.options.length; i++) {
//             if (this.options[i].id == option_id) {
//                 this.options.splice(i, 1);
//                 break;
//             }
//         }
//         return;
//     }.bind(this));
// };

// Ticket.prototype.addChoice = function(option_id, name, price) {
//     return db('ticket_option_choices').insert({
//         name: name,
//         price: price,
//         option_id: option_id
//     }).returning('id').then(function(ids) {
//         for (option of this.options) {
//             if (option.id == option_id) {
//                 option.choices.push({
//                     id: ids[0],
//                     name: name,
//                     price: price,
//                     ticket_id: this.id
//                 });
//                 break;
//             }
//         }
//         return;
//     }.bind(this));
// };

// Ticket.prototype.updateChoice = function (choice_id, new_name, new_price) {
//     return db('ticket_option_choices').update({
//         name: new_name,
//         price: new_price
//     }).where({id: choice_id}).then(function() {
//         for (option of this.options) {
//             for (choice of option.choices) {
//                 if (choice.id == choice_id) {
//                     choice.name = new_name,
//                     choice.price = new_price
//                     break;
//                 }
//             }
//         }
//         return;
//     }.bind(this));
// };

// Ticket.prototype.removeChoice = function (choice_id) {
//     return db('ticket_option_choices').del().where({id: choice_id}).then(function() {
//         this.options.forEach(function(option) {
//             option.choices = option.choices.filter(function(choice) {
//                 return choice.id != choice_id;
//             });
//         });
//         return;
//     }.bind(this));
// };

// /* Static Methods */

// Ticket.create = function(name) {
//     return db('tickets').insert({name: name}).returning('id').then(function(id){
//         return Ticket.findById(id[0]);
//     });
// };

// Ticket.findById = function(ticket_id) {
//     var ticket = null;
//     return db('tickets').first().where({id: ticket_id}).then(function(ticket_data) {
//         ticket = new Ticket(ticket_data);
//         return ticket.getOptionsAndChoices();
//     }).then(function(ticket_options) {
//         ticket.options = ticket_options;
//         return ticket;
//     });
// };

// Ticket.getAll = function() {
//     return db('tickets').select().then(function(tickets) {
//         return Promise.all(
//             tickets.map(function(ticket_data) {
//                 var ticket = new Ticket(ticket_data);
//                 return ticket.getOptionsAndChoices().then(function(ticket_options) {
//                     ticket = new Ticket(ticket_data);
//                     ticket.options = ticket_options;
//                     return ticket;
//                 });
//             })
//         );
//     });
// };

// module.exports = Ticket;
