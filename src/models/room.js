module.exports = (sequelize, DataTypes) => {
    var Room = sequelize.define("room", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT
    });

    Room.associate = function(models) {
        models.room.hasMany(models.room_booking, {
            as: "bookings"
        });
    };

    return Room;
};
