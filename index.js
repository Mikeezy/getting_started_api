require('dotenv').config();

const { createServer } = require('./server');
const config = require('./config');

const app = createServer();

const port = config.get('port');
const env = config.get('nodeEnv');

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server now listening on localhost:${port}, on ${env}`);
});
