// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DynamicContract {

    // Contract structure to hold details
    struct ContractDetails {
        uint256 buyer;
        uint256 farmer;
        string contractTerms;  // Terms of the contract (could be IPFS CID)
        uint256 contractValue;

    }

    // Mapping from contract ID to contract details
    mapping(uint256 => ContractDetails) public contracts;
    uint256 public contractCount;

    // Events for contract updates
    event ContractCreated(uint256 contractId, uint256 buyer, uint256 farmer, string contractTerms, uint256 contractValue);
   
    // Constructor to initialize the contract with initial values
    constructor(
        uint256 _farmer,
        uint256 _buyer,
        string memory _contractTerms,  // e.g., IPFS CID
        uint256 _contractValue
    ) {
        contractCount = 1;  // Start with contract ID 1
        contracts[contractCount] = ContractDetails({
            buyer: _buyer,
            farmer: _farmer,
            contractTerms: _contractTerms,
            contractValue: _contractValue
        });

        emit ContractCreated(contractCount, _buyer, _farmer, _contractTerms, _contractValue);
    }

    // Function to create a new contract
    function createContract(
        uint256 _farmer,
        uint256 _buyer,
        string memory _contractTerms,  // e.g., IPFS CID
        uint256 _contractValue
    ) public returns (uint256) {
        contractCount++;
        contracts[contractCount] = ContractDetails({
            buyer: _buyer,
            farmer: _farmer,
            contractTerms: _contractTerms,
            contractValue: _contractValue
        });

        emit ContractCreated(contractCount, _buyer, _farmer, _contractTerms, _contractValue);
        return contractCount;
    }

    // Function to get contract details
    function getContractDetails(uint256 _contractId) public view returns (
        uint256 buyer,
        uint256 farmer,
        string memory contractTerms,
        uint256 contractValue
    ) {
        ContractDetails memory contractDetail = contracts[_contractId];
        return (
            contractDetail.buyer,
            contractDetail.farmer,
            contractDetail.contractTerms,
            contractDetail.contractValue
        );
    }
}
