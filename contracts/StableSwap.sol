// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract StableSwap is Ownable {
    using SafeMath for uint256;

    event SetSwapRate(
        address _inToken,
        address _outToken,
        uint256 _inToOutSwapRate,
        uint256 _outToInSwapRate
    );
    event Receive(uint256 _amount);
    event Deposit(address _token, uint256 _amount);
    event Withdraw(address _token, uint256 _amount);
    event Swap(
        address _from,
        address _inToken,
        address _outToken,
        uint256 _inAmount
    );

    struct TokenPairs {
        address[] tokens;
        uint256 nPairs;
        mapping(address => bool) availableTokens;
        mapping(address => mapping(address => uint256)) swapRates;
    }

    TokenPairs public tokenPairs;
    uint256 public swapRateDecimal = 2;

    constructor() Ownable() {}

    receive() external payable {}

    function setSwapRate(
        address _inToken,
        address _outToken,
        uint256 _inToOutSwapRate,
        uint256 _outToinSwapRate
    ) public onlyOwner returns (bool) {
        require(
            _inToOutSwapRate > 0,
            "Swap Rate from the First to Second Tonken should larger than 0"
        );

        require(
            _outToinSwapRate > 0,
            "Swap Rate from the Second to First Tonken should larger than 0"
        );

        if (tokenPairs.availableTokens[_inToken] == false) {
            tokenPairs.availableTokens[_inToken] = true;
            tokenPairs.tokens.push(_inToken);
        }

        if (tokenPairs.availableTokens[_outToken] == false) {
            tokenPairs.availableTokens[_outToken] = true;
            tokenPairs.tokens.push(_outToken);
        }

        if (tokenPairs.swapRates[_inToken][_outToken] == 0) {
            tokenPairs.nPairs += 1;
        }

        tokenPairs.swapRates[_inToken][_outToken] = _inToOutSwapRate;
        tokenPairs.swapRates[_outToken][_inToken] = _outToinSwapRate;

        emit SetSwapRate(
            _inToken,
            _outToken,
            _inToOutSwapRate,
            _outToinSwapRate
        );

        return true;
    }

    function deposit(address _token, uint256 _amount) public onlyOwner {
        require(_amount > 0, "Amount is less or equal to 0");
        require(
            IERC20(_token).balanceOf(address(msg.sender)) >= _amount,
            "Do not have enough amount of the Token"
        );

        IERC20(_token).transferFrom(
            address(msg.sender),
            address(this),
            _amount
        );

        emit Deposit(_token, _amount);
    }

    function withdraw(address _token, uint256 _amount)
        external
        onlyOwner
        returns (bool)
    {
        require(_amount > 0, "Amount is less or equal to 0");
        require(
            IERC20(_token).balanceOf(address(this)) >= _amount,
            "Can not withdraw, bacause of not enought amount"
        );

        IERC20(_token).transfer(owner(), _amount);

        emit Withdraw(_token, _amount);
        return true;
    }

    function swap(
        address _inToken,
        address _outToken,
        uint256 _inAmount
    ) public {
        require(
            tokenPairs.swapRates[_inToken][_outToken] > 0,
            "Do not support for swaping these two tokens."
        );
        require(
            _inAmount > 0,
            "Can not swap, because of the amount is not larger than 0"
        );

        uint256 outAmount = tokenPairs
        .swapRates[_inToken][_outToken].mul(_inAmount).div(10**swapRateDecimal);

        require(
            IERC20(_outToken).balanceOf(address(this)) >= outAmount,
            "Can not swap, because of not enought outToken in the contract"
        );

        IERC20(_inToken).transferFrom(msg.sender, address(this), _inAmount);
        IERC20(_outToken).transfer(msg.sender, outAmount);

        emit Swap(msg.sender, _inToken, _outToken, _inAmount);
    }

    function swappablePairs()
        external
        view
        returns (
            address[] memory,
            address[] memory,
            uint256[] memory
        )
    {
        address[] memory inTokens = new address[](tokenPairs.nPairs * 2);
        address[] memory outTokens = new address[](tokenPairs.nPairs * 2);
        uint256[] memory swapRates = new uint256[](tokenPairs.nPairs * 2);

        address inToken;
        address outToken;
        uint256 arrayIndex = 0;

        for (
            uint256 inIndex = 0;
            inIndex < (tokenPairs.tokens.length - 1);
            inIndex++
        ) {
            for (
                uint256 outIndex = inIndex + 1;
                outIndex < tokenPairs.tokens.length;
                outIndex++
            ) {
                inToken = tokenPairs.tokens[inIndex];
                outToken = tokenPairs.tokens[outIndex];

                if (tokenPairs.swapRates[inToken][outToken] > 0) {
                    inTokens[arrayIndex] = inToken;
                    inTokens[arrayIndex + 1] = outToken;

                    outTokens[arrayIndex] = outToken;
                    outTokens[arrayIndex + 1] = inToken;

                    swapRates[arrayIndex] = tokenPairs.swapRates[inToken][
                        outToken
                    ];
                    swapRates[arrayIndex + 1] = tokenPairs.swapRates[outToken][
                        inToken
                    ];

                    arrayIndex += 2;
                }
            }
        }

        return (inTokens, outTokens, swapRates);
    }

    function swappable(address _inToken, address _outToken)
        external
        view
        returns (bool)
    {
        return tokenPairs.swapRates[_inToken][_outToken] > 0 ? true : false;
    }

    function swapRate(address _inToken, address _outToken)
        external
        view
        returns (uint256)
    {
        return tokenPairs.swapRates[_inToken][_outToken];
    }
}
