import express from 'express';
import {ethers} from 'ethers';
import {exec} from 'child_process';
import path from 'path';
import multer from 'multer';
import Pinata from '@pinata/sdk';
import fs from 'fs';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import pg from 'pg';
import util from 'util';

  
const { Pool } = pg; // Destructure the Pool class
import axios from 'axios'; 
dotenv.config();

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });

// Middleware to parse JSON requests
app.use(express.json());

// Connect to the Ethereum network
const provider = new ethers.providers.JsonRpcProvider(`https://sepolia.infura.io/v3/0c83e87772424739996ba9790d389595`);

// Import the contract artifact with JSON assertion

const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_farmer",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_buyer",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_contractTerms",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_contractValue",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "contractId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "buyer",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "farmer",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "contractTerms",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "contractValue",
				"type": "uint256"
			}
		],
		"name": "ContractCreated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "contractCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "contracts",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "buyer",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "farmer",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "contractTerms",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "contractValue",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_farmer",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_buyer",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_contractTerms",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_contractValue",
				"type": "uint256"
			}
		],
		"name": "createContract",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_contractId",
				"type": "uint256"
			}
		],
		"name": "getContractDetails",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "buyer",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "farmer",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "contractTerms",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "contractValue",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
const contractBytecode = "608060405234801561000f575f80fd5b506040516110bb3803806110bb8339818101604052810190610031919061026a565b600180819055506040518060800160405280848152602001858152602001838152602001828152505f8060015481526020019081526020015f205f820151815f015560208201518160010155604082015181600201908161009291906104ee565b50606082015181600301559050507f7a907319b337b3afe928ac1b268f1d9c244b9328cf9ac4e7b5638bba6a747e91600154848685856040516100d9959493929190610614565b60405180910390a15050505061066c565b5f604051905090565b5f80fd5b5f80fd5b5f819050919050565b61010d816100fb565b8114610117575f80fd5b50565b5f8151905061012881610104565b92915050565b5f80fd5b5f80fd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b61017c82610136565b810181811067ffffffffffffffff8211171561019b5761019a610146565b5b80604052505050565b5f6101ad6100ea565b90506101b98282610173565b919050565b5f67ffffffffffffffff8211156101d8576101d7610146565b5b6101e182610136565b9050602081019050919050565b8281835e5f83830152505050565b5f61020e610209846101be565b6101a4565b90508281526020810184848401111561022a57610229610132565b5b6102358482856101ee565b509392505050565b5f82601f8301126102515761025061012e565b5b81516102618482602086016101fc565b91505092915050565b5f805f8060808587031215610282576102816100f3565b5b5f61028f8782880161011a565b94505060206102a08782880161011a565b935050604085015167ffffffffffffffff8111156102c1576102c06100f7565b5b6102cd8782880161023d565b92505060606102de8782880161011a565b91505092959194509250565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f600282049050600182168061033857607f821691505b60208210810361034b5761034a6102f4565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026103ad7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610372565b6103b78683610372565b95508019841693508086168417925050509392505050565b5f819050919050565b5f6103f26103ed6103e8846100fb565b6103cf565b6100fb565b9050919050565b5f819050919050565b61040b836103d8565b61041f610417826103f9565b84845461037e565b825550505050565b5f90565b610433610427565b61043e818484610402565b505050565b5b81811015610461576104565f8261042b565b600181019050610444565b5050565b601f8211156104a65761047781610351565b61048084610363565b8101602085101561048f578190505b6104a361049b85610363565b830182610443565b50505b505050565b5f82821c905092915050565b5f6104c65f19846008026104ab565b1980831691505092915050565b5f6104de83836104b7565b9150826002028217905092915050565b6104f7826102ea565b67ffffffffffffffff8111156105105761050f610146565b5b61051a8254610321565b610525828285610465565b5f60209050601f831160018114610556575f8415610544578287015190505b61054e85826104d3565b8655506105b5565b601f19841661056486610351565b5f5b8281101561058b57848901518255600182019150602085019450602081019050610566565b868310156105a857848901516105a4601f8916826104b7565b8355505b6001600288020188555050505b505050505050565b6105c6816100fb565b82525050565b5f82825260208201905092915050565b5f6105e6826102ea565b6105f081856105cc565b93506106008185602086016101ee565b61060981610136565b840191505092915050565b5f60a0820190506106275f8301886105bd565b61063460208301876105bd565b61064160408301866105bd565b818103606083015261065381856105dc565b905061066260808301846105bd565b9695505050505050565b610a42806106795f395ff3fe608060405234801561000f575f80fd5b506004361061004a575f3560e01c8063474da79a1461004e5780634d6d6a9c146100815780638736381a146100b4578063b9a76b9e146100d2575b5f80fd5b610068600480360381019061006391906103be565b610102565b6040516100789493929190610468565b60405180910390f35b61009b600480360381019061009691906103be565b6101b3565b6040516100ab9493929190610468565b60405180910390f35b6100bc6102a6565b6040516100c991906104b2565b60405180910390f35b6100ec60048036038101906100e791906105f7565b6102ac565b6040516100f991906104b2565b60405180910390f35b5f602052805f5260405f205f91509050805f01549080600101549080600201805461012c906106a4565b80601f0160208091040260200160405190810160405280929190818152602001828054610158906106a4565b80156101a35780601f1061017a576101008083540402835291602001916101a3565b820191905f5260205f20905b81548152906001019060200180831161018657829003601f168201915b5050505050908060030154905084565b5f8060605f805f808781526020019081526020015f206040518060800160405290815f8201548152602001600182015481526020016002820180546101f7906106a4565b80601f0160208091040260200160405190810160405280929190818152602001828054610223906106a4565b801561026e5780601f106102455761010080835404028352916020019161026e565b820191905f5260205f20905b81548152906001019060200180831161025157829003601f168201915b505050505081526020016003820154815250509050805f01518160200151826040015183606001519450945094509450509193509193565b60015481565b5f60015f8154809291906102bf90610701565b91905055506040518060800160405280858152602001868152602001848152602001838152505f8060015481526020019081526020015f205f820151815f015560208201518160010155604082015181600201908161031e91906108e5565b50606082015181600301559050507f7a907319b337b3afe928ac1b268f1d9c244b9328cf9ac4e7b5638bba6a747e91600154858786866040516103659594939291906109b4565b60405180910390a16001549050949350505050565b5f604051905090565b5f80fd5b5f80fd5b5f819050919050565b61039d8161038b565b81146103a7575f80fd5b50565b5f813590506103b881610394565b92915050565b5f602082840312156103d3576103d2610383565b5b5f6103e0848285016103aa565b91505092915050565b6103f28161038b565b82525050565b5f81519050919050565b5f82825260208201905092915050565b8281835e5f83830152505050565b5f601f19601f8301169050919050565b5f61043a826103f8565b6104448185610402565b9350610454818560208601610412565b61045d81610420565b840191505092915050565b5f60808201905061047b5f8301876103e9565b61048860208301866103e9565b818103604083015261049a8185610430565b90506104a960608301846103e9565b95945050505050565b5f6020820190506104c55f8301846103e9565b92915050565b5f80fd5b5f80fd5b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b61050982610420565b810181811067ffffffffffffffff82111715610528576105276104d3565b5b80604052505050565b5f61053a61037a565b90506105468282610500565b919050565b5f67ffffffffffffffff821115610565576105646104d3565b5b61056e82610420565b9050602081019050919050565b828183375f83830152505050565b5f61059b6105968461054b565b610531565b9050828152602081018484840111156105b7576105b66104cf565b5b6105c284828561057b565b509392505050565b5f82601f8301126105de576105dd6104cb565b5b81356105ee848260208601610589565b91505092915050565b5f805f806080858703121561060f5761060e610383565b5b5f61061c878288016103aa565b945050602061062d878288016103aa565b935050604085013567ffffffffffffffff81111561064e5761064d610387565b5b61065a878288016105ca565b925050606061066b878288016103aa565b91505092959194509250565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f60028204905060018216806106bb57607f821691505b6020821081036106ce576106cd610677565b5b50919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f61070b8261038b565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361073d5761073c6106d4565b5b600182019050919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026107a47fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610769565b6107ae8683610769565b95508019841693508086168417925050509392505050565b5f819050919050565b5f6107e96107e46107df8461038b565b6107c6565b61038b565b9050919050565b5f819050919050565b610802836107cf565b61081661080e826107f0565b848454610775565b825550505050565b5f90565b61082a61081e565b6108358184846107f9565b505050565b5b818110156108585761084d5f82610822565b60018101905061083b565b5050565b601f82111561089d5761086e81610748565b6108778461075a565b81016020851015610886578190505b61089a6108928561075a565b83018261083a565b50505b505050565b5f82821c905092915050565b5f6108bd5f19846008026108a2565b1980831691505092915050565b5f6108d583836108ae565b9150826002028217905092915050565b6108ee826103f8565b67ffffffffffffffff811115610907576109066104d3565b5b61091182546106a4565b61091c82828561085c565b5f60209050601f83116001811461094d575f841561093b578287015190505b61094585826108ca565b8655506109ac565b601f19841661095b86610748565b5f5b828110156109825784890151825560018201915060208501945060208101905061095d565b8683101561099f578489015161099b601f8916826108ae565b8355505b6001600288020188555050505b505050505050565b5f60a0820190506109c75f8301886103e9565b6109d460208301876103e9565b6109e160408301866103e9565b81810360608301526109f38185610430565b9050610a0260808301846103e9565b969550505050505056fea26469706673582212202af18fad3d383f4737c53b22672a67f278cf5c4fc7c596c3fbe1575a5bb8ffdf64736f6c634300081a0033"
// Initialize Pinata client
const pinata = new Pinata('b796143ccb0c01cf07a3', 'a242b88faa552c3432d9293c3fd6cdda109ab73a91e506ba42638e116efc4066');
console.log('Pinata client created');

