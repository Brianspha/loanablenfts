//SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

/// @title ILoanableNFT
/// @author brianspha
/// @notice Interface contains all functions to be implemented by any client that inherits from this interface
/// @dev WIP
interface ILoanableNFT {
    //=================================================================Structs=================================================================//
    struct NFTData {
        address originalOwner;
        address currentOwner;
        address nftAddress;
        uint256 borrowedDate;
        uint256 returnDate;
        uint256 maxLeaseDurationInDays;
        bool available;
        bool listed;
        bool withdrewEarnings;
        uint256 nftValue;
        address[] pastBorrowers;
    }
    //=================================================================Events=================================================================//
    event NFTListed(
        address indexed owner,
        address indexed nftAddress,
        uint256 indexed nftValue,
        uint256 maxLeaseDuration
    );
    event NFTDeListed(
        address indexed owner,
        address indexed nftAddress,
        uint256 indexed nftValue
    );
    event NFTMovement(
        address indexed owner,
        uint256 indexed nftId,
        uint256 indexed timestamp,
        bool isReturning
    );
    event EarningsWithdrawn(
        address indexed owner,
        uint256 indexed nftId,
        uint256 indexed amount,
        uint256 yieldEarned
    );

    //=================================================================Functions=================================================================//
    function initialize(
        address transmuterAddress,
        address daiTokenAddress,
        address alchemistAddress
    ) external;

    function returnNFT(uint256 id) external;

    function borrowNFT(uint256 id, uint256 durationInDays) external;

    function getNFTDetails(uint256 id)
        external
        view
        returns (
          //  string memory,
            uint256,
            uint256,
            uint256,
            uint256,
            bool,
            bool
        );

    function deListNFT(uint256 id) external;

    function resetOwnership(uint256 id) external;

    function listNFT(
        uint256 id,
        uint256 nftValue,
        uint256 maxLeaseDuration,
        address nftAddress
    ) external;

    function getAllListedNFTs()
        external
        view
        returns (uint256[] memory, address[] memory);
}
