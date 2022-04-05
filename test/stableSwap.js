const StableSwap = artifacts.require('StableSwap');
const ERC20Token = artifacts.require('ERC20Token');

contract('StableSwap', (accounts) => {
  const [owner, user1] = accounts;
  let stableSwap = null;
  let tokenA = null;
  let tokenB = null;

  before(async () => {
    tokenA = await ERC20Token.new(1000, { from: owner });
    tokenB = await ERC20Token.new(2000, { from: owner });
    tokenC = await ERC20Token.new(1000, { from: owner });
    stableSwap = await StableSwap.deployed();

    // Preset
    await tokenA.transfer(user1, 100, { from: owner });
    await tokenA.approve(stableSwap.address, 900, { from: owner });
    await tokenA.approve(stableSwap.address, 100, { from: user1 });

    await tokenB.transfer(user1, 100, { from: owner });
    await tokenB.approve(stableSwap.address, 1900, { from: owner });
    await tokenB.approve(stableSwap.address, 100, { from: user1 });
  });

  // Deploy tests
  it('Should deploy TokenA contract properly ', async () => {
    assert.notEqual(tokenA.address, '', 'TokenA deployed failed');

    var volume_1 = await tokenA.balanceOf(owner);
    var volume_2 = await tokenA.balanceOf(user1);
    assert.equal(
      volume_1.toNumber(),
      900,
      "Owner's TokenA initial volume is not correct."
    );
    assert.equal(
      volume_2.toNumber(),
      100,
      "User1's TokenA initial volume is not correct."
    );
  });

  it('Should deploy TokenB contract properly ', async () => {
    assert.notEqual(tokenB.address, '', 'TokenB deployed failed');

    var volume_1 = await tokenB.balanceOf(owner);
    var volume_2 = await tokenB.balanceOf(user1);
    assert.equal(
      volume_1.toNumber(),
      1900,
      "Owner's TokenB initial volume is not correct."
    );
    assert.equal(
      volume_2.toNumber(),
      100,
      "User1's TokenB initial volume is not correct."
    );
  });

  it('Should deploy StableSwap contract properly ', async () => {
    assert.notEqual(stableSwap.address, '', 'StableSwap deployed failed');
  });

  // Deposit funtion tests
  it('Should deposit TokenA from owner', async () => {
    try {
      await stableSwap.deposit(tokenA.address, 500, { from: owner });

      var volume = await tokenA.balanceOf(stableSwap.address);
      assert.equal(
        volume.toNumber(),
        500,
        'The TokenA volume in StableSwap contract is not correct.'
      );
      return;
    } catch (e) {
      assert(false, e.message);
    }
  });

  it('Should block deposit not enough TokenA from owner', async () => {
    try {
      await stableSwap.deposit(tokenA.address, 500, { from: owner });
      assert(false);
    } catch (e) {
      assert(
        e.message.includes('Do not have enough amount of the Token'),
        'Block for another reason.'
      );
    }
  });

  it('Should block deposit less or equal to 0 TokenA from owner', async () => {
    try {
      await stableSwap.deposit(tokenA.address, 0, { from: owner });
      assert(false);
    } catch (e) {
      assert(
        e.message.includes('Amount is less or equal to 0'),
        'Block for another reason.'
      );
    }
  });

  it('Should block deposit from non-owner', async () => {
    try {
      await stableSwap.deposit(tokenA.address, 10, { from: user1 });
      assert(false);
    } catch (e) {
      assert(
        e.message.includes('caller is not the owner'),
        'Block for another reason.'
      );
    }
  });

  // Withdraw funtion tests
  it('Should withdraw valid amount TokenA from StableSwap to owner', async () => {
    try {
      await stableSwap.withdraw(tokenA.address, 100, { from: owner });
      const contractVolume = await tokenA.balanceOf(stableSwap.address);
      const ownerVolume = await tokenA.balanceOf(owner);

      assert(contractVolume, 400);
      assert(ownerVolume, 500);
    } catch (e) {
      assert(false, e.message);
    }
  });

  it('Should block withdraw with not enough TokenA from StableSwap to owner', async () => {
    try {
      await stableSwap.withdraw(tokenA.address, 1000, { from: owner });
      assert(false);
    } catch (e) {
      assert(
        e.message.includes('Can not withdraw, bacause of not enought amount'),
        'Block for another reason.'
      );
    }
  });

  it('Should block withdraw with less or equal to 0 amount TokenA from StableSwap to owner', async () => {
    try {
      await stableSwap.withdraw(tokenA.address, 0, { from: owner });
      assert(false);
    } catch (e) {
      assert(
        e.message.includes('Amount is less or equal to 0'),
        'Block for another reason.'
      );
    }
  });

  it('Should block withdraw TokenA from StableSwap to non-owner', async () => {
    try {
      await stableSwap.withdraw(tokenA.address, 0, { from: user1 });
      assert(false);
    } catch (e) {
      assert(
        e.message.includes('caller is not the owner'),
        'Block for another reason.'
      );
    }
  });

  // SetSwapRate function tests
  it('Should set swap rate with valid rate from owner', async () => {
    try {
      await stableSwap.setSwapRate(tokenA.address, tokenB.address, 200, 50, {
        from: owner,
      });

      var swappableAtoB = await stableSwap.swappable(
        tokenA.address,
        tokenB.address
      );
      assert.equal(
        swappableAtoB,
        true,
        'Failed - unswappable from TokenA to TokenB'
      );

      var swappableBtoA = await stableSwap.swappable(
        tokenB.address,
        tokenA.address
      );
      assert.equal(
        swappableBtoA,
        true,
        'Failed - unswappable from TokenB to TokenA'
      );

      var swapRateAtoB = await stableSwap.swapRate(
        tokenA.address,
        tokenB.address
      );
      assert.equal(
        swapRateAtoB.toNumber(),
        200,
        'Failed - uncorrect swap rate from TokenA to TokenB'
      );

      var swapRateBtoA = await stableSwap.swapRate(
        tokenB.address,
        tokenA.address
      );
      assert.equal(
        swapRateBtoA.toNumber(),
        50,
        'Failed - uncorrect swap rate from TokenB to TokenA'
      );
      return;
    } catch (e) {
      assert(false, e.message);
    }
  });

  it('Should block set swap rate with invalid first rate from owner', async () => {
    try {
      await stableSwap.setSwapRate(tokenA.address, tokenB.address, 0, 50, {
        from: owner,
      });
      assert(false);
    } catch (e) {
      assert(
        e.message.includes(
          'Swap Rate from the First to Second Tonken should larger than 0'
        ),
        'Block for another reason.'
      );
    }
  });

  it('Should set swap rate with invalid second rate from owner', async () => {
    try {
      await stableSwap.setSwapRate(tokenA.address, tokenB.address, 200, 0, {
        from: owner,
      });
      assert(false);
    } catch (e) {
      assert(
        e.message.includes(
          'Swap Rate from the Second to First Tonken should larger than 0'
        ),
        'Block for another reason.'
      );
    }
  });

  it('Should set swap rate with valid rate from non-owner', async () => {
    try {
      await stableSwap.setSwapRate(tokenA.address, tokenB.address, 200, 50, {
        from: user1,
      });
      assert(false);
    } catch (e) {
      assert(
        e.message.includes('caller is not the owner'),
        'Block for another reason.'
      );
    }
  });

  // Swap function tests
  it('Should swap from tokenA to tokenB with valid amount', async () => {
    try {
      await stableSwap.deposit(tokenB.address, 200, { from: owner });

      await tokenA.approve(stableSwap.address, 100, { from: user1 });
      await stableSwap.swap(tokenA.address, tokenB.address, 100, {
        from: user1,
      });

      var volume = await tokenA.balanceOf(stableSwap.address);
      assert.equal(volume.toNumber(), 500);

      var volume = await tokenB.balanceOf(stableSwap.address);
      assert.equal(volume.toNumber(), 0);

      var volume = await tokenA.balanceOf(user1);
      assert.equal(volume.toNumber(), 0);

      var volume = await tokenB.balanceOf(user1);
      assert.equal(volume.toNumber(), 300);

      return;
    } catch (e) {
      assert(false, e.message);
    }
  });

  it('Should swap from tokenB to tokenA with valid amount', async () => {
    try {
      await tokenB.approve(stableSwap.address, 200, { from: user1 });
      await stableSwap.swap(tokenB.address, tokenA.address, 200, {
        from: user1,
      });

      var volume = await tokenA.balanceOf(stableSwap.address);
      assert.equal(volume.toNumber(), 400);

      var volume = await tokenB.balanceOf(stableSwap.address);
      assert.equal(volume.toNumber(), 200);

      var volume = await tokenA.balanceOf(user1);
      assert.equal(volume.toNumber(), 100);

      var volume = await tokenB.balanceOf(user1);
      assert.equal(volume.toNumber(), 100);

      return;
    } catch (e) {
      assert(false, e.message);
    }
  });

  it('Should block swap from tokenA to tokenC with not support tokenA to tokenA', async () => {
    try {
      await stableSwap.swap(tokenA.address, tokenC.address, 10, {
        from: user1,
      });
      assert(false);
    } catch (e) {
      assert(true);
    }
  });

  it('Should block swap from tokenC to tokenA with not support tokenA to tokenA', async () => {
    try {
      await stableSwap.swap(tokenC.address, tokenA.address, 10, {
        from: user1,
      });
      assert(false);
    } catch (e) {
      assert(
        e.message.includes('Do not support for swaping these two tokens.'),
        'Block for another reason.'
      );
    }
  });

  it('Should block swap from tokenA to tokenB with less or equal to 0 amount', async () => {
    try {
      await stableSwap.swap(tokenA.address, tokenB.address, 0, {
        from: user1,
      });
      assert(false);
    } catch (e) {
      assert(
        e.message.includes(
          'Can not swap, because of the amount is not larger than 0'
        ),
        'Block for another reason.'
      );
    }
  });

  it('Should block swap from tokenA to tokenB with not enough tokenB in contract', async () => {
    try {
      await stableSwap.swap(tokenA.address, tokenB.address, 1000, {
        from: user1,
      });
      assert(false);
    } catch (e) {
      assert(
        e.message.includes(
          'Can not swap, because of not enought outToken in the contract'
        ),
        'Block for another reason.'
      );
    }
  });

  // swappablePairs function tests
  it('Should get swapple pairs', async () => {
    let result = await stableSwap.swappablePairs();

    assert.deepEqual(result[0], [tokenA.address, tokenB.address]);
    assert.deepEqual(result[1], [tokenB.address, tokenA.address]);
    assert.deepEqual(
      result[2].map((res) => res.toNumber()),
      [200, 50]
    );
  });
});
