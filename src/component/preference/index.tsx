import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Tag,
  Typography,
  Input,
  Button,
  Modal,
  Descriptions,
  Spin,
  message,
  Form,
  Switch,
  Space,
  Popconfirm,
  Tooltip,
} from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { FiEdit, FiSearch } from "react-icons/fi";
import { EyeOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";

import {
  useGetPreferencesQuery,
  useCreatePreferenceMutation,
  useDeletePreferenceMutation,
  useUpdatePreferenceMutation,
} from "../../redux/apiSlices/preference";

const { Text } = Typography;

/* =====================
   Types
===================== */
type Preference = {
  _id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

/* =====================
   View Modal
===================== */
const PreferenceInfoModal: React.FC<{
  preference: Preference | null;
  open: boolean;
  onClose: () => void;
}> = ({ preference, open, onClose }) => (
  <Modal open={open} onCancel={onClose} footer={null} centered width={500}>
    {preference && (
      <>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 28, color: "#fff" }}>
            {preference.name}
          </div>
        </div>

        <Descriptions column={1} bordered>
          <Descriptions.Item label="ID">
            {preference._id}
          </Descriptions.Item>
          <Descriptions.Item label="Active">
            <Tag
              style={{
                background: preference.active ? "#23a978" : "#d72632",
                color: "#fff",
                border: "none",
              }}
            >
              {preference.active ? "Yes" : "No"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(preference.createdAt).toDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated">
            {new Date(preference.updatedAt).toDateString()}
          </Descriptions.Item>
        </Descriptions>
      </>
    )}
  </Modal>
);

/* =====================
   Create / Edit Modal
===================== */
const PreferenceCreateModal: React.FC<{
  open: boolean;
  loading: boolean;
  editPreference: Preference | null;
  onClose: () => void;
  onAdd: (values: { name: string; active: boolean }) => Promise<void>;
  onUpdate: (
    id: string,
    values: { name: string; active: boolean }
  ) => Promise<void>;
}> = ({ open, loading, editPreference, onClose, onAdd, onUpdate }) => {
  const [form] = Form.useForm();

  // ✅ Proper default value handling
  useEffect(() => {
    if (editPreference) {
      form.setFieldsValue({
        name: editPreference.name,
        active: editPreference.active,
      });
    } else {
      form.resetFields();
    }
  }, [editPreference, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (editPreference) {
      await onUpdate(editPreference._id, values);
    } else {
      await onAdd(values);
    }

    form.resetFields();
  };

  return (
    <Modal
      open={open}
      title={editPreference ? "Edit Preference" : "Add Preference"}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={editPreference ? "Update" : "Create"}
      width={400}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ active: true }}>
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: "Please enter preference name" },
            { min: 2, message: "Name too short" },
          ]}
        >
          <Input placeholder="Preference name" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

/* =====================
   Main Page
===================== */
const Preference: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [viewItem, setViewItem] = useState<Preference | null>(null);
  const [editItem, setEditItem] = useState<Preference | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const query: any = { page, limit };
  if (search.trim()) query.searchTerm = search;

  const { data, isLoading, refetch } = useGetPreferencesQuery({ query });

  const [createPreference, { isLoading: createLoading }] =
    useCreatePreferenceMutation();
  const [updatePreference, { isLoading: updateLoading }] =
    useUpdatePreferenceMutation();
  const [deletePreference, { isLoading: deleteLoading }] =
    useDeletePreferenceMutation();

  /* =====================
     Table Columns
  ===================== */
  const columns: TableColumnsType<Preference> = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        render: (v) => <Text >{v}</Text>,
      },
      {
        title: "Active",
        dataIndex: "active",
        render: (v, r) => (
          <Tooltip title={v ? "Deactivate preference" : "Activate preference"}>
            <Switch
              checked={v}
              loading={updateLoading}
              onChange={async (checked) => {
                await updatePreference({
                  id: r._id,
                  data: { active: checked },
                }).unwrap();
                message.success("Status updated");
                refetch();
              }}
              style={v ? { backgroundColor: "#586A26" } : {}}
            />
          </Tooltip>
        ),
      },
      {
        title: "Created",
        dataIndex: "createdAt",
        render: (v) => (
          <Text >
            {new Date(v).toDateString()}
          </Text>
        ),
      },
      {
        title: "Action",
        align: "center",
        render: (_, record) => (
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

            <Popconfirm
              title="Delete this preference?"
              onConfirm={async () => {
                await deletePreference(record._id).unwrap();
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
    [updateLoading, deleteLoading]
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
      <PreferenceInfoModal
        open={viewOpen}
        preference={viewItem}
        onClose={() => setViewOpen(false)}
      />

      <PreferenceCreateModal
        open={formOpen}
        loading={createLoading || updateLoading}
        editPreference={editItem}
        onClose={() => {
          setFormOpen(false);
          setEditItem(null);
        }}
        onAdd={async (v) => {
          await createPreference(v).unwrap();
          message.success("Preference added");
          setFormOpen(false);
          refetch();
        }}
        onUpdate={async (id, v) => {
          await updatePreference({ id, data: v }).unwrap();
          message.success("Preference updated");
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
              placeholder="Search preferences"
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{height:40, borderRadius:50}}
            onClick={() => setFormOpen(true)}
          >
            Add Preference
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
            window.innerWidth < 600
              ? undefined
              : { y: `calc(100vh - 320px)` }
          }
          // No onChange needed for this table since pagination handled above
        />
      </Spin>
    </div>
  );
};

export default Preference;
