const userRoutes = require('./users');
const eventRoutes = require('./events');

const router = require('express').Router();

 router.use(userRoutes);
 router.use(eventRoutes);

  router.get('/', (req, res) => {
    res.status(200).render('index');
  });
  
  router.get('*', (req, res) => {
    res.status(404).render('404');
  });


module.exports = router;
