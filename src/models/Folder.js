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

    static async createNewFolder({ name, parent = null }) {
      return sequelize.transaction(async () => {
        return await Folder.create(
          {
            name,
            parent,
          },
          { include: Folder.parent }
        );
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
            args: /^[a-zA-Z\d\s\-_]+$/,
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
    },
    {
      sequelize,
      modelName: "Folder",
    }
  );

  return Folder;
};
