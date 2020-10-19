const { collection } = require('forest-express-sequelize');

collection('otherSkills', {
  actions: [{
    name: 'add',
    type: 'bulk',
  }],
  fields: [{
    field: 'description',
    type: 'String',
  }],
  segments: [],
});
