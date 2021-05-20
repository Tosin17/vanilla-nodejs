const environments = {
    staging: {
        httpPort: 3000,
        httpsPort: 3001,
        envName: 'staging'
    },
    production: {
        httpPort: 5000,
        httpsPort: 5001,
        envName: 'production'
    }
}

const env = process.env.NODE_ENV;
const currentEnv = env && typeof (env) === 'string' ? env.toLowerCase() : '';

module.exports = environments[currentEnv] || environments.staging;
