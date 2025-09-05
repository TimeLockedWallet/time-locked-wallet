import { formatTime, fromTimestamp } from "./clock";

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { TimeLockedWallet } from "../target/types/time_locked_wallet";
import { PublicKey } from "@solana/web3.js"; import idl from "../target/idl/time_locked_wallet.json";
import { BN } from "bn.js";

export const getInfoUser = async (provider: any) => {
  try {
    if (!(window as any).phantom?.solana?.publicKey) return;
    let program: Program<TimeLockedWallet>;
    let authority: any;
    let vaultPda: PublicKey;
    const VAULT_SEED = "VAULT";
    anchor.setProvider(provider);
    program = new Program(idl as any, provider);
    authority = provider.wallet as any;
    [vaultPda] = PublicKey.findProgramAddressSync([Buffer.from(VAULT_SEED), authority.publicKey.toBuffer()], program.programId);
    const info = await program.account.vault.fetch(vaultPda);
    console.log(info);

    const div = info.amount.div(new BN(info.isSol ? 1e9 : 1e6)).toString();
    const mod = info.amount.mod(new BN(info.isSol ? 1e9 : 1e6)).toString();

    const unlock_time = Number(info.unlockTimestamp);
    const format_time = formatTime(fromTimestamp(Number(unlock_time * 1000)));
    const newDInfo = {
      amount: Number(`${div}.${mod}`),
      token_symbol: info.isSol ? "SOL" : "USDC",
      unlock_time: unlock_time,
      format_time: format_time,
    };

    console.log(newDInfo);

    if (newDInfo.amount === 0) return (null);
    return Object(newDInfo);
  } catch (err: any) {
    console.log("get info user error: ", err);
    return null
  }
};