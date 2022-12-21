import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./models/user.js"
import path from 'path';

const __dirname = path.resolve();
export const root: string = path.resolve(__dirname, "..")

const AppDataSource = new DataSource({
    type: "sqlite",
    database: `${root}/data/line.sqlite`,
    entities: [User],
    synchronize: true,
    logging: false,
})

export async function init() {
    await AppDataSource.initialize();
}
