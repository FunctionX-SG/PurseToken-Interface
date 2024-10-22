import { FC } from "react";

interface CustomTooltipProps {
  payload?: Array<{
    value: string | number;
  }>;
  label?: string;
  formatter?: (value: number) => string;
}

const CustomTooltip: FC<CustomTooltipProps> = ({
  payload,
  label,
  formatter = (val) => val.toString(),
}) => {
  if (!payload?.length || !label) {
    return null;
  }

  const date = new Date(1000 * Number(label));
  const year = date.getFullYear();
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate();
  const value = parseFloat(payload[0].value.toString());
  const formattedValue = formatter(value);

  return (
    <div className="custom-tooltip">
      <p
        className="textWhiteSmall"
        style={{
          padding: "0",
          margin: "0",
          textAlign: "center",
          width: "40px",
          height: "18px",
          color: "#fff",
          lineHeight: "18px",
          backgroundColor: "var(--basic-black)",
        }}
      >
        SUM
      </p>
      <div
        className="textWhiteHeading"
        style={{
          color: "#000",
          padding: "0",
          margin: "0",
        }}
      >
        {formattedValue}
      </div>
      <p
        className="textWhiteSmall"
        style={{
          color: "#000",
          padding: "0",
          margin: "0",
        }}
      >
        {day}-{month}-{year}
      </p>
    </div>
  );
};

export default CustomTooltip;
