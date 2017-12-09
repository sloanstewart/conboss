exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      //  'mongodb://localhost/conboss-dev';
                      'mongodb://sloan:test123@ds017231.mlab.com:17231/conboss';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
                       global.TEST_DATABASE_URL ||
                      'mongodb://sloan:test123@ds111882.mlab.com:11882/conboss-test';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

