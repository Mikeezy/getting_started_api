const bcrypt = require('bcryptjs');

const saltRound = 10;

describe.skip('User password hash', function () {
  it('should print a hashed password of a certain password', async (done) => {
    try {
      const passwordHashed = await bcrypt.hash(
        'admin_opartners@2020',
        saltRound
      );

      console.log(`Passsword hashed: ${passwordHashed}`);

      expect(passwordHashed).toBeTruthy();
      done();
    } catch (error) {
      done(error);
    }
  });
});
