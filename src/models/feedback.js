module.exports = (sequelize, DataTypes) => {
    var Feedback = sequelize.define("feedback", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        exec: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        anonymous: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        archived: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        read_by_user: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });

    Feedback.associate = function (models) {
        models.feedback.belongsTo(models.feedback, {
            as: "parent",
            onDelete: "CASCADE"
        });
        models.feedback.hasMany(models.feedback, {
            as: "replies",
            foreignKey: "parent_id"
        });

        models.feedback.belongsTo(models.user, {
            as: "author",
            onDelete: "CASCADE",
            foreignKey: "author_username"
        });
    };

    return Feedback;
};
