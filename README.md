# WhaleSwap

A basic Automated Market Maker (AMM) designed to implement the Time Weighted Average Market Maker (TWAMM) capability set out by Paradigm in their 07/28/2021 paper: https://www.paradigm.xyz/2021/07/twamm

## Background

A basic AMM is a series of pairs of tokens, X and Y, that represent pools of user-provided liquidity in order to allow for the decentralised trading of cryptocurrencies. Currently, a 'constant product' AMM calculates the return from swapping a single unit of X as the size of the Y pool over the size of the X pool. This means that for every additional unit of X that is swapped, the price shifts slightly in the favour of Y (Y becomes worth more relative to X) as the size of the Y pool decreases and the size of the X pool increases. Therefore, if a user wants to swap some quantity of X that is relatively large compared to the size of the pools (5%+) they will experience a negatively impacted return in Y of several percentage points. For example, if pool X has 1000 tokens and pool Y has 2000 tokens, a single unit of X is worth 2 units of Y. However, after having made this swap, the size of pool X will be 1001 and the size of pool Y will be 1998. Therefore, for the next unit of X the user wants to swap, the amount of Y returned will be 1998/1001 which is less than the original return of 2. Although the impact in this scenario is small, it gets exponentially larger as the amount of X swapped increases relative to the pool sizes. Going back to the original pool sizes of 1000 and 2000, if a user wants to swap 100 units of X, the ideal return at the original market price would be 200. However, with a basic AMM the user would instead receive about 182 units of Y which is a price impact of about 9%.
To combat this, the intention of TWAMM is to split up large transactions over some period of time measured in blocks on the chain. Like this, assuming arbitrageurs intermittently come and correct the pool sizes when the price shifts away from the market rate, the return on the large transaction should be the equivalent of the sum of the smaller transactions, each trading for the original 1:2 price.
Although a user is theoretically able to split up these transactions manually, not only does it take time and effort but the user will have to pay gas fees on each individual transaction. Instead, WhaleSwap allows users to submit a large swap to the pair and either cancel the transaction at any point or withdraw the returns from their swap at the end of the time period they submit - all while only paying gas fees for the handful of relevant requests they make.
The way WhaleSwap does this is by holding the amount to be swapped in a virtual sub-pool associated with the pair. By accumulating all the time-weighted transactions in progress, it will update the main pool sizes whenever necessary in order to simulate the process of making incremental swaps on each block. Like this, the effect of the swaps on the price happens gradually and allows arbitrageurs to come and correct the price so that the long term transactions are never trading at a price that is significantly worse than the market rate. When the user then decides to withdraw the proceeds from their long term order, the tokens are moved to the relevant wallets in a single transaction at a price equal to the average price offered by the trading pair over that period. Therefore, the user only pays gas on this transaction all the while being protected from detrimental price fluctuation and even malicious sandwich attacks. Read more about the TWAMM process in the Paradigm paper.

## How to set up and run WhaleSwap

### 1. Install Packages

Run the command 'npm install' in both the route directory, 'whaleswapmvp', and the client directory, 'whaleswapmvp/client'.

### 2. Set up a local blockchain to run the contracts

The user can use whichever localhost blockchain they prefer. You only need to change the code on line 26 of 'whaleswap/client/index.js' to specify which port it's running on.
Personally, I use Ganache, the development blockchain software offered by the truffle suite. This runs on port '7545'. After setting index.js to run on this port, simply open up the Ganache app on your computer and quickstart an EVM. It's probably best to save the workspace you use in Ganache so that you don't have to re-migrate the contracts every time you run it.
You can also use the truffle CLI with the command 'truffle develop' in the route directory and that should set up a less visual but still functioning local blockchain that runs on port 9545.

### 3. Compile and migrate contracts

This will depend on whatever blockchain software you decided to use in step 2. For Ganache, simply open up the whaleswap route directory in your terminal and run 'truffle compile' and then 'truffle migrate'. If you use the built-in truffle blockchain, after entering 'truffle develop' just run 'compile' and then 'migrate'.

### 4. MetaMask

We have been using metamask to connect our frontend to the local blockchain. First, add the network to MetaMask by clicking on the network dropdown in the MM UI (will probably have 'Ethereum Mainnet' as default). Click 'Add Network' and fill in the necessary fields. Using Ganache as an example:
Network Name: Whatever you want to call the network
New RPC URL: The RPC server your blockchain runs on. For Ganache, it's probably 'HTTP://127.0.0.1:7545' but you can copy paste it from the horizontal information bar in the Ganache UI under 'RPC Server:'.
Chain ID: For Ganache, it's 1337
Currency Symbol: Doesn't matter, I put Eth
Block Explorer URL: Can leave blank

After you have connected to the relevant network, you can add a user account. To do this, click on the multicoloured, circular icon in the top right of the MetaMask UI. Click, 'Import Account' and enter the private key for whichever wallet you want to use. For Ganache, click on the key icon for the first account in the list and copy/paste the private key.

### 5. Run the frontend

Run the command 'npm start' in the command line in the client directory and open localhost:3000 in chrome (assuming that's where you have the MetaMask add-on and are logged into it).

### 6. Explaining the UI and how to use it

The homepage contains some summary info about the user. It also shows information about the two dummy tokens that are included in this repo for demonstration purposes. It should show the address of each contract on your local chain as well as the name, symbol, supply, creator's balance etc.
Below the token information there should be a section called Factory information. The factory is the name of the contract that creates instances of the pair contract that dicatates the behaviour of any swapping pair the user wishes to create. To create a pair, enter the addresses of the two demonstration tokens and their corresponding names.
Doing this should create a list of active pairs below the factory information. Clicking on an element in this list should navigate the user to a new page with information specific to that pair.
Here, the user should be able to see the size of the pools of each token as well add liquidity to these pools if the current user currently owns sufficient quantities of each token.
Adding liquidity should change the pool size information as well as the number of Liquidity Provider (LP) tokens the user owns that represent the size of their stake in the pool.
Below this information, the user has the ability to perform either an Instand Swap or a Long Term Swap. The difference being an additional field requiring the user to dictate how many blocks they wish to split their transaction over.
Entering amounts into these fields should result in a pop up with information regarding the expected return from the swap as well as the price impact. As well as this, the user has the ability to enter the public address of where they would like the returns to be deposited. This functionality exists so that the original/creator wallet has the ability to easily deposit tokens into other wallets on the chain to better allow for the simulation of multiple users.
