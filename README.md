

# Nodies Batch Send Script

This script allows you to send a specified amount of POKT tokens to multiple receiver addresses using the Pocket Network JSON-RPC provider. The receiver addresses are read from a CSV file, and the script sends the specified amount to each address one by one.

## Usage

1. Clone this repository or copy the script file to your local environment.

2. Install the required dependencies using npm:

   ```shell
   npm install
   ```

3. Run the script:

   ```shell
   node script.js
   ```

4. Follow the prompts to enter the necessary information, including the wallet key file path, passphrase, receiver file path, amount, and POKT RPC provider URL.

5. The script will send the specified amount to each receiver address and display the response or error for each transaction.

6. The script will save the results in a CSV file with the format `{CURRENT_DATE}-results.csv`, containing the columns "address" and "response".

7. After the script finishes executing, you can find the results in the generated CSV file.

## Dependencies

This script utilizes the following npm packages:

- `@pokt-foundation/pocketjs-provider`: JSON-RPC provider for interacting with the Pocket Network.
- `@pokt-foundation/pocketjs-signer`: KeyManager for wallet passphrase and private key management.
- `@pokt-foundation/pocketjs-transaction-builder`: TransactionBuilder for constructing and submitting transactions.
