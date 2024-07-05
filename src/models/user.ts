import { IUser } from "interfaces/global";
import db from "../config/db";
import { DataTypes, Sequelize } from "sequelize";
const User = db.define<any>('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
});
export default User;