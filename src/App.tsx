import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Wallet from "./component/Wallet";
import DepositPage from "./component/DepositPage";
import WithdrawPage from "./component/WithdrawPage";
import SwitchPage from "./component/SwitchPage";

import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import type { TimeLockedWallet } from "./target/types/time_locked_wallet";
import { PublicKey } from "@solana/web3.js";
import idl from "./target/idl/time_locked_wallet.json";
import { BN } from "bn.js";
import { useDispatch, useSelector } from "react-redux";
import { formatTime, fromTimestamp } from "./functions/clock";
import { changeInfo } from "./redux/slices/depositSlice";
import { useEffect } from "react";
import HistoryPage from "./component/HistoryPage";

function App() {
	const walletAddress = useSelector((state: any) => state.wallet.publicKey);
	const rpcUrl = useSelector((state: any) => state.wallet.rpcUrl);
	const dispatch = useDispatch();

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

	const getInfoUser = async () => {
		if (!(window as any).phantom?.solana?.publicKey) return;
		try {
			let program: Program<TimeLockedWallet>;
			let provider;
			let authority: any;
			let vaultPda: PublicKey;
			const VAULT_SEED = "VAULT";
			provider = getProvider();
			anchor.setProvider(provider);
			program = new Program(idl as any, provider);
			authority = provider.wallet as any;
			[vaultPda] = PublicKey.findProgramAddressSync([Buffer.from(VAULT_SEED), authority.publicKey.toBuffer()], program.programId);
			const info = await program.account.vault.fetch(vaultPda);
			console.log("Vault info: ", info);

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

			if (newDInfo.amount === 0) dispatch(changeInfo(null));
			else dispatch(changeInfo(newDInfo));
		} catch (err: any) {
			dispatch(changeInfo(null));
		}
	};

	useEffect(() => {
		const provider = (window as any).phantom?.solana;
		if (!provider) return;

		const handleConnect = () => {
			getInfoUser();
		};

		if (provider.isConnected && provider.publicKey) {
			handleConnect();
		} else {
			provider.on("connect", handleConnect);
		}

		return () => {
			provider?.off("connect", handleConnect);
		};
	}, [walletAddress]);

	return (
		<div className="App">
			<Router>
				<Routes>
					<Route path="" element={<Navigate to="/deposit" />} />
					<Route path="/deposit" element={<DepositPage />} />
					<Route path="/withdraw" element={<WithdrawPage />} />
					<Route path="/history" element={<HistoryPage />} />
				</Routes>
				<SwitchPage />
			</Router>
			<Wallet />
		</div>
	);
}

export default App;
