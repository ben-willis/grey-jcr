module.exports = (sequelize, DataTypes) => {
    var ElectionVote = sequelize.define("election_vote", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        preference: DataTypes.STRING,
        usercode: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    ElectionVote.associate = function (models) {
        models.election_vote.belongsTo(models.election_position_nominee, {
            as: "nominee",
            foreignKey: "nominee_id"
        });
        models.election_vote.belongsTo(models.election_position, {
            as: "position",
            foreignKey: "position_id"
        });
        models.election_vote.belongsTo(models.election, {
            as: "election",
            foreignKey: "election_id"
        });
        models.election_vote.belongsTo(models.user, {
            as: "user",
            foreignKey: "username"
        });
    };

    return ElectionVote;
};
