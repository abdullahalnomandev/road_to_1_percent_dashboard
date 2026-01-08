import React, { useMemo, useState } from "react";
import {
  Table,
  Typography,
  Button,
  Spin,
  message,
  Space,
  Popconfirm,
  Tooltip,
  Switch,
} from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { FiEdit } from "react-icons/fi";
import { DeleteOutlined } from "@ant-design/icons";
import {
  useGetMealCategoriesQuery,
  useCreateMealCategoryMutation,
  useUpdateMealCategoryMutation,
  useDeleteMealCategoryMutation,
} from "../../../redux/apiSlices/mealCategorySlice";
import { CategoryCreateModel } from "./CategoryCreateModel";

const { Text } = Typography;

export type MealCategoryType = {
  _id: string;
  title: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  mealCount: number;
  // description?: string;
  // image?: string;
};

interface IProps {
  editItem: MealCategoryType | null;
  setEditItem: React.Dispatch<React.SetStateAction<MealCategoryType | null>>;
  formOpen: boolean;
  setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MealCategory: React.FC<IProps> = ({ editItem, setEditItem, formOpen, setFormOpen }) => {
  const [search] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

//   const [editItem, setEditItem] = useState<MealCategoryType | null>(null);
//   const [formOpen, setFormOpen] = useState(false);

  const query: Record<string, any> = { page, limit };
  if (search.trim()) query.searchTerm = search;

  const { data, isLoading, refetch } = useGetMealCategoriesQuery({ query });

  const [createMealCategory, { isLoading: createLoading }] = useCreateMealCategoryMutation();
  const [updateMealCategory, { isLoading: updateLoading }] = useUpdateMealCategoryMutation();
  const [deleteMealCategory, { isLoading: deleteLoading }] = useDeleteMealCategoryMutation();


  // Toggle active status
  const handleToggleActive = async (record: MealCategoryType, checked: boolean) => {
    try {
      await updateMealCategory({
        id: record._id,
        data: { active: checked },
      }).unwrap();
      message.success(
        `Category "${record.title}" marked as ${
          checked ? "Active" : "Inactive"
        }`
      );
      refetch();
    } catch (err) {
      message.error("Update failed");
    }
  };

  const columns: TableColumnsType<MealCategoryType> = useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title",
        render: (v) => <Text>{v}</Text>,
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
                await handleToggleActive(r, checked);
              }}
              style={v ? { backgroundColor: "#586A26" } : {}}
            />
          </Tooltip>
        ),
      },
      {
        title: "Meals",
        dataIndex: "mealCount",
        align: "center",
        render: (v) => <Text>{typeof v === "number" ? v : 0}</Text>
      },
      {
        title: "Action",
        align: "center",
        render: (_: any, record: MealCategoryType) => (
          <Space>
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
              title="Delete this category?"
              onConfirm={async () => {
                await deleteMealCategory(record._id).unwrap();
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
    [updateLoading, deleteLoading, refetch, deleteMealCategory]
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



  const handleFormCancel = () => {
    setFormOpen(false);
    setEditItem(null);
  };

  // Compose for add/update:
  const handleAdd = async (values: { title: string }) => {
    // If backend expects FormData, create as such; else, use object directly.
    //@ts-ignore
    await createMealCategory({ ...values }).unwrap();
    message.success("Category added");
    setFormOpen(false);
    setEditItem(null);
    refetch();
  };

  const handleUpdate = async (id: string, values: { title: string }) => {
    await updateMealCategory({ id, data: values }).unwrap();
    message.success("Category updated");
    setFormOpen(false);
    setEditItem(null);
    refetch();
  };

  return (
    <div>
      {/* Create/Edit Modal */}
      <CategoryCreateModel
        open={formOpen}
        loading={createLoading || updateLoading}
        editCategory={
          editItem
            ? {
                _id: editItem._id,
                title: editItem.title,
                createdAt: editItem.createdAt,
                updatedAt: editItem.updatedAt,
                image: undefined, // CategoryCreateModel expects this prop
              }
            : null
        }
        onClose={handleFormCancel}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
      />

     
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
            typeof window !== "undefined" && window.innerWidth < 600
              ? undefined
              : { y: `calc(100vh - 320px)` }
          }
        />
      </Spin>
    </div>
  );
};

export default MealCategory;
