module.exports = (sequelize, DataTypes) => {
    var Booking = sequelize.define("booking", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        guestname: DataTypes.STRING,
        notes: DataTypes.TEXT
    });

    Booking.associate = function (models) {
        models.booking.belongsTo(models.user, {
            as: "booker",
            onDelete: "CASCADE",
            foreignKey: "booked_by"
        });
        models.booking.belongsTo(models.user, {foreignKey: "username"});
        models.booking.belongsToMany(models.ticket_option_choice, {through: "booking_choices", as: "choices"});
        models.booking.belongsTo(models.event);
        models.booking.belongsTo(models.ticket);
        models.booking.hasOne(models.debt);
    };

    return Booking;
};
