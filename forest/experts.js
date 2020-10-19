const { collection } = require('forest-express-sequelize');

collection('experts', {
  actions: [{
  }],
  fields: [{
    field: 'otherSkills',
    type: ['String'],
    reference: 'otherSkills.id',
  }],
  segments: [],
});
