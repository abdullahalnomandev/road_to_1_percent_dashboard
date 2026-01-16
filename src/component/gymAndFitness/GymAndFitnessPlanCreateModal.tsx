import {
  Form,
  Input,
  Modal,
  Upload,
  Button,
  Image,
  message,
  Card,
  Space,
} from "antd";
import { useEffect, useRef, useMemo, useState } from "react";
import JoditEditor from "jodit-react";
import {
  UploadOutlined,
  InboxOutlined,
  FileImageOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import "react-quill/dist/quill.snow.css";
import type { UploadFile } from "antd";
import { imageUrl } from "../../redux/api/baseApi";

const { Dragger } = Upload;

type GymAndFitnessPlan = {
  _id: string;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  looked: boolean;
};

export const GymAndFitnessPlanCreateModal: React.FC<{
  open: boolean;
  loading: boolean;
  editPlan: GymAndFitnessPlan | null;
  onClose: () => void;
  onAdd: (values: FormData) => Promise<void>;
  onUpdate: (id: string, values: FormData) => Promise<void>;
}> = ({ open, loading, editPlan, onClose, onAdd, onUpdate }) => {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageError, setImageError] = useState<string>(""); // <-- for image error message

  // Jodit Editor logic --- useRef for value, not state!
  const editor = useRef(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 600;
  const editorHeight = isMobile ? 200 : 300;

  // Use ref for description
  const editorContentRef = useRef<string>(editPlan?.description || "");
  
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
      allowResizeY: false,
      spellcheck: true,
      statusbar: false,
      // Custom CSS for the editor (matches high-contrast look of Biz modal)
      uploader: { insertImageAsBase64URI: false },    
    }),
    [editorHeight]
  );
  
  

  useEffect(() => {
    if (editPlan) {
      form.setFieldsValue({
        title: editPlan.title,
      });
      editorContentRef.current = editPlan.description || "";
      setImageFile(null);
      setFileList([]);
      setImagePreview(editPlan.image ? `${imageUrl}/${editPlan.image}` : "");
      setImageError("");
    } else {
      form.resetFields();
      editorContentRef.current = "";
      setImageFile(null);
      setFileList([]);
      setImagePreview("");
      setImageError("");
    }
  }, [editPlan, form, open]);

  const handleImageChange = (info: any) => {
    const { file, fileList: newFileList } = info;
    setFileList(newFileList.slice(-1));

    if (file.status !== "removed") {
      const originFile = file.originFileObj || file;

      const isImage = originFile.type && originFile.type.startsWith("image/");
      if (!isImage) {
        setImageError("Please upload a valid image file!");
        setFileList([]);
        setImageFile(null);
        setImagePreview(editPlan?.image ? `${imageUrl}/${editPlan?.image}` : "");
        return;
      }

      const isLt5M = originFile.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        setImageError("Image must be smaller than 5MB!");
        setFileList([]);
        setImageFile(null);
        setImagePreview(editPlan?.image ? `${imageUrl}/${editPlan?.image}` : "");
        return;
      }

      setImageFile(originFile);
      setImageError("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(originFile);
      message.success("Image uploaded successfully!");
    } else {
      handleImageRemove();
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setFileList([]);
    setImagePreview(editPlan?.image ? `${imageUrl}/${editPlan?.image}` : "");
    setImageError("Image is required."); // Set error if removed
    message.info("Image removed");
  };

  const handleEditorChange = (newContent: string) => {
    editorContentRef.current = newContent;
    // No setState for html, just update ref
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Image is required for new, and must be present for edit (either file or preview from editPlan)
      if ((!imageFile && (!editPlan || !editPlan.image))) {
        setImageError("Image is required.");
        // Also scroll to image section for user feedback
        document.getElementById("plan-image-field")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      } else {
        setImageError("");
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", editorContentRef.current || ""); // Save html as desc to db

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (editPlan && editPlan.image) {
        // No new file, but keep existing image
        formData.append("image", editPlan.image);
      } else {
        formData.append("image", "");
      }

      try {
        if (editPlan) {
          await onUpdate(editPlan._id, formData);
        } else {
          await onAdd(formData);
        }
      } catch (error: any) {
        // Show error message on failure
        console.log(error);
        // Handle Mongoose validation error for image
        if (
          error &&
          error.success === false &&
          Array.isArray(error.errorMessages)
        ) {
          // Look for the "image" path error
          const imgError = error.errorMessages.find(
            (msg: any) => msg.path === "image"
          );
          if (imgError) {
            setImageError(imgError.message || "Image is required.");
            return;
          }
        }
        message.error(error?.message || error || "Failed to save plan. Please try again.");
        return;
      }

      form.resetFields();
      editorContentRef.current = "";
      setImageFile(null);
      setFileList([]);
      setImagePreview("");
      setImageError("");
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
            ? "Edit Gym & Fitness Plan"
            : "Create New Gym & Fitness Plan"}
        </div>
      }
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={editPlan ? "Update Plan" : "Create Plan"}
      cancelText="Cancel"
      width={850}
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
        {/* Image Upload Section */}
        <Form.Item
          label={
            <span style={{ fontSize: 14, fontWeight: 500 }}>Image<span style={{ color: "#ff3333" }}> *</span></span>
          }
          required
          style={{ marginBottom: imageError ? 4 : 24 }}
          validateStatus={imageError ? "error" : undefined}
          help={imageError || undefined}
          id="plan-image-field"
        >
          {!imagePreview ? (
            <Dragger
              name="image"
              multiple={false}
              maxCount={1}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              beforeUpload={() => false}
              onChange={handleImageChange}
              fileList={fileList}
              showUploadList={false}
              style={{
                borderRadius: 12,
                border: imageError ? "2px dashed #ff3333" : "2px dashed #d9d9d9",
                transition: "all 0.3s",
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div style={{ width: "100%", padding: 0, margin: 0 }}>
                <div style={{ display: 'flex', height: 200, alignItems: 'center', justifyContent: 'center' }}>
                  <div>
                    <p className="ant-upload-drag-icon" style={{ textAlign: "center" }}>
                      <InboxOutlined style={{ fontSize: 56, color: imageError ? "#ff3333" : "#1890ff" }} />
                    </p>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: "#fff",
                        marginBottom: 8,
                        textAlign: "center"
                      }}
                    >
                      Click or drag image to upload
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#fff",
                        margin: 0,
                        textAlign: "center"
                      }}
                    >
                      Support: JPG, PNG, WEBP • Max size: 5MB
                    </p>
                  </div>
                </div>
              </div>
            </Dragger>
          ) : (
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                background: "black",
                height: 200,
                display: "flex",
                alignItems: "stretch",
                border: imageError ? "1.5px solid #ff3333" : undefined,
              }}
              bodyStyle={{
                height: "100%",
                padding: 0
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                  height: "100%"
                }}
              >
                {/* Image Preview */}
                <div style={{ flex: "0 0 280px", height: "100%" }}>
                  <div
                    style={{
                      position: "relative",
                      borderRadius: 10,
                      overflow: "hidden",
                      height: "100%"
                    }}
                  >
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: 200,
                        objectFit: "contain",
                        borderTopRightRadius: 10,
                        borderBottomRightRadius: 10,
                        background: "black"
                      }}
                      preview={{
                        mask: (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 14,
                            }}
                          >
                            <EyeOutlined /> Preview
                          </div>
                        ),
                      }}
                    />
                  </div>
                </div>

                {/* Image Info & Actions */}
                <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    {imageFile && (
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#fff",
                            marginBottom: 8,
                            fontWeight: 500,
                          }}
                        >
                          File Details:
                        </div>
                        <div
                          style={{
                            color: "#fff",
                            padding: "12px 16px",
                            borderRadius: 8,
                            border: "1px solid #e8e8e8",
                            fontSize: 13,
                          }}
                        >
                          <div style={{ marginBottom: 6 }}>
                            <FileImageOutlined
                              style={{ marginRight: 8, color: "#1890ff" }}
                            />
                            <strong>Name:</strong> {imageFile.name}
                          </div>
                          <div>
                            <strong>Size:</strong>{" "}
                            {(imageFile.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      </div>
                    )}

                    <Space size={8}>
                      <Upload
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/*"
                        showUploadList={false}
                        onChange={handleImageChange}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          style={{ borderRadius: 6 }}
                        >
                          Change Image
                        </Button>
                      </Upload>

                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleImageRemove}
                        style={{ borderRadius: 6 }}
                      >
                        Remove
                      </Button>
                    </Space>
                  </Space>
                </div>
              </div>
            </Card>
          )}
        </Form.Item>

        {/* Description Editor */}
        <Form.Item
          label={
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              Description
            </span>
          }
          // Description is not required
        >
          <div
            style={{
              border: "1px solid #d9d9d9",
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
