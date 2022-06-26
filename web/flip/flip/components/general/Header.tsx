/* eslint-disable @next/next/no-img-element */
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

const Anchor = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link href={href} passHref>
    <a>{children}</a>
  </Link>
);

const Header = () => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between h-20 px-3 lg:px-12">
      <Anchor href="/">
        <img alt="Logo" src="/assets/logo.png" className="w-36" />
      </Anchor>
      <div className="flex flex-row items-center mt-4 lg:mt-0 space-x-6 text-center">
        {/* <Anchor href="/listings">
          <p className="font-medium lg:text-lg transition-transform hover:scale-[1.02]">
            My Listings
          </p>
        </Anchor> */}
        <Anchor href="/list">
          <p className="font-medium lg:text-lg transition-transform hover:scale-[1.02]">
            List an NFT
          </p>
        </Anchor>
        <ConnectButton />
      </div>
    </div>
  );
};

export default Header;
