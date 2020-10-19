const express = require('express');
const { PermissionMiddlewareCreator, RecordSerializer } = require('forest-express-sequelize');
const { Op } = require('sequelize');
const { otherSkills, experts, skills } = require('../models');

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator('experts');
const recordSerializer = new RecordSerializer({ name: 'otherSkills' });

router.get('/experts/:id/relationships/otherSkills', permissionMiddlewareCreator.list(), (request, response, next) => {
  const expert = experts.findByPk(request.params.id, {
    include: [
      {
        model: skills,
        as: 'expertSkills',
      },
    ],
  });
  let queryParams = {};
  if (request.query.search) {
    queryParams = {
      where: {
        description: {
          [Op.iLike]: `%${request.query.search}%`,
        },
      },
    };
  }
  const skillsList = skills.findAll(queryParams);
  Promise.all([expert, skillsList])
    .then((results) => {
      const { expertSkills } = results[0];
      const allSkills = results[1];
      const expertSkillsIds = expertSkills.map((record) => record.id);
      const records = [];
      allSkills.forEach((skillListed) => {
        if (!expertSkillsIds.includes(skillListed.id) && skillListed.description) {
          const skill = {
            id: skillListed.id,
            description: skillListed.description,
          };
          records.push(skill);
        }
      });
      return records;
    })
    .then((records) => recordSerializer.serialize(records))
    .then((recordsSerialized) => response.send({
      ...recordsSerialized,
      meta: { count: recordsSerialized.data.length },
    }));
});


module.exports = router;
