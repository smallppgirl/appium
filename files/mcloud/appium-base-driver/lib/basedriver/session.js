/* eslint-disable require-await */
import _ from 'lodash';
import log from '../logger';
import { errors } from '../../protocol';
import { util } from 'appium-support';
import { processCapabilities } from '../capabilities';
import { executeShell } from '../mcloud-utils';

let commands = {};

commands.createSession = async function createSession (jsonwpDesiredCapabilities, jsonwpRequiredCaps, w3cCapabilities) {
  if (this.sessionId !== null) {
    throw new errors.SessionNotCreatedError('Cannot create a new session ' +
                                            'while one is in progress');
  }

  log.debug();

  // Determine weather we should use jsonwpDesiredCapabilities or w3cCapabilities to get caps from
  let caps;
  if (w3cCapabilities) {
    this.setProtocolW3C();
    if (jsonwpDesiredCapabilities) {
      log.debug(`W3C capabilities and MJSONWP desired capabilities were provided`);
    }

    if (jsonwpDesiredCapabilities && !_.isPlainObject(w3cCapabilities)) {
      // If W3C Capabilities and MJSONWP Capabilities were provided and W3C caps aren't a plain object,
      // log a warning and fall back to MJSONWP
      if (!_.isEmpty(w3cCapabilities)) {
        log.warn(`Expected W3C "capabilities" to be a JSON Object but was provided with: ${JSON.stringify(w3cCapabilities)}`);
      }
      log.warn(`Falling back to MJSONWP desired capabilities`);
      this.setProtocolMJSONWP();
      caps = jsonwpDesiredCapabilities;
    } else {
      log.debug(`Creating session with W3C capabilities: ${JSON.stringify(w3cCapabilities, null, 2)}`);
      caps = processCapabilities(w3cCapabilities, this.desiredCapConstraints, this.shouldValidateCaps);
    }
  } else {
    this.setProtocolMJSONWP();
    log.debug(`Creating session with MJSONWP desired capabilities: ${JSON.stringify(jsonwpDesiredCapabilities, null, 2)}`);
    caps = jsonwpDesiredCapabilities || {};
  }

  caps = fixCaps(caps, this.desiredCapConstraints);
  this.validateDesiredCaps(caps);

  this.sessionId = util.uuidV4();
  this.caps = caps;
  this.opts = _.cloneDeep(this.initialOpts);

  // merge caps onto opts so we don't need to worry about what's where
  Object.assign(this.opts, this.caps);

  // deal with resets
  // some people like to do weird things by setting noReset and fullReset
  // both to true, but this is misguided and strange, so error here instead
  if (this.opts.noReset && this.opts.fullReset) {
    throw new Error("The 'noReset' and 'fullReset' capabilities are mutually " +
                    'exclusive and should not both be set to true. You ' +
                    "probably meant to just use 'fullReset' on its own");
  }
  if (this.opts.noReset === true) {
    this.opts.fullReset = false;
  }
  if (this.opts.fullReset === true) {
    this.opts.noReset = false;
  }
  this.opts.fastReset = !this.opts.fullReset && !this.opts.noReset;
  this.opts.skipUninstall = this.opts.fastReset || this.opts.noReset;

  // Prevents empty string caps so we don't need to test it everywhere
  if (typeof this.opts.app === 'string' && this.opts.app.trim() === '') {
    this.opts.app = null;
  }

  if (!_.isUndefined(this.caps.newCommandTimeout)) {
    this.newCommandTimeoutMs = (this.caps.newCommandTimeout * 1000);
  }

  log.info(`Session created with session id: ${this.sessionId}`);

  const part=0;
  const screenrecord_opts = process.env.SCREENRECORD_OPTS != undefined ? process.env.SCREENRECORD_OPTS : '';
  const start_rec_command = `adb shell "screenrecord --verbose ${screenrecord_opts} /sdcard/${this.sessionId}_${part}.mp4"`;

  executeShell(start_rec_command, 'start video recording');
  return [this.sessionId, caps];
};

commands.getSessions = async function getSessions () {
  let ret = [];

  if (this.sessionId) {
    ret.push({
      id: this.sessionId,
      capabilities: this.caps
    });
  }

  return ret;
};

commands.getSession = async function getSession () {
  if (this.caps.eventTimings) {
    return Object.assign({}, this.caps, {events: this.eventHistory});
  }
  return this.caps;
};

commands.deleteSession = async function deleteSession (/* sessionId */) {
  this.clearNewCommandTimeout();
  if (this.isCommandsQueueEnabled && this.commandsQueueGuard.isBusy()) {
    // simple hack to release pending commands if they exist
    for (const key of _.keys(this.commandsQueueGuard.queues)) {
      this.commandsQueueGuard.queues[key] = [];
    }
  }

  // stop recording
  const part=0;
  const stop_rec_command = 'pkill -f screenrecord';
  executeShell(stop_rec_command, 'stop video recording');
  await new Promise(resolve => setTimeout(resolve, 300));
  // pull video from device
  const pull_video_command =`adb pull "/sdcard/${this.sessionId}_${part}.mp4" "${this.sessionId}.mp4" > /dev/null 2>&1`;
  executeShell(pull_video_command, 'pull video recording from device');
  // remove video from device
  const remove_video_command =`adb shell "rm -f /sdcard/${this.sessionId}.mp4" &`;
  executeShell(remove_video_command, 'remove video recording from device');
  // upload video to s3
  const s3_path=`s3://${process.env.BUCKET}/${process.env.TENANT}/artifacts/test-sessions/${this.sessionId}`;
  const upload_to_s3_command = `aws s3 cp "${this.sessionId}.mp4" "${s3_path}/video.mp4"`;
  executeShell(upload_to_s3_command, 'upload video to s3');

  this.sessionId = null;
};

function fixCaps (originalCaps, desiredCapConstraints = {}) {
  let caps = _.clone(originalCaps);

  // boolean capabilities can be passed in as strings 'false' and 'true'
  // which we want to translate into boolean values
  let booleanCaps = _.keys(_.pickBy(desiredCapConstraints, (k) => k.isBoolean === true));
  for (let cap of booleanCaps) {
    let value = originalCaps[cap];
    if (_.isString(value)) {
      value = value.toLowerCase();
      if (value === 'true' || value === 'false') {
        log.warn(`Capability '${cap}' changed from string to boolean. This may cause unexpected behavior`);
        caps[cap] = (value === 'true');
      }
    }
  }

  // int capabilities are often sent in as strings by frameworks
  let intCaps = _.keys(_.pickBy(desiredCapConstraints, (k) => k.isNumber === true));
  for (let cap of intCaps) {
    let value = originalCaps[cap];
    if (_.isString(value) && !isNaN(value)) {
      value = value.trim();
      let newValue = parseInt(value, 10);
      if (value !== `${newValue}`) {
        newValue = parseFloat(value);
      }
      log.warn(`Capability '${cap}' changed from string ('${value}') to integer (${newValue}). This may cause unexpected behavior`);
      caps[cap] = newValue;
    }
  }

  return caps;
}

export default commands;
