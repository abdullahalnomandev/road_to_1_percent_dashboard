import React, { useMemo, useState } from "react";
import {
  Table,
  Typography,
  Input,
  Button,
  Modal,
  Descriptions,
  Spin,
  Tooltip,
  Space
} from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { FiSearch } from "react-icons/fi";
import { EyeOutlined } from "@ant-design/icons";
import { useGetOrderHistoryQuery, useGetOrdersQuery } from "../../redux/apiSlices/orderSlice";

const { Text } = Typography;

/* =====================
   Types
===================== */
type OrderItem = {
  id: string;
  name: string;
  price: string;
  currency: string;
  totalItems: number;
  paymentStatus: string;
  fulfillStatus: string;
  poNumber: string;
  date: string;
};

type LineItem = {
  id: string;
  title: string;
  quantity: number;
  variantId: string;
  variantTitle: string;
  variantPrice: string;
  productId: string;
  productHandle: string;
  productImage: string;
};

type ShopifyOrderDetails = {
  id: string;
  name: string;
  createdAt: string;
  amount: string;
  currency: string;
  lineItems: LineItem[];
};

/* =====================
   View Modal
===================== */
const OrderInfoModal: React.FC<{
  order: OrderItem | null;
  open: boolean;
  onClose: () => void;
  orderDetails?: ShopifyOrderDetails | null;
  isLoading?: boolean;
}> = ({ order, open, onClose, orderDetails, isLoading }) => {

  return ( <Modal open={open} onCancel={onClose} footer={null} centered width={650}>
    {order && (
      <Spin spinning={!!isLoading}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 28, color: "#fff" }}>
            {orderDetails?.name ?? order?.name}
          </div>
        </div>
        <Descriptions
          column={1}
          bordered
          style={{ marginBottom: 24, background: "#232323", borderRadius: 8, padding: 12 }}
          labelStyle={{ color: "#c2fd72", fontWeight: 600 }}
        >

          <Descriptions.Item label="Price">
            {orderDetails?.amount ?? order.price} {orderDetails?.currency ?? order.currency}
          </Descriptions.Item>
          <Descriptions.Item label="Total Items">
            {orderDetails?.lineItems?.reduce?.((acc, li) => acc + (li.quantity || 0), 0) ?? order.totalItems}
          </Descriptions.Item>
          {typeof order.poNumber !== "undefined" && (
            <Descriptions.Item label="PO Number">
              {order.poNumber} {orderDetails?.lineItems?.length}
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Show line items with image in a more professional layout */}

        {(orderDetails as any)?.data?.lineItems?.length ? (
          <>
            <h3 style={{ color: "#fff", fontWeight: 700, marginBottom: 14, fontSize: 18, letterSpacing: 1 }}>
              Line Items 
            </h3>
            <div style={{ 
              background: "#232323", 
              borderRadius: 10, 
              padding: 18, 
              marginBottom: 8, 
              boxShadow: "0 2px 12px 0 #1114", 
              border: "1px solid #353e2f" 
            }}>
              {(orderDetails as any)?.data?.lineItems.map((item:any) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #2d301e",
                    padding: "18px 0",
                    marginBottom: 0,
                    gap: 22,
                  }}
                >
                  <div style={{
                    flexShrink: 0,
                    border: "1.5px solid #445621",
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "#181c0b",
                    boxShadow: "0 2px 18px #13190e44",
                    width: 72,
                    height: 72,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}>
                    <img
                      src={item.productImage}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 8
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#e3ffb9", fontWeight: 600, fontSize: 17 }}>
                      {item.title}
                    </div>
                    <div style={{ color: "#d0d0d0", marginTop: 5, fontSize: 15 }}>
                      <div>
                        <span style={{ fontWeight: 550, color: "#a4e15c" }}>Variant:</span> {item.variantTitle}
                      </div>
                      <div>
                        <span style={{ fontWeight: 500 }}>Quantity:</span> <b style={{ color: "#fff" }}>{item.quantity}</b>
                      </div>
                      <div>
                        <span style={{ fontWeight: 500 }}>Price:</span> <span style={{ color: "#fff" }}>{item.variantPrice}</span> {(orderDetails as any)?.currency}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </Spin>
    )}
  </Modal>)
};

/* =====================
   Main Page
===================== */
const Order: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [viewItem, setViewItem] = useState<OrderItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const query: any = { page, limit };
  if (search.trim()) query.searchTerm = search;

  const { data, isLoading } = useGetOrdersQuery({ query });
  const cleanId = viewItem?.name?.startsWith("#") ? viewItem.name.slice(1) : viewItem?.name ?? "";
  const { data: orderDetails, isLoading: isOrderHistoryLoading } = useGetOrderHistoryQuery(
    { id: cleanId },
    { skip: !viewOpen || !viewItem }
  );

  // For demonstration, adapt data?.data or fake the shape if undefined.
  const tableData: OrderItem[] = Array.isArray(data?.data) ? data.data : [];

  /* =====================
     Table Columns
  ===================== */
  const columns: TableColumnsType<OrderItem> = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        render: (v: string) => <Text strong>{v}</Text>,
      },
      {
        title: "Price",
        dataIndex: "price",
        render: (v: string, r: OrderItem) => (
          <span>
            {v} {r.currency}
          </span>
        ),
      },
      {
        title: "Order Items",
        dataIndex: "totalItems",
        render: (v: number) => v,
      },
      {
        title: "Payment status",
        dataIndex: "paymentStatus",
        render: (v: string) => (
          <Text style={{ color: v === "PAID" ? "#23a978" : "#d72632" }}>{v}</Text>
        ),
      },
      {
        title: "Fulfillment",
        dataIndex: "fulfillStatus",
        render: (v: string) => v,
      },
      {
        title: "Mobile",
        dataIndex: "poNumber",
        render: (v: string) => v,
      },
      {
        title: "Date",
        dataIndex: "date",
        render: (v: string) => (
          <Text>
            {new Date(v).toLocaleDateString()}
          </Text>
        ),
      },
      {
        title: "Action",
        align: "center",
        render: (_: any, record: OrderItem) => (
          <Space>
            <Tooltip title="View">
              <Button
                type="link"
                style={{ color: "#dddd" }}
                onClick={() => {
                  setViewItem(record);
                  setViewOpen(true);
                }}
              >
                <EyeOutlined />
              </Button>
            </Tooltip>
          </Space>
        ),
      },
    ],
    []
  );

  const pagination: TablePaginationConfig = {
    total: data?.pagination?.total || 0,
    current: page,
    pageSize: limit,
    showSizeChanger: true,
    onChange: (p, s) => {
      setPage(p);
      setLimit(s);
    },
  };

  return (
    <div>
      {/* View Modal */}
      <OrderInfoModal
        open={viewOpen}
        order={viewItem}
        onClose={() => setViewOpen(false)}
        orderDetails={orderDetails as ShopifyOrderDetails}
        isLoading={isOrderHistoryLoading}
      />

      {/* Top Actions */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div />
        <div style={{ display: "flex", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#232323",
              borderRadius: 32,
              padding: "6px 18px 6px 8px",
              boxShadow: "0px 2px 9px 0px rgba(0,0,0,0.15)",
              width: 350,
              minHeight: 44,
              height: 40,
            }}
          >
            <div
              style={{
                background: "#94B341",
                borderRadius: "100%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 5,
                boxShadow: "0 1px 4px rgba(0,0,0,0.09)",
              }}
            >
              <FiSearch style={{ fontSize: 14, color: "#232323", margin: 0 }} />
            </div>
            <Input
              type="text"
              placeholder="Search orders"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                background: "transparent",
                color: "#f4f4f5",
                border: "none",
                fontSize: 18,
                width: "85%",
                fontWeight: 400,
                letterSpacing: 0.2,
                outline: "none",
                boxShadow: "none",
              }}
              allowClear
              className="user-search-input-white-clear user-search-input-gray-placeholder"
            />
            <style>
              {`
              .user-search-input-white-clear .ant-input-clear-icon {
                color: #fff !important;
              }
              .user-search-input-gray-placeholder input::placeholder {
                color: #bfbfbf !important;
                opacity: 1 !important;
              }
            `}
            </style>
          </div>
        </div>
      </div>

      {/* Table */}
      <Spin spinning={isLoading}>
        <Table
          rowKey="id"
          style={{ overflowX: "auto", marginTop: 20 }}
          dataSource={tableData}
          columns={columns}
          className={`user-table-custom-gray user-table-gray-row-border`}
          pagination={pagination}
          loading={isLoading}
          scroll={
            window.innerWidth < 600
              ? undefined
              : { y: `calc(100vh - 320px)` }
          }
        />
      </Spin>
    </div>
  );
};

export default Order;
