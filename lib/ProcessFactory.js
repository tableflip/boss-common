var Process = require('./Process')
  Autowire = require('wantsit').Autowire

var ProcessFactory = function() {
  this._logger = Autowire
}

ProcessFactory.prototype.containerAware = function(container) {
  this._container = container
}

ProcessFactory.prototype.create = function(socket) {
  this._logger.debug('Creating remote process to connect to', socket)

  var remoteProcess = new Process(socket)

  this._container.autowire(remoteProcess)

  return remoteProcess
}

ProcessFactory.prototype.connect = function(socket, callback) {
  this.create(socket).connect(callback)
}

module.exports = ProcessFactory
