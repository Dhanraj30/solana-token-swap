const web3 = require('@solana/web3.js');
const { Jupiter } = require('@jup-ag/core');
const dotenv = require('dotenv');

dotenv.config();
async function swapTokens() {
  const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
  
  
  // Load private key from environment variable and convert to Uint8Array
  const secretKey = new Uint8Array(JSON.parse(process.env.SECRET_KEY));
  const keypair = web3.Keypair.fromSecretKey(secretKey);
  //const keypair = web3.Keypair.generate();
    // Display wallet public key
  console.log(`Using wallet: ${keypair.publicKey.toBase58()}`);

  //console.log("Requesting airdrop for wallet...");
 // await connection.requestAirdrop(keypair.publicKey, web3.LAMPORTS_PER_SOL);


  const inputMint = new web3.PublicKey('So11111111111111111111111111111111111111112'); 
  const outputMint = new web3.PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

  const jupiter = await Jupiter.load({
    connection,
    cluster: 'devnet',
    user: keypair,
  });

  console.log("Fetching routes...");
 
  const { routesInfos } = await jupiter.computeRoutes({
    inputMint,
    outputMint,
    inputAmount: 100000000, 
    slippageBps: 50, 
  });

  if (!routesInfos || routesInfos.length === 0) {
    console.error('No routes found for the specified token swap.');
    return;
  }
  const bestRoute = routesInfos[0];

  console.log("Executing swap...");

  const swapResult = await jupiter.exchange({
    routeInfo: bestRoute,
  });

  if ('error' in swapResult) {
    console.log('Error executing swap:', swapResult.error);
  } else {
    console.log('Swap executed successfully!');
    console.log('Input Token:', swapResult.inputAddress.toString());
    console.log('Output Token:', swapResult.destinationAddress.toString());
  }
}

swapTokens().catch(console.error);