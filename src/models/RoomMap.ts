import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize";

import sequelize from "./init";

export default class RoomMap extends
    Model<InferAttributes<RoomMap>, InferCreationAttributes<RoomMap>> {
    declare id: CreationOptional<number>;
    declare lineMode: string;
    declare lineHookFrom: string;
    declare lineTo: string | null;
    declare matrixTo: string;
    declare createdTime: number;
    declare updatedTime: number;
}

RoomMap.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    lineMode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lineHookFrom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lineTo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    matrixTo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    updatedTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: "room_map",
    tableName: "room_map",
    timestamps: false,
    indexes: [
        {
            name: "line_mode_unique",
            fields: ["lineMode", "lineTo", "matrixTo"],
            unique: true,
        },
    ],
});
