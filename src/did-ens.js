#!/usr/bin/env node
const { ethers } = require("ethers")
const INFURA_PID = ""
const chainNameOrId = 1 // mainnet
const provider = new ethers.InfuraProvider(chainNameOrId, INFURA_PID);
const providerConfig = { networks: [
    { name: "mainnet", provider: provider } 
 ], rpcUrl: 'https://mainnet.infura.io/v3/' + INFURA_PID, registry: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b' }

const ensName = "nick.eth"
const doc = resolveENSDID(providerConfig, ensName)

async function resolveENSDID(providerConfig, ensName){
    var did = require('did-resolver');
    var ethr = require('ens-did-resolver')
    const ensDidResolver = ethr.getResolver(providerConfig)
    const didResolver = new did.Resolver(ensDidResolver)
    var did = "did:ens:" + ensName
    /*didResolver.resolve(did).then(
        (doc) => console.log(doc)
    )*/
    const doc = await didResolver.resolve(did)
    console.log(JSON.stringify(doc))
    console.log(isValidDIDDocument(doc.didDocument))
    return doc;
    
}

function isValidDIDDocument(didDocument) {
    // Check if 'id' field exists and is a string
    if (!didDocument.id || typeof didDocument.id !== 'string') {
    console.log("missing id")
      return false;
    }  
    // Check if 'service' field exists and is an array
    if (!Array.isArray(didDocument.service)) {
    console.log("missing service")
      return false;
    }  
    // Check if 'verificationMethod' field exists and is an array
    if (!Array.isArray(didDocument.verificationMethod)) {
        console.log("missing verification method") 
      return false;
    }  
    // Check if 'authentication' field exists and is an array
    if (!Array.isArray(didDocument.authentication)) {
        console.log("authentication")
      return false;
    }  
    // Additional checks can be added here based on your specific requirements
      return true;
  }