// PostgreSQL Pool setup
const pool = new Pool({
    user: 'postgres',
    host: 'junction.proxy.rlwy.net',
    database: 'railway',
    password: 'xxCLZgrenGVFMzOTJUmsbKouowsjohFC',
    port: 46207
});

async function deployContract(buyer_id,farmer_id,contractfileipfs,contract_value,start_date,end_date) {
    const wallet = new ethers.Wallet(`c91157ba20bf90c020414fb53f136d818bf731c013d05b6d342cd5bdd5d872c8`, provider);
    const contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);

    try {
        // Deploy the contract
        const contract = await contractFactory.deploy(
            buyer_id,
            farmer_id,
            contractfileipfs,
            Math.floor(contract_value),

        );
        await contract.deployed();

        console.log("Contract deployed at address:", contract.address);

        
        return contract.address;
    } catch (error) {
        console.error("Error deploying contract:", error);
        throw error;
    }
}




// Upload the file to Pinata
async function uploadToPinata(file) {
    try {
        // Ensure file.path is a readable stream
        const readableStream = fs.createReadStream(file.path);

        // Use pinFileToIPFS which expects a readable stream
        const result = await pinata.pinFileToIPFS(readableStream, {
            pinataMetadata: {
                name: file.originalname // Use the original name of the file
            }
        });

        return result.IpfsHash; // CID
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw error;
    }
}

