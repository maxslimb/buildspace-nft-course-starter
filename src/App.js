import React, { useEffect, useState } from "react";
import './styles/App.css';
import { ethers } from "ethers";
import twitterLogo from './assets/twitter-logo.svg';
import loader from './assets/loader.gif';
import myEpicNft from './utils/MyEpicNFT.json';

const TWITTER_HANDLE = 'Kishan';
const TWITTER_LINK = 'https://twitter.com/maxslimb';
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/class-of-2022-qpdb1irrjr';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0xF036C1546CcD4E61ca3535b12FdF0AeB5297B6dC";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [currenttxn, setCurrenttxn] = useState("false");
  const [TotalNftSold, setTotalNftSold] = useState(0);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      TotalNftMintedSofar();
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  }

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask! Extension");
        return;
      }

      /*
      * Request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Public Address!
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      setupEventListener()
    } catch (error) {
      console.log(error);
    }
    
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
  
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
  
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setCurrenttxn("true")
        console.log("Mining...please wait.")
        await nftTxn.wait();
        setCurrenttxn("false")
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        TotalNftMintedSofar();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const TotalNftMintedSofar = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        await connectedContract.getTotalNFTsMintedSoFar().then((TotalNfts)=>{
          console.log("Total Nfts Sold", TotalNfts.toNumber())
          setTotalNftSold(TotalNfts.toNumber())
        })

       
        //return TotalNfts.toNumber()

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  },[])

 
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Class of 2022 NFT</p>
          <p className="sub-text">
            Unique NFT for the Outgoing Class!
          </p>
          { TotalNftSold === 0 ? <p></p> : 
          (<p className="sub-text">Total Nfts Sold {TotalNftSold}/120</p>)
            }
          {currenttxn === "false" ? (
            <p></p>
          ) : (
            <img src={loader} alt="Loading..." className="loader"></img>
            
          )}
          
          </div>
          <div>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
        </div>
        <a
           href={OPENSEA_LINK}
           target="_blank"
           rel="noreferrer">
            <button  className="opensea-button">🌊 View Collection on OpenSea</button>
        </a>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;