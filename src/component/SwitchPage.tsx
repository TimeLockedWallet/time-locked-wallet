import "./styles/SwitchPage.css";
import { useLocation } from "react-router-dom";

function SwitchPage() {
	const location = useLocation();

	return (
		<div className="switch-page">
			<div className="page-item" onClick={() => (window.location.href = "/deposit")} style={{ color: location.pathname.search("deposit") !== -1 ? "#AFC4DA" : "#5B678B" }}>
				Deposit
			</div>
			<div style={{ color: "#5B678B" }}>|</div>
			<div className="page-item" onClick={() => (window.location.href = "/withdraw")} style={{ color: location.pathname.search("withdraw") !== -1 ? "#AFC4DA" : "#5B678B" }}>
				Withdraw
			</div>
			<div style={{ color: "#5B678B" }}>|</div>
			<div className="page-item" onClick={() => (window.location.href = "/history")} style={{ color: location.pathname.search("history") !== -1 ? "#AFC4DA" : "#5B678B" }}>
				History
			</div>
		</div>
	);
}

export default SwitchPage;
