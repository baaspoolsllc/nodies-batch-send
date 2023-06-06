import * as fs from 'fs';
import * as readline from 'readline';

import {JsonRpcProvider} from "@pokt-foundation/pocketjs-provider";
import {KeyManager} from "@pokt-foundation/pocketjs-signer";
import {TransactionBuilder} from "@pokt-foundation/pocketjs-transaction-builder";


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function main() {
    const keyfilePath = await askQuestion('Enter your wallet key file path (wallet.json): ');
    const walletPassPhrase = await askQuestion('Enter your wallet passphrase: ');
    const receiverFilePath = await askQuestion('Enter the file path to read from (CSV format): ');
    const amount = await askQuestion('Enter the amount to send to each receiver (POKT): ');
    const rpcProviderUrl = await askQuestion('Enter your POKT RPC Provider URL: ');

    if (!isValidFilePath(keyfilePath)) {
        console.error('Invalid wallet key file path or file does not exist!');
        rl.close();
        return;
    }

    if (!isValidPassphrase(walletPassPhrase)) {
        console.error('Invalid wallet passphrase!');
        rl.close();
        return;
    }

    if (!isValidFilePath(receiverFilePath)) {
        console.error('Invalid file path or file does not exist!');
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

    const receiverData = fs.readFileSync(receiverFilePath, 'utf-8');
    const receiverAddresses = receiverData.split('\n').map(line => line.trim());

    if (!isValidCsv(receiverAddresses)) {
        console.error('malformed addresses csv');
        rl.close();
        return;
    }

    // Instantiate a provider for querying information on the chain!
    const provider = new JsonRpcProvider({
        rpcUrl: rpcProviderUrl,
        dispatchers: [rpcProviderUrl],
    });

    const walletData = fs.readFileSync(keyfilePath, 'utf-8');


    const signer = await KeyManager.fromPPK({
        password: walletPassPhrase,
        ppk: walletData,
    });
    const transactionBuilder = new TransactionBuilder({
        provider,
        signer,
        chainID: "localnet",
    });

    const responses: {
        address: string,
        response: string
    }[] = []
    // Intentionally send out each one by one, we won't do parallel to avoid overloading RPC node.
    for (const addr of receiverAddresses) {
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
    fs.writeFileSync(`${new Date().toISOString().split('T')[0]}-results.csv`, csvContent, 'utf-8');
}

function askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

function convertToCSV(data: any[]): string {
    const header = Object.keys(data[0]);
    const rows = data.map((obj) => Object.values(obj));
    return [header, ...rows].map((row) => row.join(',')).join('\n');
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
        console.error('malformed addreses.csv');
        rl.close();
        return;
    }
    const invalidAddresses = receiverAddresses.slice(1).filter(address => address.length !== 20);
    if (invalidAddresses.length > 0) {
        console.error('Invalid addresses:', invalidAddresses);
        rl.close();
        return;
    }

    if(receiverAddresses.slice(1).length > 1000) {
        console.error('Avoid batch sending to more than 1K to avoid overloading blocks, wait another 15 minutes and try another 10000');
        rl.close();
    }
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
