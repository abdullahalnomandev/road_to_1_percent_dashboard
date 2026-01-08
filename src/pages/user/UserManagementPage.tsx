import React, { useState } from "react";
import {
  Table,
  Tag,
  Typography,
  Input,
  Avatar,
  Modal,
  Button,
  Descriptions,
  Spin,
  message,
} from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { FiSearch } from "react-icons/fi";
import { EyeOutlined } from "@ant-design/icons";
import { useGetUsersQuery } from "../../redux/apiSlices/userSlice";

const { Text } = Typography;

// =====================
// User type definition
// =====================
type User = {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  status: string;
  profile_mode: string;
  createdAt: string;
};

// =====================
// Modal to view user info
// =====================
const UserInfoModal: React.FC<{
  user: User | null;
  open: boolean;
  onClose: () => void;
}> = ({ user, open, onClose }) => (
  <Modal
    open={open}
    onCancel={onClose}
    onOk={onClose}
    title={
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 0 12px 0",
          borderRadius: 0,
        }}
      >
        <Avatar
          size={72}
          src={user?.image}
          style={{
            marginBottom: 12,
            border: "2px solid #232323",
            background: "#232323",
          }}
        />
        <div
          style={{
            fontSize: "2rem",
            fontWeight: 400,
            color: "#fff",
            letterSpacing: 0.5,
          }}
        >
          {user?.name}
        </div>
        <div
          style={{
            color: "#cccccc",
            fontSize: 18,
            marginTop: 4,
            fontWeight: 400,
          }}
        >
          {user?.email}
        </div>
      </div>
    }
    footer={null}
    centered
    width={600}
  >
    {user && (
      <Descriptions
        column={1}
        bordered
        contentStyle={{ color: "#fff" }}
        labelStyle={{ color: "#fff" }}
      >
        <Descriptions.Item label="ID">{user._id}</Descriptions.Item>
        <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Role">{user.role}</Descriptions.Item>
        <Descriptions.Item label="Status" style={{ color: "#fff" }}>
          <Tag
            style={{
              background:
                user.status === "active"
                  ? "#23a978"
                  : user.status === "delete"
                  ? "#d72632"
                  : "#808080",
              color: "#fff",
              border: "none",
              textTransform: "capitalize",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            {user.status?.charAt(0).toUpperCase() + user.status.slice(1)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Profile Mode">
          <Tag
            style={{
              background: "#586A26",
              color: "#fff",
              border: "none",
              textTransform: "capitalize",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            {user.profile_mode?.charAt(0).toUpperCase() +
              user.profile_mode?.slice(1)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {(() => {
            const date = new Date(user.createdAt);
            return `${date
              .getDate()
              .toString()
              .padStart(2, "0")} ${date.toLocaleString("en-US", {
              month: "short",
            })} ${date.getFullYear()}`;
          })()}
        </Descriptions.Item>
      </Descriptions>
    )}
  </Modal>
);

// =====================
// Status tag color helper
// =====================
function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "#586A26";
    case "delete":
      return "#586A26";
    default:
      return "#586A26";
  }
}

// =====================
// Table columns
// =====================
const columns: TableColumnsType<User> = [
  {
    title: "User",
    dataIndex: "name",
    key: "name",
    width: 180,
    render: (_: string, record: User) => (
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar src={record.image} size={36} />
        <span>
          <Text style={{ color: "#f9fafb" }}>{record.name}</Text>
        </span>
      </span>
    ),
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    width: 200,
    render: (value: string) => <Text style={{ color: "#fff" }}>{value}</Text>,
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
    width: 110,
    render: (value: string) => (
      <span style={{ color: "#fff" }}>
        {value?.charAt(0).toUpperCase() + value?.slice(1)}
      </span>
    ),
  },
  {
    title: "Feature Access",
    dataIndex: "canAccessFeature",
    key: "canAccessFeature",
    width: 140,
    render: (value: string) => (
      <Tag
        style={{
          background: getStatusColor(value),
          color: "#fff",
          border: "none",
          textTransform: "capitalize",
          fontWeight: 500,
          fontSize: 13,
        }}
      >
        {value ? "Yes" : "No"}
      </Tag>
    ),
  },
  {
    title: "Profile",
    dataIndex: "profile_mode",
    key: "profile_mode",
    width: 120,
    render: (value: string) => (
      <Tag
        style={{
          background: "#586A26",
          color: "#fff",
          border: "none",
          textTransform: "capitalize",
          fontWeight: 500,
          fontSize: 13,
        }}
      >
        {value?.charAt(0).toUpperCase() + value?.slice(1)}
      </Tag>
    ),
  },
  {
    title: "Created",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 120,
    render: (value: string) => (
      <Text style={{ color: "#d4d4d8", fontSize: 12 }}>
        {(() => {
          const date = new Date(value);
          return `${date.getDate().toString().padStart(2, "0")} ${date.toLocaleString(
            "en-US",
            { month: "short" }
          )} ${date.getFullYear()}`;
        })()}
      </Text>
    ),
  },
];

// =====================
// Main Component
// =====================
const UserManagementPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openViewModal, setOpenViewModal] = useState(false);

  // Compose backend query params (status filter removed)
  let query: any = { page, limit };
  if (search.trim()) {
    query.searchTerm = search.trim();
  }

  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
  } = useGetUsersQuery({ query });

  React.useEffect(() => {
    if (usersError) {
      message.error("Failed to fetch users.");
    }
  }, [usersError]);

  // Table columns with action column
  const userColumns: TableColumnsType<User> = React.useMemo(
    () => [
      ...columns,
      {
        title: "Action",
        key: "action",
        width: 80,
        align: "center",
        render: (_: any, record: User) => (
          <Button
            icon={<EyeOutlined />}
            type="link"
            style={{ color: "#94B341", padding: 0 }}
            onClick={() => {
              setSelectedUser(record);
              setOpenViewModal(true);
            }}
          >
            View
          </Button>
        ),
      },
    ],
    []
  );

  // Table change handler
  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: any,
    _sorter: any
  ) => {
    if (
      pagination.current !== undefined &&
      pagination.current !== page
    )
      setPage(pagination.current);
    if (
      pagination.pageSize !== undefined &&
      pagination.pageSize !== limit
    )
      setLimit(pagination.pageSize);
  };

  // Pagination info based on backend pagination response
  const backendPage = users?.pagination?.page ?? page;
  const backendLimit = users?.pagination?.limit ?? limit;
  const backendTotal = users?.pagination?.total ?? 0;

  const paginationConfig: TablePaginationConfig = {
    total: backendTotal,
    pageSize: backendLimit,
    current: backendPage,
    showSizeChanger: true,
    // showQuickJumper: true,
    pageSizeOptions: ["5", "10", "20", "50", "100"],
  };

  // Data extraction from response
  const userData: User[] = users?.data?.data || users?.data || [];

  return (
    <div>
      <UserInfoModal
        user={selectedUser}
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
      />
      {/* Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#232323",
            borderRadius: 32,
            padding: "6px 18px 6px 8px",
            boxShadow: "0px 2px 9px 0px rgba(0,0,0,0.15)",
            width: 350,
            minHeight: 46,
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
            placeholder="Search here"
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
      {/* Table */}
      <Spin spinning={usersLoading}>
        <Table
          rowKey="_id"
          style={{ overflowX: "auto" }}
          dataSource={userData}
          columns={userColumns}
          className={`user-table-custom-gray user-table-gray-row-border`}
          pagination={paginationConfig}
          loading={usersLoading}
          scroll={
            window.innerWidth < 600
              ? undefined
              : { y: `calc(100vh - 320px)` }
          }
          onChange={handleTableChange}
        />
      </Spin>
    </div>
  );
};

export default UserManagementPage;
