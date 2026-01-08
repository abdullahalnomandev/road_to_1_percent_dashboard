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
  Select,
} from "antd";
import { useEffect, useState } from "react";
import Editor from "react-simple-wysiwyg";
import {
  UploadOutlined,
  InboxOutlined,
  FileImageOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import "react-quill/dist/quill.snow.css";
import type { UploadFile } from "antd";
import { imageUrl } from "../../../redux/api/baseApi";
import { useGetMealCategoriesQuery } from "../../../redux/apiSlices/mealCategorySlice";

const { Dragger } = Upload;
const { Option } = Select;

type MealType = {
  _id: string;
  mealCategory: string | { _id: string; title: string };
  name: string;
  image?: string;
  description?: string;
};

type MealCategory = {
  _id: string;
  title: string;
};

export const MealCreateModal: React.FC<{
  open: boolean;
  loading: boolean;
  editMeal: MealType | null;
  onClose: () => void;
  onAdd: (values: FormData) => Promise<void>;
  onUpdate: (id: string, values: FormData) => Promise<void>;
}> = ({ open, loading, editMeal, onClose, onAdd, onUpdate }) => {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [descError, setDescError] = useState<string>("");

  // For dropdown pagination, handy if many categories (not included UX here)
  const [categoryLimit] = useState(100);
  const [categoryPage] = useState(1);

  const query = {
    page: categoryPage,
    limit: categoryLimit,
  };

  const { data: catData } = useGetMealCategoriesQuery({ query });

  const [html, setHtml] = useState<string>("");

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement> | string) {
    if (typeof e === "string") {
      setHtml(e);
    } else {
      setHtml(e.target.value);
    }
  }

  // Handles both string and object format for mealCategory from editMeal
  useEffect(() => {
    if (editMeal) {
      let catId = "";
      if (typeof editMeal.mealCategory === "object" && editMeal.mealCategory?._id) {
        catId = editMeal.mealCategory._id;
      } else if (typeof editMeal.mealCategory === "string") {
        catId = editMeal.mealCategory;
      }
      form.setFieldsValue({
        mealCategory: catId || undefined,
        name: editMeal.name,
      });
      setHtml(editMeal.description || "");
      setImageFile(null);
      setFileList([]);
      setImagePreview(editMeal.image ? `${imageUrl}/${editMeal.image}` : "");
    } else {
      form.resetFields();
      setHtml("");
      setImageFile(null);
      setFileList([]);
      setImagePreview("");
    }
    setDescError("");
  }, [editMeal, form, open]);

  const handleImageChange = (info: any) => {
    const { file, fileList: newFileList } = info;
    setFileList(newFileList.slice(-1));

    if (file.status !== "removed") {
      const originFile = file.originFileObj || file;

      const isImage = originFile.type && originFile.type.startsWith("image/");
      if (!isImage) {
        message.error("Please upload a valid image file!");
        setFileList([]);
        return;
      }

      const isLt5M = originFile.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
        setFileList([]);
        return;
      }

      setImageFile(originFile);

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
    setImagePreview(editMeal?.image ? `${imageUrl}/${editMeal?.image}` : "");
    message.info("Image removed");
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Remove html tags for checking
      const cleanDesc = html.replace(/<[^>]*>/g, "").trim();
      if (!cleanDesc) {
        setDescError("Please enter description");
        return;
      }
      setDescError("");

      const formData = new FormData();
      formData.append("mealCategory", values.mealCategory);
      formData.append("name", values.name);
      formData.append("description", html);

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (!editMeal) {
        formData.append("image", "");
      }

      if (editMeal) {
        await onUpdate(editMeal._id, formData);
      } else {
        await onAdd(formData);
      }

      form.resetFields();
      setHtml("");
      setImageFile(null);
      setFileList([]);
      setImagePreview("");
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
          {editMeal ? "Edit Meal" : "Create New Meal"}
        </div>
      }
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={editMeal ? "Update Meal" : "Create Meal"}
      cancelText="Cancel"
      width={850}
      destroyOnClose
      styles={{
        body: { paddingTop: 24 },
      }}
    >
      <Form form={form} layout="vertical" size="large">
        {/* Meal Category Selector */}
        <Form.Item
          label={
            <span style={{ fontSize: 14, fontWeight: 500 }}>Meal Category</span>
          }
          name="mealCategory"
          rules={[
            { required: true, message: "Please select meal category" },
          ]}
        >
          <Select
            placeholder="Select meal category"
            showSearch
            filterOption={(input, option) =>
              (option?.children as any)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            style={{ borderRadius: 8, fontSize: 15,background:'black' }}
            optionFilterProp="children"
            loading={!catData}
            disabled={!catData}
          >
            {catData &&
              Array.isArray(catData?.data) &&
              catData.data.map((cat: MealCategory) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.title}
                </Option>
              ))}
          </Select>
        </Form.Item>

        {/* Name Input */}
        <Form.Item
          label={
            <span style={{ fontSize: 14, fontWeight: 500 }}>Name</span>
          }
          name="name"
          rules={[
            { required: true, message: "Please enter meal name" },
            { min: 2, message: "Meal name must be at least 2 characters" },
            { max: 100, message: "Meal name must be less than 100 characters" },
          ]}
        >
          <Input
            placeholder="Enter meal name"
            style={{
              borderRadius: 8,
              fontSize: 15,
            }}
          />
        </Form.Item>

        {/* Image Upload Section */}
        <Form.Item
          label={
            <span style={{ fontSize: 14, fontWeight: 500 }}>Image</span>
          }
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
                border: "2px dashed #d9d9d9",
                transition: "all 0.3s",
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "100%", padding: 0, margin: 0 }}>
                <div
                  style={{
                    display: "flex",
                    height: 200,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div>
                    <p
                      className="ant-upload-drag-icon"
                      style={{ textAlign: "center" }}
                    >
                      <InboxOutlined style={{ fontSize: 56, color: "#1890ff" }} />
                    </p>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: "#fff",
                        marginBottom: 8,
                        textAlign: "center",
                      }}
                    >
                      Click or drag image to upload
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#fff",
                        margin: 0,
                        textAlign: "center",
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
              }}
              bodyStyle={{
                height: "100%",
                padding: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                  height: "100%",
                }}
              >
                {/* Image Preview */}
                <div style={{ flex: "0 0 280px", height: "100%" }}>
                  <div
                    style={{
                      position: "relative",
                      borderRadius: 10,
                      overflow: "hidden",
                      height: "100%",
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
                        background: "black",
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
                <div
                  style={{
                    flex: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
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
            <span style={{ fontSize: 14, fontWeight: 500 }}>Description</span>
          }
          required
          validateStatus={descError ? "error" : ""}
          help={
            descError && (
              <span style={{ color: "#ff4d4f" }}>{descError}</span>
            )
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
