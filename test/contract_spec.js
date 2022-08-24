/*global artifacts, contract, it*/
/**/
const bigNumber = require("bignumber.js");
const LoanableNFT = artifacts.require("LoanableNFT");
const DAI = artifacts.require("DAI");
const yDAI = artifacts.require("yDAI");

const NFT = artifacts.require("NFT");
const Whitelist = artifacts.require("Whitelist");
const Alchemist = artifacts.require("Alchemist")
let accounts,
	nftIDAccount1,
	nftIDAccount2,
	nftIDAccount3,
	nftIDAccount4,
	nftIDAccount5, ONE_DAY_IN_SECONDS = 86400;

// For documentation please see https://framework.embarklabs.io/docs/contracts_testing.html
config({
		//deployment: {
		//  accounts: [
		//    // you can configure custom accounts with a custom balance
		//    // see https://framework.embarklabs.io/docs/contracts_testing.html#Configuring-accounts
		//  ]
		//},
		contracts: {
			deploy: {
				LoanableNFT: {
					args: [],
				},
				NFT: {
					args: ["LOANABLE", "LOANABLENFT"],
				},
				ERC20: {
					args: ["LOANABLE", "LOANABLENFT"],
				},
				ERC721: {
					args: ["ERC721", "ERC721"],
				},
				DAI: {
					abiDefinition: require("../abis/dai.json"),
					address: "0x6b175474e89094c44da98b954eedeac495271d0f",
				},
				yDAI: {
					abiDefinition: require("../abis/dai.json"),
					address: "0xdA816459F1AB5631232FE5e97a05BBBb94970c95"
				},
				Whitelist: {
					abiDefinition: require("../abis/whitelist.json"),
					address: "0x78537a6ceba16f412e123a90472c6e0e9a8f1132",
				},
				Alchemist: {
					abiDefinition: require("../abis/alchemist.json"),
					address: "0x5C6374a2ac4EBC38DeA0Fc1F8716e5Ea1AdD94dd",
				}
			},
		},
	},
	(_err, web3_accounts) => {
		accounts = web3_accounts;
	}
);

contract("DAI", function() {

	it("should transfer all DAI from whale to accounts[0]", async function() {
		await DAI.methods.transferFrom("0x16B34Ce9A6a6F7FC2DD25Ba59bf7308E7B38E186", accounts[0], new bigNumber(await DAI.methods.balanceOf("0x16B34Ce9A6a6F7FC2DD25Ba59bf7308E7B38E186").call()).toFixed(0)).send({
			from: "0x16B34Ce9A6a6F7FC2DD25Ba59bf7308E7B38E186",
			gas: 500000
		})
	});
	it("should get account[0] DAI balance", async function() {
		let balance = await DAI.methods.balanceOf(accounts[0]).call();
		console.log("balance: ", balance);
		assert.strictEqual(balance > 0, true);
	});

	it("should transfer 100000 to accounts[1] from accounts[0]", async function() {
		let balanceAccount1Before = await DAI.methods.balanceOf(accounts[1]).call();
		await DAI.methods
			.transferFrom(
				accounts[0],
				accounts[1],
				new bigNumber(100000).multipliedBy(10e8).toFixed(0)
			)
			.send({
				from: accounts[0],
				gas: 5000000
			});
		let balanceAccount1After = await DAI.methods.balanceOf(accounts[1]).call();
		console.log("balanceAccount1After: ", balanceAccount1After);
		assert.strictEqual(
			balanceAccount1After > balanceAccount1Before,
			true,
			"DAI not transferred"
		);
	});
	it("should transfer 100000 to accounts[2] from accounts[0]", async function() {
		let balanceAccount1Before = await DAI.methods.balanceOf(accounts[2]).call();
		await DAI.methods
			.transferFrom(
				accounts[0],
				accounts[2],
				new bigNumber(100000).multipliedBy(10e8).toFixed(0)
			)
			.send({
				from: accounts[0],
				gas: 5000000
			});
		let balanceAccount1After = await DAI.methods.balanceOf(accounts[2]).call();
		console.log("balanceAccount1After: ", balanceAccount1After);
		assert.strictEqual(
			balanceAccount1After > balanceAccount1Before,
			true,
			"DAI not transferred"
		);
	});

	it("should transfer 100000 to accounts[3] from accounts[0]", async function() {
		let balanceAccount1Before = await DAI.methods.balanceOf(accounts[3]).call();
		await DAI.methods
			.transferFrom(
				accounts[0],
				accounts[3],
				new bigNumber(100000).multipliedBy(10e8).toFixed(0)
			)
			.send({
				from: accounts[0],
				gas: 5000000
			});
		let balanceAccount1After = await DAI.methods.balanceOf(accounts[3]).call();
		console.log("balanceAccount1After: ", balanceAccount1After);
		assert.strictEqual(
			balanceAccount1After > balanceAccount1Before,
			true,
			"DAI not transferred"
		);
	});
	it("should transfer 100000 to accounts[4] from accounts[0]", async function() {
		let balanceAccount1Before = await DAI.methods.balanceOf(accounts[4]).call();
		await DAI.methods
			.transferFrom(
				accounts[0],
				accounts[4],
				new bigNumber(100000).multipliedBy(10e8).toFixed(0)
			)
			.send({
				from: accounts[0],
				gas: 5000000
			});
		let balanceAccount1After = await DAI.methods.balanceOf(accounts[4]).call();
		console.log("balanceAccount1After: ", balanceAccount1After);
		assert.strictEqual(
			balanceAccount1After > balanceAccount1Before,
			true,
			"DAI not transferred"
		);
	});
	it("should transfer 100000 to accounts[5] from accounts[0]", async function() {
		let balanceAccount1Before = await DAI.methods.balanceOf(accounts[5]).call();
		await DAI.methods
			.transferFrom(
				accounts[0],
				accounts[5],
				new bigNumber(100000).multipliedBy(10e8).toFixed(0)
			)
			.send({
				from: accounts[0],
				gas: 5000000
			});
		let balanceAccount1After = await DAI.methods.balanceOf(accounts[5]).call();
		console.log("balanceAccount1After: ", balanceAccount1After);
		assert.strictEqual(
			balanceAccount1After > balanceAccount1Before,
			true,
			"DAI not transferred"
		);
	});
});

