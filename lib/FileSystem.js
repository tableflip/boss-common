var Autowire = require('wantsit').Autowire

var FileSystem = function() {
  this._config = Autowire
  this._logger = Autowire
  this._userid = Autowire
  this._fs = Autowire
  this._mkdirp = Autowire
}

FileSystem.prototype.findProcessDirectory = function() {
  return this._config.boss.rundir + '/processes'
}

FileSystem.prototype.findOrCreateProcessDirectory = function(callback) {
  this._findOrCreateDirectory(this.findProcessDirectory(), 0770, callback)
}

FileSystem.prototype.findOrCreateLogFileDirectory = function(callback) {
  this._findOrCreateDirectory(this._config.boss.logdir, 0770, callback)
}

FileSystem.prototype.findOrCreateRunDirectory = function(callback) {
  this._findOrCreateDirectory(this._config.boss.rundir, 0770, callback)
}

FileSystem.prototype.findOrCreateConfigDirectory = function(callback) {
  this._findOrCreateDirectory(this._config.boss.confdir, 0700, callback)
}

FileSystem.prototype.findOrCreateAppDirectory = function(callback) {
  this._findOrCreateDirectory(this._config.boss.appdir, 0770, callback)
}

FileSystem.prototype._findOrCreateDirectory = function(directory, mode, callback) {
  var gid = this._userid.gid(this._config.boss.group)

  this._fs.exists(directory, function(exists) {
    if(exists) {
      return process.nextTick(callback.bind(callback, undefined, directory))
    }

    this._logger.debug('Creating', directory, 'with mode', mode.toString(8))

    var oldmask = process.umask(0)
    this._mkdirp(directory, {
      mode: mode
    }, function (error) {
      process.umask(oldmask)

      if(error) {
        // we've been run as a non-root user
        if (error.code == 'EACCES') {
          this._logger.error('I do not have permission to create', directory, '- please run me as a privileged user.')
          process.exit(-1)
        }

        return process.nextTick(callback.bind(callback, error))
      }

      this._fs.chown(directory, process.getuid(), gid, function(error) {
        process.nextTick(callback.bind(callback, error, directory))
      }.bind(this))
    }.bind(this))
  }.bind(this))
}

module.exports = FileSystem
