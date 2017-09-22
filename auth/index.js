const {router} = require('./router');
const {localStrategy, basicStrategy, jwtStrategy} = require('./strategies');

module.exports = {router, localStrategy, basicStrategy, jwtStrategy};
