// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TKN contract
 * NOTE: Contract inherit from openzeppelin ERC20 and add function for initial minting
 * and withdraw of tokens
 */
contract token1 is ERC20, Ownable {
    /**
     * @dev Emitted when the owner withdraw ether from the contract
     * @param owner owner address
     * @param amount amount of ether
     */
    event WithdrawalOfOwner(address owner, uint256 indexed amount);

    /**
     * @dev Each token has 18 decimals
     * Mint initial 75000 amount of tokens for the owner
     */
    constructor() ERC20("Token1", "TKN1") {
        _mint(msg.sender, 75000 * 10**18);
    }

    /**
     * @dev Each user can mint an additional number of tokens at a price
     * 0.0001 ETH per token
     */
    function buyToken() public payable {
        require(msg.value >= 0.0001 ether, "1 token cost 0.0001 ETH");
        _mint(msg.sender, ((msg.value * 10**18) / 0.0001 ether));
    }

    /**
     * @dev Owner can withdraw Ether from contract
     */
    function withdrawETH(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Not enough ETH");
        payable(owner()).transfer(amount);
        emit WithdrawalOfOwner(msg.sender, amount);
    }
}