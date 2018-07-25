import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../../../components/ha-attributes.js';


import attributeClassNames from '../../../common/entity/attribute_class_names';
import EventsMixin from '../../../mixins/events-mixin.js';
import LocalizeMixin from '../../../mixins/localize-mixin.js';

/*
 * @appliesMixin EventsMixin
 */
class MoreInfoFan extends LocalizeMixin(EventsMixin(PolymerElement)) {
  static get template() {
    return html`
    <style include="iron-flex"></style>
    <style>
      .container-speed_list,
      .container-direction,
      .container-oscillating,
      .container-night_mode,
      .container-angle {
        display: none;
      }

      .has-speed_list .container-speed_list,
      .has-direction .container-direction,
      .has-oscillating .container-oscillating,
      .has-night_mode .container-night_mode,
      .has-angle_low .container-angle {
        display: block;
      }

      paper-dropdown-menu {
        width: 100%;
      }

      paper-item {
        cursor: pointer;
      }
    </style>

    <div class$="[[computeClassNames(stateObj)]]">

      <div class="container-speed_list">
        <paper-dropdown-menu label-float="" dynamic-align="" label="[[localize('ui.card.fan.speed')]]">
          <paper-listbox slot="dropdown-content" selected="{{speedIndex}}">
            <template is="dom-repeat" items="[[stateObj.attributes.speed_list]]">
              <paper-item>[[item]]</paper-item>
            </template>
          </paper-listbox>
        </paper-dropdown-menu>
      </div>

      <div class="container-oscillating">
        <div class="center horizontal layout single-row">
          <div class="flex">[[localize('ui.card.fan.oscillate')]]</div>
          <paper-toggle-button checked="[[oscillationToggleChecked]]" on-change="oscillationToggleChanged">
          </paper-toggle-button>
        </div>
      </div>
      
      <div class="container-angle">
        <template is="dom-if" if="[[oscillationToggleChecked]]">
            <div class="center horizontal layout single-row">
              <paper-input value="{{angleLow}}" label="[[localize('ui.card.fan.angle_low')]]" on-change="angleLowChanged">
              </paper-input>
            </div>
            <div class="center horizontal layout single-row" hidden$=oscillationToggleChecked>
              <paper-input value="{{angleHigh}}" label="[[localize('ui .card.fan.angle_high')]]" on-change="angleHighChanged">
              </paper-input>
            </div>
        </template>
        <div class="center horizontal layout single-row">
            <paper-input value="{{angleLow}}" label="[[localize('ui.card.fan.angle')]]" on-change="angleChanged">
            </paper-input>
        </div>
      </div>

      <div class="container-direction">
        <div class="direction">
          <div>[[localize('ui.card.fan.direction')]]</div>
          <paper-icon-button icon="hass:rotate-left" on-click="onDirectionLeft" title="Left" disabled="[[computeIsRotatingLeft(stateObj)]]"></paper-icon-button>
          <paper-icon-button icon="hass:rotate-right" on-click="onDirectionRight" title="Right" disabled="[[computeIsRotatingRight(stateObj)]]"></paper-icon-button>
        </div>
      </div>
       
      <div class="container-night_mode">
        <div class="center horizontal layout single-row">
          <div class="flex">[[localize('ui.card.fan.night_mode')]]</div>
          <paper-toggle-button checked="[[nightModeToggleChecked]]" on-change="nightModeToggleChanged">
          </paper-toggle-button>
        </div>
      </div>
    </div>

    <ha-attributes state-obj="[[stateObj]]" extra-filters="speed,speed_list,oscillating,direction,night_mode,angle_low,angle_high"></ha-attributes>
`;
  }

  static get properties() {
    return {
      hass: {
        type: Object,
      },

      stateObj: {
        type: Object,
        observer: 'stateObjChanged',
      },

      speedIndex: {
        type: Number,
        value: -1,
        observer: 'speedChanged',
      },

      oscillationToggleChecked: {
        type: Boolean,
      },

      angleLowChanged: {
        type: Number,
      },

      angleHighChanged: {
        type: Number,
      },
    };
  }

  stateObjChanged(newVal, oldVal) {
    if (newVal) {
      this.setProperties({
        oscillationToggleChecked: newVal.attributes.oscillating,
        nightModeToggleChecked: newVal.attributes.night_mode,
        angleLow: newVal.attributes.angle_low,
        angleHigh: newVal.attributes.angle_high,
        speedIndex: newVal.attributes.speed_list ?
          newVal.attributes.speed_list.indexOf(newVal.attributes.speed) : -1,
      });
    }

    if (oldVal) {
      setTimeout(() => {
        this.fire('iron-resize');
      }, 500);
    }
  }

  computeClassNames(stateObj) {
    return 'more-info-fan ' + attributeClassNames(stateObj, ['oscillating', 'speed_list', 'direction',
      'night_mode', 'angle_low', 'angle_high']);
  }

  speedChanged(speedIndex) {
    var speedInput;
    // Selected Option will transition to '' before transitioning to new value
    if (speedIndex === '' || speedIndex === -1) return;

    speedInput = this.stateObj.attributes.speed_list[speedIndex];
    if (speedInput === this.stateObj.attributes.speed) return;

    this.hass.callService('fan', 'turn_on', {
      entity_id: this.stateObj.entity_id,
      speed: speedInput,
    });
  }

  oscillationToggleChanged(ev) {
    var oldVal = this.stateObj.attributes.oscillating;
    var newVal = ev.target.checked;

    if (oldVal === newVal) return;

    this.hass.callService('fan', 'oscillate', {
      entity_id: this.stateObj.entity_id,
      oscillating: newVal,
    });
  }

  angleLowChanged(ev) {
    const newVal = ev.target.value;
    const oldVal = this.stateObj.attributes.angle_low;

    if (oldVal === newVal) return;

    this.hass.callService('fan', 'set_angle', {
      entity_id: this.stateObj.entity_id,
      angle_low: newVal
    });
  }

  angleHighChanged(ev) {
    const newVal = ev.target.value;
    const oldVal = this.stateObj.attributes.angle_high;

    if (oldVal === newVal) return;

    this.hass.callService('fan', 'set_angle', {
      entity_id: this.stateObj.entity_id,
      angle_high: newVal
    });
  }

  angleChanged(ev) {
    const newVal = ev.target.value;

    this.hass.callService('fan', 'set_angle', {
      entity_id: this.stateObj.entity_id,
      angle_low: newVal,
      angle_high: newVal
    });
  }

  onDirectionLeft() {
    this.hass.callService('fan', 'set_direction', {
      entity_id: this.stateObj.entity_id,
      direction: 'reverse'
    });
  }

  onDirectionRight() {
    this.hass.callService('fan', 'set_direction', {
      entity_id: this.stateObj.entity_id,
      direction: 'forward'
    });
  }

  computeIsRotatingLeft(stateObj) {
    return stateObj.attributes.direction === 'reverse';
  }

  computeIsRotatingRight(stateObj) {
    return stateObj.attributes.direction === 'forward';
  }
}

customElements.define('more-info-fan', MoreInfoFan);
