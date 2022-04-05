const StableSwap = artifacts.require('StableSwap');

module.exports = function (deployer) {
  deployer.deploy(StableSwap);
};
