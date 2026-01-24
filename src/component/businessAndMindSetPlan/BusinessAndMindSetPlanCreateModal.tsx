import {
  Form,
  Input,
  message,
  Modal
} from "antd";
import { useEffect, useRef, useMemo, useState } from "react";
import JoditEditor from "jodit-react";

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
  // Use useRef for editor content (same as GymAndFitness)
  const editorContentRef = useRef<string>(editPlan?.description || "");

  // Jodit Editor logic
  const editor = useRef(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 600;
  const editorHeight = isMobile ? 200 : 300;

  const joditConfig = useMemo(
    () => ({
      readonly: false,
    height: 240, // higher for more space, matches "BusinessAndMindSetPlanCreateModal"
    minHeight: 240,
    theme: "default",
    buttons:
    "undo,redo,|," +
    "font,fontsize,|," +
    "brush,|," +
    "bold,italic,underline,strikethrough,|," +
    "ul,ol,|," +
    "lineHeight,|," ,
    placeholder: "Write Description",
    toolbarAdaptive: false,
    style: { background: "#131313", color: "#fff", minHeight: 240 },
    toolbarSticky: false,
    allowResizeY: true,
    spellcheck: true,
    statusbar: false,
    // Custom CSS for the editor (matches high-contrast look of Biz modal)
    uploader: { insertImageAsBase64URI: false },
    }),
    [editorHeight]
  );

  // Populate fields from editPlan directly if editing, else clear fields
  useEffect(() => {
    if (open) {
      if (editPlan) {
        form.setFieldsValue({
          title: editPlan.title,
        });
        editorContentRef.current = editPlan.description || "";
        setDescError("");
      } else {
        form.resetFields();
        editorContentRef.current = "";
        setDescError("");
      }
    }
    // eslint-disable-next-line
  }, [open, editPlan, form]);

  const handleEditorChange = (newContent: string) => {
    editorContentRef.current = newContent;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Remove html tags for requiredness
      const cleanDesc = (editorContentRef.current || "").replace(/<[^>]*>/g, "").trim();
      if (!cleanDesc) {
        setDescError("Please enter plan description");
        message.error("Please enter plan description");
        return;
      }
      setDescError("");

      const body: BusinessAndMindSetPlanBody = {
        title: values.title,
        description: editorContentRef.current || ""
      };

      if (editPlan) {
        await onUpdate(editPlan._id, body);
      } else {
        await onAdd(body);
      }

      form.resetFields();
      editorContentRef.current = "";
      setDescError("");
    } catch (err: any) {
      // Try to show error message from the db response if available
      let dbMsg = err?.data?.message || err?.message || err?.error;
      // If error message contains "The value of \"offset\" is out of range.", convert numbers to MB/KB and make human readable
      if (typeof dbMsg === "string" && dbMsg.includes('The value of "offset" is out of range')) {
        // Extract Received and max values
        const receivedMatch = dbMsg.match(/Received (\d+)/);
        const maxMatch = dbMsg.match(/<= (\d+)/);
        const received = receivedMatch ? parseInt(receivedMatch[1], 10) : null;
        const max = maxMatch ? parseInt(maxMatch[1], 10) : null;
        // Function to format size
        const fmt = (n: number) => {
          if (n >= 1024 * 1024) return (n / (1024 * 1024)).toFixed(2) + " MB";
          if (n >= 1024) return (n / 1024).toFixed(2) + " KB";
          return n + " B";
        };
        if (received !== null && max !== null) {
          dbMsg = `The value of "offset" is out of range. Allowed range is 0 to ${fmt(max)}. Received ${fmt(received)}.`;
        }
      }
      if (dbMsg) {
        message.error(dbMsg);
      } else {
        message.error("Failed to submit. Please check the form.");
      }
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
      width={700}
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
              background: "#181c1f",
            }}
          >
            <JoditEditor
              ref={editor}
              value={editorContentRef.current}
              config={joditConfig as any}
              tabIndex={1}
              onChange={handleEditorChange}
            />
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
