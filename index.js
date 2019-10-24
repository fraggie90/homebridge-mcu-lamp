'use strict';

var request = require("request");
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-mcu-switch", "McuSwitch", McuSwitchAccessory);
}

function McuSwitchAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.accessorytype = confi["accessorytype"] || "lamp";
  this.mcuIP = config["ip"];
  this.manufacturer = config["manufacturer"] || "ESP8266 Relay Lamp Switch";
  this.model = config["model"] || "Lamp Relay Switch";
  this.serialnumber = config["serialnumber"] || "1234567890";
  this.firmwarerevision = config["firmwarerevision"] || "1.0.1";
}

McuSwitchAccessory.prototype.identify = function(callback) {
  this.log('Identify requested!');
  callback();
};

McuSwitchAccessory.prototype.getPowerState = function(callback) {
  this.log("Getting State");
  request.get({
    url: 'http://' + this.mcuIP + '/status'
  }, function(err, response, body) {
    var status = body == '1' ? 1 : 0;
    callback(null, status);
  }.bind(this));
}

McuSwitchAccessory.prototype.setPowerState = function(state, callback) {
  var url = state ? "1": "0";
  request.get({
    url: 'http://' + this.mcuIP + '/relay?state=' + url
  }, function(err, response, body) {
  callback(null, state);
  }.bind(this));
},

McuSwitchAccessory.prototype.getServices = function() {

  var informationService = new Service.AccessoryInformation();

  informationService
    .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
    .setCharacteristic(Characteristic.Model, this.model)
    .setCharacteristic(Characteristic.SerialNumber, this.serialnumber)
    .setCharacteristic(Characteristic.FirmwareRevision, this.firmwarerevision);

  var accessoryService;
  switch (this.accessorytype) {
    case "lightbulb":
        accessoryService = new Service.Lightbulb(this.name);
        break;
    case "fan":
        accessoryService = new Service.Fan(this.name);
        break;
    case "outlet":
        accessoryService = new Service.Outlet(this.name);
        break;
    default:
        accessoryService = new Service.Switch(this.name);
  }

  accessoryService
    .getCharacteristic(Characteristic.On)
    .on('get', this.getPowerState.bind(this))
    .on('set', this.setPowerState.bind(this));

  return [informationService, accessoryService];
}
