

# Nodies Batch Send Script

This script allows you to send a specified amount of POKT tokens to multiple receiver addresses using the Pocket Network JSON-RPC provider. The receiver addresses are read from a CSV file, and the script sends the specified amount to each address one by one.

* Note: Use on your own risk. We aren't responsible for any lost of funds using this script.
## Usage

1. Clone this repository or download it.

2. Have Typescript and NPM/Yarn installed

3. Fill out `addresses.csv` in `input` folder with the addresses you'd like to send to

4. Add  `wallet.json` in `input` folder. This is the wallet generated from https://wallet.pokt.network and the wallet you'll be sending out of.

5. Run the script

   ```shell
   npm install && npm run build && npm run start
   ```

6. Follow the prompts to enter the necessary information such as the amount in `uPokt`, and POKT RPC provider URL to broadcast the TX to the mempool. If you need a RPC provider url, let us know and we can provide you one our private ones.

## Script Description
1. The script will ask for a confirmation based off your inputs.

2. Then it will send the specified amount to each receiver address and display the response or error for each transaction.

3. Finally it will save the results in a CSV file with the format `output/{CURRENT_DATE}-results.csv`, containing the columns "address" and "response" of the transaction.

## Example output after running the script
```sh
Enter your wallet passphrase: {redacted}
Enter the uPokt amount to send each receiver. [Note this is not POKT amount]: 10000
Enter your POKT RPC Provider URL: http://localhost:8084
You are sending 10000 uPOKT each to 8 addresses.
With http://localhost:8084 as your RPC provider url

Does this seem correct? Confirm by typing yes: yes
Attempting to send to:  91305d2b8239856e4e58c7b99bf5ad7bb20e10cf
Attempting to send to:  be8c16b0be0a58b0bb03e1c117eac8a51e2f416f
Attempting to send to:  059f8248ac50b73131d007e48f3140ac8865ee2e
Attempting to send to:  ef2a3620925d5e150bfad1f8364e5ed6c33a14ae
Attempting to send to:  01468b89038197ce4cb5392a33bfe5ea0bbf9d92
Attempting to send to:  7d6372e0d49d097a50c5c27b87f1fd92d84325fe
Attempting to send to:  967d90ffc0d3a9b27235660f60fbc2556aa91be8
Attempting to send to:  4d3a62e6b0377c5e88ad9c19fc5aa7b770e17ca5
Results saved to /home/blade/poktjs-csv-sender/output/2023-06-08T05:01:16.048Z-results.csv
```
## Dependencies

This script utilizes the following npm packages:

- `@pokt-foundation/pocketjs-provider`: JSON-RPC provider for interacting with the Pocket Network.
- `@pokt-foundation/pocketjs-signer`: KeyManager for wallet passphrase and private key management.
- `@pokt-foundation/pocketjs-transaction-builder`: TransactionBuilder for constructing and submitting transactions.