app.post('/submit_contract', upload.single('contractFile'), async (req, res) => {
    const {  start_date, end_date, contract_value, timestamp, buyer_id, farmer_id, tender_id,status,payment_status } = req.body;
    const contractFile = req.file;

    if ( !start_date || !end_date || !contract_value || !buyer_id || !farmer_id || !timestamp || !contractFile) {
        return res.status(400).json({ error: 'Necessary fields are missing' });
    }

    try {
        // Step 1: Upload file to Pinata
        const cid = await uploadToPinata(contractFile);
        console.log('Pinata CID:', cid);

        // Step 2: Store CID in PostgreSQL
        const insertQuery = 'INSERT INTO contract_contract ( start_date, end_date, contract_value, timestamp, buyer_id, farmer_id, tender_id, contractfileipfs,status,payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10)';
        await pool.query(insertQuery, [start_date, end_date, contract_value, timestamp, buyer_id, farmer_id, tender_id, cid,status,payment_status]);

        // Step 3: Retrieve the farmer's email
        const getFarmerQuery = 'SELECT email FROM accounts_user WHERE id = $1';
        const farmerResult = await pool.query(getFarmerQuery, [farmer_id]);

        if (farmerResult.rows.length === 0) {
            return res.status(404).json({ error: 'Not a valid farmer' });
        }

        const farmerMail = farmerResult.rows[0].email;

        // Step 4: Send an email with the confirmation link
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vijaymano0501@gmail.com', 
                pass: 'mhgl uqjx eyos cxhb'  // Use app-specific password
            }
        });

        const mailOptions = {
            from: 'vijaymano0501@gmail.com',
            to: farmerMail,
            subject: 'Contract Confirmation',
            text: 'Here is your confirmation endpoint URL: http://localhost:3000/confirm_farmer',
            html: '<p>Here is your confirmation endpoint URL: <a href="http://localhost:3000/confirm_farmer">confirm contract</a></p>'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error:', error);
                return res.status(500).json({ error: 'Failed to send email' });
            }
            console.log('Email sent:', info.response);
        });

        res.status(200).json({ message: 'Contract created and email sent' });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to save details' });
    }
});


