const express = require('express');
const { PermissionMiddlewareCreator, RecordSerializer } = require('forest-express-sequelize');
const { availableSlots, bookings } = require('../models');
const moment = require('moment');

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator('availableSlots');
const recordSerializer = new RecordSerializer({ name: 'availableSlots' });

// Get a list of Available slots
router.get('/availableSlots', permissionMiddlewareCreator.list(), (request, response, next) => {
  console.log(request.query);
  let date = request.query.date;
  function addHours(date, hours) {
    return moment(date).add(hours, 'h').toDate();
  }
  let duration = request.query.duration;
  let slotsInfo = [
    { maxTimeSlot: 3 },
    { maxTimeSlot: 2 },
    { maxTimeSlot: 1 },
    { maxTimeSlot: 0 },
    { maxTimeSlot: 4 },
    { maxTimeSlot: 3 },
    { maxTimeSlot: 2 },
    { maxTimeSlot: 2 },
    { maxTimeSlot: 1 },
  ];
  const matchingSlots = [];
  slotsInfo.forEach((slotInfo, index) => {
    if (slotInfo.maxTimeSlot >= duration) {
      let slot = {};
      const newDate = addHours(date, 11 + index);
      slot.id = index + 1;
      slot.type = availableSlots;
      slot.startDate = newDate;
      slot.endDate = addHours(newDate, duration);
      slot.time = moment(newDate).format('HH:mm');
      matchingSlots.push(slot);
    }
  });
  recordSerializer.serialize(matchingSlots) // .filter(item => item.maxTimeSlot > )
    .then(recordsSerialized => response.send(recordsSerialized));
});

// // Get a number of Available slots
// router.get('/availableSlots/count', permissionMiddlewareCreator.list(), (request, response, next) => {
//   // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
//   response.send({ count: 9 });
// });

router.post('/actions/book', permissionMiddlewareCreator.smartAction(), (request, response) => {
  const attr = request.body.data.attributes;
  bookings.create({
    startDate: attr.startDate,
    endDate: attr.startDate,
    user: attr.user,
  }).then(() => response.send({ success: 'successfully created booking' }));
});


module.exports = router;
