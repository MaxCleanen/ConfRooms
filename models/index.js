const Sequelize = require("sequelize");

const scheme = require("./scheme");

const Op = Sequelize.Op;

const sequelize = new Sequelize("DB", null, null, {
  dialect: "sqlite",
  storage: "db.sqlite3",
  operatorsAliases: { $and: Op.and },
  logging: console.log,
});

scheme(sequelize);

sequelize.sync();

module.exports.sequelize = sequelize;
module.exports.models = sequelize.models;
