require('dotenv').config();
const convict = require('convict');

const config = convict({
  env: {
    doc:
      'This corresponds to execution environment (development, staging, production, etc.) and is used to provide sane defaults.',
    format: ['development', 'staging', 'production'],
    default: 'development',
    env: 'CONFIG_ENV',
  },
  nodeEnv: {
    doc: `This corresponds to the NODE_ENV environment variable and affects execution of many child modules. Generally speaking this should be "development" in a local developer environment and "production" in a real environment (regardless of whether it's staging or production).`,
    format: ['development', 'production', 'test'],
    default: null,
    env: 'NODE_ENV',
  },
  port: {
    doc: 'Port to bind server on.',
    format: 'port',
    default: null,
    env: 'PORT',
  },
  jwtSecret: {
    doc: 'Secret key for encrypting passwords.',
    format: String,
    default: null,
    env: 'JWT_SECRET',
    sensitive: true,
  },
});

// load environment defaults
if (config.get('env')) {
  // note that this is relative to CWD
  config.loadFile(`./config/${config.get('env')}.json`);
}

config.validate();

module.exports = config;
