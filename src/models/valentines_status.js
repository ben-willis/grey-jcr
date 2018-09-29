module.exports = (sequelize, DataTypes) => {
    var ValentinesStatus = sequelize.define("valentines_status", {
        open: {
            type: DataTypes.BOOLEAN,
        },
        updated: {
            type: DataTypes.TIME,
            defaultValue: DataTypes.NOW
        }
    }, {tableName: "valentines_status"});

    ValentinesStatus.removeAttribute("id");

    return ValentinesStatus;
};
