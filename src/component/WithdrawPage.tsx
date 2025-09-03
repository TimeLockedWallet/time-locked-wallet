import { formatTime, fromTimestamp } from "../functions/clock";
import "./styles/WithdrawPage.css";

const listDeposit = [
	{
		unlock_time: 1756740600,
		token_symbol: "SOL",
		amount: "12.21321",
	},
	{
		unlock_time: 1756740600,
		token_symbol: "USDC",
		amount: "12.21321",
	},
];

function WithdrawPage() {
	return (
		<div className="withdraw-page">
			{listDeposit.map((itemd) => (
				<div className="item-deposit">
					<div className="unlock-time">{"Unlock time: " + formatTime(fromTimestamp(itemd.unlock_time)) + " (GMT +7)"}</div>
					<div>{"Token amount: " + itemd.amount + " " + itemd.token_symbol}</div>
				</div>
			))}
		</div>
	);
}

export default WithdrawPage;
