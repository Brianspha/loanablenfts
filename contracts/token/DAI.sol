//SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract DAI is ERC20, Initializable {
    constructor(string memory name, string memory symbol)
        initializer
        ERC20(name, symbol)
    {}
}
