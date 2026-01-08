import React, { useMemo, useState } from "react";
import {
  Table,
  Typography,
  Input,
  Button,
  Spin,
  message,
  Space,
  Popconfirm,
  Tooltip,
} from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { FiEdit, FiSearch } from "react-icons/fi";
import { EyeOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  useGetBusinessAndMindsetPlansQuery,
  useCreateBusinessAndMindsetPlanMutation,
  useUpdateBusinessAndMindsetPlanMutation,
  useDeleteBusinessAndMindsetPlanMutation,
  useGetBusinessAndMindsetPlanDetailsQuery,
} from "../../redux/apiSlices/business_and_mindsetPlanSlice";
import { GymAndFitnessPlanCreateModal } from "./BusinessAndMindSetPlanCreateModal";
import { GymAndFitnessPlanInfoModal } from "./BusinessAndMindSetPlan";

const { Text } = Typography;

export type BusinessAndMindSetPlan = {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  looked: boolean;
  image?: string; // to cover the GymAndFitnessPlan type requirement for create modal
};

const BusinessAndMindSetPlan: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [viewItem, setViewItem] = useState<BusinessAndMindSetPlan | null>(null);
  const [editItem, setEditItem] = useState<BusinessAndMindSetPlan | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const query: any = { page, limit };
  if (search.trim()) query.searchTerm = search;

  const { data, isLoading, refetch } = useGetBusinessAndMindsetPlansQuery({ query });

  const [createBusinessAndMindsetPlan, { isLoading: createLoading }] = useCreateBusinessAndMindsetPlanMutation();
  const [updateBusinessAndMindsetPlan, { isLoading: updateLoading }] = useUpdateBusinessAndMindsetPlanMutation();
  const [deleteBusinessAndMindsetPlan, { isLoading: deleteLoading }] = useDeleteBusinessAndMindsetPlanMutation();

  // When viewing details, fetch from API by id
  const {  data: details,} = useGetBusinessAndMindsetPlanDetailsQuery(
    viewOpen && viewItem?._id ? viewItem._id : "",
    {
      skip: !viewOpen || !viewItem,
    }
  );

  // For edit modal, fetch the details when form is open and an item is being edited
  const {
    data: editDetails,
    isLoading: editDetailsLoading,
  } = useGetBusinessAndMindsetPlanDetailsQuery(
    formOpen && editItem?._id ? editItem._id : "",
    {
      skip: !formOpen || !editItem,
    }
  );

  const columns: TableColumnsType<BusinessAndMindSetPlan> = useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title",
        render: (v) => <Text>{v}</Text>,
      },
      {
        title: "Created",
        dataIndex: "createdAt",
        render: (v) => <Text>{new Date(v).toDateString()}</Text>,
      },
      {
        title: "Action",
        align: "center",
        render: (_: any, record: BusinessAndMindSetPlan) => (
          <Space>
            {/* View */}
            <Tooltip title="View">
              <Button
                type="link"
                style={{ color: "#dddd" }}
                onClick={() => {
                  setViewItem(record);
                  setViewOpen(true);
                  refetch()
                }}
              >
                <EyeOutlined />
              </Button>
            </Tooltip>
            {/* Edit */}
            <Tooltip title="Edit">
              <Button
                type="link"
                style={{ color: "#586A26" }}
                onClick={() => {
                  setEditItem(record);
                  setFormOpen(true);
                }}
              >
                <FiEdit />
              </Button>
            </Tooltip>
            {/* Delete */}
            <Popconfirm
              title="Delete this plan?"
              onConfirm={async () => {
                await deleteBusinessAndMindsetPlan(record._id).unwrap();
                message.success("Deleted");
                refetch();
              }}
            >
              <Button type="link" danger style={{ color: "#e54848" }}>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [updateLoading, deleteLoading, refetch]
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
      {/* Modals */}
      <GymAndFitnessPlanInfoModal
        open={viewOpen}
        // Always supply the API-fetched details for view
        plan={details?.data || null}
        onClose={() => {
          setEditItem(null);
          setViewItem(null);
          return setViewOpen(false)
        }}
      />
      <GymAndFitnessPlanCreateModal
        open={formOpen}
        loading={createLoading || updateLoading || editDetailsLoading}
        // Only provide editPlan when actually editing. When creating, always null.
        editPlan={editItem && formOpen ? (editDetails?.data ? { ...editDetails?.data } : null) : null}
        onClose={() => {
          setFormOpen(false);
          setEditItem(null);
        }}
        onAdd={async (v) => {
          await createBusinessAndMindsetPlan(v).unwrap();
          message.success("Plan added");
          setFormOpen(false);
          refetch();
        }}
        onUpdate={async (id, v) => {
          await updateBusinessAndMindsetPlan({ id, data: v }).unwrap();
          message.success("Plan updated");
          setFormOpen(false);
          setEditItem(null);
          refetch();
        }}
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
              placeholder="Search plans"
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
              className="user-search-input-white-clear user-search-input-gray-placeholder"
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ height: 40, borderRadius: 50 }}
            onClick={() => {
              // When opening for create, ensure editItem is cleared!
              setEditItem(null);
              setFormOpen(true);
            }}
          >
            Add Plan
          </Button>
        </div>
      </div>

      {/* Table */}
      <Spin spinning={isLoading}>
        <Table
          rowKey="_id"
          style={{ overflowX: "auto", marginTop: 20 }}
          dataSource={data?.data || []}
          columns={columns}
          className={`user-table-custom-gray user-table-gray-row-border`}
          pagination={pagination}
          loading={isLoading}
          scroll={
            window.innerWidth < 600 ? undefined : { y: `calc(100vh - 320px)` }
          }
        />
      </Spin>
    </div>
  );
};

export default BusinessAndMindSetPlan;
