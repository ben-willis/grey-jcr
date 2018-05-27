module.exports = (sequelize, DataTypes) => {
    var ElectionPositionNominee = sequelize.define("election_position_nominee", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        manifesto: {
            type: DataTypes.STRING
        }
    });

    ElectionPositionNominee.associate = function (models) {
        models.election_position_nominee.belongsTo(models.election_position, {
            as: "position",
            onDelete: "CASCADE",
            foreignKey: "position_id"
        });
        models.election_position_nominee.hasMany(models.election_vote, {
            as: "votes",
            foreignKey: "nominee_id"
        });
    };

    return ElectionPositionNominee;
};
