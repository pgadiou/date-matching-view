const { collection } = require('forest-express-sequelize');

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments
collection('availableSlots', {
  actions: [
    {
      name: 'book',
      type: 'single',
      fields: [{
        field: 'start date',
        type: 'Date',
      }, {
        field: 'end date',
        type: 'Date',
      }, {
        field: 'user',
        reference: 'users.id',
      }],
      values: (context) => {
        return {
          time: context.time,
          'start date': context.startDate,
          'end date': context.endDate,
        };
      },
    },
  ],
  fields: [{
    field: 'arenaId',
    type: 'Number',
  }, {
    field: 'startDate',
    type: 'Date',
  }, {
    field: 'endDate',
    type: 'Date',
  }, {
    field: 'time',
    type: 'String',
  }, {
    field: 'maxTimeSlot',
    type: 'Number',
  }],
  segments: [],
});
