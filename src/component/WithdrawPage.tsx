import "./styles/WithdrawPage.css";
import { formatTime, fromDuration, fromTimestamp } from "../functions/clock";
import * as imgs from "../images/index";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet, AnchorProvider } from "@coral-xyz/anchor";
import type { TimeLockedWallet } from "../target/types/time_locked_wallet";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import idl from "../target/idl/time_locked_wallet.json";
import { BN } from "bn.js";
import { changeInfo } from "../redux/slices/depositSlice";
import { addAction } from "../functions/history";

function WithdrawPage() {
	const walletAddress = useSelector((state: any) => state.wallet.publicKey);
	const rpcUrl = useSelector((state: any) => state.wallet.rpcUrl);
	const depositInfo = useSelector((state: any) => state.deposit.info);
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);
	const [countDown, setCountDown] = useState(0);

	useEffect(() => {
		setCountDown(Math.floor(Number(Date.now()) / 1000));
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			setCountDown((prev) => {
				return prev > 10 ? prev + 1 : prev;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const getProvider = () => {
		const provider = new AnchorProvider(
			new anchor.web3.Connection(rpcUrl, "confirmed"),
			{
				publicKey: (window as any).phantom?.solana.publicKey,
				signTransaction: (tx: any) => (window as any).phantom?.solana.signTransaction(tx),
				signAllTransactions: (txs: any) => (window as any).phantom?.solana.signAllTransactions(txs),
			} as any,
			{ preflightCommitment: "processed" }
		);
		return provider;
	};

	const withdraw = async () => {
		if (depositInfo === null) {
			alert("Please deposit to withdraw.");
			return;
		}

		if (Number(Date.now()) / 1000 < (depositInfo as any).unlock_time) {
			alert("Current time must be later than unlock time.");
			return;
		}

		setLoading(true);
		try {
			let program: Program<TimeLockedWallet>;
			let provider;
			let authority: Wallet;
			let vaultPda: PublicKey;
			let bankVaultPda: PublicKey;
			let userUsdcAta: PublicKey;
			let bankVaultUsdcAta: PublicKey;

			const VAULT_SEED = "VAULT";
			const BANK_VAULT_SEED = "BANK_VAULT";
			const TOKENS = {
				usdcMint: new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"),
				wsolMint: new PublicKey("So11111111111111111111111111111111111111112"),
			};

			provider = getProvider();
			anchor.setProvider(provider);
			program = new Program(idl as any, provider);
			authority = provider.wallet as any;

			[vaultPda] = PublicKey.findProgramAddressSync([Buffer.from(VAULT_SEED), authority.publicKey.toBuffer()], program.programId);
			[bankVaultPda] = PublicKey.findProgramAddressSync([Buffer.from(BANK_VAULT_SEED), authority.publicKey.toBuffer()], program.programId);
			userUsdcAta = (await getOrCreateAssociatedTokenAccount(provider.connection, authority.payer, TOKENS.usdcMint, authority.publicKey, true)).address;
			bankVaultUsdcAta = await getAssociatedTokenAddress(TOKENS.usdcMint, bankVaultPda, true);

			const ixs: any[] = [];

			const ataInfo = await provider.connection.getAccountInfo(bankVaultUsdcAta);
			if (ataInfo === null) {
				const ix = createAssociatedTokenAccountInstruction(authority.publicKey, bankVaultUsdcAta, bankVaultPda, TOKENS.usdcMint);
				ixs.push(ix);
			}

			const withdrawIx = await program.methods
				.withdraw()
				.accountsPartial({
					vault: vaultPda,
					bankVault: bankVaultPda,
					bankVaultTokenAta: bankVaultUsdcAta,
					recipientTokenAta: userUsdcAta,
					owner: authority.publicKey,
					tokenMint: TOKENS.usdcMint,
					associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
					systemProgram: SystemProgram.programId,
				})
				.instruction();
			ixs.push(withdrawIx);

			const tx = new Transaction().add(...ixs);
			tx.feePayer = authority.publicKey;
			tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;

			const signed = await (window as any).solana.signTransaction(tx);
			const sig = await provider.connection.sendRawTransaction(signed.serialize());
			const result = await provider.connection.confirmTransaction(sig);

			console.log("initializeLock done, tx:", sig);

			if (result.value.err === null) {
				addAction(walletAddress, `Withdraw ${depositInfo.amount} ${depositInfo.token_symbol}`, String(sig));
				alert("Transaction successful!");
			} else {
				console.error("Transaction failed:", result.value.err);
				alert("Transaction failed!");
			}
		} catch (err: any) {
			console.log("Deposit error: ", err);
			if (String(err).search("rejected") !== -1) alert("Transaction rejected!");
		}
		setLoading(false);
		dispatch(changeInfo(null));
	};

	return (
		<div className="withdraw-page">
			<div className="wrap-info">
				{depositInfo === null ? (
					<div style={{ marginLeft: "120px" }}>Please deposit to withdraw.</div>
				) : (
					<>
						<div className="col-1">
							<div>Unlock time:</div>
							<div>Token amount deposit:</div>
							<div>Countdown:</div>
						</div>
						<div className="col-2">
							<div>{(depositInfo as any).format_time + " (GMT +7)"}</div>
							<div>{(depositInfo as any).amount + " " + (depositInfo as any).token_symbol}</div>
							<div>{fromDuration((depositInfo as any).unlock_time - countDown)}</div>
						</div>
					</>
				)}
			</div>
			<div className="withdraw-button" onClick={withdraw}>
				{!loading && <div>Withdraw</div>}
				{loading && <img style={{ height: "25px" }} src={(imgs as any)["loading"]} />}
			</div>
		</div>
	);
}

export default WithdrawPage;
