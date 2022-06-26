/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getTimeDifference } from "../../utils/TimeUtils";

const Container = ({
  children,
  isClickable,
  lotteryId,
  collectionType,
}: {
  children: React.ReactNode;
  isClickable?: boolean;
  lotteryId: string;
  collectionType?: string;
}) =>
  isClickable ? (
    <Link href={`/listing/${collectionType}/${lotteryId}`} passHref>
      <a className="my-3 mx-4 w-60 bg-white flex flex-col pb-6 rounded-[32px] h-[420px] overflow-hidden shadow-md hover:scale-[1.03] cursor-pointer transition-transform">
        {children}
      </a>
    </Link>
  ) : (
    <div className="my-3 mx-4 w-60 bg-white flex flex-col h-[420px] pb-6 rounded-[32px] overflow-hidden shadow-md">
      {children}
    </div>
  );

const LotteryCardPreview = ({
  itemName,
  timeStamp,
  imageUrl,
  lotteryId,
  isClickable,
  collectionType,
  listPrice,
}: {
  itemName: string;
  timeStamp: number;
  imageUrl: string;
  lotteryId: number;
  isClickable?: boolean;
  collectionType?: string;
  listPrice: string;
}) => {
  const timeAgo = getTimeDifference(timeStamp);

  return (
    <Container
      isClickable={isClickable}
      lotteryId={lotteryId}
      collectionType={collectionType}
    >
      <img
        alt="Optipunk #9075"
        src={imageUrl}
        className="w-full text-ellipsis"
      />
      <h1 className="px-4 mt-4 font-semibold text-2xl whitespace-nowrap text-ellipsis overflow-hidden">
        {itemName}
      </h1>
      <h2 className="font-medium text-lg px-4 text-gray-500">
        Expires in {timeAgo}
      </h2>
      <div className="h-6" />
      <h2 className="font-medium text-xl px-4 text-gray-500">Listed at</h2>
      <div className="px-4 flex items-center">
        <h2 className="font-medium text-2xl">{listPrice} ETH</h2>
        <img
          className="h-6 w-6 ml-2"
          alt="Optimism Ethereum Logo"
          src="/assets/op_eth.png"
        />
      </div>
    </Container>
  );
};

export default LotteryCardPreview;
