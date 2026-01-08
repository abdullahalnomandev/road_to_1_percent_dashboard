import { Card, Col, Row, Statistic, Typography, Space, Select } from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useGetEarningStatisticsQuery,
  useGetStatisticsQuery,
  useGetUserStatisticsQuery,
} from "../../redux/apiSlices/userSlice";

const { Text } = Typography;

// Month abbreviation to full name mapping
const monthMap: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};

// Month number to 3-char month abbreviation (for Earning Statistics X axis)
const monthNumToAbbr = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];


function DashboardPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedEarningYear, setSelectedEarningYear] = useState(
    new Date().getFullYear()
  );
  const [selectedUserYear, setSelectedUserYear] = useState<string>(new Date().getFullYear() as any);
  const { data } = useGetStatisticsQuery(null);
  const { data: earningStatistics } = useGetEarningStatisticsQuery({
    year: String(selectedEarningYear),
  });
  const { data: userStatistics } = useGetUserStatisticsQuery({
    year: String(selectedUserYear),
  });

  const earingData = earningStatistics?.data?.earningStats;
  const userData = userStatistics?.data?.userStats;

  const earningSeries = userData?.map((d: any) => ({
    month: d.month,
    monthFull: monthMap[d.month],
    value: d?.newUsers,
  }));

  console.log({ userData });

  const cardData = [
    {
      icon: <UserOutlined />,
      label: "Total User",
      value: data?.data?.totalUser,
      valueStyle: { color: "#f9fafb", fontSize: 28, fontWeight: 600 },
      prefix: undefined,
      precision: 0,
      trend: { value: -15, isPositive: false, color: "#f97373" },
      iconBg: "linear-gradient(135deg, #586A26 0%, #3d4a1a 100%)",
    },
    {
      icon: <DollarOutlined />,
      label: "Total Revenue",
      value: data?.data?.totalRevenue,
      valueStyle: { color: "#f9fafb", fontSize: 28, fontWeight: 600 },
      prefix: "$",
      precision: 0,
      trend: { value: 15, isPositive: true, color: "#4ade80" },
      iconBg: "linear-gradient(135deg, #586A26 0%, #3d4a1a 100%)",
    },
    {
      icon: <ShoppingOutlined />,
      label: "Total Order",
      value: data?.data?.totalOrder,
      valueStyle: { color: "#f9fafb", fontSize: 28, fontWeight: 600 },
      prefix: undefined,
      precision: 0,
      trend: { value: 15, isPositive: true, color: "#4ade80" },
      iconBg: "linear-gradient(135deg, #586A26 0%, #3d4a1a 100%)",
    },
  ];

  return (
    <Space direction="vertical" size={28} style={{ width: "100%" }}>
      <Row gutter={[20, 20]}>
        {cardData.map((item) => (
          <Col key={item.label} xs={24} sm={12} md={8}>
            <div
              onMouseEnter={() => setHoveredCard(item.label)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: "linear-gradient(135deg, #020617 0%, #0a0f1f 100%)",
                borderRadius: 16,
                height: "100%",
                padding: 24,
                boxSizing: "border-box",
                width: "100%",
                border: "1px solid rgba(163, 230, 53, 0.1)",
                boxShadow:
                  hoveredCard === item.label
                    ? "0 8px 24px rgba(163, 230, 53, 0.15), 0 0 0 1px rgba(163, 230, 53, 0.2)"
                    : "0 4px 12px rgba(0, 0, 0, 0.3)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform:
                  hoveredCard === item.label
                    ? "translateY(-4px)"
                    : "translateY(0)",
                cursor: "pointer",
              }}
            >
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Space align="center">
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: item.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#a3e635",
                      fontSize: 18,
                      boxShadow: "0 4px 12px rgba(163, 230, 53, 0.2)",
                      transition: "all 0.3s ease",
                      transform:
                        hoveredCard === item.label
                          ? "scale(1.1) rotate(5deg)"
                          : "scale(1)",
                    }}
                  >
                    {item.icon}
                  </div>
                  <Text
                    style={{ color: "#9ca3af", fontSize: 14, fontWeight: 500 }}
                  >
                    {item.label}
                  </Text>
                </Space>
                <Statistic
                  prefix={item.prefix}
                  value={item.value}
                  precision={item.precision}
                  valueStyle={{
                    ...item.valueStyle,
                    transition: "all 0.3s ease",
                    transform:
                      hoveredCard === item.label ? "scale(1)" : "scale(1)",
                  }}
                />
              </Space>
            </div>
          </Col>
        ))}
      </Row>

      <Card
        style={{
          background: "linear-gradient(135deg, #020617 0%, #0a0f1f 100%)",
          borderRadius: 16,
          border: "1px solid rgba(163, 230, 53, 0.1)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
        styles={{ body: { padding: 24 } }}
        title={
          <Text
            style={{
              color: "#f9fafb",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Earning Statistics
          </Text>
        }
        extra={(() => {
          const currentYear = new Date().getFullYear();
          const years = Array.from({ length: 4 }, (_, i) => currentYear - i);
          return (
            <Select
              value={String(selectedEarningYear)}
              onChange={(value) => setSelectedEarningYear(Number(value))}
              options={years.map((year) => ({
                value: String(year),
                label: String(year),
              }))}
              size="small"
              style={{
                width: 100,
                background: "#586A26",
                color: "white",
                border: "none",
              }}
              dropdownStyle={{
                background: "#586A26",
              }}
              suffixIcon={
                <svg
                  width="1em"
                  height="1em"
                  viewBox="0 0 1024 1024"
                  fill="white"
                >
                  <path d="M512 624c-7.7 0-15.3-2.9-21.1-8.8L166.4 300.1c-12-11.7-12.2-30.8-.5-42.6s30.8-12.2 42.6-.5l303.1 295.2 303.1-295.2c11.7-11.4 30.9-11.2 42.6.5s11.5 30.9-.5 42.6L533.1 615.2c-5.8 5.9-13.4 8.8-21.1 8.8z" />
                </svg>
              }
              popupRender={(menu) => (
                <div>
                  <style>
                    {`
                      .custom-dashboard-year-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
                        background-color: #D1FC5B !important;
                        color: black !important;
                      }
                    `}
                  </style>
                  <div className="custom-dashboard-year-dropdown">{menu}</div>
                </div>
              )}
            />
          );
        })()}
      >
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={earingData}
            // margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a3e635" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#a3e635" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#1f2937"
              opacity={0.6}
            />
            <XAxis
              dataKey="month"
              tickFormatter={(value) => {
                // value is expected "YYYY-MM"
                const monthNum = Number(value.split("-")[1]);
                // Show 3 char month abbreviation for Earning Statistics
                return monthNumToAbbr[monthNum - 1] || value;
              }}
              tick={{ fill: "#90a4ae", fontWeight: 500, fontSize: 13 }}
              axisLine={{ stroke: "#1f2937", strokeWidth: 1 }}
              tickLine={{ stroke: "#1f2937" }}
            />

            <YAxis
              tickFormatter={(value) => `$${value}`}
              tick={{ fill: "#90a4ae", fontSize: 12 }}
              axisLine={{ stroke: "#1f2937", strokeWidth: 1 }}
              tickLine={{ stroke: "#1f2937" }}
              // grid={{ stroke: "#1f2937", strokeDasharray: "4 4", opacity: 0.6 }}
            />
            <Tooltip
              cursor={{
                fill: "rgba(163, 230, 53, 0.08)", // soft green hover
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  // Use the full month name from monthMap
                  const monthName = monthMap[data.month] || data.month;
                  return (
                    <div
                      style={{
                        padding: "10px 14px",
                        background:
                          "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                        borderRadius: "8px",
                        border: "1px solid rgba(163, 230, 53, 0.2)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                      }}
                    >
                      <div
                        style={{
                          color: "#a3e635",
                          fontSize: "16px",
                          fontWeight: 700,
                          marginBottom: "8px",
                        }}
                      >
                        {monthName}
                      </div>
                      <div
                        style={{
                          marginBottom: "4px",
                          color: "#9ca3af",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        Earning
                      </div>
                      <div
                        style={{
                          color: "#f9fafb",
                          fontSize: "18px",
                          fontWeight: 700,
                        }}
                      >
                        ${data.earning?.toLocaleString()}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="earning"
              stroke="#a3e635"
              strokeWidth={2.5}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={24}>
        <Col span={24}>
          <Card
            // bordered={false}  // Deprecated, so removed
            style={{
              background: "linear-gradient(135deg, #020617 0%, #0a0f1f 100%)",
              borderRadius: 16,
              border: "1px solid rgba(163, 230, 53, 0.1)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
            styles={{ body: { padding: 24 } }}
            title={
              <Text style={{ color: "#f9fafb", fontSize: 18, fontWeight: 600 }}>
                User Statistics
              </Text>
            }
            extra={(() => {
              const currentYear = new Date().getFullYear();
              const years = Array.from(
                { length: 4 },
                (_, i) => currentYear - i
              );
              return (
                <Select
                  value={String(selectedUserYear)}
                  onChange={(value) => setSelectedUserYear(String(value))}
                  options={years.map((year) => ({
                    value: String(year),
                    label: String(year),
                  }))}
                  size="small"
                  style={{
                    width: 100,
                    background: "#586A26",
                    color: "white",
                    border: "none",
                  }}
                  dropdownStyle={{
                    background: "#586A26",
                  }}
                  suffixIcon={
                    <svg
                      width="1em"
                      height="1em"
                      viewBox="0 0 1024 1024"
                      fill="white"
                    >
                      <path d="M512 624c-7.7 0-15.3-2.9-21.1-8.8L166.4 300.1c-12-11.7-12.2-30.8-.5-42.6s30.8-12.2 42.6-.5l303.1 295.2 303.1-295.2c11.7-11.4 30.9-11.2 42.6.5s11.5 30.9-.5 42.6L533.1 615.2c-5.8 5.9-13.4 8.8-21.1 8.8z" />
                    </svg>
                  }
                  popupRender={(menu) => <div>{menu}</div>}
                />
              );
            })()}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={earningSeries}>
                <defs>
                  <linearGradient id="colorEarning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a3e635" />
                    <stop offset="100%" stopColor="#84cc16" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#243142"
                  opacity={0.6}
                />
                <XAxis
                  dataKey="month"
                  tickFormatter={(val) => val} // Show 3-char month only
                  tick={{ fill: "#90a4ae", fontWeight: 500, fontSize: 13 }}
                  axisLine={{ stroke: "#232b34", strokeWidth: 1 }}
                  tickLine={{ stroke: "#232b34", strokeWidth: 1 }}
                />
                <YAxis
                  tickFormatter={(val) => `$${val}`}
                  tick={{ fill: "#90a4ae", fontWeight: 500, fontSize: 12 }}
                  axisLine={{ stroke: "#232b34", strokeWidth: 1 }}
                  tickLine={{ stroke: "#232b34", strokeWidth: 1 }}
                  label={{
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#d1fa5b", fontWeight: 600, fontSize: 13 },
                  }}
                />
                <Tooltip
                  cursor={{
                    fill: "rgba(163, 230, 53, 0.08)", // soft green hover
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const monthName = monthMap[data.month] || data.month;
                      return (
                        <div
                          style={{
                            padding: "10px 14px",
                            background:
                              "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                            borderRadius: "8px",
                            border: "1px solid rgba(163, 230, 53, 0.2)",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                          }}
                        >
                          <div
                            style={{
                              color: "#a3e635",
                              fontSize: "16px",
                              fontWeight: 700,
                              marginBottom: "8px",
                            }}
                          >
                            {monthName}
                          </div>
                          <div
                            style={{
                              marginBottom: "4px",
                              color: "#9ca3af",
                              fontSize: "12px",
                              fontWeight: 500,
                            }}
                          >
                            Earning
                          </div>
                          <div
                            style={{
                              color: "#f9fafb",
                              fontSize: "18px",
                              fontWeight: 700,
                            }}
                          >
                            Total: {data.value.toLocaleString()}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="url(#colorEarning)"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

export default DashboardPage;
