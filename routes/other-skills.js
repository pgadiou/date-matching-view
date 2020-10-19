const express = require('express');
const { PermissionMiddlewareCreator } = require('forest-express-sequelize');
const { experts } = require('../models');

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator('otherSkills');


router.post('/actions/add', permissionMiddlewareCreator.smartAction(), (request, response) => {
  const expertId = request.body.data.attributes.parent_collection_id;
  const selectedIds = request.body.data.attributes.ids;
  experts.findByPk(expertId)
    .then((user) => {
      selectedIds.forEach((skillId) => {
        user.addExpertSkills(skillId);
      });
    })
    .then(() => response.send({ success: `${selectedIds.length} new skills have been added` }));
});


module.exports = router;
