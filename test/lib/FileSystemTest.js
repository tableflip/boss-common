var expect = require('chai').expect,
  sinon = require('sinon'),
  FileSystem = require('../../lib/FileSystem'),
  os = require('os'),
  uuid = require('uuid'),
  fs = require('fs'),
  posix = require('posix'),
  mkdirp = require('mkdirp')

describe('FileSystem', function() {
  var temp, fileSystem

  beforeEach(function() {
    temp = os.tmpdir() + '/' + uuid.v4()
    fileSystem = new FileSystem()
    fileSystem._config = {
      boss: {
        logdir: temp + '/log',
        confdir: temp + '/conf',
        rundir: temp + '/run',
        appdir: temp + '/apps',
        user: posix.getpwnam(process.getuid()).name,
        group: posix.getgrnam(process.getgid()).name
      }
    }
    fileSystem._logger = {
      info: function() {},
      warn: function() {},
      error: function() {},
      debug: function() {}
    }
    fileSystem._posix = posix
    fileSystem._fs = fs
    fileSystem._mkdirp = mkdirp
  })

  it('should create process directory', function(done) {
    expect(fs.existsSync(fileSystem._config.boss.rundir)).to.be.false

    fileSystem.findOrCreateProcessDirectory(function(error, processDir) {
      expect(error).to.not.exist
      expect(processDir).to.contain(fileSystem._config.boss.rundir)
      expect(fs.existsSync(processDir)).to.be.true

      done()
    })
  })

  it('should create log file directory', function(done) {
    expect(fs.existsSync(fileSystem._config.boss.logdir)).to.be.false

    fileSystem.findOrCreateLogFileDirectory(function(error, processDir) {
      expect(error).to.not.exist
      expect(processDir).to.contain(fileSystem._config.boss.logdir)
      expect(fs.existsSync(processDir)).to.be.true

      done()
    })
  })

  it('should create run directory', function(done) {
    expect(fs.existsSync(fileSystem._config.boss.rundir)).to.be.false

    fileSystem.findOrCreateRunDirectory(function(error, processDir) {
      expect(error).to.not.exist
      expect(processDir).to.contain(fileSystem._config.boss.rundir)
      expect(fs.existsSync(processDir)).to.be.true

      done()
    })
  })

  it('should create config directory', function(done) {
    expect(fs.existsSync(fileSystem._config.boss.confdir)).to.be.false

    fileSystem.findOrCreateConfigDirectory(function(error, processDir) {
      expect(error).to.not.exist
      expect(processDir).to.contain(fileSystem._config.boss.confdir)
      expect(fs.existsSync(processDir)).to.be.true

      done()
    })
  })

  it('should create app directory', function(done) {
    expect(fs.existsSync(fileSystem._config.boss.appdir)).to.be.false

    fileSystem.findOrCreateAppDirectory(function(error, processDir) {
      expect(error).to.not.exist
      expect(processDir).to.contain(fileSystem._config.boss.appdir)
      expect(fs.existsSync(processDir)).to.be.true

      done()
    })
  })

  it('should not create a directory when one exists', function(done) {
    fileSystem._fs = {
      exists: sinon.stub()
    }
    fileSystem._mkdirp = sinon.stub()

    fileSystem._fs.exists.callsArgWith(1, true)

    fileSystem.findOrCreateConfigDirectory(function(error, processDir) {
      expect(error).to.not.exist
      expect(fileSystem._mkdirp.callCount).to.equal(0)

      done()
    })
  })

  it('should inform the callback when directory creation fails', function(done) {
    fileSystem._fs = {
      exists: sinon.stub(),
      chown: sinon.stub()
    }
    fileSystem._mkdirp = sinon.stub()

    fileSystem._fs.exists.callsArgWith(1, false)
    fileSystem._mkdirp.callsArgWith(2, new Error('urk!'))

    fileSystem.findOrCreateConfigDirectory(function(error, processDir) {
      expect(error).to.be.ok
      expect(processDir).to.not.exist
      expect(fileSystem._fs.chown.callCount).to.equal(0)

      done()
    })
  })
})
