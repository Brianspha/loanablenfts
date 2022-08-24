//SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "../interfaces/ILoanableNFT.sol";
import "../interfaces/ITransmuterV2.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../token/NFT.sol";
import "../interfaces/IERC20.sol";
import "../interfaces/alchemist/IAlchemistV2.sol";

contract LoanableNFT is
    ILoanableNFT,
    Initializable,
    ReentrancyGuard,
    OwnableUpgradeable,
    PausableUpgradeable,
    IERC721Receiver
{
    //=================================================================Modifiers=================================================================//
    modifier contractInitialized() {
        require(initialized, "Contract not initialized");
        _;
    }
    //=================================================================Variables=================================================================//

    mapping(uint256 => NFTData) listedNFTs;
    uint256[] listedNFTIds;
    address[] listedNFTAddresses;
    ITransmuterV2 transmuterV2;
    IAlchemistV2 alchemist;
    IERC20 daiToken;
    bool internal initialized;
    address public ydai = 0xdA816459F1AB5631232FE5e97a05BBBb94970c95;

    //=================================================================Functions=================================================================//

    function initialize(
        address transmuterAddress,
        address daiTokenAddress,
        address alchemistAddress
    ) public override initializer {
        require(msg.sender != address(0), "Invalid address");
        require(address(0) != transmuterAddress, "Invalid transmuter address");
        require(address(0) != daiTokenAddress, "Invalid dai address");
        require(address(0) != alchemistAddress, "Invalid alchemist address");
        require(
            IAlchemistV2(alchemistAddress).isSupportedYieldToken(ydai),
            "Yield Token not supported by Alchemix"
        );
        alchemist = IAlchemistV2(alchemistAddress);
        transmuterV2 = ITransmuterV2(transmuterAddress);
        daiToken = IERC20(daiTokenAddress);
        initialized = true;
        __Pausable_init_unchained();
        __Ownable_init();
    }

    function listNFT(
        uint256 id,
        uint256 nftValue,
        uint256 maxLeaseDurationInDays,
        address nftAddress
    ) external virtual override contractInitialized nonReentrant whenNotPaused {
        require(!listedNFTs[id].listed, "NFT already listed");
        require(msg.sender != address(0), "Invalid sender");
        require(maxLeaseDurationInDays > 0, "Invalid max lease duration");
        require(nftAddress != address(0), "NFT address not valid");
        require(nftValue > 0, "NFT value must be greater than 0");
        require(
            NFT(nftAddress).ownerOf(id) == address(this),
            "token not delegated to contract"
        );
        listedNFTs[id].nftValue = nftValue;
        listedNFTs[id].maxLeaseDurationInDays = maxLeaseDurationInDays;
        listedNFTs[id].originalOwner = msg.sender;
        listedNFTs[id].available = true;
        listedNFTs[id].listed = true;
        listedNFTs[id].currentOwner = address(this);
        listedNFTs[id].nftAddress = nftAddress;
        listedNFTIds.push(id);
        listedNFTAddresses.push(nftAddress);
        emit NFTListed(
            NFT(nftAddress).ownerOf(id),
            nftAddress,
            id,
            maxLeaseDurationInDays
        );
    }

    function deListNFT(uint256 id)
        external
        virtual
        override
        nonReentrant
        contractInitialized
    {
        require(listedNFTs[id].listed, "NFT not listed");
        require(listedNFTs[id].available, "NFT leased");
        require(msg.sender != address(0), "Invalid sender");
        address tokenAddress = listedNFTs[id].nftAddress;
        require(listedNFTs[id].originalOwner == msg.sender, "token not owned");
        require(
            NFT(tokenAddress).ownerOf(id) == address(this),
            "token not owned by contract"
        );
        delete listedNFTs[id];
        NFT(tokenAddress).safeTransferFrom(address(this), msg.sender, id);
        require(
            NFT(tokenAddress).ownerOf(id) == msg.sender,
            "token not transffered"
        );
        emit NFTDeListed(NFT(tokenAddress).ownerOf(id), tokenAddress, id);
    }

    function resetOwnership(uint256 id)
        external
        override
        whenNotPaused
        contractInitialized
    {
        require(listedNFTs[id].currentOwner == msg.sender && NFT(listedNFTs[id].nftAddress).ownerOf(id) == msg.sender, "Not current owner");
        delete listedNFTs[id];
    }

    function borrowNFT(uint256 id, uint256 durationInDays)
        external
        virtual
        override
        nonReentrant
        whenNotPaused
        contractInitialized
    {
        require(msg.sender != address(0), "invalid sender");
        require(listedNFTs[id].listed, "NFT not listed");
        require(listedNFTs[id].available, "NFT not available");
        require(
            listedNFTs[id].originalOwner != msg.sender,
            "Cant borrow own NFT"
        );
        require(
            listedNFTs[id].maxLeaseDurationInDays >= durationInDays,
            "Borrow period not allowed"
        );
        require(listedNFTs[id].available, "NFT not listed");
        require(
            NFT(listedNFTs[id].nftAddress).ownerOf(id) == address(this),
            "NFT not owned by contract"
        );
        require(
            daiToken.balanceOf(msg.sender) >= listedNFTs[id].nftValue,
            "DAI balane must be greater than NFT value"
        );
        require(
            daiToken.allowance(msg.sender, address(this)) >=
                listedNFTs[id].nftValue,
            "DAI allowance doesnt match NFT value"
        );
        listedNFTs[id].currentOwner = msg.sender;
        listedNFTs[id].available = false;
        listedNFTs[id].maxLeaseDurationInDays = durationInDays;
        listedNFTs[id].borrowedDate = block.timestamp;
        daiToken.transferFrom(
            msg.sender,
            address(this),
            listedNFTs[id].nftValue
        );
        NFT(listedNFTs[id].nftAddress).safeTransferFrom(
            address(this),
            msg.sender,
            id
        );

        daiToken.approve(address(alchemist), type(uint256).max); //@dev DANGEROUS!!!!
        alchemist.depositUnderlying(
            ydai,
            listedNFTs[id].nftValue,
            listedNFTs[id].originalOwner,
            0
        );
        require(
            NFT(listedNFTs[id].nftAddress).ownerOf(id) == msg.sender,
            "token not transferred"
        );
        emit NFTMovement(msg.sender, id, block.timestamp, false);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function returnNFT(uint256 id)
        external
        virtual
        override
        nonReentrant
        contractInitialized
    {
        require(!listedNFTs[id].available, "NFT available");
        require(
            NFT(listedNFTs[id].nftAddress).ownerOf(id) == msg.sender,
            "NFT not owned by sender"
        );
        uint256 durationInDays = (block.timestamp -
            listedNFTs[id].borrowedDate) / 86400;
        require(
            durationInDays <= listedNFTs[id].maxLeaseDurationInDays,
            "Cannot return NFT lease duration exceeded"
        );
        listedNFTs[id].available = true;
        NFT(listedNFTs[id].nftAddress).safeTransferFrom(
            msg.sender,
            address(this),
            id
        );
        listedNFTs[id].currentOwner = address(this);
        assert(NFT(listedNFTs[id].nftAddress).ownerOf(id) == address(this));
        emit NFTMovement(
            NFT(listedNFTs[id].nftAddress).ownerOf(id),
            id,
            block.timestamp,
            true
        );
    }

    function getNFTDetails(uint256 id)
        external
        view
        override
        contractInitialized
        returns (
        //    string memory,
            uint256,
            uint256,
            uint256,
            uint256,
            bool,
            bool
        )
    {
        return (
        //    NFT(listedNFTs[id].nftAddress).tokenURI(id),
            listedNFTs[id].borrowedDate,
            listedNFTs[id].returnDate,
            listedNFTs[id].nftValue,
            listedNFTs[id].maxLeaseDurationInDays,
            listedNFTs[id].available,
            listedNFTs[id].listed
        );
    }

    function getAllListedNFTs()
        external
        view
        virtual
        override
        contractInitialized
        returns (uint256[] memory, address[] memory)
    {
        return (listedNFTIds, listedNFTAddresses);
    }
}
