module.exports = (sequelize, DataTypes) => {
    var Event = sequelize.define("event", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        image: DataTypes.TEXT,
        time: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    });

    Event.associate = function (models) {
        models.event.belongsToMany(models.ticket, {
            through: "event_tickets"
        });
        models.event.hasMany(models.booking);
    };

    return Event;
};
