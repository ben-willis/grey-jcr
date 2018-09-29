module.exports = (sequelize, DataTypes) => {
    var Election = sequelize.define("election", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: "0:closed, 1:public, 2:open"
        }
    });

    Election.associate = function (models) {
        models.election.hasMany(models.election_position, {
            as: "positions",
            foreignKey: "election_id"
        });
        models.election.hasMany(models.election_vote, {
            as: "votes"
        })
    };

    return Election;
};
