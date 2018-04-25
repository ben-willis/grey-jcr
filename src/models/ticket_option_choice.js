module.exports = (sequelize, DataTypes) => {
    var TicketOptionChoice = sequelize.define("ticket_option_choice", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        }
    });

    TicketOptionChoice.associate = function (models) {
        models.ticket_option_choice.belongsTo(models.ticket_option, {
            as: "option",
            onDelete: "CASCADE",
            foreignKey: "option_id"
        });
        models.ticket_option_choice.belongsToMany(models.booking, {through: "booking_choices", foreignKey: "choice_id"});
    };

    return TicketOptionChoice;
};