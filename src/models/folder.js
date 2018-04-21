module.exports = (sequelize, DataTypes) => {
    var Folder = sequelize.define("folder", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });

    Folder.associate = function (models) {
        models.folder.hasMany(models.file);
        models.folder.belongsTo(models.folder, {
            as: "parent",
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: true,
                defaultValue: 0
            }
        });
        models.folder.hasMany(models.folder, {
            as: "children",
            foreignKey: "parent_id"
        });

        models.folder.belongsTo(models.role, {
            as: "owner",
            onDelete: "CASCADE",
            foreignKey: "owner_id"
        });
    };

    return Folder;
};
