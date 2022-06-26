const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3333;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const ALCHEMY_KEY = "I6PvO1JSZbIo7EOR1CKbwpkQK1xKVTxN";

const web3 = createAlchemyWeb3(
  `https://eth-mainnet.alchemyapi.io/${ALCHEMY_KEY}`
);

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

const PRIVATE_KEY =
  "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d";
app.get("/", (req, res) => {
  res.send("This is the Lotta Flip Server!");
});

const PROXIES = {
  APETMISM: "0x361ea6a9e0d9cda53e0d5835adefd0dd4dcffab9",
  OPPUNKS: "0xda4624a7e4b131663383cade2c9496e3d018112f",
};

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/random_hash/ape/:tokenId", (req, res) => {
  const { tokenId } = req.params;

  const proxy = PROXIES.APETMISM;

  // TODO: make alchemy call to proxy here
  // const randomHash = web3.eth.abi.encodeParameters()

  // TODO: Sign with privateKey
  // const { signature } = web3.eth.accounts.sign(randomHash, PRIVATE_KEY);
  res.send(signature);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// /tokenId
// => query contract for randomessHash.
// sign randomnHash => return signedRandomHash
//
