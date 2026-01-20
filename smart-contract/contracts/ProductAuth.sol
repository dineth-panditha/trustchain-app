// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ProductAuth {
    address public admin;
    uint256 public totalProducts;
    uint256 public totalScans;
    uint256 public totalReports;

    struct Product {
        string name;
        string manufacturer;
        string imageHash;
        uint256 timestamp;
        address currentOwner;
        uint256 scanCount;
        bool isRegistered;
        bool isSold;
    }

    mapping(string => Product) private products;
    mapping(string => address[]) private ownershipHistory;
    mapping(address => string[]) private userProducts;

    event ProductRegistered(string serial, string name, address manufacturer);
    event OwnershipTransferred(string serial, address from, address to);
    event ProductVerified(string serial, address scanner);
    event FakeReported(string serial, string location);

    constructor() {
        admin = msg.sender;
    }

 
    function registerProduct(
        string memory _serial, 
        string memory _name, 
        string memory _manufacturer,
        string memory _imageHash
    ) public {
        require(!products[_serial].isRegistered, "Already registered");
        
        products[_serial] = Product({
            name: _name,
            manufacturer: _manufacturer,
            imageHash: _imageHash,
            timestamp: block.timestamp,
            currentOwner: msg.sender,
            scanCount: 0,
            isRegistered: true,
            isSold: false
        });

        ownershipHistory[_serial].push(msg.sender);
        
      

        totalProducts++;
        emit ProductRegistered(_serial, _name, msg.sender);
    }

    function verifyProduct(string memory _serial) public returns (Product memory) {
        if(products[_serial].isRegistered) {
            products[_serial].scanCount++;
            totalScans++;
            emit ProductVerified(_serial, msg.sender);
        }
        return products[_serial];
    }

    
    function claimOwnership(string memory _serial) public {
        require(products[_serial].isRegistered, "Product not found");
        require(!products[_serial].isSold, "Already claimed");

        address previousOwner = products[_serial].currentOwner;
        products[_serial].currentOwner = msg.sender;
        products[_serial].isSold = true;
        
        ownershipHistory[_serial].push(msg.sender);
        
       
        userProducts[msg.sender].push(_serial);

        emit OwnershipTransferred(_serial, previousOwner, msg.sender);
    }

    function reportFake(string memory _serial, string memory _location) public {
        totalReports++;
        emit FakeReported(_serial, _location);
    }

    function getUserProducts(address _user) public view returns (string[] memory) {
        return userProducts[_user];
    }

    function getOwnershipHistory(string memory _serial) public view returns (address[] memory) {
        return ownershipHistory[_serial];
    }
}