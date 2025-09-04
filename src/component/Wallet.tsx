import "./styles/Wallet.css";
import { useEffect } from "react";
import * as imgs from "../images/index";
import { useDispatch, useSelector } from "react-redux";
import { changePublicKey } from "../redux/slices/walletSlice";

function Wallet() {
	const walletAddress = useSelector((state: any) => state.wallet.publicKey);
	const dispatch = useDispatch();

	const getProvider = () => {
		if ("phantom" in window) {
			const provider = (window.phantom as any).solana;
			if (provider?.isPhantom) {
				return provider;
			}
		}
		window.open("https://phantom.app/", "_blank");
	};

	const connectWallet = async () => {
		const provider = getProvider();
		await provider
			.connect({ onlyIfTrusted: true })
			.then(({ publicKey }: any) => {
				dispatch(changePublicKey(publicKey.toString()));
			})
			.catch(() => {
				dispatch(changePublicKey("connect wallet"));
			});
	};

	useEffect(() => {
		connectWallet();

		const provider = getProvider();

		provider.on("connect", () => console.log("Wallet connected"));
		provider.on("disconnect", () => console.log("Wallet disconnected"));
		provider.on("accountChanged", (publicKey: any) => {
			if (publicKey) {
				dispatch(changePublicKey(publicKey.toString()));
			} else {
				dispatch(changePublicKey("connect wallet"));
			}
		});
	}, []);

	const disconnectWallet = async () => {
		const provider = getProvider();

		try {
			await provider.disconnect();
			dispatch(changePublicKey("connect wallet"));
		} catch (err) {
			console.error("Disconnect failed", err);
		}
	};

	return (
		<div className="wallet">
			{walletAddress === "connect wallet" ? (
				<button className="connect-wallet" onClick={connectWallet}>
					Connect Wallet
				</button>
			) : (
				walletAddress !== "" && (
					<div className="connected-wallet">
						<div className="choose-chain">
							<div>Solana Devnet</div>
							<img src={imgs["extend"]} style={{ height: "15px" }} />
						</div>
						<div className="account-address">
							<img className="wallet-logo" alt="phantom_logo" src={imgs.phantom_logo} />
							{String(walletAddress).slice(0, 4) + ".." + String(walletAddress).slice(-4)}
						</div>
						<button
							className="disconnect"
							onClick={disconnectWallet}
							onMouseEnter={() => {
								(document.querySelector(".disconnect") as any).style["background-color"] = "red";
							}}
							onMouseLeave={() => {
								(document.querySelector(".disconnect") as any).style["background-color"] = "#1e243e";
							}}
						>
							Disconnect
						</button>
					</div>
				)
			)}
		</div>
	);
}

export default Wallet;
