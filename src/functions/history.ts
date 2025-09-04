export function addAction(walletAddress: string, action: string, txHash: string) {
  const stored: any = localStorage.getItem('history');
  let newHistory = stored ? JSON.parse(stored) : [];
  newHistory = [{ walletAddress: walletAddress, action: action, txHash: txHash }, ...newHistory];
  localStorage.setItem('history', JSON.stringify(newHistory));
}