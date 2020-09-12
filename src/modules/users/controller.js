const User = require('./model.js');
const { generateUuid } = require('../../utils/random');
const Promise = require('bluebird');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailController = require('../../email/controller');
const { customError, customSimpleError } = require('../../utils/customError');
const config = require('../../../config');
const {
  AUTHENTICATION_ERROR,
  TOKEN_EXPIRED,
  TOKEN_INVALID,
} = require('../../../utils/errorCode.js');

const saltRound = 10;
const privateKey = config.get('jwtSecret');
const tokenExpiry24h = '24h';
const tokenExpiry1h = '1h';

exports.getAll = async function getAll({ offset = 0, limit = 5 }) {
  const dataPromise = await User.find({
    role: {
      $ne: 'super_admin',
    },
  })
    .skip(+offset)
    .limit(+limit)
    .select('-uuid')
    .sort('lastname')
    .exec();

  const totalPromise = User.find({
    role: {
      $ne: 'super_admin',
    },
  })
    .countDocuments()
    .exec();

  const [data, total] = await Promise.all([dataPromise, totalPromise]);

  return {
    total,
    data,
  };
};

exports.block = async function block({ id }) {
  const userGet = await User.findOne({
    _id: id,
  })
    .select('_id blocked')
    .exec();

  if (userGet) {
    userGet.blocked = userGet.blocked === true ? false : true;

    await userGet.save();
  }

  return null;
};

exports.updateProfile = async function updateProfile({ user, ...data }) {
  const userUpdated = await User.findOneAndUpdate(
    {
      _id: user._id,
    },
    data,
    {
      new: true,
    }
  )
    .select('-uuid')
    .exec();

  return userUpdated;
};

exports.updatePassword = async function updatePassword({
  password,
  old_password,
  user,
}) {
  const userGet = await User.findOne({
    _id: user._id,
  }).exec();

  const response = await bcrypt.compare(old_password, userGet.password);

  if (!response) {
    throw new customError('Password incorrect, please retry !');
  }

  const hash = await bcrypt.hash(password, saltRound);

  await User.findOneAndUpdate(
    {
      _id: user._id,
    },
    {
      password: hash,
    }
  ).exec();

  return null;
};

// Auth methods
exports.auth = async function auth({ email, password, expiresIn = null }) {
  const userGet = await User.findOne({
    email,
  })
    .select('-uuid')
    .exec();

  if (userGet) {
    const response = await bcrypt.compare(password, userGet.password);

    if (response === true) {
      const jwtSignAsync = Promise.promisify(jwt.sign);

      let token;
      const userData = userGet.toObject();

      if (expiresIn) {
        token = await jwtSignAsync(userData, privateKey, {
          expiresIn: tokenExpiry24h,
        });
      } else {
        token = await jwtSignAsync(userData, privateKey);
      }

      return { data: userData, token };
    } else {
      throw new customError(
        'Email or password incorrect, please retry !',
        AUTHENTICATION_ERROR
      );
    }
  } else {
    throw new customError(
      'Email or password incorrect, please retry !',
      AUTHENTICATION_ERROR
    );
  }
};

exports.signupAdminPartOne = async function signupAdminPartOne(data) {
  const jwtSignAsync = Promise.promisify(jwt.sign);

  const token = await jwtSignAsync(data, privateKey, {
    expiresIn: tokenExpiry1h,
  });

  const emailInfo = await emailController.sendConfirmationMail({
    to: data.email,
    info: {
      link: `${config.get('hostname.FRONTEND')}${config.get(
        'link.confirmationFrontendAdmin'
      )}/${token}`,
    },
  });

  if (emailInfo) {
    return null;
  } else {
    throw new customSimpleError();
  }
};

exports.signupAdminPartTwo = async function signupAdminPartTwo(data) {
  const uuidPromise = generateUuid(User, 'uuid');
  const passwordHashPromise = bcrypt.hash(data.password, saltRound);

  const [uuid, passwordHash] = await Promise.all([
    uuidPromise,
    passwordHashPromise,
  ]);

  data.password = passwordHash;
  data.uuid = uuid;
  data.status = true;

  const userCreated = await new User(data).save();

  await emailController.sendAfterRegisterMail({
    to: userCreated.email,
    info: {
      email: userCreated.email,
    },
  });

  return null;
};

exports.signup = async function signup(data) {
  const jwtSignAsync = Promise.promisify(jwt.sign);

  const uuidPromise = generateUuid(User, 'uuid');
  const passwordHashPromise = bcrypt.hash(data.password, saltRound);

  const [uuid, passwordHash] = await Promise.all([
    uuidPromise,
    passwordHashPromise,
  ]);

  delete data.confirm_password;
  data.password = passwordHash;
  data.uuid = uuid;
  data.role = 'user';

  const userCreated = await new User(data).save();

  const token = await jwtSignAsync(
    {
      id: userCreated._id,
    },
    privateKey,
    {
      expiresIn: tokenExpiry1h,
    }
  );

  const emailInfo = await emailController.sendConfirmationMail({
    to: data.email,
    info: {
      link: `${config.get('hostname.FRONTEND')}${config.get(
        'link.confirmationFrontend'
      )}/${token}`,
    },
  });

  if (emailInfo) {
    return null;
  } else {
    throw new customSimpleError();
  }
};

exports.signupPartTwo = async function signupPartTwo({ id }) {
  await User.findOneAndUpdate(
    {
      _id: id,
    },
    {
      status: true,
    }
  ).exec();

  return null;
};

exports.checkToken = async function checkToken({ token }) {
  const jwtVerifyAsync = Promise.promisify(jwt.verify);

  try {
    const decoded = await jwtVerifyAsync(token, privateKey);

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new customError(
        'Token expired, please contact support !',
        TOKEN_EXPIRED
      );
    } else if (error.name === 'JsonWebTokenError') {
      throw new customError('Invalid Token, please retry !', TOKEN_INVALID);
    } else {
      throw error;
    }
  }
};

exports.resetPasswordPartOne = async function resetPasswordPartOne({ email }) {
  const jwtSignAsync = Promise.promisify(jwt.sign);

  let userGet = await User.findOne({
    email,
  }).exec();

  const token = await jwtSignAsync(
    {
      id: userGet._id,
    },
    privateKey,
    {
      expiresIn: tokenExpiry1h,
    }
  );

  let emailInfo = await emailController.sendResetPasswordMail({
    to: userGet.email,
    info: {
      link: `${config.get('hostname.FRONTEND')}${config.get(
        'link.resetPasswordFrontend'
      )}/${token}`,
    },
  });

  if (emailInfo) {
    return null;
  } else {
    throw new customSimpleError();
  }
};

exports.resetPasswordPartTwo = async function resetPasswordPartTwo({
  id,
  password,
}) {
  const hash = await bcrypt.hash(password, saltRound);

  await User.findOneAndUpdate(
    {
      _id: id,
    },
    {
      password: hash,
    }
  ).exec();

  return null;
};
