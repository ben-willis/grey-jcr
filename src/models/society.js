var htmlToText = require('html-to-text');

module.exports = (sequelize, DataTypes) => sequelize.define("society", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.INTEGER,
        comment: "0: society, 1: sport",
        allowNull: false
    },
    description: DataTypes.TEXT,
    facebook: {
        type: DataTypes.STRING,
        validate: {
            isUrl: true
        }
    },
    twitter: {
        type: DataTypes.STRING,
        validate: {
            isUrl: true
        }
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    }
}, {
    getterMethods: {
        descriptionShort() {
            var description = this.getDataValue("description");
            return htmlToText.fromString(description, {
                wordwrap: false,
                ignoreHref: true,
                ignoreImage: true
            }).slice(0, 100) + "...";
        }
    }
});
