import {
  Connection,
  PublicKey,
  clusterApiUrl
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getAccount
} from "@solana/spl-token";

const symbol_to_address: any = {
  SOL: "native",
  USDC: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
}

export async function getUSDCBalance(symbol: string, walletAddress: string) {
  try {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const owner = new PublicKey(walletAddress);

    const address_mint = symbol_to_address[symbol];

    if (address_mint === "native") {
      const lamports = await connection.getBalance(owner);

      const sol = lamports / 1e9;
      console.log(`Số dư SOL: ${sol}`);
      return sol;
    }

    const USDC_MINT = new PublicKey(address_mint);

    const ata = await getAssociatedTokenAddress(USDC_MINT, owner);

    const accountInfo = await getAccount(connection, ata);

    const balance = Number(accountInfo.amount) / 10 ** 6;

    console.log(`Số dư ${symbol}: ${balance}`);
    return balance;
  } catch (err) {
    console.log(err);
    return 0;
  }
}

getUSDCBalance("USDC", "9TAgkYtubwrDEPxipPgw7uxY6MtZNbDFtwG1r64Cm9wZ");
