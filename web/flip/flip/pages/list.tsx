/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import type { NextPage } from "next";
import { useState } from "react";
import Head from "next/head";
import Header from "../components/general/Header";

import { DialogOverlay, DialogContent } from "@reach/dialog";
import "@reach/dialog/styles.css";
import { animated, useTransition } from "@react-spring/web";
import ActionButton from "../components/general/ActionButton";
import Glow from "../components/general/Glow";
import { useAccount, useContractWrite } from "wagmi";
import { CollectionInfo } from "../utils/GeneralUtils";
import ABI from "../public/assets/ABI.json";
import { BigNumber, ethers } from "ethers";

const OPTIPUNK_COLLECTION_LOGO =
  "https://quixotic.io/_next/image?url=https%3A%2F%2Ffanbase-1.s3.amazonaws.com%2Fquixotic-collection-profile%2Foptipunkgif.b34a680b_vBX64As.gif&w=3840&q=75";

const APETIMISM_COLLECTION_LOGO =
  "https://quixotic.io/_next/image?url=https%3A%2F%2Ffanbase-1.s3.amazonaws.com%2Fquixotic-collection-profile%2Flooprotated-360.72b010f9.gif&w=3840&q=75";

function getFinalTimeStamp(hoursOffset: number) {
  const time = new Date();
  const timeMS = hoursOffset * 60 * 60 * 1000;
  return time.getTime() + timeMS;
}

function Modal({
  onRender,
  imageUrl,
  collectionType,
}: {
  onRender: any;
  imageUrl: string;
  collectionType: string;
}) {
  const AnimatedDialogOverlay = animated(DialogOverlay);
  const AnimatedDialogContent = animated(DialogContent);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const { data: account } = useAccount();

  const disabled = !account || loading;
  let buttonText = disabled ? "Connect Wallet" : "List";
  if (loading) {
    buttonText = "Loading...";
  }

  const [showDialog, setShowDialog] = useState(false);
  const transitions = useTransition(showDialog, {
    from: { opacity: 0, y: -10 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: 10 },
  });

  const [listPrice, setListPrice] = useState("0.1");
  const [tokenId, setTokenId] = useState(0);
  const [expirtyHours, setExpirtyHours] = useState("2");

  const { write: createLottery } = useContractWrite(
    {
      addressOrName: CollectionInfo[collectionType].proxyAddress,
      contractInterface: ABI,
    },
    "createLottery"
  );

  const onClick = () => {
    setLoading(true);
    const offset = parseInt(expirtyHours);
    const timeStamp = getFinalTimeStamp(offset);

    const price = parseFloat(listPrice);
    setErrorText("");
    if (!price) {
      setErrorText("Price must be a valid number greater than 0.");
      setLoading(false);
      return;
    }
    if (offset <= 0) {
      setErrorText("Expiry time must be a valid number greater than 0.");
      setLoading(false);
      return;
    }

    createLottery({
      args: [
        tokenId,
        ethers.utils.parseUnits(String(price)),
        BigNumber.from(timeStamp),
      ],
    });
    setLoading(false);
  };
  return (
    <div>
      {onRender(() => setShowDialog(true))}
      {transitions(
        (styles, item) =>
          item && (
            <AnimatedDialogOverlay
              onDismiss={() => setShowDialog(false)}
              style={{ opacity: styles.opacity, zIndex: 100000000000000 }}
            >
              <AnimatedDialogContent
                aria-labelledby="dialog-title"
                style={{
                  borderRadius: 32,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  transform: styles.y.to(
                    (value) => `translate3d(0px, ${value}px, 0px)`
                  ),
                }}
              >
                <div className="flex flex-col lg:flex-row">
                  <img
                    alt="Yeet."
                    src={imageUrl}
                    className="h-72 w-72 rounded-2xl"
                  />
                  <div className="flex flex-col">
                    <h1 className="px-4 font-semibold text-2xl mb-3">
                      List Price
                    </h1>
                    <div className="ml-4 flex justify-start items-center">
                      <input
                        className="bg-gray-400 px-3 py-2 rounded-xl text-center text-xl font-semibold w-16"
                        value={listPrice}
                        onChange={(e) => setListPrice(e.target.value)}
                      />
                      <p className="font-medium text-xl ml-2">ETH</p>
                    </div>
                    <div className="flex-grow min-h-[4px]" />
                    <div className="ml-4 flex justify-start items-center">
                      <input
                        className="bg-gray-400 px-3 py-2 rounded-xl text-center text-xl font-semibold w-16"
                        value={tokenId}
                        onChange={(e) => setTokenId(e.target.value)}
                      />
                      <p className="font-medium text-xl ml-2">Token Id</p>
                    </div>
                    <div className="flex-grow min-h-[4px]" />
                    <div className="ml-4 flex justify-start items-center">
                      <input
                        className="bg-gray-400 px-3 py-2 rounded-xl text-center text-xl font-semibold w-16"
                        value={expirtyHours}
                        onChange={(e) => setExpirtyHours(e.target.value)}
                      />
                      <p className="font-medium text-xl ml-2">
                        Hours until expiry
                      </p>
                    </div>
                    <div className="flex-grow min-h-[4px]" />
                    <ActionButton
                      onClick={onClick}
                      text={buttonText}
                      disabled={disabled}
                    />
                  </div>
                </div>
                <p className="text-lg font-medium mt-6 text-red-700">
                  {errorText}
                </p>
              </AnimatedDialogContent>
            </AnimatedDialogOverlay>
          )
      )}
    </div>
  );
}

const CollectionItem = ({
  collectionName,
  imageUrl,
}: {
  collectionName: string;
  imageUrl: string;
}) => {
  return (
    <Modal
      collectionType={collectionName}
      imageUrl={imageUrl}
      onRender={(onClick: any) => (
        <div
          onClick={onClick}
          className="bg-white my-3 mx-4 w-60 flex flex-col pb-6 rounded-[32px] h-[420px] overflow-hidden shadow-md hover:scale-[1.03] cursor-pointer transition-transform"
        >
          <img
            alt="Optipunks"
            src={imageUrl}
            className="w-full text-ellipsis"
          />
          <h1 className="px-4 mt-4 font-semibold text-2xl whitespace-nowrap text-ellipsis overflow-hidden">
            {collectionName}
          </h1>
        </div>
      )}
    />
  );
};

const ListPage: NextPage = () => {
  return (
    <div className="flex flex-col relative">
      <Head>
        <title>Lotta Flips | List</title>
        <meta name="description" content="You feelin' lucky?" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className="self-center mt-16  lg:min-w-[1024px]">
        <h1 className="text-3xl font-bold mb-4 ml-4">List an NFT</h1>
        <div className="h-full w-full flex items-center justify-center flex-col lg:flex-row">
          <CollectionItem
            collectionName="Optipunk"
            imageUrl={OPTIPUNK_COLLECTION_LOGO}
          />
          <CollectionItem
            collectionName="Apetimism"
            imageUrl={APETIMISM_COLLECTION_LOGO}
          />
        </div>
      </div>
      <Glow />
    </div>
  );
};

export default ListPage;
