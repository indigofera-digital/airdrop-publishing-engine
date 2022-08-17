const path = require('path');
const fs = require('fs');
const solc = require('solc');
const Handlebars = require("handlebars");
const Web3 = require('web3');


function compile(contractName, airdropType) {

    // read base contract template by airdrop type
    const contractBasePath = path.resolve(__dirname, `../contracts/${airdropType}Base.sol.t`);
    const contractTemplate = fs.readFileSync(contractBasePath, 'utf8');
    const template = Handlebars.compile(contractTemplate);
    const contractSource = template({ name: contractName });

    const contractFile = `${contractName}.sol`;
    const contractPath = path.resolve(__dirname, `../contracts/${contractFile}`);

    fs.writeFile(contractPath, contractSource, err => {});
    
    const input = {
        language: 'Solidity',
        sources: {
            // sources
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };
    input.sources[contractFile] = {content: contractSource};

    // Compile the contract
    const compileResult = JSON.parse(solc.compile(JSON.stringify(input)));
    const contractResult = compileResult.contracts[contractFile][contractName];

    return contractResult;
}

async function deploy(bytecode, abi, chainURL, privateKey) {
    const web3 = new Web3(chainURL);
    const web3Contract = new web3.eth.Contract(abi);
  
    const deployment = web3Contract.deploy({
      data: bytecode,
    //   arguments: [5], // arguments for the constructor
    });
  
    const transaction = await web3.eth.accounts.signTransaction(
      {
        data: deployment.encodeABI(),
        gas: await deployment.estimateGas(),
      },
      privateKey
    );
  
    const response = await web3.eth.sendSignedTransaction(transaction.rawTransaction);
    // console.log("transaction response ", response);    

    return response.contractAddress;
};


async function deployProcess(contractData, chain, privateKey) {

    const contractName = contractData.name;
    const airdropType = contractData.type;

    // compile contract
    const compiledContract = await compile(contractName, airdropType);

    const bytecode = compiledContract.evm.bytecode.object;
    const abi = compiledContract.abi;

    // deploy contract
    const contractAddress = await deploy(bytecode, abi, chain, privateKey);
    console.log(`Contract deployed at address: ${contractAddress}`);

    const contract = {
        abi: abi,
        contractAddress: contractAddress
    }

    return contract;
}

module.exports = {
    deploy: deployProcess,
}