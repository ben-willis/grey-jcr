module.exports = (sequelize, DataTypes) => {
    var Debt = sequelize.define("debt", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: DataTypes.TEXT,
        link: DataTypes.TEXT,
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        debt_added: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });

    Debt.associate = function (models) {
        models.debt.belongsTo(models.user, {
            foreignKey: "username"
        });
        models.debt.belongsTo(models.booking);
    };

    return Debt;
};