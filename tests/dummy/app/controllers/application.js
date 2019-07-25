import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import moment from 'moment';

export default Controller.extend({
  ticktock: service(),

  timeFreeze: computed(function() {
    return moment();
  }),

  formattedTime: computed('ticktock.now', function() {
    return this.get('ticktock.now').format('MM/DD/YYYY [at] hh:mm:ss');
  }),

  formattedTimeFreeze: computed('timeFreeze', function() {
    return this.get('timeFreeze').format('MM/DD/YYYY [at] hh:mm:ss');
  })
});