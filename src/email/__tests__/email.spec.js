require('dotenv').config();
const emailController = require('../controller.js');

describe.skip('Email controller', function () {
  it('should send an email test to: nabe.minkitam@gmail.com', async (done) => {
    jest.setTimeout(30000);
    try {
      const emailReturn = await emailController.sendMail({
        to: 'nabe.minkitam@gmail.com',
        subject: 'Hello from unit test',
        content: `Hello from unit test, unit test performed successfully !`,
      });

      expect(emailReturn).toBeTruthy();
      done();
    } catch (error) {
      done(error);
    }
  });
});
