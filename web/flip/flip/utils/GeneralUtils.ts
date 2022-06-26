import { BigNumber, ethers } from "ethers";

const OPTIPUNK_9075 =
  "https://quixotic.io/_next/image?url=https%3A%2F%2Fipfs.quixotic.io%2Fipfs%2FQmbAhtqQqiSQqwCwQgrRB6urGc3umTskiuVpgX7FvHhutU%2F4330.png&w=3840&q=75";

const APE_IMAGE =
  "https://quixotic.infura-ipfs.io/ipfs/QmS7rPmj3vA32ZQmixG8XEkirtFvxVWtaR1a3ZEW8KNMJf";

export type CleanData = {
  from: string;
  bidder: string;
  tokenId: number;
  itemName: string;
  timeStamp: number;
  collectionType: string;
  listPrice: string;
  status: string;
};

export const CollectionInfo: Record<
  string,
  { logo: string; proxyAddress: string }
> = {
  Optipunk: {
    logo: OPTIPUNK_9075,
    proxyAddress: "0x361ea6a9e0d9cda53e0d5835adefd0dd4dcffab9",
  },
  Apetimism: {
    logo: APE_IMAGE,
    proxyAddress: "0xda4624a7e4b131663383cade2c9496e3d018112f",
  },
};

export function convertRawDataToCleanData(rawData: any): CleanData {
  const cleanData = {
    from: rawData.lister,
    bidder: rawData.bidder,
    // tokenId: rawData.tokenId,
    tokenId: 285,
    // itemName: `Apetimism ${rawData.tokenId}`,
    itemName: `Apetimism 285`,
    timeStamp: BigNumber.from(rawData.expirationTimestamp).toNumber(),
    collectionType: "Apetimism",
    listPrice: ethers.utils.formatUnits(rawData.listPrice, 18),
    status: !rawData.status
      ? "inactive"
      : rawData.status === 1
      ? "active"
      : "readyToReveal",
  };
  return cleanData;
}
