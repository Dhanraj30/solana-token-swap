
const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotent,
  createTransferInstruction,
} = require("@solana/spl-token");
const dotenv = require('dotenv');
  
  dotenv.config();
// Define connection to mainnet-beta
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

// Load private key from environment variable and convert to Uint8Array
const secretKey = new Uint8Array(JSON.parse(process.env.SECRET_KEY));
const wallet = Keypair.fromSecretKey(secretKey);

// Define token mint addresses for SOL and DOGWIFTHAT (replace with your own)
const SOL_TOKEN_MINT_ADDRESS = new PublicKey("So11111111111111111111111111111111111111112");
const DOGWIFTHAT_MINT_ADDRESS = new PublicKey("EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm");

async function checkTokenMintExists(tokenMintAddress) {
  try {
    const accountInfo = await connection.getAccountInfo(tokenMintAddress);
    if (accountInfo) {
      console.log(`Token mint address ${tokenMintAddress.toString()} exists on mainnet-beta.`);
      return true;
    } else {
      console.log(`Token mint address ${tokenMintAddress.toString()} does not exist on mainnet-beta.`);
      return false;
    }
  } catch (error) {
    console.error(`Error checking token mint address ${tokenMintAddress.toString()}:`, error);
    return false;
  }
}

async function getOrCreateTokenAccount(tokenMintAddress, ownerPublicKey) {
  try {
    const associatedTokenAccount = await createAssociatedTokenAccountIdempotent(
      connection,
      wallet,
      tokenMintAddress,
      ownerPublicKey,
      {},
      TOKEN_PROGRAM_ID
    );
    console.log(`Associated token account created at: ${associatedTokenAccount.toString()}`);
    return associatedTokenAccount;
  } catch (error) {
    console.error(`Error creating token account for ${tokenMintAddress.toString()}:`, error);
    throw error;
  }
}

async function swapTokens(sendingTokenMint, receivingTokenMint, amount) {
  // Check if both token mint addresses exist on mainnet-beta
  const sendingTokenMintExists = await checkTokenMintExists(sendingTokenMint);
  const receivingTokenMintExists = await checkTokenMintExists(receivingTokenMint);

  if (!sendingTokenMintExists || !receivingTokenMintExists) {
    console.log("One or both token mint addresses do not exist on mainnet-beta. Cannot proceed with swap.");
    return;
  }

  // Get or create token accounts for sending and receiving tokens
  const sendingTokenAccount = await getOrCreateTokenAccount(sendingTokenMint, wallet.publicKey);
  const receivingTokenAccount = await getOrCreateTokenAccount(receivingTokenMint, wallet.publicKey);

  // Create and send transaction to swap tokens
  const transaction = new Transaction().add(
    createTransferInstruction(
      sendingTokenAccount,
      receivingTokenAccount,
      wallet.publicKey,
      amount,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  try {
    await sendAndConfirmTransaction(connection, transaction, [wallet]);
    console.log("Swap successful!");
  } catch (error) {
    console.error("Error swapping tokens:", error);
  }
}

(async () => {
  try {
    // Swap example: swapping 1000000 of sending token (equivalent to 1 token if 6 decimal places) with receiving token
    await swapTokens(SOL_TOKEN_MINT_ADDRESS, DOGWIFTHAT_MINT_ADDRESS, 1000000);
  } catch (error) {
    console.error("Error swapping tokens:", error);
  }
})();
