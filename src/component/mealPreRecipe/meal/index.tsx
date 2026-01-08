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
} from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { FiEdit } from "react-icons/fi";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import {
  useGetMealsQuery,
  useCreateMealMutation,
  useUpdateMealMutation,
  useDeleteMealMutation,
} from "../../../redux/apiSlices/mealSlice";
import { imageUrl } from "../../../redux/api/baseApi";
import { MealViewModel } from "./MealViewModel";
import { MealCreateModal } from "./MealCreateModel";

const { Text } = Typography;

// Enable mealCategory to be string (id) or object with a title
export type MealType = {
  _id: string;
  mealCategory: string | { _id: string; title: string };
  name: string;
  image?: string;
  description?: string;
};

interface IProps {
  editItem: MealType | null;
  setEditItem: React.Dispatch<React.SetStateAction<MealType | null>>;
  formOpen: boolean;
  setFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Meal: React.FC<IProps> = ({
  editItem,
  setEditItem,
  formOpen,
  setFormOpen,
}) => {
  // UI state
  const [search] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // View modal state
  const [viewOpen, setViewOpen] = useState<boolean>(false);
  const [viewItem, setViewItem] = useState<MealType | null>(null);

  // Query params
  const query: Record<string, any> = { page, limit };
  if (search.trim()) query.searchTerm = search;

  // Data hooks
  const { data, isLoading, refetch } = useGetMealsQuery({ query });
  const [createMeal, { isLoading: createLoading }] = useCreateMealMutation();
  const [updateMeal, { isLoading: updateLoading }] = useUpdateMealMutation();
  const [deleteMeal, { isLoading: deleteLoading }] = useDeleteMealMutation();

  // Table Columns for Meal
  const columns: TableColumnsType<MealType> = useMemo(
    () => [
      {
        title: "Image",
        dataIndex: "image",
        render: (src: string) =>
          src ? (
            <img
              src={`${imageUrl}/${src}`}
              alt=""
              style={{
                width: 56,
                height: 40,
                objectFit: "cover",
                borderRadius: 4,
                background: "#eee",
              }}
            />
          ) : (
            <span>-</span>
          ),
      },
      {
        title: "Name",
        dataIndex: "name",
        render: (v) => <Text>{v}</Text>,
      },
      {
        title: "Category",
        render: (_: any, record: MealType) => {
          let title = "";
          const cat = record.mealCategory;
          if (typeof cat === "object" && cat && "title" in cat) {
            title = cat.title;
          } else if (typeof cat === "string") {
            title = "";
          }
          return <Text>{title || "-"}</Text>;
        },
      },
      {
        title: "Action",
        align: "center",
        render: (_: any, record: MealType) => (
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
              title="Delete this meal?"
              onConfirm={async () => {
                await deleteMeal(record._id).unwrap();
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
    [updateLoading, deleteLoading, refetch, deleteMeal, setEditItem, setFormOpen]
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

  // Use MealCreateModal -- uses FormData, so pass through directly
  const handleAdd = async (formData: FormData) => {
    await createMeal(formData).unwrap();
    message.success("Meal added");
    setFormOpen(false);
    setEditItem(null);
    refetch();
  };

  const handleUpdate = async (id: string, formData: FormData) => {
    await updateMeal({ id, data: formData }).unwrap();
    message.success("Meal updated");
    setFormOpen(false);
    setEditItem(null);
    refetch();
  };

  // Render
  return (
    <div>
      {/* View Modal */}
      <MealViewModel
        open={viewOpen}
        meal={viewItem}
        onClose={() => setViewOpen(false)}
      />

      {/* Create/Edit Modal */}
      <MealCreateModal
        open={formOpen}
        loading={createLoading || updateLoading}
        editMeal={editItem}
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
          className="user-table-custom-gray user-table-gray-row-border"
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

export default Meal;
