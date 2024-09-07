const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Specify the fully qualified contract name
    const ContractFactory = await ethers.getContractFactory("contracts/DynamicContract.sol:DynamicContract");

    // Deploy the contract
    const contract = await ContractFactory.deploy();
    await contract.deployed();

    console.log("Contract deployed to:", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
