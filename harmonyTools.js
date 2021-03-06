const HarmonyConst = require('./harmonyConst');

module.exports = {
  checkParameter: function(parameter, def) {
    if (parameter == undefined) return def;
    else return parameter;
  },

  serviceIsNotTv(service) {
    return (
      service.type === HarmonyConst.DEVICE_TYPE ||
      service.type === HarmonyConst.DEVICEMACRO_TYPE ||
      service.type === HarmonyConst.SEQUENCE_TYPE ||
      service.type === HarmonyConst.HOME_TYPE
    );
  },

  isActivtyToBeSkipped: function(platform, activity) {
    return (
      platform.addAllActivitiesToSkipedIfSameStateActivitiesList ||
      (platform.skipedIfSameStateActivities &&
        platform.skipedIfSameStateActivities.includes(activity))
    );
  },

  processCommands: async function(hb, platform, commands) {
    for (const command of commands) {
      let commandTosend = command.split('|');
      let timeToWait = HarmonyConst.DELAY_FOR_MACRO;
      if (commandTosend.length === 2) timeToWait = commandTosend[1];
      else timeToWait = HarmonyConst.DELAY_FOR_MACRO;
      await processCommand(hb, platform, commandTosend[0], timeToWait);
    }
  },

  HarmonyAccessory: function(services) {
    this.services = services;
  },

  disablePreviousActivity: function(
    platform,
    characteristic,
    service,
    commandToSend,
    on
  ) {
    //we disable previous activities that were on
    if (service.id != -1 && service.id != commandToSend && on) {
      platform.log.debug('Switching off ' + service.displayName);
      characteristic.updateValue(false);
    }
  },

  handleOffActivity: function(
    platform,
    characteristic,
    service,
    commandToSend
  ) {
    //we turn off Off Activity if another activity was launched
    if (service.id == -1 && commandToSend != -1) {
      platform.log.debug(
        'New activity on , turning off off Activity ' + service.displayName
      );
      characteristic.updateValue(
        platform.showTurnOffActivity == 'inverted' ? true : false
      );
    }

    //we turn on Off Activity if we turned off an activity (or turn on the general switch)
    if (service.id == -1 && commandToSend == -1) {
      platform.log.debug('Turning on off Activity ' + service.displayName);
      characteristic.updateValue(
        platform.showTurnOffActivity != 'inverted' &&
          platform.showTurnOffActivity != 'stateless'
          ? true
          : false
      );
    }
  },

  isCommandOk: function(data) {
    return (
      data && data.code && data.code == 200 && data.msg && data.msg == 'OK'
    );
  },

  isCommandInProgress: function(data) {
    return data && (data.code == 202 || data.code == 100);
  },
};

async function processCommand(hb, platform, command, timeToWait) {
  // notice that we can await a function
  // that returns a promise
  await hb.sendCommand(platform, command);
  await delay(timeToWait);
}

function delay(timeToWait) {
  return new Promise(resolve => setTimeout(resolve, timeToWait));
}
