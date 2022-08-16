// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../client/node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
//import "../client/node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";


contract Auction is ERC721 {


    struct elements{
        string name;
        address payable owner;
        address payable bidder;
        uint startprice;
        uint minIncrement;
        uint currentPrice;
        bool status;
    }

    struct nft{
        bool used;
        bool onauction;
        address owner;
        uint id;
    }
    uint public total= 1;


    mapping(string => nft) nftlist; 
    mapping(uint => elements) auctions;



    constructor() ERC721("Abhishek", "CC") {
        // mint("abhi");
        // mint("abcd");
        // add("abhi",10,2,10);
        // add("abcd",20,1,12);
    }

    function mint(string memory _name) public payable{
        
        require(!nftlist[_name].used,"Already Exists");

        nft memory cur;
        cur.owner = msg.sender;
        cur.id = total;
        cur.used = true;

        nftlist[_name] = cur;
        _mint(msg.sender, total);
        total++;
    }

    function get(uint _Id) public view returns(elements memory) {
        
        return auctions[_Id];
    }

    function add(string memory _name,uint _startPrice,uint _minIncrement) public{
        
        require(!nftlist[_name].onauction,"Already an auction exists");
        require(nftlist[_name].owner==msg.sender,"you are not the owner");

        address payable _owner = payable(msg.sender);

        elements memory cur;
        uint _id = nftlist[_name].id;
        cur.name = _name;
        cur.startprice = _startPrice;
        cur.minIncrement = _minIncrement;
        cur.currentPrice = _startPrice;
        cur.owner = _owner;
        cur.status = true;
        cur.bidder = _owner;
        auctions[_id] = cur;
        nftlist[_name].onauction = true;
    }

    function bid(string memory _nft) public payable{
        nft memory nftcur = nftlist[_nft];
        elements memory cur = auctions[nftcur.id];
        uint minamount = cur.currentPrice + cur.minIncrement;
        minamount *= 1000000000000000000;
        require(cur.status,"NA");
        require(msg.value>=minamount, "not enough bid");
        require(msg.sender!=cur.owner,"you are the owner");

        if(cur.bidder!=cur.owner){
            bool check = cur.bidder.send(cur.currentPrice*1000000000000000000);
            if(!check) revert();
        }

        address payable _bidder = payable(msg.sender);
        cur.bidder = _bidder;
        cur.currentPrice = msg.value/(1 ether);

        auctions[nftcur.id] =cur;
    }

    function finalise(string memory _nft) public{
        nft memory nftcur = nftlist[_nft];
        elements memory cur = auctions[nftcur.id];

        require(cur.owner==msg.sender,"not the onwer");
        
        if(cur.bidder!=msg.sender){
            _transfer(cur.owner, cur.bidder, nftcur.id);
            bool check = cur.owner.send(cur.currentPrice*1000000000000000000);
            if(!check) revert();
        }

        cur.status = false;
        nftcur.owner = cur.bidder;
        nftcur.onauction = false;
    
    }

   
}