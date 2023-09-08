const ethers = require('ethers');
const contentHash = require('content-hash');
const INFERA_KEY = "";
const PRIVATE_KEY = "";
RESOLVER_ADDR = "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63";

// ABI for the ContentHashResolver contract
// You can get the full ABI from Etherscan
const resolverABI = [
  "function setContenthash(bytes32 node, bytes calldata hash) external",
  // ... other function signatures you may need
];

async function updateEnsContentHash(ensName, key, content) {
    // Connect to the Ethereum network
    try{
        const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/' + INFERA_KEY);
        // Initialize a wallet from a private key and connect it to the provider
        const wallet = new ethers.Wallet(key, provider);
        // The address of the ENS resolver contract
        const resolverAddress = RESOLVER_ADDR; // Replace with the actual resolver contract address
        // Initialize a contract object
        const resolverContract = await new ethers.Contract(resolverAddress, resolverABI, wallet);
        console.debug(resolverContract)
        // Send the transaction to update the content hash
        //const tx = await resolverContract.setContenthash(namehash, contentHash);
        const tx = await setContenthashWithResolver(ensName, content, resolverContract);
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log(`Transaction hash: ${receipt.transactionHash}`);
        return true;
    }
    catch(err){
        console.log(err)
        return false;
    }
}
async function setContenthashWithResolver(
    name,
    content,
    resolverContract,
  ) {
    let encodedContenthash = content
    if (parseInt(content, 16) !== 0) {
      encodedContenthash = encodeContenthash(content);
    }

    return resolverContract.setContenthash(ethers.namehash(name), encodedContenthash);
}

function encodeContenthash(text) {
  let content, contentType
  let encoded = false
  if (!!text) {
    let matched =
      text.match(/^(ipfs|ipns|bzz|onion|onion3):\/\/(.*)/) ||
      text.match(/\/(ipfs)\/(.*)/) ||
      text.match(/\/(ipns)\/(.*)/)
    if (matched) {
      contentType = matched[1]
      content = matched[2]
    }
    console.debug(content)
    console.debug(contentType)
    try {
      if (contentType === 'ipfs') {
        if (content.length >= 4) {
          encoded = '0x' + contentHash.encode('ipfs-ns', content)
          console.debug(encoded)
        }
      } else if (contentType === 'ipns') {
        let bs58content = bs58.encode(
          Buffer.concat([
            Buffer.from([0, content.length]),
            Buffer.from(content),
          ])
        )
        encoded = '0x' + contentHash.encode('ipns-ns', bs58content)
      } else if (contentType === 'bzz') {
        if (content.length >= 4) {
          encoded = '0x' + contentHash.fromSwarm(content)
        }
      } else if (contentType === 'onion') {
        if (content.length == 16) {
          encoded = '0x' + contentHash.encode('onion', content)
        }
      } else if (contentType === 'onion3') {
        if (content.length == 56) {
          encoded = '0x' + contentHash.encode('onion3', content)
        }
      } else {
        console.warn('Unsupported protocol or invalid value', {
          contentType,
          text,
        })
      }
    } catch (err) {
      console.warn('Error encoding content hash', { text, encoded })
      //throw 'Error encoding content hash'
    }
  }
  return encoded
}

async function getEnsAddressandContentHash(ensName) {
 try{
      const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/' + INFERA_KEY);
      // Resolve the ENS name to get the EnsResolver instance
      const ensResolver = await ethers.EnsResolver.fromName(provider, ensName);

        if (ensResolver) {
            // Get the Ethereum address associated with the ENS name
            var address = await ensResolver.getAddress();
            var content = await ensResolver.getContentHash();
            return { address, content }; // Return as an object

        } else {
            return null;
            console.log(`No resolver found for ${ensName}`);
        }
    }
    catch(e){
        console.debug(e)
        return null;
    }
    
}

// Calling function
async function main() {
  ensName = "fhirfly.eth"
  const result = await getEnsAddressandContentHash(ensName);
  if (result) {
    ensAddress = result.address;
    console.log(`Address: ${result.address}`);
    ensContentHash = result.content;
    console.log(`Content Hash: ${result.content}`);
    updateEnsContentHash(ensName, privatekey, ensContentHash)
  } else {
    console.log(`Could not resolve ${ensName}`);
  } 
}

main();