contract("NFT", function() {
	it("should mint token for account[1]", async function() {
		const nftTx = await NFT.methods
			.mintToken(
				accounts[1],
				JSON.stringify({
					created: Date.now(),
					name: "My Super NFT",
					description: "This is a very super interesting NFT",
					nftValueInDAI: new bigNumber(100).multipliedBy(10e8).toFixed(0),
					owner: accounts[1],
					attributes: [],
				})
			)
			.send({
				from: accounts[1],
				gas: 6000000
			});
		assert.eventEmitted(nftTx, "Transfer", {
			to: accounts[1]
		});
		nftIDAccount1 = nftTx.events.Transfer.returnValues.tokenId;
		assert.strictEqual(
			(await NFT.methods
				.ownerOf(nftTx.events.Transfer.returnValues.tokenId)
				.call()) === accounts[1],
			true,
			"Token not owned by account[1]"
		);
	});
	it("should get totalSupply to equal 1", async function() {
		assert.strictEqual(
			new bigNumber(await NFT.methods.totalSupply().call()).isEqualTo(
				new bigNumber(1)
			),
			true,
			"Token supply not equal to 1"
		);
	});

	it("should burn token", async function() {
		await NFT.methods
			.burnToken(nftIDAccount1)
			.send({
				from: accounts[1],
				gas: 6000000
			});
		assert.strictEqual(
			await NFT.methods.tokenExists(nftIDAccount1).call(),
			false,
			"Token not burnt"
		);
	});

	it("should mint token for account[1] again", async function() {
		const nftTx = await NFT.methods
			.mintToken(
				accounts[1],
				JSON.stringify({
					created: Date.now(),
					name: "My Super NFT",
					description: "This is a very super interesting NFT",
					nftValueInDAI: new bigNumber(100).multipliedBy(10e8).toFixed(0),
					owner: accounts[1],
					attributes: [],
				})
			)
			.send({
				from: accounts[1],
				gas: 6000000
			});
		assert.eventEmitted(nftTx, "Transfer", {
			to: accounts[1]
		});
		nftIDAccount1 = nftTx.events.Transfer.returnValues.tokenId;
		assert.strictEqual(
			(await NFT.methods
				.ownerOf(nftTx.events.Transfer.returnValues.tokenId)
				.call()) === accounts[1],
			true,
			"Token not owned by account[1]"
		);
	});

	it("should mint token for account[2]", async function() {
		const nftTx = await NFT.methods
			.mintToken(
				accounts[2],
				JSON.stringify({
					created: Date.now(),
					name: "My Super NFT",
					description: "This is a very super interesting NFT",
					nftValueInDAI: new bigNumber(100).multipliedBy(10e8).toFixed(0),
					owner: accounts[2],
					attributes: [],
				})
			)
			.send({
				from: accounts[2],
				gas: 6000000
			});
		assert.eventEmitted(nftTx, "Transfer", {
			to: accounts[2]
		});
		nftIDAccount2 = nftTx.events.Transfer.returnValues.tokenId;
		assert.strictEqual(
			(await NFT.methods
				.ownerOf(nftTx.events.Transfer.returnValues.tokenId)
				.call()) === accounts[2],
			true,
			"Token not owned by account[2]"
		);
	});
	it("should mint token for account[3]", async function() {
		const nftTx = await NFT.methods
			.mintToken(
				accounts[3],
				JSON.stringify({
					created: Date.now(),
					name: "My Super NFT",
					description: "This is a very super interesting NFT",
					nftValueInDAI: new bigNumber(100).multipliedBy(10e8).toFixed(0),
					owner: accounts[3],
					attributes: [],
				})
			)
			.send({
				from: accounts[3],
				gas: 6000000
			});
		assert.eventEmitted(nftTx, "Transfer", {
			to: accounts[3]
		});
		nftIDAccount3 = nftTx.events.Transfer.returnValues.tokenId;
		assert.strictEqual(
			(await NFT.methods
				.ownerOf(nftTx.events.Transfer.returnValues.tokenId)
				.call()) === accounts[3],
			true,
			"Token not owned by account[3]"
		);
	});
	it("should mint token for account[4]", async function() {
		const nftTx = await NFT.methods
			.mintToken(
				accounts[4],
				JSON.stringify({
					created: Date.now(),
					name: "My Super NFT",
					description: "This is a very super interesting NFT",
					nftValueInDAI: new bigNumber(100).multipliedBy(10e8).toFixed(0),
					owner: accounts[4],
					attributes: [],
				})
			)
			.send({
				from: accounts[4],
				gas: 6000000
			});
		assert.eventEmitted(nftTx, "Transfer", {
			to: accounts[4]
		});
		nftIDAccount4 = nftTx.events.Transfer.returnValues.tokenId;
		assert.strictEqual(
			(await NFT.methods
				.ownerOf(nftTx.events.Transfer.returnValues.tokenId)
				.call()) === accounts[4],
			true,
			"Token not owned by account[4]"
		);
	});
	it("should mint token for account[5]", async function() {
		const nftTx = await NFT.methods
			.mintToken(
				accounts[5],
				JSON.stringify({
					created: Date.now(),
					name: "My Super NFT",
					description: "This is a very super interesting NFT",
					nftValueInDAI: new bigNumber(100).multipliedBy(10e8).toFixed(0),
					owner: accounts[5],
					attributes: [],
				})
			)
			.send({
				from: accounts[5],
				gas: 6000000
			});
		assert.eventEmitted(nftTx, "Transfer", {
			to: accounts[5]
		});
		nftIDAccount5 = nftTx.events.Transfer.returnValues.tokenId;
		assert.strictEqual(
			(await NFT.methods
				.ownerOf(nftTx.events.Transfer.returnValues.tokenId)
				.call()) === accounts[5],
			true,
			"Token not owned by account[5]"
		);
	});
});
contract("Whitelist", function() {
	it("should whitelist LoanableNFT contract address", async function() {
		await Whitelist.methods.add(LoanableNFT.options.address).send({
			from: "0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9",
			gas: 6000000
		})
		assert.strictEqual(await Whitelist.methods.isWhitelisted(LoanableNFT.options.address).call({
			gas: 6000000
		}), true, "LoanableNFT contract not whitelisted")
	})

	it("should whitelist accounts[2]", async function() {
		await Whitelist.methods.add(accounts[2]).send({
			from: "0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9",
			gas: 6000000
		})
		assert.strictEqual(await Whitelist.methods.isWhitelisted(accounts[2]).call({
			gas: 6000000
		}), true, "LoanableNFT contract not whitelisted")
	})

})
contract("Alchemist", function() {
	it("should deposit underlyingToken", async function() {
		console.log("position: ", await Alchemist.methods.positions(accounts[0], yDAI.options.address).call({
			from: accounts[0],
			gas: 6000000
		}))
		await DAI.methods.approve(Alchemist.options.address, new bigNumber(10).multipliedBy(10e8).toFixed(0)).send({
			from: accounts[0],
			gas: 6000000
		})
		await Alchemist.methods.depositUnderlying(yDAI.options.address, new bigNumber(10).multipliedBy(10e8).toFixed(0), accounts[0], 0).send({
			from: accounts[0],
			gas: 6000000
		})
		await increaseTime(ONE_DAY_IN_SECONDS);
	})

	it("should get account[0] position", async function() {
		const position = await Alchemist.methods.positions(accounts[0], yDAI.options.address).call({
			from: accounts[0],
			gas: 6000000
		})
		console.log("decimals: ", await yDAI.methods.decimals().call(), " position: ", position)
	})

	it("should withdraw accounts[0] deposit", async function() {
		var position = await Alchemist.methods.positions(accounts[0], yDAI.options.address).call({
			from: accounts[0],
			gas: 6000000
		})
		const withdrawTx = await Alchemist.methods.withdraw(yDAI.options.address, position.shares, accounts[0]).send({
			from: accounts[0],
			gas: 6000000
		})
		console.log("withdrawTx: ", withdrawTx.events.Withdraw.returnValues)
		assert.eventEmitted(withdrawTx, "Withdraw", {
			owner: accounts[0],
		});

	})

})

