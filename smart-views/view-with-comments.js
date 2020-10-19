import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { observer } from '@ember/object';
import $ from 'jquery';
import SmartViewMixin from 'client/mixins/smart-view-mixin';

export default Component.extend(SmartViewMixin, {
  store: service(),
  conditionAfter: null,
  conditionBefore: null,
  loaded: false,
  calendarId: null,
  selectedAvailability: null,
  selectedDate: null,
  selectedDuration: 1,
  availableSlots: null,
  availableSlotsCollection: null,
  _calendar: null,

  init(...args) {
    this._super(...args);
    this.loadPlugin();
    this.initConditions();
    this.set('durations', [{
      label: '1 hour',
      value: 1,
    }, {
      label: '2 hours',
      value: 2,
    }, {
      label: '3 hours',
      value: 3,
    }]);
  },

  didInsertElement() {
    this.set('availableSlotsCollection', this.store.peekAll('collection').findBy('name', 'availableSlots'));
  },

  // update displayed events when new records are retrieved
  onRecordsChange: observer('records.[]', function () {
    this.setEvent();
  }),

  onConfigurationChange: observer('selectedDate', 'selectedDuration', function () {
    this.searchAvailabilities();
  }),

  initConditions() {
    if (this.filters) {
      this.filters.forEach(condition => {
        if (condition.operator === 'is after') {
          this.set('conditionAfter', condition);
        } else if (condition.operator === 'is before') {
          this.set('conditionBefore', condition);
        }
      });
    }
  },

  loadPlugin() {
    scheduleOnce('afterRender', this, function () {
      this.set('calendarId', `${this.elementId}-calendar`);

      // retrieve fullCalendar script to build the calendar view
      $.getScript('https://cdn.jsdelivr.net/npm/fullcalendar@5.3.0/main.min.js', () => {
        this.setEvent();
        const calendarEl = document.getElementById(this.calendarId);
        const calendar = new FullCalendar.Calendar(calendarEl, {
          height: 600,
          allDaySlot: true,
          eventClick: (event, jsEvent, view) => {
            // persist the selected event information
            this.set('selectedAvailability', event.event);
            const eventStart = event.event.start;
            const selectedDate = `${eventStart.getDate().toString()}/${(eventStart.getMonth() + 1).toString()}/${eventStart.getFullYear().toString()}`;
            // persist the selected event's date to be displayed in the view
            this.set('selectedDate', selectedDate);
          },
          // define logic to be triggered when the user navigates between date ranges
          datesSet: (view) => {
            // define params to query the relevant records from the database based on the date range
            const params = {
              filters: JSON.stringify({
                aggregator: 'and',
                conditions: [{
                  field: 'date',
                  operator: 'before',
                  value: view.end,
                }, {
                  field: 'date',
                  operator: 'after',
                  value: view.start,
                }],
              }),
              'page[number]': 1,
              'page[size]': 31,
              timezone: 'Europe/Paris',
            };

            return this.store.query('forest-available-date', params)
              .then((records) => {
                this.set('records', records);
              })
              .catch((error) => {
                this.set('records', null);
                alert('We could not retrieve the available dates');
                console.error(error);
              });
          },
        });

        this.set('_calendar', calendar);
        calendar.render();
        this.set('loaded', true);
      });

      const headElement = document.getElementsByTagName('head')[0];
      const cssLink = document.createElement('link');

      cssLink.type = 'text/css';
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@5.3.0/main.min.css';
      headElement.appendChild(cssLink);
    });
  },

  setEvent() {
    if (!this.records || !this.loaded) { return; }

    this._calendar.getEvents().forEach((event) => event.remove());

    this.records.forEach((availability) => {
      if (availability.get('forest-opened') === true) {
        const event = {
          id: availability.get('id'),
          title: 'Available',
          start: availability.get('forest-date'),
          allDay: true,
        };

        if (availability.get('forest-pricingPremium') === 'high') {
          event.textColor = 'white';
          event.backgroundColor = '#FB6669';
          event.title = 'Available';
        }
        this._calendar.addEvent(event);
      }
    });
  },

  searchAvailabilities() {
    if (this.selectedAvailability) {
      return this.store.query('forest-available-slot', {
        date: this.selectedAvailability.start,
        duration: this.selectedDuration,
      }).then((slots) => {
        this.set('availableSlots', slots);
      }).catch((error) => {
        this.set('availableSlots', null);
        alert('We could not retrieve the available slots');
        console.error(error);
      });
    }
  },
});
