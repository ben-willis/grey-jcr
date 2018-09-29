module.exports = (sequelize, DataTypes) => {
    var File = sequelize.define("file", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        description: DataTypes.TEXT,
        path: {
            type: DataTypes.TEXT,
            allowNull: false
            // TODO: Validate the file at the path actually exists
        },
        updated: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });

    File.associate = function (models) {
        models.file.belongsTo(models.folder, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });
    };

    return File;
};