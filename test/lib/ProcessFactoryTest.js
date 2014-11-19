var expect = require('chai').expect,
  sinon = require('sinon'),
  ProcessFactory = require('../../lib/ProcessFactory')

describe('FileSystem', function() {

  it('should create and autowire a process', function() {
    var factory = new ProcessFactory()
    factory._container = {
      autowire: sinon.stub()
    }
    factory._logger = {
      info: function() {},
      warn: function() {},
      error: function() {},
      debug: function() {}
    }

    var socket = 'foo'
    var process = factory.create(socket)

    expect(factory._container.autowire.calledOnce).to.be.true
    expect(process._socket).to.equal(socket)
  })
})
