const bigNumber = require('bignumber.js')

module.exports = {
    // default applies to all environments
    default: {
        // order of connections the dapp should connect to
        dappConnection: [
            "$WEB3", // uses pre existing web3 object if available (e.g in Mist)
            "ws://localhost:8546",
            "http://localhost:8546"
        ],

        // Automatically call `ethereum.enable` if true.
        // If false, the following code must run before sending any transaction: `await EmbarkJS.enableEthereum();`
        // Default value is true.
        // dappAutoEnable: true,

        gas: "auto",

        // Strategy for the deployment of the contracts:
        // - implicit will try to deploy all the contracts located inside the contracts directory
        //            or the directory configured for the location of the contracts. This is default one
        //            when not specified
        // - explicit will only attempt to deploy the contracts that are explicitly specified inside the
        //            contracts section.
        // strategy: 'implicit',

        // minimalContractSize, when set to true, tells Embark to generate contract files without the heavy bytecodes
        // Using filteredFields lets you customize which field you want to filter out of the contract file (requires minimalContractSize: true)
        // minimalContractSize: false,
        // filteredFields: [],

        deploy: {
            // SimpleStorage: {
            //   fromIndex: 0,
            //   args: [100]
            // }
        }
    },

    // default environment, merges with the settings in default
    // assumed to be the intended environment by `embark run`
    development: {
        dappConnection: [
            "ws://localhost:8545",
            "http://localhost:8545",
            "$WEB3" // uses pre existing web3 object if available (e.g in Mist)
        ],
        strategy: 'explicit',
        deploy: {
            LoanableNFT: {
                args: []
            },
            NFT: {
                args: ["LOANABLE", "LOANABLENFT"]
            },
            ERC20: {
                args: ["LOANABLE", "LOANABLENFT"]
            },
            ERC721: {
                args: ["ERC721", "ERC721"]
            },
            DAI: {
                abiDefinition: require("../abis/dai.json"),
                address: "0x6b175474e89094c44da98b954eedeac495271d0f"
            },
            yDAI: {
                abiDefinition: require("../abis/dai.json"),
                address: "0x6b175474e89094c44da98b954eedeac495271d0f"
            },
            Whitelist:{
                abiDefinition: require("../abis/whitelist.json"),
                address: "0x78537a6ceba16f412e123a90472c6e0e9a8f1132", 
            }
            ,
        Alchemist:{
            abiDefinition: require("../abis/alchemist.json"),
            address: "0x5C6374a2ac4EBC38DeA0Fc1F8716e5Ea1AdD94dd",   
        }
        },
        afterDeploy: async ({
            contracts,
            web3,
            logger
        }) => {
          try{
            console.log("Start transferring DAI from whale account to user account[0]")
            const accounts = await web3.eth.getAccounts();
            const tx = await web3.eth.sendTransaction({
                from: accounts[0],
                to: '0x16B34Ce9A6a6F7FC2DD25Ba59bf7308E7B38E186',
                value: '9991000000000000000'
            })
            console.log("transaction: ", tx.transactionHash)
            console.log("balance: ", await contracts.DAI.methods.balanceOf("0x16B34Ce9A6a6F7FC2DD25Ba59bf7308E7B38E186").call())
            await contracts.DAI.methods.transferFrom("0x16B34Ce9A6a6F7FC2DD25Ba59bf7308E7B38E186", accounts[0], new bigNumber(await contracts.DAI.methods.balanceOf("0x16B34Ce9A6a6F7FC2DD25Ba59bf7308E7B38E186").call()).toFixed(0)).send({
                from: "0x16B34Ce9A6a6F7FC2DD25Ba59bf7308E7B38E186",
                gas: 500000
            })
            console.log("Done transferring DAI from whale account to user account[0]")
            console.log("Start Init LoanableNFT contract")
            await contracts.LoanableNFT.methods.initialize("0xAD2A6C1C6025bE8C703930dCd921a2Fa25220298",contracts.DAI.options.address, "0x5C6374a2ac4EBC38DeA0Fc1F8716e5Ea1AdD94dd").send({from:accounts[0],gas:6000000})
            console.log("Init LoanableNFT contract Done")

            console.log("Start whitelisting LoanableNFT contract address")
            await contracts.Whitelist.methods.add(contracts.LoanableNFT.options.address).send({from:"0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9",gas:6000000})
            console.log("Start whitelisting LoanableNFT contract address Done")
          }
          catch(error){
            console.error("error deploying contracts", error.message);
          }

        }
    },

    // merges with the settings in default
    // used with "embark run privatenet"
    privatenet: {},

    // merges with the settings in default
    // used with "embark run testnet"
    testnet: {},

    // merges with the settings in default
    // used with "embark run livenet"
    livenet: {}

    // you can name an environment with specific settings and then specify with
    // "embark run custom_name" or "embark blockchain custom_name"
    // custom_name: {}
};