contract("LoanableNFT", function() {
	it("should initialize LoanableNFT contract", async function() {
		await LoanableNFT.methods
			.initialize(
				"0xAD2A6C1C6025bE8C703930dCd921a2Fa25220298",
				DAI.options.address,
				"0x5C6374a2ac4EBC38DeA0Fc1F8716e5Ea1AdD94dd"
			)
			.send({
				from: accounts[0],
				gas: 6000000
			});
	});
	it("should transfer token owned by accounts[1] to LoanableNFT contract", async function() {
		const transferTx = await NFT.methods
			.transferFrom(accounts[1], LoanableNFT.options.address, nftIDAccount1)
			.send({
				from: accounts[1],
				gas: 6000000
			});
		assert.eventEmitted(transferTx, "Transfer", {
			from: accounts[1]
		});
		assert.strictEqual(
			(await NFT.methods.ownerOf(nftIDAccount1).call()) ===
			LoanableNFT.options.address,
			true,
			"Token not owned by contract"
		);
	});
	it("should list token owned by account[1]", async function() {
		const nftTx = await LoanableNFT.methods
			.listNFT(
				nftIDAccount1,
				new bigNumber(100).multipliedBy(10e8).toFixed(0),
				30,
				NFT.options.address
			)
			.send({
				from: accounts[1],
				gas: 6000000
			});
		assert.eventEmitted(nftTx, "NFTListed", {
			owner: LoanableNFT.options.address,
		});
	});
	it("should deList token owned by account[1]", async function() {
		const nftTx = await LoanableNFT.methods
			.deListNFT(nftIDAccount1)
			.send({
				from: accounts[1],
				gas: 6000000
			});
		assert.eventEmitted(nftTx, "NFTDeListed", {
			owner: accounts[1]
		});
	});

	it("should transfer token owned by accounts[1] to LoanableNFT contract again", async function() {
		const transferTx = await NFT.methods
			.transferFrom(accounts[1], LoanableNFT.options.address, nftIDAccount1)
			.send({
				from: accounts[1],
				gas: 6000000
			});
		assert.eventEmitted(transferTx, "Transfer", {
			from: accounts[1]
		});
		assert.strictEqual(
			(await NFT.methods.ownerOf(nftIDAccount1).call()) ===
			LoanableNFT.options.address,
			true,
			"Token not owned by contract"
		);
	});
	it("should list token owned by account[1] again", async function() {
		const nftTx = await LoanableNFT.methods
			.listNFT(
				nftIDAccount1,
				new bigNumber(100).multipliedBy(10e8).toFixed(0),
				30,
				NFT.options.address
			)
			.send({
				from: accounts[1],
				gas: 6000000
			});
		assert.eventEmitted(nftTx, "NFTListed", {
			owner: LoanableNFT.options.address,
		});
	});
	it("should transfer token owned by accounts[2] to LoanableNFT contract", async function() {
		const transferTx = await NFT.methods
			.transferFrom(accounts[2], LoanableNFT.options.address, nftIDAccount2)
			.send({
				from: accounts[2],
				gas: 6000000
			});
		assert.eventEmitted(transferTx, "Transfer", {
			from: accounts[2]
		});
		assert.strictEqual(
			(await NFT.methods.ownerOf(nftIDAccount2).call()) ===
			LoanableNFT.options.address,
			true,
			"Token not owned by contract"
		);
	});
	it("should list token owned by account[2]", async function() {
		const nftTx = await LoanableNFT.methods
			.listNFT(
				nftIDAccount2,
				new bigNumber(100).multipliedBy(10e8).toFixed(0),
				30,
				NFT.options.address
			)
			.send({
				from: accounts[2],
				gas: 6000000
			});
		assert.eventEmitted(nftTx, "NFTListed", {
			owner: LoanableNFT.options.address,
		});
	});
	it("accounts[2] should approve DAI of NFT value to LoanableNFT contract", async function() {
		const allowanceTx = await DAI.methods
			.approve(
				LoanableNFT.options.address,
				new bigNumber(100).multipliedBy(10e8).toFixed(0)
			)
			.send({
				from: accounts[2],
				gas: 6000000
			});
		assert.strictEqual(
			new bigNumber(
				await DAI.methods
				.allowance(accounts[2], LoanableNFT.options.address)
				.call()
			).isGreaterThanOrEqualTo(new bigNumber(100).multipliedBy(10e8)),
			true,
			"Allowance not approved"
		);
		assert.eventEmitted(allowanceTx, "Approval", {
			owner: accounts[2]
		});

	});
	it("accounts[2] should borrow account[1] NFT", async function() {
		const nftTx = await LoanableNFT.methods
			.borrowNFT(nftIDAccount1, 10)
			.send({
				from: accounts[2],
				gas: 6000000
			});
		assert.eventEmitted(nftTx, "NFTMovement", {
			owner: accounts[2]
		});
	});


	it("should withdraw accounts[1] cost with yield from the alchemist", async function() {
		var position = await Alchemist.methods.positions(accounts[1], yDAI.options.address).call({
			from: accounts[1],
			gas: 6000000
		})
		const withdrawTx = await Alchemist.methods.withdraw(yDAI.options.address, position.shares, accounts[1]).send({
			from: accounts[1],
			gas: 6000000
		})
		console.log("withdrawTx: ", withdrawTx.events.Withdraw.returnValues)
		assert.eventEmitted(withdrawTx, "Withdraw", {
			owner: accounts[1],
		});
		await increaseTime(ONE_DAY_IN_SECONDS * 9);
	})
	it("accounts[2] should return accounts[1] NFT", async function() {

		await NFT.methods
			.approve(LoanableNFT.options.address, nftIDAccount1)
			.send({
				from: accounts[2],
				gas: 6000000
			});
		const nftTx = await LoanableNFT.methods
			.returnNFT(nftIDAccount1)
			.send({
				from: accounts[2],
				gas: 6000000
			});
		assert.eventEmitted(nftTx, "NFTMovement", {
			owner: LoanableNFT.options.address
		});
	});
	it("accounts[3] should approve DAI of NFT value to LoanableNFT contract", async function() {
		const allowanceTx = await DAI.methods
			.approve(
				LoanableNFT.options.address,
				new bigNumber(100).multipliedBy(10e8).toFixed(0)
			)
			.send({
				from: accounts[3],
				gas: 6000000
			});
		assert.strictEqual(
			new bigNumber(
				await DAI.methods
				.allowance(accounts[3], LoanableNFT.options.address)
				.call()
			).isGreaterThanOrEqualTo(new bigNumber(100).multipliedBy(10e8)),
			true,
			"Allowance not approved"
		);
		assert.eventEmitted(allowanceTx, "Approval", {
			owner: accounts[3]
		});

	});
	it("accounts[3] should borrow account[2] NFT", async function() {
		const nftTx = await LoanableNFT.methods
			.borrowNFT(nftIDAccount2, 10)
			.send({
				from: accounts[3],
				gas: 6000000
			});
		assert.eventEmitted(nftTx, "NFTMovement", {
			owner: accounts[3]
		});
		await increaseTime(ONE_DAY_IN_SECONDS * 11);
	});
	it("accounts[3] should return account[2] NFT after due date and fail", async function() {
		await NFT.methods
			.approve(LoanableNFT.options.address, nftIDAccount2)
			.send({
				from: accounts[3],
				gas: 6000000
			});
		await assert.reverts(LoanableNFT.methods
			.returnNFT(nftIDAccount2), {
				from: accounts[3],
				gas: 6000000
			},
			'Returned error: Returned error: VM Exception while processing transaction: revert Cannot return NFT lease duration exceeded');
	});
	it("accounts[3] should return account[2] NFT after due date and fail", async function() {
		await LoanableNFT.methods
			.resetOwnership(nftIDAccount2)
			.send({
				from: accounts[3],
				gas: 6000000
			});
		const tokenExists = await LoanableNFT.methods
			.getNFTDetails(nftIDAccount2)
			.call({
				from: accounts[3],
				gas: 6000000
			});
            console.log("tokenExists: ",tokenExists)
		assert.strictEqual(tokenExists['4'], false, "Token listing not reset")
	})
});