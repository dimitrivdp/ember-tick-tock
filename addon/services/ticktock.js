import $ from 'jquery';
import { later } from '@ember/runloop';
import { set, get } from '@ember/object';
import Service from '@ember/service';
import { getOwner } from '@ember/application';
import moment from 'moment';

export default Service.extend({
  now: null,
  currentOffset: 0,
  useRemoteTimestamp: false,
  remoteSyncFrequency: 60,
  tickTockFrequency: 1,
  timestampEndpoint: null,
  timestampProperty: null,

  init() {
    this._super(...arguments);
    this._loadConfigAndStartTimers();
  },

  _loadConfigAndStartTimers() {
    let config = getOwner(this).resolveRegistration('config:environment')['ticktockOptions'];

    if (config && config.remoteSyncFrequency) {
      set(this, 'remoteSyncFrequency', config.remoteSyncFrequency);
    }

    if (config && config.tickTockFrequency) {
      set(this, 'tickTockFrequency', config.tickTockFrequency);
    }

    if (config && config.timestampEndpoint) {
      set(this, 'timestampEndpoint', config.timestampEndpoint);
    }

    if (config && config.timestampProperty) {
      set(this, 'timestampProperty', config.timestampProperty);
    }

    if (config && config.useRemoteTimestamp) {
      set(this, 'useRemoteTimestamp', config.useRemoteTimestamp);
      this._setServerTime();
    }

    this._setCurrentTime();
  },

  _syncServerLoop() {
    let frequency = get(this, 'remoteSyncFrequency');
    later(this, this._setServerTime, (frequency * 1000));
  },

  _syncLocalLoop() {
    let frequency = get(this, 'tickTockFrequency');
    later(this, this._setCurrentTime, (frequency * 1000));
  },

  _setServerTime() {
    let _this = this;

    $.ajax(_this.timestampEndpoint, {
      type: 'GET',
      success: (data) => {
        var currentServerTime = data[_this.timestampProperty];
        var currentLocalTime  = moment().unix();
        var serverTime        = parseInt(currentServerTime);
        var serverOffset      = serverTime - parseInt(currentLocalTime);

        set(_this, 'currentOffset', serverOffset);
      }
    });

    this._syncServerLoop();
  },

  _setCurrentTime: function() {
    let now = moment().unix();

    if (get(this, 'useRemoteTimestamp')) {
      now += get(this, 'currentOffset');
    }

    now = moment.unix(now);
    set(this, 'now', now);

    this._syncLocalLoop();
  }
});
