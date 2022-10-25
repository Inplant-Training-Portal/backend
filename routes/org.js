// admin router
const express = require('express');
const router = express.Router();

// import org controller
const orgController = require('../controllers/org.controller.js');

// test route
router.get('/test', orgController.test);

// register org
router.post('/register', orgController.registerOrg);

// login org
router.post('/login', orgController.loginOrg);

// get org by id
router.get('/info/:id', orgController.getOrgById);

// get all orgs
router.get('/list', orgController.getAllOrgs);

//view files
router.get('/file/view/:id', orgController.viewFile);

// export org router
module.exports = router;