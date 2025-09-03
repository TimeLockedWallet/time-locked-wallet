import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Wallet from "./component/Wallet";
import DepositPage from "./component/DepositPage";
import WithdrawPage from "./component/WithdrawPage";
import SwitchPage from "./component/SwitchPage";

function App() {
	return (
		<div className="App">
			<Router>
				<Routes>
					<Route path="" element={<Navigate to="/deposit" />} />
					<Route path="/deposit" element={<DepositPage />} />
					<Route path="/withdraw" element={<WithdrawPage />} />
				</Routes>
				<SwitchPage />
			</Router>
			<Wallet />
		</div>
	);
}

export default App;
