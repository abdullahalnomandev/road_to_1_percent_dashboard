import {
  Form,
  Input,
  Modal
} from "antd";
import { useEffect, useState } from "react";
import Editor from "react-simple-wysiwyg";

type BusinessAndMindSetPlan = {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  looked: boolean;
  image?: string;
};

type BusinessAndMindSetPlanBody = {
  title: string;
  description: string;
};

export const GymAndFitnessPlanCreateModal: React.FC<{
  open: boolean;
  loading: boolean;
  editPlan: BusinessAndMindSetPlan | null;
  onClose: () => void;
  onAdd: (values: BusinessAndMindSetPlanBody) => Promise<void>;
  onUpdate: (id: string, values: BusinessAndMindSetPlanBody) => Promise<void>;
}> = ({ open, loading, editPlan, onClose, onAdd, onUpdate }) => {
  const [form] = Form.useForm();
  const [descError, setDescError] = useState<string>("");
  const [html, setHtml] = useState<string>("");

  // Populate fields from editPlan directly if editing, else clear fields
  useEffect(() => {
    if (open) {
      if (editPlan) {
        form.setFieldsValue({
          title: editPlan.title,
        });
        setHtml(editPlan.description || "");
        setDescError("");
      } else {
        form.resetFields();
        setHtml("");
        setDescError("");
      }
    }
    // eslint-disable-next-line
  }, [open, editPlan, form]);

  // Correct e typing
  function onChange(e: React.ChangeEvent<HTMLTextAreaElement> | string) {
    if (typeof e === "string") {
      setHtml(e);
    } else {
      setHtml(e.target.value);
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const cleanDesc = html.replace(/<[^>]*>/g, "").trim();
      if (!cleanDesc) {
        setDescError("Please enter plan description");
        return;
      }
      setDescError("");

      const body: BusinessAndMindSetPlanBody = {
        title: values.title,
        description: html
      };

      if (editPlan) {
        await onUpdate(editPlan._id, body);
      } else {
        await onAdd(body);
      }

      form.resetFields();
      setHtml("");
      setDescError("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
          {editPlan
            ? "Edit Business & Mindset Plan"
            : "Create New Business & Mindset Plan"}
        </div>
      }
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={editPlan ? "Update Plan" : "Create Plan"}
      cancelText="Cancel"
      width={600}
      destroyOnClose
      styles={{
        body: { paddingTop: 24 },
      }}
    >
      <Form form={form} layout="vertical" size="large">
        {/* Title Input */}
        <Form.Item
          label={
            <span style={{ fontSize: 14, fontWeight: 500 }}>Title</span>
          }
          name="title"
          rules={[
            { required: true, message: "Please enter plan title" },
            { min: 3, message: "Title must be at least 3 characters" },
            { max: 100, message: "Title must be less than 100 characters" },
          ]}
        >
          <Input
            placeholder="Enter title"
            style={{
              borderRadius: 8,
              fontSize: 15,
            }}
          />
        </Form.Item>

        {/* Description Editor */}
        <Form.Item
          label={
            <span style={{ fontSize: 14, fontWeight: 500 }}>
               Description
            </span>
          }
          required
          validateStatus={descError ? "error" : ""}
          help={
            descError && <span style={{ color: "#ff4d4f" }}>{descError}</span>
          }
        >
          <div
            style={{
              border: descError ? "2px solid #ff4d4f" : "1px solid #d9d9d9",
              borderRadius: 8,
              overflow: "hidden",
              transition: "all 0.3s",
            }}
          >
            <Editor
              value={html}
              onChange={(event) => onChange(event.target.value)}
              aria-multiline
              color="red"
              style={{ color: "#fff", minHeight: 200, height: 200 }}
              placeholder="Write Description"
            />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>
            💡 Tip: Use formatting tools to make your description more readable
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
