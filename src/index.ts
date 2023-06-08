import * as fs from 'fs';
import * as readline from 'readline';

import {JsonRpcProvider} from "@pokt-foundation/pocketjs-provider";
import {KeyManager} from "@pokt-foundation/pocketjs-signer";
import {ChainID, TransactionBuilder} from "@pokt-foundation/pocketjs-transaction-builder";
import * as Path from "path";


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const keyFilePath = Path.join(__dirname, "../input/wallet.json")
const addressesFilePath = Path.join(__dirname, "../input/addresses-template.csv")

async function main() {
    const walletPassPhrase = await askQuestion('Enter your wallet passphrase: ');
    const amount = await askQuestion('Enter the uPokt amount to send each receiver. [Note this is not POKT amount]: ');
    const rpcProviderUrl = await askQuestion('Enter your POKT RPC Provider URL: ');

    if (!isValidFilePath(keyFilePath)) {
        console.error('Could not find wallet.json in input folder');
        rl.close();
        return;
    }

    if (!isValidPassphrase(walletPassPhrase)) {
        console.error('Invalid wallet passphrase!');
        rl.close();
        return;
    }

    if (!isValidFilePath(addressesFilePath)) {
        console.error('Could not find addresses-template.csv in input folder');
        rl.close();
        return;
    }

    if (!isValidAmount(amount)) {
        console.error('Invalid amount!');
        rl.close();
        return;
    }

    if (!isValidUrl(rpcProviderUrl)) {
        console.error('Invalid RPC Provider URL!');
        rl.close();
        return;
    }

    const receiverData = fs.readFileSync(addressesFilePath, 'utf-8');
    const receiverAddressesFile = receiverData.split('\n').map(line => line.trim());

    if (!isValidCsv(receiverAddressesFile)) {
        console.error('malformed addresses csv');
        rl.close();
        return;
    }

    const receiverAddresses = receiverAddressesFile.slice(1)


    console.log(`You are sending ${amount} uPOKT each to ${receiverAddresses.length} addresses.`)
    console.log(`With ${rpcProviderUrl} as your RPC provider url`)
    console.log('')

    const confirm = await askQuestion(`Does this seem correct? Confirm by typing yes: `)

    if(!["y", "yes"].includes(confirm)) {
        console.log(`User confirmation failed, user answered with ${confirm}`)
        rl.close()
        return;
    }


    // Instantiate a provider for querying information on the chain!
    const provider = new JsonRpcProvider({
        rpcUrl: rpcProviderUrl,
        dispatchers: [rpcProviderUrl],
    });

    // Init Wallet/Signer
    const walletData = fs.readFileSync(keyFilePath, 'utf-8');
    const signer = await KeyManager.fromPPK({
        password: walletPassPhrase,
        ppk: walletData,
    });

    // Create TB
    const transactionBuilder = new TransactionBuilder({
        provider,
        signer,
        chainID: process.env.chainId as ChainID || "mainnet"
    });

    // Responses to save for output file
    const responses: {
        address: string,
        response: string
    }[] = []

    // Send logic
    for (const addr of receiverAddresses) {

        console.log("Attempting to send to: ", addr)
        // Intentionally send out each one by one, we won't do parallel to avoid overloading RPC node.
        const sendMsg = transactionBuilder.send({
                toAddress: addr.toLowerCase(),
                amount,
            }
        );
        try {
            const response = await transactionBuilder.submit({
                memo: "Nodies Batch Send Script",
                txMsg: sendMsg,
            });
            responses.push({address: addr, response: response.txHash})
        } catch (e) {
            responses.push({address: addr, response: `ERROR: ${JSON.stringify(e)}`})
        }
    }

    // Create the csv file for output
    let csvContent = 'address,response\n';
    for (const { address, response } of responses) {
        csvContent += `${address},${response}\n`;
    }
    const outputFileName = `${new Date().toISOString()}-results.csv`
    const outputPath = Path.join(__dirname, "../", "output", outputFileName)
    fs.writeFileSync(outputPath, csvContent, 'utf-8');
    console.log(`Results saved to ${outputPath}`)
    rl.close()
}

function askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}
function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

function isValidFilePath(filePath: string): boolean {
    try {
        fs.accessSync(filePath);
        return true;
    } catch (error) {
        return false;
    }
}

function isValidCsv(receiverAddresses: string[]): boolean {
    const header = receiverAddresses[0];
    if (header != "address") {
        console.error('malformed addreses.csv header');
        return false;
    }
    const invalidAddresses = receiverAddresses.slice(1).filter(address => address.length !== 40);
    if (invalidAddresses.length > 0) {
        console.error('Invalid addresses:', invalidAddresses);
        return false;
    }
    if(receiverAddresses.slice(1).length > 1000) {
        console.error('Avoid batch sending to more than 1K to avoid overloading blocks, wait another 15 minutes and try another 10000');
        return false
    }
    return true
}

function isValidPassphrase(passphrase: string): boolean {
    return passphrase.length > 0;
}

function isValidAmount(amount: string): boolean {
    // Add your amount validation logic here
    // Example: Numeric check, minimum/maximum value, etc.
    const parsedAmount = parseFloat(amount);
    return !isNaN(parsedAmount) && parsedAmount > 0;
}

main().catch((error) => {
    console.error('An error occurred:', error);
    rl.close();
});
