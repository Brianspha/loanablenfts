//SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721URIStorage, Ownable, Initializable {
    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;

    constructor(string memory name, string memory symbol)
        initializer
        ERC721(name, symbol)
    {}

    function mintToken(address tokenOwner, string memory tokenURI)
        public
        returns (uint256)
    {
        tokenIds.increment();
        _mint(tokenOwner, tokenIds.current());
        _setTokenURI(tokenIds.current(), tokenURI);
        return tokenIds.current();
    }

    function tokenExists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function totalSupply() public view returns (uint256) {
        // _tokenOwners are indexed by tokenIds, so .length() returns the number of tokenIds
        return tokenIds.current();
    }

    function burnToken(uint256 tokenId) public returns (bool) {
        require(msg.sender == ownerOf(tokenId), "Not owner");
        _burn(tokenId);
        return tokenExists(tokenId);
    }
}