app.get('/paymentsuccess/:contractId',async(req,res)=>{
    const {contractId}=req.params;
    const getContract = 'SELECT * from contract_contract where id=$1';
    const contractResult = await pool.query(getContract, [contractId]);

    if (contractResult.rows.length === 0) {
        return res.status(404).json({ error: 'Not a valid farmer' });
    }

    const {id,status,payment_status,start_date,end_date,contract_value,timestamp,buyer_id,farmer_id,tender_id,contractfileipfs}=contractResult.rows[0];
    try {
        const contractAddress=await deployContract(buyer_id,farmer_id,contractfileipfs,contract_value,start_date,end_date)
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const postQuery="INSERT INTO contract_contractblockchain (contract_id,blockchainaddress) values($1,$2)";
        const postResult=await pool.query(postQuery,[contractId,contractAddress]);
        if(!postResult)
        {
            return res.status(404).json({error:"failed to upload"});
        }

    } catch (error) {
        console.error("Error fetching contract details:", error);
        res.status(500).json({ error: 'Failed to retrieve contract details' });
    }

})


app.put('/deploy_contract/:contractId', async (req, res) => {
    const { contractId } = req.params;

    try {
        // Step 1: Fetch the contract details from the database using contractId
        const getContractQuery = 'SELECT farmer_id, contract_value, start_date, end_date, contractfileipfs, buyer_id FROM contract_contract WHERE id = $1';
        const contractResult = await pool.query(getContractQuery, [contractId]);

        // Check if the contract exists
        if (contractResult.rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        // Extract the required contract details from the database result
        const { buyer_id, farmer_id, contract_value, start_date, end_date, contractfileipfs } = contractResult.rows[0];

        // Compile the contract using Hardhat
        console.log('Compiling contract...');
        await execPromise('npx hardhat compile');

        // Deploy the contract
        console.log('Deploying contract...');
        const { stdout, stderr } = await execPromise('npx hardhat run scripts/deploy.js --network sepolia');

        if (stderr) {
            console.error(`Error deploying contract: ${stderr}`);
            return res.status(500).json({ error: stderr });
        }

        // Extract the deployed address from stdout
        const deployedAddressMatch = stdout.match(/Contract deployed to: (\w+)/);
        if (!deployedAddressMatch) {
            return res.status(500).json({ error: 'Failed to parse deployment output' });
        }
        const deployedAddress = deployedAddressMatch[1];
        console.log('Contract deployed at address:', deployedAddress);

        // Insert the deployed contract address into the contract_contractblockchain table
        const insertQuery = 'INSERT INTO contract_contractblockchain (contract_id, blockchainaddress) VALUES ($1, $2)';
        await pool.query(insertQuery, [contractId, deployedAddress]);

        // Respond with the deployed contract address
        res.json({ contractAddress: deployedAddress });
    } catch (error) {
        console.error("Error in deployment process:", error);
        res.status(500).json({ error: error.message });
    }
});
app.get('/contracts_data_bc/:contractId', async (req, res) => {
    const { contractId } = req.params;

    try {
        // Query the database for the contract address
        const ContractQuery = "SELECT blockchainaddress FROM contract_contractblockchain WHERE contract_id = $1";
        const result = await pool.query(ContractQuery, [contractId]);

        if (result.rows.length === 0) {
            return res.status(404).send("No address found");
        }

        const contractAddress = result.rows[0].blockchainaddress;

        if (!ethers.utils.isAddress(contractAddress)) {
            return res.status(400).send("Invalid contract address");
        }

        // Set up ethers.js provider and contract instance
        const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/0c83e87772424739996ba9790d389595');
        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        // Fetch contract details from the smart contract
        const [buyer, farmer, contractTerms, contractValue] = await contract.getContractDetails(1);

        // Respond with the contract details
        res.json({
            buyer: buyer.toString(),
            farmer: farmer.toString(),
            contractTerms: contractTerms,
            contractValue: ethers.utils.formatUnits(contractValue, 18) // Adjust decimals as needed
        });
    } catch (error) {
        console.error("Error fetching contract details:", error);
        res.status(500).json({ error: error.message });
    }
});
app.get('/contracts_data/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Step 1: Get the role of the user
        const getRoleQuery = "SELECT role FROM accounts_user WHERE id = $1";
        const roleResult = await pool.query(getRoleQuery, [id]);

        if (roleResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const role = roleResult.rows[0].role;

        // Step 2: Fetch contracts based on role
        if (role === 1) { // Farmer role
            const getFarmerQuery = "SELECT * FROM contract_contract WHERE farmer_id = $1";
            const farmerContracts = await pool.query(getFarmerQuery, [id]);
            return res.status(200).json(farmerContracts.rows);

        } else if (role === 2) { // Buyer role
            const getBuyerQuery = "SELECT * FROM contract_contract WHERE buyer_id = $1";
            const buyerContracts = await pool.query(getBuyerQuery, [id]);
            return res.status(200).json(buyerContracts.rows);

        } else {
            return res.status(400).json({ error: 'Invalid role' });
        }

    } catch (error) {
        console.error("Error fetching contract details:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/contract_data/:cid', async (req, res) => {
    const { cid } = req.params;
    const getQuery = "SELECT * FROM contract_contract WHERE id = $1";
    
    try {
        const details = await pool.query(getQuery, [cid]);
        if (details.rows.length === 0) {
            return res.status(404).json("Details not found");
        }

        const fileCid = details.rows[0].contractfileipfs;
        const fileUrl = `https://gateway.pinata.cloud/ipfs/${fileCid}`;

        // Fetch the file from Pinata Gateway
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const data = response.data;
        const base64File = Buffer.from(data).toString('base64');

        // Include file data with details
        const responseData = {
            details: details.rows[0],
            fileData: base64File,
            fileType: 'base64'  // Specify encoding for clarity
        };

        // Send the combined data as JSON
        res.status(200).json(responseData);
    } catch (error) {
        console.error("Failed to retrieve file or data", error);
        res.status(500).json("Internal Server Error");
    }
});



// New endpoint to retrieve file from IPFS by CID
app.get('/file/:contractId', async (req, res) => {
    const { contractId } = req.params;

    try {
        // Step 1: Fetch CID from PostgreSQL using contractId
        const result = await pool.query('SELECT contractfileIpfs FROM contract_contract WHERE id = $1', [contractId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        const cid = result.rows[0].contractfileipfs;

        if (!cid) {
            console.log(cid)
            return res.status(404).json({ error: 'File CID not found for this contract' });
        }

        // Step 2: Fetch file from Pinata using CID
        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`, {
            responseType: 'stream' // Get the response as a stream
        });

        // Set appropriate headers and send the file
        res.setHeader('Content-Type', response.headers['content-type']);
        res.setHeader('Content-Disposition', `attachment; filename="${cid}"`);
        response.data.pipe(res); // Pipe the file data to the response
    } catch (error) {
        console.error('Error retrieving file from Pinata:', error);
        res.status(500).json({ error: 'Failed to retrieve file from IPFS' });
    }
});


app.listen(process.env.port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
