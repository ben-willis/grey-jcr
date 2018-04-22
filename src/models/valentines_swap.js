module.exports = (sequelize, DataTypes) => {
    var ValentinesSwap = sequelize.define("valentines_swap", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        cost: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        created: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });

    ValentinesSwap.associate = function (models) {
        models.valentines_swap.belongsTo(models.user, {
            foreignKey: "username"
        });
        models.valentines_swap.belongsTo(models.valentines_pair, {
            as: "paira"
        });
        models.valentines_swap.belongsTo(models.valentines_pair, {
            as: "pairb"
        });
    };

    return ValentinesSwap;
};
