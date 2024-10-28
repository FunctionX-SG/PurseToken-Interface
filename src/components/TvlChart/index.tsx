import {
  Area,
  AreaChart,
  Label,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TvlChartProps } from "./types";
import {
  convertUnixToDate,
  getNumberWithCommas,
  RawNumberFormatter,
} from "../utils";
import CustomTooltip from "../CustomTooltip";

function TVLChart(props: TvlChartProps) {
  const {
    dataKey,
    tvlData,
    height,
    displayHeader = false,
    displayTokenAmount = false,
    chartTitle = "TVL",
    size = "m",
    domainHeightMultiplier = 1,
    yAxisLabel,
    yAxisFormatter,
    tooltipFormatter,
  } = props;

  if (!tvlData) {
    return <></>;
  }

  return (
    <>
      {displayHeader ? (
        <div className="mb-2">
          <div className={`common-title text-muted`}>{chartTitle}</div>
          {displayTokenAmount ? (
            <div className={size === "m" ? `h3 bold` : `h4 bold`}>
              <strong>
                {RawNumberFormatter(
                  tvlData[tvlData.length - 1].totalAmountLiquidity
                )}
              </strong>
            </div>
          ) : null}
          <div className={size === "m" ? `h5 text-muted` : `h6 text-muted`}>
            {`$${getNumberWithCommas(
              tvlData[tvlData.length - 1].totalLiquidityValueUSD,
              2
            )}`}
          </div>
        </div>
      ) : null}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={tvlData} margin={{ top: yAxisLabel ? 24 : 10 }}>
          <XAxis
            axisLine={false}
            dataKey="blockTimestamp"
            domain={["dataMin", "dataMax"]}
            interval="preserveStartEnd"
            type="number"
            tickFormatter={convertUnixToDate}
            stroke="#000"
            tickLine={false}
            fontSize={size === "m" ? 16 : 12}
          />
          <YAxis
            axisLine={false}
            dataKey={dataKey}
            domain={[0, (dataMax: number) => dataMax * domainHeightMultiplier]} // ??
            interval="preserveStartEnd"
            tickFormatter={yAxisFormatter}
            tick={{ fontSize: 12 }}
            stroke="#000"
          >
            {yAxisLabel ? (
              <Label
                position="top"
                value={yAxisLabel}
                offset={10}
                style={{ fontSize: "90%", fill: "black", padding: "100px" }}
              />
            ) : null}
          </YAxis>
          <Tooltip
            content={<CustomTooltip formatter={tooltipFormatter} />}
            cursor={{
              stroke: "#000",
              strokeWidth: 1,
              strokeDasharray: "2 2",
            }}
            itemStyle={{ color: "#8884d8" }}
          />
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d94cf5" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#dd59f7" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#c80ced"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorUv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}

export default TVLChart;
