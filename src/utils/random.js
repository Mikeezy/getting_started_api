const randToken = require('rand-token');
const uuidV1 = require('uuid/v1');

exports.generateReference = async function generateReference(
  schema,
  fields,
  size
) {
  const code = randToken.generate(size);

  const result = await schema
    .findOne({
      [fields]: code,
    })
    .exec();

  if (result === null || typeof result._id === 'undefined') {
    return code;
  } else {
    return generateReference(schema, fields, size);
  }
};

exports.generateUuid = async function generateUuid(schema, fields) {
  const code = uuidV1();

  const result = await schema
    .findOne({
      [fields]: code,
    })
    .exec();

  if (result === null || typeof result._id === 'undefined') {
    return code;
  } else {
    return generateUuid(schema, fields);
  }
};
