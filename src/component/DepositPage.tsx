import "./styles/DepositPage.css";
import * as imgs from "../images/index";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUSDCBalance } from "../functions/getTokenBalance";

const symbols = ["SOL", "USDC"];
const symbol_to_name_img: any = {
	SOL: "solana_logo",
	USDC: "usdc_logo",
};

function DepositPage() {
	const walletAddress = useSelector((state: any) => state.wallet.publicKey);

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

	const setMaxBalance = async () => {
		const el = document.querySelector(".choose-amount");
		if (!el) return;
		let newValue = tokenBalance.toString();
		for (let i = 0; i < newValue.length; i++) {
			await sleep(80);
			(el as any).value = newValue.slice(0, i + 1);
		}
	};

	const updateBalanceToken = async () => {
		setTokenBalance(await getUSDCBalance(tokenSymbol, walletAddress));
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
	}, []);

	return (
		<div className="deposit-page">
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

			<div className="deposit-button">Deposit</div>
		</div>
	);
}

export default DepositPage;
