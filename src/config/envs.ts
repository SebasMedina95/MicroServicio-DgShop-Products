import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    URL_DEV: string;
    DATABASE_URL: string;
    DB_MYSQL_ROOT_PASSWORD: string;
    DB_MYSQL_DATABASE: string;
    DB_MYSQL_USER: string;
    DB_MYSQL_PASSWORD: string;
    DB_MYSQL_PORT_MYSQL: number;
    DB_MYSQL_PORT_DOCKER: number;
    DB_HOST: string;
    DB_TYPE: string;
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    URL_DEV: joi.string().optional(),
    DATABASE_URL: joi.string().required(),
    DB_MYSQL_ROOT_PASSWORD: joi.string().required(),
    DB_MYSQL_DATABASE: joi.string().required(),
    DB_MYSQL_USER: joi.string().required(),
    DB_MYSQL_PASSWORD: joi.string().required(),
    DB_MYSQL_PORT_MYSQL: joi.number().required(),
    DB_MYSQL_PORT_DOCKER: joi.number().required(),
    DB_HOST: joi.string().required(),
    DB_TYPE: joi.string().required(),
}).unknown(true);

const { error, value } = envsSchema.validate( process.env )

if( error ){
    throw new Error(`Error en la validación de la configuración. Error: ${ error.message }`);
}

const envVars: EnvVars = value;

export const envs = {
    port: envVars.PORT,
    url_dev: envVars.URL_DEV,
    dbUrl: envVars.DATABASE_URL,
    dbMySqlRootPassword: envVars.DB_MYSQL_ROOT_PASSWORD,
    dbMySqlDataBase: envVars.DB_MYSQL_DATABASE,
    dbMySqlUser: envVars.DB_MYSQL_USER,
    dbMySqlPassword: envVars.DB_MYSQL_PASSWORD,
    dbMySqlPortMySql: envVars.DB_MYSQL_PORT_MYSQL,
    dbMySqlPortDocker: envVars.DB_MYSQL_PORT_DOCKER,
    dbHost: envVars.DB_HOST,
    dbType: envVars.DB_TYPE,
}
