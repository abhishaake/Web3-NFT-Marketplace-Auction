import React, { useState, useEffect } from "react";
import Auction from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";
import 'bootstrap/dist/css/bootstrap.min.css';

import "./App.css";

const App = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState("");
  
  const [name, setname] = useState("");
  
  const [startprice, setprice] = useState(0);
  const [minincr, setincr] = useState(0);

  const [amount, setamount] = useState(0);

  const [auctions, setauctions] = useState([]);

  const mint = () => {
    contract.methods.mint(name).send({ from: account}, (error)=>{
      console.log("it worked")
      if(!error){
        setname("");
      }
    });
  }
// String(mintText.name),mintText.startprice,mintText.minincr,mintText.deadline
  const add = () => {
    contract.methods.add(name,startprice,minincr).send({from: account}, (error)=>{
      if(!error){
          //let temp = [mintText.name,mintText.startprice,mintText.minincr,mintText.deadline];
          var st = true;
          setauctions(auctions => [...auctions,{name,account,account,startprice,minincr,startprice,st}])
          setname("");
          setprice(0);  
          setincr(0);
      }
    });
  }
  const bid = () => {
    let am = amount*1000000000000000000;
    contract.methods.bid(name).send({from: account, value: am}, (error)=>{
      if(!error){
        
          setname("");
          setamount(0);
      }
    });
  }
  
  const finalise = () => {
    contract.methods.finalise(name).send({from : account}, (error)=>{
      if(!error){
        setname("");
      }
    });
  }
  const loadNFTS = async (contract) => {
    const totalSupply = await contract.methods.total().call();
    console.log(totalSupply);
    console.log("trying again");
    let results = [];
    for(let i = 1; i < totalSupply; i++){
     // console.log("reached");
     
      let coder = await contract.methods.get(i).call();
      if(!coder.status) continue;
      results.push(coder);
      
    }
    setauctions(results);
  }

  const loadWeb3Account = async (web3) =>{
    const accounts = await web3.eth.getAccounts();
    if(accounts){
      setAccount(accounts[0]);
    }
  }

  const loadWeb3Contract = async (web3) => {
    const networkId = await web3.eth.net.getId();
    const networkData = Auction.networks[networkId];
    if(networkData){
      const abi = Auction.abi;
      const address = networkData.address;
      const contract = new web3.eth.Contract(abi, address);
      setContract(contract);
      return contract;
    }
  }

  useEffect(async ()=>{
    const web3 = await getWeb3();
    await loadWeb3Account(web3);
    const contract = await loadWeb3Contract(web3);
    await loadNFTS(contract);
  }, [])

  return (
  <div>
    <nav className="navbar navbar-light bg-light px-4">
      <a className="navbar-brand" >Auction</a>
      <span>{account}</span>
    </nav>
    <div className="container-fluid mt-5">
      <div className="row">
        <div className="col">
            Mint your NFT
            <div>
              <input type="text" value={name} onChange={(e)=>setname(e.target.value)} className="form-control mb-2" placeholder="Enter name of NFT" />
              <button onClick={mint}  className="btn btn-primary"> Mint </button>
            </div>
        </div>
      </div>
    </div>
    <div className="container-fluid mt-5">
      <div className="row">
        <div className="col d-flex flex-column align-items-center">
          <img className="mb-4" src="https://avatars.dicebear.com/api/pixel-art/naz.svg" alt="" width="72"/>
          <h1 className="display-5 fw-bold">Auction</h1>
          <div className="col-6 text-center mb-3" >
            <p className="lead text-center">Auction Your NFTs</p>
            <div>
              Name: <input 
                type="text"
                value={name}
                onChange={(e)=>setname(e.target.value)}
                className="form-control mb-2"
                placeholder="Type the name of NFT" />
                Start Price: <input 
                  type="number"
                  value={startprice}
                  onChange={(e)=>setprice( e.target.value)}
                  className="form-control mb-2"
                  placeholder="Enter the Starting auction Price"
                />
                Minimum Increment: <input 
                type="number"
                value={minincr}
                onChange={(e)=>setincr( e.target.value)}
                className="form-control mb-2"
                placeholder="Enter the minimum Increment"/>
                
              <button onClick = {add} className="btn btn-primary">ADD</button>
            </div>
          </div>
          <div className="col-8 d-flex justify-content-center flex-wrap ">
            {auctions.map((auction, key)=><div className="d-flex flex-column align-items-center border" key={key}>
                  {/* <img width="150" src={`https://avatars.dicebear.com/api/pixel-art/${coder.replace("#", "")}.svg`} /> */}
                  <span>Name: {auction.name}</span>
                  <br />
                  <span>Start Price: {auction.startPrice}</span>
                  <br />
                  <span>NFT Owner: {auction.owner}</span>
                  <br />
                  <span>Highest Bidder: {auction.bidder}</span>

                  <br />
                  <span>Auction Price: {auction.currentPrice}</span>
                  <br />
                  <div>
                    <input type="number" 
                    value={amount}
                    onChange={(e)=>{
                      setamount(e.target.value)
                      setname(auction.name)}
                    }
                    className="form-control mb-2"
                    placeholder="e.g. Naz"/>

                    <button className="btn btn-primary" onClick = {bid}> Bid </button>
                  </div>
                  <div>
                    <input 
                    type="text"
                    value={name}
                    onChange={(e)=>setname(e.target.value)}
                    className="form-control mb-2"
                    placeholder="Type the name of NFT" />

                    <button className="btn btn-primary" 
                    onClick={finalise}> 
                    Finalise 
                    </button>
                  </div>
            </div>)}
          </div>
        </div>
      </div>
    </div>
  </div>);
};

export default App;
