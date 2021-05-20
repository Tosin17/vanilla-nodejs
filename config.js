const environments = {
    staging: {
        port: 3000,
        envName: 'staging'
    },
    production: {
        port: 5000,
        envName: 'production'
    }
}

const env = process.env.NODE_ENV;
const currentEnv = env && typeof (env) === 'string' ? env.toLowerCase() : '';

module.exports = environments[env] || environments.staging;
