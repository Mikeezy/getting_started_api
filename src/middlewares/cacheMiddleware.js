const client = require('../utils/redis');
const { successMessage } = require('../utils/response');

const ttl = 15 * 60;

function getKeyFromRequest(req) {
  let key = req.originalUrl;

  return key;
}

function getKeyFromRequestBody(req) {
  let key = req.originalUrl;

  let parameters = {
    ...req.body,
  };

  for (let value of Object.values(parameters)) {
    key = key + `/${value}`;
  }

  return key;
}

async function get(req, res, next) {
  const key = getKeyFromRequest(req);

  const data = await client.getAsync(key);

  if (data) {
    const dataToReturn = successMessage(JSON.parse(data));
    return res.status(200).json(dataToReturn);
  }

  return next();
}

async function getByBody(req, res, next) {
  const key = getKeyFromRequestBody(req);

  const data = await client.getAsync(key);

  if (data) {
    const dataToReturn = successMessage(JSON.parse(data));
    return res.status(200).json(dataToReturn);
  }

  return next();
}

async function set(req, res, next) {
  const key = getKeyFromRequest(req);

  const value = res.locals.data;

  await client.setAsync(key, JSON.stringify(value), 'EX', ttl);

  return next();
}

async function setByBody(req, res, next) {
  const key = getKeyFromRequestBody(req);

  const value = res.locals.data;

  await client.setAsync(key, JSON.stringify(value), 'EX', ttl);

  return next();
}

async function clear(req, res, next) {
  const keysToDelete = req.baseUrl;
  const dataToDelete = await client.keysAsync(`${keysToDelete}*`);

  if (dataToDelete.length > 0) {
    await client.delAsync(dataToDelete);
  }

  return next();
}

function customClear(keysToDelete) {
  return async function (req, res, next) {
    const dataToDelete = await client.keysAsync(`${keysToDelete}*`);

    if (dataToDelete.length > 0) {
      await client.delAsync(dataToDelete);
    }

    return next();
  };
}

module.exports = {
  get,
  getByBody,
  set,
  setByBody,
  clear,
  customClear,
};
