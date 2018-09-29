module.exports = (sequelize, DataTypes) => {
  let Blog = sequelize.define("blog", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: DataTypes.TEXT,
    updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    getterMethods: {
      permalink() {
        return this.updated.getFullYear() + "/" + (this.updated.getMonth() + 1) + "/" + this.updated.getDate() + "/" + this.slug;
      }
    }
  });

  Blog.associate = function(models) {
    models.blog.belongsTo(models.role);

    models.blog.belongsTo(models.user, {
      as: "author",
      foreignKey: "author_username"
    });
  };

  return Blog;
};
