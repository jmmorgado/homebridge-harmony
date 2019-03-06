module.exports = {
  checkParemeter: function(parameter, def) {
    if (parameter == undefined) return def;
    else return parameter;
  },

  processCommands: async function(hb, platform, commands) {
    for (const command of commands) {
      let commandTosend = command.split('|');
      let timeToWait = HarmonyConst.DELAY_FOR_MACRO;
      if (commandTosend.length === 2) timeToWait = commandTosend[1];
      else timeToWait = HarmonyConst.DELAY_FOR_MACRO;
      console.log(commandTosend[0]);
      console.log(timeToWait);
      await processCommand(hb, platform, commandTosend[0], timeToWait);
    }
  },

  processCommand: async function(hb, platform, command, timeToWait) {
    // notice that we can await a function
    // that returns a promise
    await hb.sendCommand(platform, command);
    await delay(timeToWait);
  },

  delay: function(timeToWait) {
    return new Promise(resolve => setTimeout(resolve, timeToWait));
  },

  HarmonyAccessory: function(services) {
    this.services = services;
  },

  disablePreviousActivity: function(
    characteristic,
    service,
    commandToSend,
    on
  ) {
    //we disable previous activities that were on
    if (service.id != -1 && service.id != commandToSend && on) {
      this.log.debug('Switching off ' + otherServiceControl.displayName);
      characteristic.updateValue(false);
    }
  },

  handleOffActivity: function(characteristic, service, commandToSend) {
    //we turn off Off Activity if another activity was launched
    if (service.id == -1 && commandToSend != -1) {
      this.log.debug(
        'New activity on , turning off off Activity ' + service.displayName
      );
      characteristic.updateValue(false);
    }

    //we turn on Off Activity if we turned off an activity (or turn on the general switch)
    if (service.id == -1 && commandToSend == -1) {
      this.log.debug('Turning on off Activity ' + service.displayName);
      characteristic.updateValue(true);
    }
  },
};