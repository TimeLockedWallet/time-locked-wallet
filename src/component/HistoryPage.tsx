import "./styles/HistoryPage.css";
import { useEffect, useState } from "react";
import * as imgs from "../images/index";
import { useSelector } from "react-redux";

function HistoryPage() {
	const walletAddress = useSelector((state: any) => state.wallet.publicKey);
	const [history, setHistory] = useState([]);

	useEffect(() => {
		const stored = localStorage.getItem("history");
		setHistory(stored ? JSON.parse(stored) : []);
	}, []);

	const clickItem = (txHash: string) => {
		window.open(`https://solscan.io/tx/${txHash}?cluster=devnet`, "_blank");
	};

	return (
		<div className="history-page">
			{history
				.filter((item: any) => {
					return item.walletAddress === walletAddress;
				})
				.map((item: any) => (
					<div className="history-item" onClick={() => clickItem(item.txHash)}>
						<img className="token-logo" src={(imgs as any)[item.action.search("SOL") !== -1 ? "solana_logo" : "usdc_logo"]} />
						<div className="col-1">
							<div>Action:</div>
							<div>TxHash:</div>
						</div>
						<div className="col-2">
							<div style={{ color: String(item.action).search("Deposit") !== -1 ? "red" : "green" }}>{item.action}</div>
							<div>{String(item.txHash).slice(0, 5) + "..." + String(item.txHash).slice(-5)}</div>
						</div>
					</div>
				))}
		</div>
	);
}

export default HistoryPage;
