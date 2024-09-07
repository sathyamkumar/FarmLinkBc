require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();  // Load environment variables

module.exports = {
  solidity: "0.8.18",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/0c83e87772424739996ba9790d389595`, // Use the INFURA_URL from the .env file
      accounts: [`0xc91157ba20bf90c020414fb53f136d818bf731c013d05b6d342cd5bdd5d872c8`] // Use the PRIVATE_KEY from the .env file
    }
  },
  etherscan: {
    apiKey: `0c83e87772424739996ba9790d389595` // Use the ETHERSCAN_API_KEY from the .env file
  }
};
