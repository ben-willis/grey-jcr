module.exports = (sequelize, DataTypes) => {
    var RoomBooking = sequelize.define("room_booking", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        notes: DataTypes.TEXT,
        start_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER,
            defaultValue: 60
        },
        added: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });

    RoomBooking.associate = function(models) {
        models.room_booking.belongsTo(models.room, {
            onDelete: "CASCADE"
        });

        models.room_booking.belongsTo(models.user, {
            as: "booker",
            onDelete: "CASCADE",
            foreignKey: "username"
        });
    };

    return RoomBooking;
};