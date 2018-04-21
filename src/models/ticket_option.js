module.exports = (sequelize, DataTypes) => {
    var TicketOption = sequelize.define("ticket_option", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    TicketOption.associate = function (models) {
        models.ticket_option.belongsTo(models.ticket, {
            onDelete: "CASCADE"
        });
        models.ticket_option.hasMany(models.ticket_option_choice, {as: "choices"});
    };

    return TicketOption;
};