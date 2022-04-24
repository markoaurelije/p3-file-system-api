const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Folder extends Model {
    static associate(models) {
      Folder.files = Folder.hasMany(models.File, {
        foreignKey: {
          name: "parentId",
        },
      });

      Folder.parent = Folder.belongsTo(Folder, {
        as: "parent",
        foreignKey: {
          name: "parentId",
          allowNull: true,
        },
        onDelete: "RESTRICT",
      });
      Folder.subfolders = Folder.hasMany(Folder, {
        foreignKey: {
          name: "parentId",
        },
      });
    }
  }

  Folder.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        // unique: true,
        validate: {
          is: {
            args: /^[a-zA-Z\d\s\-_.@]+$/,
            msg: "'name' contains invalid character(s)",
          },
          async uniqueWithinParent() {
            const count = await Folder.count({
              where: { name: this.name, parentId: !!this.parentId ? this.parentId : null },
            });
            if (count > 0) {
              throw new Error("Folder name already exists along this path");
            }
          },
        },
      },
      path: {
        type: DataTypes.STRING(1024),
      },
    },
    {
      sequelize,
      indexes: [{ fields: ["name"] }],
      modelName: "Folder",
    }
  );

  Folder.beforeSave(async (folder, options) => {
    let parentPath = "";
    if (folder.parentId) {
      const parent = await Folder.findByPk(folder.parentId);
      if (parent) parentPath = parent.path;
    }
    folder.path = `${parentPath}/${folder.name}`;
  });

  return Folder;
};
