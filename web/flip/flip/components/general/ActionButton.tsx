/* eslint-disable @next/next/no-img-element */

const ActionButton = ({
  text,
  disabled,
  onClick,
}: {
  text: string;
  disabled: boolean;
  onClick: () => void;
}) => {
  const disabledStyle =
    "flex flex-row items-center justify-center bg-black rounded-[36px] py-3 w-48 bg-gray-500 text-white self-center";

  const regularStyle =
    "flex flex-row items-center justify-center bg-black rounded-[36px] py-3 w-48 self-center cursor-pointer transition-transform hover:scale-[1.03] ";

  const style = disabled ? disabledStyle : regularStyle;

  return (
    <div onClick={disabled ? () => {} : onClick} className={style}>
      <img alt="Sword Icon" src="/assets/sword.svg" />
      <p className="ml-1 font-bold text-white">{text}</p>
    </div>
  );
};

export default ActionButton;
