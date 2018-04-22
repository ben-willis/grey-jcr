module.exports = (sequelize, DataTypes) => {
    var ValentinesPair = sequelize.define("valentines_pair", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lead: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        partner: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        position: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });

    ValentinesPair.associate = function (models) {
        models.valentines_pair.hasMany(models.valentines_swap, {
            as: "swap",
            onDelete: "CASCADE"
        });
    };

    return ValentinesPair;
};
