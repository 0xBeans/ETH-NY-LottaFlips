/* eslint-disable @next/next/no-img-element */

const OPTIPUNK_9075 =
  "https://quixotic.io/_next/image?url=https%3A%2F%2Fipfs.quixotic.io%2Fipfs%2FQmbAhtqQqiSQqwCwQgrRB6urGc3umTskiuVpgX7FvHhutU%2F4330.png&w=3840&q=75";

const RecentLottery = ({
  itemName,
  listingPrice,
  lotteryAt,
}: {
  itemName: string;
  listingPrice: number;
  lotteryAt: number;
}) => {
  const imageUrl = OPTIPUNK_9075;
  const status = "Flipped"; // Flipped or Safe

  const color = status === "Flipped" ? "text-red-500" : "";
  return (
    <tr
      onClick={() => {
        window.open(
          "https://optimistic.etherscan.io/tx/0xf4419c78d8028ef6582df2afe4588ba004907b1c0ecf10df6917ddf1d65d8812",
          "_blank"
        );
      }}
      className="border-b border-gray-600 cursor-pointer transition-transform hover:scale-[1.02]"
    >
      <td className="flex flex-row items-center font-semibold text-lg">
        <img
          alt="Optipunk # 9454"
          className="h-16 w-16 mr-2 rounded-lg my-3"
          src={imageUrl}
        />
        {itemName}
      </td>
      <td className="font-medium text-lg">{lotteryAt.toFixed(3)} ETH</td>
      <td className="font-medium text-lg">{listingPrice.toFixed(3)} ETH</td>
      <td className={`font-medium text-lg ${color}`}>{status}</td>
    </tr>
  );
};

const RecentLotteries = () => {
  return (
    <div className="self-center mt-16  lg:min-w-[1024px]">
      <h1 className="text-3xl font-bold mb-4 ml-4">Recent Lotteries</h1>
      <div className=" lg:flex-row items-center flex-wrap shadow-lg rounded-[32px] px-6 py-4">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="text-left text-gray-300">Collection</th>
              <th className="text-left text-gray-300">Listed At</th>
              <th className="text-left text-gray-300">Lottery Value</th>
              <th className="text-left text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody className="border-t border-gray-600">
            <RecentLottery
              itemName="Optipunk #132"
              listingPrice={0.2}
              lotteryAt={0.1}
            />
            <RecentLottery
              itemName="Optipunk #166"
              listingPrice={0.225}
              lotteryAt={0.125}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentLotteries;
