import {Sequelize, Options} from "sequelize";

const dataDirectoryPath = `${__dirname}/../../data`;

const config: Options = {
    host: "localhost",
    dialect: "sqlite",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    storage: `${dataDirectoryPath}/bridge.sqlite`,
};

export default new Sequelize(config);
