module.exports = (sequelize, DataTypes) => {
    var ElectionPosition = sequelize.define("election_position", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    });

    ElectionPosition.associate = function (models) {
        models.election_position.belongsTo(models.election, {
            onDelete: "CASCADE"
        });
        models.election_position.hasMany(models.election_vote, {
            as: "votes"
        });
        models.election_position.hasMany(models.election_position_nominee, {
            as: "nominees",
            foreignKey: "position_id"
        });
    };

    return ElectionPosition;
};