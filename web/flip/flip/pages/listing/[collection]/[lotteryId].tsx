/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import { BigNumber, ethers } from "ethers";
import { arrayify } from "ethers/lib/utils";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import ActionButton from "../../../components/general/ActionButton";
import Glow from "../../../components/general/Glow";
import Header from "../../../components/general/Header";
import LotteryCardPreview from "../../../components/general/LotteryCardPreview";
import ABI from "../../../public/assets/ABI.json";
import {
  CleanData,
  CollectionInfo,
  convertRawDataToCleanData,
} from "../../../utils/GeneralUtils";

const SERVER_URL = "https://flip-server-production.up.railway.app/";

const LotteryPageSelf = () => {
  const onClick = () => {
    // TODO: Add Delist Code.
  };

  return (
    <div className="bg-white h-[420px] p-6 my-3 mx-4 w-[380px] flex flex-col pb-6 rounded-[32px] overflow-hidden shadow-md">
      <h1 className="font-semibold text-2xl">Lottery Info</h1>
      <h2 className="font-medium mt-3">Listed by yourself.</h2>
      <div className="flex-grow" />
      <p className="font-medium text-xl">
        No one has taken the other side of the lottery yet, so you can delist it
        if you want.
      </p>
      <div className="flex-grow" />
      <ActionButton onClick={onClick} text="Delist" disabled={false} />
    </div>
  );
};

const LotteryPageRevealReady = ({ cleanData }: { cleanData: CleanData }) => {
  const [loading, setLoading] = useState(false);
  const { data: account } = useAccount();
  const disabled = loading || !account;

  const { write: settleLottery } = useContractWrite(
    {
      addressOrName: CollectionInfo[cleanData.collectionType].proxyAddress,
      contractInterface: ABI,
    },
    "settleLottery"
  );

  let buttonText = account ? "Reveal" : "Connect Wallet";
  if (loading) {
    buttonText = "Loading...";
  }

  const minterAddress = cleanData.from;
  const betterAddress = cleanData.bidder;

  const onClick = () => {
    setLoading(true);
    if (!account) {
      alert("You must have your wallet connected to reveal a lottery.");
      setLoading(false);
      return;
    }

    const urlToFetch = `${SERVER_URL}/${cleanData.collectionType}/${cleanData.tokenId}`;

    fetch(urlToFetch)
      .then((res) => res.text())
      .then((randomnessSignature) => {
        settleLottery({
          args: [cleanData.tokenId, arrayify(randomnessSignature)],
        });
        setLoading(false);
      });
  };

  return (
    <div className="bg-white h-[420px] p-6 my-3 mx-4 w-[380px] flex flex-col pb-6 rounded-[32px] overflow-hidden shadow-md">
      <h1 className="font-semibold text-2xl">Lottery Info</h1>
      <h2 className="font-medium mt-3">
        Listed by{": "}
        <span className="font-semibold text-red-500">
          {minterAddress.substring(0, 6)}...
          {minterAddress.substring(minterAddress.length - 4)}
        </span>
      </h2>
      <div className="flex-grow" />
      <p className="font-medium text-xl">
        <span className="font-semibold text-red-500">
          {betterAddress.substring(0, 6)}...
          {betterAddress.substring(minterAddress.length - 4)}{" "}
        </span>
        has entered the other side of this lottery. Anyone can resolve the
        lottery to see the result.
      </p>
      <div className="flex-grow" />
      <ActionButton onClick={onClick} text={buttonText} disabled={disabled} />
    </div>
  );
};
const LotterPageActive = ({ cleanData }: { cleanData: CleanData }) => {
  const [value, setValue] = useState(parseFloat(cleanData.listPrice) / 2 + "");
  const { write: enterLottery } = useContractWrite(
    {
      addressOrName: CollectionInfo[cleanData.collectionType].proxyAddress,
      contractInterface: ABI,
    },
    "enterLottery"
  );
  const rawValue = parseFloat(value) / parseFloat(cleanData.listPrice);
  const pct = (rawValue * 100).toFixed(2);

  const showErrorText = rawValue < 0.1 || rawValue > 0.5;

  const minterAddress = cleanData.from;

  const onClick = () => {
    enterLottery({ args: [cleanData.tokenId] });
  };

  return (
    <div className="bg-white h-[420px] p-6 my-3 mx-4 w-[380px] flex flex-col pb-6 rounded-[32px] overflow-hidden shadow-md">
      <h1 className="font-semibold text-2xl">Lottery Info</h1>
      <h2 className="font-medium mt-3">
        Listed by{": "}
        <span className="font-semibold text-red-500">
          {minterAddress.substring(0, 6)}...
          {minterAddress.substring(minterAddress.length - 4)}
        </span>
      </h2>
      <div className="flex-grow" />
      <p className="font-medium text-xl">You pay</p>
      <input
        className="text-3xl my-3 px-3 py-2 rounded-lg bg-gray-400 w-48 text-center text-black placeholder:text-gray-600"
        value={value}
        onChange={(text) => setValue(text.target.value)}
      />
      <p className="font-medium text-xl">
        ETH for a <span className="text-red-500">{pct}%</span> chance to win
        this NFT
      </p>
      <p
        style={{ opacity: showErrorText ? 1 : 0 }}
        className="transition-opacity font-medium mt-4 "
      >
        * The range of %'s allowed is between 10% and 50%
      </p>
      <div className="flex-grow" />
      <ActionButton onClick={onClick} text="Enter" disabled={!!showErrorText} />
    </div>
  );
};

const LotteryPageInfo = ({ cleanData }: { cleanData: CleanData }) => {
  const { data: account } = useAccount();

  const minterAddress = cleanData.from;
  const isOwn = account?.address === minterAddress;

  if (isOwn && cleanData.status === "active") {
    return <LotteryPageSelf />;
  }

  if (cleanData.status === "readyToReveal") {
    return <LotteryPageRevealReady cleanData={cleanData} />;
  }

  return <LotterPageActive cleanData={cleanData} />;
};
const LotteryPage: NextPage = () => {
  const router = useRouter();
  const { lotteryId, collection } = router.query;

  const collectionName = String(collection);
  const collectionData = CollectionInfo[collectionName];

  const { data: rawData } = useContractRead(
    {
      addressOrName: collectionData?.proxyAddress,
      contractInterface: ABI,
    },
    "listings",
    {
      args: lotteryId,
    }
  );

  if (!rawData) {
    return <div />;
  }

  const cleanData = convertRawDataToCleanData(rawData);

  return (
    <div className="flex flex-col min-h-screen relative">
      <Head>
        <title>Lotta Flips - Lottery #{lotteryId}</title>
        <meta name="description" content="You feelin' lucky?" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div
        style={{ minHeight: "calc(100vh - 5rem)" }}
        className="h-full w-full flex items-center justify-center flex-col lg:flex-row"
      >
        <LotteryCardPreview
          lotteryId={cleanData.tokenId}
          imageUrl={CollectionInfo[collectionName].logo}
          itemName={cleanData.itemName}
          timeStamp={cleanData.timeStamp}
          listPrice={cleanData.listPrice}
        />
        <LotteryPageInfo cleanData={cleanData} />
      </div>
      <Glow />
    </div>
  );
};

export default LotteryPage;
