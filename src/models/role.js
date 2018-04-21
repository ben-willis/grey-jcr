module.exports = (sequelize, DataTypes) => {
    var Role = sequelize.define("role", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: "6: WE, 5: Admin, 4: Exec, 3: Officer, 2: Reps, 1: Welfare???"
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    Role.associate = function (models) {
        models.role.hasOne(models.folder, {
            foreignKey: "owner_id"
        });

        models.role.belongsToMany(models.user, {through: "user_roles"});

        models.role.hasMany(models.blog);
    };

    return Role;
};
