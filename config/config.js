const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({
    path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`),
});
const envVarsSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
        PORT: Joi.number().default(4000),
        APP_URL: Joi.string().required(),
        DB_HOST: Joi.string().required().description('DB Host'),
        DB_USERNAME: Joi.string().required().description('DB Username'),
        DB_PASSWORD: Joi.string().required().description('DB Password'),
        DB_NAME: Joi.string().required().description('DB Name'),
        DB_PORT: Joi.string().required().description('DB Port'),
        DB_DIALECT: Joi.string().required().description('DB dialect'),
        JWT_SECRET: Joi.string().required().description('JWT secret key'),
        JWT_ACCESS_EXPIRATION_TIME: Joi.string().default('8h').description('minutes after which access tokens expire'),
    })
    .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
console.log("Server is about to start in directory: ", __dirname);
module.exports = {
    env: process.env.NODE_ENV,
    port: envVars.PORT,
    appUrl: envVars.APP_URL,

    proxy: {
        apiUrl: envVars.PROXY_BASE_API_URL,
        clientId: envVars.CLIENT_ID,
        clientSecret: envVars.CLIENT_SECRET,
    },

    development: {
        username: envVars.DB_USERNAME,
        password: envVars.DB_PASSWORD,
        database: envVars.DB_NAME,
        host: envVars.DB_HOST,
        port: envVars.DB_PORT,
        dialect: envVars.DB_DIALECT,
        dialectOptions: {
            //     ssl: {
            //       require: true,
            //       ca: fs.readFileSync(`/etc/ssl/rds/ap-south-1-bundle.pem`),
            //     },
        },
        logging: false,
    },
    jwt: {
        secret: envVars.JWT_SECRET,
        accessExpirationTime: envVars.JWT_ACCESS_EXPIRATION_TIME,
    },
};