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
        },
        owner: DataTypes.INTEGER
    });

    Folder.associate = function (models) {
        models.folder.hasMany(models.file);
        models.folder.belongsTo(models.folder, {
            as: "Parent",
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: true,
                defaultValue: 0
            }
        });
        models.file.hasMany(models.folder, {
            as: "Children",
            foreignKey: "parent_id"
        });
    };

    return Folder;
};
