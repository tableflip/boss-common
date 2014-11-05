var Autowire = require('wantsit').Autowire,
  fs = require('fs'),
  mkdirp = require('mkdirp'),
  userid = require('userid')

var FileSystem = function() {
  this._config = Autowire
  this._logger = Autowire
}

FileSystem.prototype.findProcessDirectory = function() {
  return this._config.boss.rundir + '/processes'
}

FileSystem.prototype.findOrCreateProcessDirectory = function(callback) {
  this._findOrCreateDirectory(this.findProcessDirectory(), callback, 0770)
}

FileSystem.prototype.findOrCreateLogFileDirectory = function(callback) {
  this._findOrCreateDirectory(this._config.boss.logdir, callback, 0770)
}

FileSystem.prototype.findOrCreateRunDirectory = function(callback) {
  this._findOrCreateDirectory(this._config.boss.rundir, callback, 0770)
}

FileSystem.prototype.findOrCreateConfigDirectory = function(callback) {
  this._findOrCreateDirectory(this._config.boss.confdir, callback, 0700)
}

FileSystem.prototype._findOrCreateDirectory = function(directory, callback, mode) {
  if(!callback) {
    callback = function() {}
  }

  var gid = userid.gid(this._config.boss.group)

  fs.exists(directory, function(exists) {
    if(exists) {
      return callback(undefined, directory)
    }

    this._logger.debug('Creating', directory, 'with mode', mode.toString(8))

    var oldmask = process.umask(0)
    mkdirp(directory, {
      mode: mode
    }, function (error) {
      process.umask(oldmask)

      if(error) {
        // we've been run as a non-root user
        if (error.code == 'EACCES') {
          this._logger.error('I do not have permission to create', directory, '- please run me as a privileged user.')
          process.exit(-1)
        }

        return callback(error)
      }

      fs.chown(directory, process.getuid(), gid, function(error) {
        callback(error, directory)
      }.bind(this))
    }.bind(this))
  }.bind(this))
}

module.exports = FileSystem
