

# Nodies Batch Send Script

This script allows you to send a specified amount of POKT tokens to multiple receiver addresses using the Pocket Network JSON-RPC provider. The receiver addresses are read from a CSV file, and the script sends the specified amount to each address one by one.

* Note: Use on your own risk. We aren't responsible for any lost of funds using this script.
## Usage

1. Clone this repository or download it.

2. Have Typescript and NPM/Yarn installed

3. Fill out `addresses.csv` in `input` folder with the addresses you'd like to send to

4. Add your wallet PPK to the `input` folder with the specified name `wallet.json`

5. Run the script

   ```shell
   npm install && npm run build && npm run start
   ```

6. Follow the prompts to enter the necessary information such as the amount in `uPokt`, and POKT RPC provider URL.

## Script Description
1. The script will ask for a confirmation based off your inputs.

2. Then it will send the specified amount to each receiver address and display the response or error for each transaction.

3. Finally it will save the results in a CSV file with the format `output/{CURRENT_DATE}-results.csv`, containing the columns "address" and "response" of the transaction.

## Dependencies

This script utilizes the following npm packages:

- `@pokt-foundation/pocketjs-provider`: JSON-RPC provider for interacting with the Pocket Network.
- `@pokt-foundation/pocketjs-signer`: KeyManager for wallet passphrase and private key management.
- `@pokt-foundation/pocketjs-transaction-builder`: TransactionBuilder for constructing and submitting transactions.
