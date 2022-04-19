const fs = require("fs");
const path = require("path");

let models = {};

function registerModels(sequelize) {
  const thisFile = path.basename(__filename); // index.js
  const modelFiles = fs.readdirSync(__dirname);
  const filteredModelFiles = modelFiles.filter((file) => {
    return file !== thisFile && file.slice(-3) === ".js";
  });

  for (const file of filteredModelFiles) {
    const modelClass = require(path.join(__dirname, file));
    const model = modelClass(sequelize);
    models[model.name] = model;
  }

  Object.keys(models).forEach((modelName) => {
    if ("associate" in models[modelName]) {
      models[modelName].associate(models);
    }
  });

  models.sequelize = sequelize;
}

module.exports = {
  models,
  registerModels,
};
