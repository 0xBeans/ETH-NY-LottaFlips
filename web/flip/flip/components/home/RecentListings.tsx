import { useContractRead } from "wagmi";
import LotteryCardPreview from "../general/LotteryCardPreview";
import ABI from "../../public/assets/ABI.json";
import { useEffect, useState } from "react";
import {
  CleanData,
  CollectionInfo,
  convertRawDataToCleanData,
} from "../../utils/GeneralUtils";

/* eslint-disable @next/next/no-img-element */

const RecentListings = () => {
  const { data: apeData } = useContractRead(
    {
      addressOrName: CollectionInfo["Apetimism"].proxyAddress,
      contractInterface: ABI,
    },
    "allActiveListings"
  );

  const { data: punkData } = useContractRead(
    {
      addressOrName: CollectionInfo["Optipunk"].proxyAddress,
      contractInterface: ABI,
    },
    "allActiveListings"
  );

  const [finalData, setFinalData] = useState<any[]>([]);

  useEffect(() => {
    if (apeData && punkData && !finalData.length) {
      const cleanApeData =
        apeData?.map((rawItem) => {
          const cleanData = convertRawDataToCleanData(rawItem);
          return cleanData;
        }) || [];

      const cleanPunkData =
        punkData?.map((rawItem) => {
          const cleanData = convertRawDataToCleanData(rawItem);
          return cleanData;
        }) || [];

      const newFinalData = [...cleanApeData, ...cleanPunkData].sort(
        (a, b) => a.timeStamp - b.timeStamp
      );
      setFinalData(newFinalData);
    }
  }, [apeData, finalData.length, punkData]);

  return (
    <div className="self-center mt-16  lg:min-w-[1024px]">
      <h1 className="text-3xl font-bold mb-4 ml-4">Recent Listings</h1>
      <div className="flex flex-col lg:flex-row items-center flex-wrap">
        {finalData.map((item: CleanData) => {
          return (
            <LotteryCardPreview
              key={item.itemName}
              isClickable
              lotteryId={item.tokenId}
              collectionType={item.collectionType}
              imageUrl={CollectionInfo[item.collectionType].logo}
              itemName={item.itemName}
              timeStamp={item.timeStamp}
              listPrice={item.listPrice}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RecentListings;
