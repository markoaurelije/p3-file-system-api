const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class File extends Model {
    static associate(models) {
      File.parent = File.belongsTo(models.Folder, {
        as: "parent",
        foreignKey: {
          name: "parentId",
          allowNull: true,
        },
        onDelete: "RESTRICT",
      });
    }

    static async createNewFile({ name, parent = null }) {
      return sequelize.transaction(() => {
        return File.create(
          {
            name,
            parent,
          },
          { include: File.parent }
        );
      });
    }
  }

  File.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          is: {
            args: /^[a-zA-Z\d\s\-_.]+$/,
            msg: "'name' contains invalid character(s)",
          },
          async uniqueWithinParent() {
            const count = await File.count({
              where: { name: this.name, parentId: !!this.parentId ? this.parentId : null },
            });
            if (count > 0) {
              throw new Error("Filename already exists along this path");
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
      modelName: "File",
    }
  );

  File.beforeSave(async (file, options) => {
    let parentPath = "";
    if (file.parentId) {
      const parent = await sequelize.models.Folder.findByPk(file.parentId);
      if (parent) parentPath = parent.path;
    }
    file.path = `${parentPath}/${file.name}`;
  });

  return File;
};
