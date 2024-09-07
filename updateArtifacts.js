const fs = require('fs');
const path = require('path');
const { artifacts } = require('hardhat');

async function updateArtifacts() {
  // Directory where compiled contracts are stored
  const artifactsDir = path.join(__dirname, 'artifacts', 'contracts');

  // Directory to which you want to save updated ABI and bytecode
  const outputDir = path.join(__dirname, 'updated_contracts');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Read all contract files from artifacts
  const files = fs.readdirSync(artifactsDir);
  
  for (const file of files) {
    const filePath = path.join(artifactsDir, file);
    const contractData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const contractName = contractData.contractName;
    const abi = contractData.abi;
    const bytecode = contractData.bytecode;

    // Write ABI and bytecode to separate files
    fs.writeFileSync(
      path.join(outputDir, `${contractName}_ABI.json`),
      JSON.stringify(abi, null, 2)
    );

    fs.writeFileSync(
      path.join(outputDir, `${contractName}_Bytecode.txt`),
      bytecode
    );

    console.log(`Updated ABI and Bytecode for contract: ${contractName}`);
  }
}

updateArtifacts()
  .then(() => console.log('Artifacts updated successfully.'))
  .catch(err => console.error('Error updating artifacts:', err));
