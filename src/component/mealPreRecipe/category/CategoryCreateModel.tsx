import {
  Form,
  Input,
  Modal
} from "antd";
import { useEffect } from "react";

type MealCategory = {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  image?: string;
};

type MealCategoryBody = {
  title: string;
};

export const CategoryCreateModel: React.FC<{
  open: boolean;
  loading: boolean;
  editCategory: MealCategory | null;
  onClose: () => void;
  onAdd: (values: MealCategoryBody) => Promise<void>;
  onUpdate: (id: string, values: MealCategoryBody) => Promise<void>;
}> = ({ open, loading, editCategory, onClose, onAdd, onUpdate }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (editCategory) {
        form.setFieldsValue({
          title: editCategory.title,
        });
      } else {
        form.resetFields();
      }
    }
    // eslint-disable-next-line
  }, [open, editCategory, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const body: MealCategoryBody = {
        title: values.title,
      };
      if (editCategory) {
        await onUpdate(editCategory._id, body);
      } else {
        await onAdd(body);
      }
      form.resetFields();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
          {editCategory ? "Edit Meal Category" : "Add New Meal Category"}
        </div>
      }
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={editCategory ? "Update" : "Add"}
      cancelText="Cancel"
      width={420}
      destroyOnClose
      styles={{
        body: { paddingTop: 24 },
      }}
    >
      <Form form={form} layout="vertical" size="large">
        <Form.Item
          label={
            <span style={{ fontSize: 14, fontWeight: 500 }}>Title</span>
          }
          name="title"
          rules={[
            { required: true, message: "Please enter category title" },
            { min: 2, message: "Title must be at least 2 characters" },
            { max: 100, message: "Title must be less than 100 characters" },
          ]}
        >
          <Input
            placeholder="Enter category title"
            style={{
              borderRadius: 8,
              fontSize: 15,
            }}
            disabled={loading}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};