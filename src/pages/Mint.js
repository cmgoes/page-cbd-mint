import { useState, useEffect } from "react";
import Walletmodel from "../utils/walletmodal.js";

const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const contractABI = require("../cbd.json");
const contractAddress = "0xf78d6e4241303DC4b743A3Ea0ae496c78176a0Eb";
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

export default function Mint() {
  const [walletAddress, setWallet] = useState("");  
  const [tokenNum, setTokenNum] = useState(1);
  const [supply, setSupply] = useState(0);  

  const {web3Loading, getweb3} = Walletmodel ();
  const [web3, setMyWeb3] = useState ();
  async function connectWallet () {
    await getweb3 ().then((response) => {
      setMyWeb3 (response);      
      response.eth.getAccounts().then ((result) => {
        setWallet(result[0]);
        console.log (web3Loading);        
      });
    });
  };

  const mintNFT = async(amount, price, state) => {      
    if (walletAddress === "") {
      return {
        success: false, 
        status: "Please make sure wallet connected!",           
      }
    }  
    else {         
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const _amountOfEther = web3.utils.toWei(web3.utils.toBN(price), 'ether') * web3.utils.toBN(amount) / web3.utils.toBN(100); 
      const gaslimit = 8000 + amount * 2000;
      if (state === true) {
        contract.methods.mintPresale(amount).send({from: walletAddress, gas: gaslimit, value: _amountOfEther})
        .on("confirmation", function () {      
        })
        .on('error', async function (error, receipt) {
          console.log(error);      
        }); 
      } else {
        contract.methods.mint(amount).send({from: walletAddress, gas: 100000 * amount, value: _amountOfEther})
        .on("confirmation", function () {      
        })
        .on('error', async function (error, receipt) {
          console.log(error);      
        }); 
      }    
  
      return {
        status: "",
      }   
    }
  } 

  // const [publicsaledate, setPublicsaledate] = useState(new Date("23 February 2022 03:56:00 UTC").getTime());
  const publicsaledate = new Date("23 February 2022 03:57:00 UTC").getTime();
  const [timerInterval, setTimerInterval] = useState(null);
  const [presaleState, setPresaleState] = useState(false);

  const presalePrice = 8;
  const publicsalePrice = 12;

  const decreaseTokenNumber = () => {
    if (tokenNum === 1) {
      return;
    }
    setTokenNum(tokenNum - 1);
  }  

  useEffect(() => {
    updateTime();
    setTimerInterval(setInterval(updateTime, 1000));
    return () => {
      if (timerInterval !== null) {
        clearInterval(timerInterval);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicsaledate]) 

  const updateTime = () => {
    // console.log(publicsaledate)
    let timeleft = publicsaledate - Date.now();   

    if (timeleft < 0) {
      clearInterval(timerInterval);
      if(presaleState === false) {
        setPresaleState(true);
      } else {
        setPresaleState(false);
      }
      // setPublicsaledate(new Date("13 January 2022 16:00:00 UTC").getTime())
    }
  }  

  useEffect(() => {    
    async function fetchData() {             
      const web3 = createAlchemyWeb3(alchemyKey);
      const contract = new web3.eth.Contract(contractABI, contractAddress); 
      contract.methods.totalSupply().call().then((_supply) => {        
        setSupply(_supply);        
      }).catch((err) => console.log(err))     
    }
    fetchData();
  });

  return (
    <div 
      className="mint-page" 
      style={{backgroundImage: "url('./images/png/bg.jpg')"}}
    >
      <div className="d-flex justify-content-end mint-container">
        <button className="connect" type="button" onClick={connectWallet}>        
          {walletAddress.length > 0 ? (                    
            "" +
            String(walletAddress).substring(0, 6) +
            "..." +
            String(walletAddress).substring(38)
            ) : (
              "Connect"
            )
          } 
        </button>
      </div>
      <div className="mint-assets-content mb-4">
        <img src="/images/png/logo.png" alt="" />
      </div>
      <div className="mint-desc-container">
        <div className="nft-panel">
          <div className="supply">Join CBD Community</div>          
          <div className="supply">{supply} / 5000</div>
          <div className="nft-counter">            
            <div className="counter-symbol counter-minus" onClick={decreaseTokenNumber}></div>
            <div className="amount">{tokenNum}</div>
            {
              presaleState ? [tokenNum < 5 ? <div className="counter-symbol counter-plus" onClick={() => setTokenNum(tokenNum + 1)}></div> : 
              <div className="counter-symbol counter-plus" onClick={() => setTokenNum(tokenNum)}></div>] :                  
              [tokenNum < 20 ? <div className="counter-symbol counter-plus" onClick={() => setTokenNum(tokenNum + 1)}></div> : 
              <div className="counter-symbol counter-plus" onClick={() => setTokenNum(tokenNum)}></div>
            ]}            
          </div>
        </div>
        {
          presaleState ? <h4 className="mb-1">Total {presalePrice * tokenNum / 100} ETH</h4> : 
          <h4 className="mb-1">Total {publicsalePrice * tokenNum / 100} ETH</h4>
        }  
        {presaleState ? <button type="button" onClick={() => {mintNFT(tokenNum, presalePrice, presaleState)}}>Mint</button> : 
          <button type="button" disabled onClick={() => {mintNFT(tokenNum, presalePrice, presaleState)}}>Mint</button>
        }         
      </div>
    </div>
  )
}