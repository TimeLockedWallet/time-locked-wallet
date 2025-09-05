import "./styles/DepositPage.css";
import * as imgs from "../images/index";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUSDCBalance } from "../functions/getTokenBalance";

import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet, AnchorProvider } from "@coral-xyz/anchor";
import type { TimeLockedWallet } from "../target/types/time_locked_wallet";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { BN } from "bn.js";
import idl from "../target/idl/time_locked_wallet.json";
import { fromTimestamp, toTimestamp } from "../functions/clock";
import { changeInfo } from "../redux/slices/depositSlice";
import { getInfoUser } from "../functions/getInfoUser";
import { addAction } from "../functions/history";
import { BigNumber } from "bignumber.js";

const symbols = ["SOL", "USDC"];
const symbol_to_name_img: any = {
	SOL: "solana_logo",
	USDC: "usdc_logo",
};
const symbol_to_lamports: any = {
	SOL: 1_000_000_000,
	USDC: 1_000_000,
};

function DepositPage() {
	const walletAddress = useSelector((state: any) => state.wallet.publicKey);
	const rpcUrl = useSelector((state: any) => state.wallet.rpcUrl);
	const depositInfo = useSelector((state: any) => state.deposit.info);
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);
	const [tokenSymbol, setTokenSymbol] = useState("SOL");
	const [showListToken, setShowListToken] = useState(false);
	const [tokenBalance, setTokenBalance] = useState(-1);

	const [year, setYear] = useState<number | "">("");
	const [month, setMonth] = useState<number | "">("");
	const [day, setDay] = useState<number | "">("");

	const [hour, setHour] = useState<number | "">("");
	const [minute, setMinute] = useState<number | "">("");
	const [second, setSecond] = useState<number | "">("");

	const getDaysInMonth = (year: number, month: number) => {
		return new Date(year, month, 0).getDate();
	};

	const years = Array.from({ length: 100 }, (_, i) => 2000 + i);

	const months = Array.from({ length: 12 }, (_, i) => i + 1);

	const days = year && month ? Array.from({ length: getDaysInMonth(Number(year), Number(month)) }, (_, i) => i + 1) : [];

	const hours = Array.from({ length: 24 }, (_, i) => i);
	const minutes = Array.from({ length: 60 }, (_, i) => i);
	const seconds = Array.from({ length: 60 }, (_, i) => i);

	const sleep = (ms: number) => {
		return new Promise((resolve) => setTimeout(resolve, ms));
	};

	useEffect(() => {
		const el = document.querySelector(".choose-amount");
		if (el) (el as any).value = "";
		updateBalanceToken();
	}, [walletAddress, tokenSymbol]);

	useEffect(() => {
		const elListToken = document.querySelector(".list-token");

		document.addEventListener("click", function (event: any) {
			if (showListToken && !elListToken?.contains(event.target)) {
				setShowListToken(false);
			}
		});

		const dataTime = fromTimestamp(Number(Date.now()));
		setYear(dataTime.year);
		setMonth(dataTime.month);
		setDay(dataTime.day);
		setHour(dataTime.hour);
		setMinute(dataTime.minute);
		setSecond(dataTime.second);
	}, []);

	const setMaxBalance = async () => {
		const el = document.querySelector(".choose-amount");
		if (!el) return;
		let newValue = BigNumber(tokenBalance).minus(BigNumber(0.00098)).toString();
		for (let i = 0; i < newValue.length; i++) {
			await sleep(80);
			(el as any).value = newValue.slice(0, i + 1);
		}
	};

	const updateBalanceToken = async () => {
		setTokenBalance(await getUSDCBalance(tokenSymbol, walletAddress));
	};

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

	const initializeLock = async () => {
		if (!(depositInfo === null)) {
			alert("Please withdraw to continue depositing.");
			return;
		}

		if (year === "" || month === "" || day === "" || hour === "" || minute === "" || second === "") {
			alert("Invalid unlock time.");
			return;
		}

		const el = document.querySelector(".choose-amount");
		const amountInput = (el as any).value;
		if (amountInput === "" || isNaN(Number(amountInput))) {
			alert("Invalid amount token.");
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
			const TOKENS: any = {
				USDC: new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"),
				SOL: new PublicKey("So11111111111111111111111111111111111111112"),
			};

			provider = getProvider();
			anchor.setProvider(provider);
			program = new Program(idl as any, provider);
			authority = provider.wallet as any;

			[vaultPda] = PublicKey.findProgramAddressSync([Buffer.from(VAULT_SEED), authority.publicKey.toBuffer()], program.programId);
			[bankVaultPda] = PublicKey.findProgramAddressSync([Buffer.from(BANK_VAULT_SEED), authority.publicKey.toBuffer()], program.programId);
			userUsdcAta = (await getOrCreateAssociatedTokenAccount(provider.connection, authority.payer, TOKENS["USDC"], authority.publicKey, true)).address;
			bankVaultUsdcAta = await getAssociatedTokenAddress(TOKENS["USDC"], bankVaultPda, true);

			const ixs: any[] = [];

			const ataInfo = await provider.connection.getAccountInfo(bankVaultUsdcAta);
			if (ataInfo === null) {
				const ix = createAssociatedTokenAccountInstruction(authority.publicKey, bankVaultUsdcAta, bankVaultPda, TOKENS["USDC"]);
				ixs.push(ix);
			}

			const unlockTimestamp = Math.floor(toTimestamp(year, month, day, hour, minute, second) / 1000);
			const isSol = tokenSymbol === "SOL";
			const amount = new BN(Number(amountInput) * symbol_to_lamports[tokenSymbol]);
			const lockIx = await program.methods
				.initializeLock(new BN(unlockTimestamp), authority.publicKey, amount, isSol)
				.accountsPartial({
					vault: vaultPda,
					bankVault: bankVaultPda,
					userTokenAta: userUsdcAta,
					bankVaultTokenAta: bankVaultUsdcAta,
					user: authority.publicKey,
					tokenMint: TOKENS["USDC"],
					associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
					systemProgram: SystemProgram.programId,
				})
				.instruction();
			ixs.push(lockIx);

			const tx = new Transaction().add(...ixs);
			tx.feePayer = authority.publicKey;
			tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;

			const signed = await (window as any).solana.signTransaction(tx);
			const sig = await provider.connection.sendRawTransaction(signed.serialize());
			const result = await provider.connection.confirmTransaction(sig);

			console.log("initializeLock done, tx:", sig);
			console.log(result);

			if (result.value.err === null) {
				addAction(walletAddress, `Deposit ${Number(amountInput)} ${tokenSymbol}`, String(sig));
				alert("Transaction successful!");
			} else {
				console.error("Transaction failed: ", result.value.err);
				alert("Transaction failed!");
			}
		} catch (err: any) {
			console.log("Deposit error: ", err);
			if (String(err).search("rejected") !== -1) alert("Transaction rejected!");
			else alert("Simulated transaction failed!");
		}
		dispatch(changeInfo(await getInfoUser(getProvider())));
		await updateBalanceToken();
		setLoading(false);
	};

	return (
		<div className="deposit-page">
			{!(depositInfo === null) && <div style={{ marginBottom: "30px" }}>Please withdraw to continue depositing.</div>}
			<div className="row-1" style={{ marginBottom: "8px" }}>
				<input className="choose-amount" type="text" placeholder="0.0" />
				<div className="choose-token">
					<div className="selected-token" onClick={() => setShowListToken(!showListToken)}>
						<img className="token-img" alt="token-img" src={(imgs as any)[symbol_to_name_img[tokenSymbol]]} />
						{tokenSymbol}
						<img className="extend-img" alt="extend-img" src={(imgs as any)["extend"]} />
					</div>
					{showListToken && (
						<div className="list-token">
							{symbols.map((symbol) => (
								<div
									className="token-item"
									onClick={() => {
										setTokenSymbol(symbol);
										setShowListToken(false);
									}}
								>
									<img className="token-img" alt="token-img" src={(imgs as any)[symbol_to_name_img[symbol]]} />
									{symbol}
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			<div className="row-2" style={{ marginBottom: "30px" }}>
				<div className="your-balance">Your balance: {tokenBalance}</div>
				<div className="set-max-balance" onClick={setMaxBalance}>
					Max
				</div>
			</div>

			<div style={{ marginBottom: "20px" }}>Choose unlock time (GMT +7)</div>

			<div className="row-3" style={{ marginBottom: "30px" }}>
				<div className="wrap-select">
					<div className="title-select">Year</div>
					<select
						className="choose year"
						value={year}
						onChange={(e) => {
							setYear(Number(e.target.value));
							setMonth("");
							setDay("");
						}}
					>
						<option value=""></option>
						{years.map((y) => (
							<option key={y} value={y}>
								{y}
							</option>
						))}
					</select>
				</div>

				<div className="wrap-select">
					<div className="title-select">Month</div>
					<select
						className="choose month"
						value={month}
						onChange={(e) => {
							setMonth(Number(e.target.value));
							setDay("");
						}}
						disabled={!year}
					>
						<option value=""></option>
						{months.map((m) => (
							<option key={m} value={m}>
								{m}
							</option>
						))}
					</select>
				</div>

				<div className="wrap-select">
					<div className="title-select">Date</div>
					<select className="choose date" value={day} onChange={(e) => setDay(Number(e.target.value))} disabled={!month}>
						<option value=""></option>
						{days.map((d) => (
							<option key={d} value={d}>
								{d}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="row-4" style={{ marginBottom: "30px" }}>
				<div className="wrap-select">
					<div className="title-select">Hour</div>
					<select className="choose hour" value={hour} onChange={(e) => setHour(Number(e.target.value))}>
						<option value=""></option>
						{hours.map((h) => (
							<option key={h} value={h}>
								{h.toString().padStart(2, "0")}
							</option>
						))}
					</select>
				</div>

				<div className="wrap-select">
					<div className="title-select">Minute</div>
					<select className="choose minute" value={minute} onChange={(e) => setMinute(Number(e.target.value))}>
						<option value=""></option>
						{minutes.map((m) => (
							<option key={m} value={m}>
								{m.toString().padStart(2, "0")}
							</option>
						))}
					</select>
				</div>

				<div className="wrap-select">
					<div className="title-select">Second</div>
					<select className="choose second" value={second} onChange={(e) => setSecond(Number(e.target.value))}>
						<option value=""></option>
						{seconds.map((s) => (
							<option key={s} value={s}>
								{s.toString().padStart(2, "0")}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="deposit-button" onClick={initializeLock}>
				{!loading && <div>Deposit</div>}
				{loading && <img style={{ height: "25px" }} src={(imgs as any)["loading"]} />}
			</div>
		</div>
	);
}

export default DepositPage;
