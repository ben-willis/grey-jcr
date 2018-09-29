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
