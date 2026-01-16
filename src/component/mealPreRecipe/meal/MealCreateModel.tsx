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
import { useEffect, useRef, useState, useMemo } from "react";
import JoditEditor from "jodit-react";
import {
  UploadOutlined,
  InboxOutlined,
  FileImageOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
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
}> = ({
  open,
  loading,
  editMeal,
  onClose,
  onAdd,
  onUpdate,
}) => {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageError, setImageError] = useState<string>("");

  const query = { page: 1, limit: 100 };
  const { data: catData } = useGetMealCategoriesQuery({ query });

  // --- Description/Editor logic using pattern like PrivacyPolicy ---
  const editorRef = useRef<any>(null);
  // Store the description HTML string by ref; initial value must sync with editMeal dynamically
  const editorContentRef = useRef<string>("");

  // When editMeal or open changes, set form fields and image states with latest values
  useEffect(() => {
    if (editMeal && open) {
      // Adapt _id for category option
      const categoryId =
        typeof editMeal.mealCategory === "string"
          ? editMeal.mealCategory
          : (editMeal.mealCategory as any)._id;
      form.setFieldsValue({
        mealCategory: categoryId,
        name: editMeal.name,
      });

      // Image preview: from meal image path
      if (editMeal.image) {
        setImagePreview(`${imageUrl}/${editMeal.image}`);
        setImageFile(null);
        setFileList([]); // keep upload empty, just preview original
        setImageError("");
      } else {
        setImagePreview("");
        setImageFile(null);
        setFileList([]);
        setImageError("");
      }

      // Description
      editorContentRef.current = editMeal.description || "";
      setTimeout(() => {
        try {
          if (editorRef.current?.editor) {
            editorRef.current.editor.value = editMeal.description || "";
          }
        } catch {}
      }, 0);
    } else if (open && !editMeal) {
      // Create mode: clear everything
      form.resetFields();
      setImagePreview("");
      setImageFile(null);
      setFileList([]);
      setImageError("");
      editorContentRef.current = "";
      setTimeout(() => {
        try {
          if (editorRef.current?.editor) {
            editorRef.current.editor.value = "";
          }
        } catch {}
      }, 0);
    }
    // Clean up on close: (no-op)
  }, [editMeal, open, form]);

  // Jodit config
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 600;
  const editorHeight = isMobile ? 240 : 240;
  const joditConfig = useMemo(
    () => ({
      placeholder: "Write description...",
      toolbarAdaptive: false,
      buttons:
        "paragraph,bold,italic,ul,ol,font,fontsize,lineHeight,align,table,brush",
      height: editorHeight,
      style: {
        background: "#131313",
        color: "#fff",
        minHeight: editorHeight,
      },
      readonly: false,
      theme: "default",
      minHeight: editorHeight,
      toolbarSticky: false,
      allowResizeY: false,
      spellcheck: true,
      statusbar: false,
      uploader: { insertImageAsBase64URI: false },
    }),
    [editorHeight]
  );

  // Image handling
  const handleImageChange = (info: any) => {
    const { file, fileList: newFileList } = info;
    setFileList(newFileList.slice(-1));
    if (file.status !== "removed") {
      const originFile = file.originFileObj || file;
      if (!originFile.type.startsWith("image/")) {
        message.error("Please upload a valid image file!");
        setImageError("Please upload a valid image file!");
        setFileList([]);
        setImageFile(null);
        setImagePreview(editMeal?.image ? `${imageUrl}/${editMeal?.image}` : "");
        return;
      }
      if (originFile.size / 1024 / 1024 > 5) {
        message.error("Image must be smaller than 5MB!");
        setImageError("Image must be smaller than 5MB!");
        setFileList([]);
        setImageFile(null);
        setImagePreview(editMeal?.image ? `${imageUrl}/${editMeal?.image}` : "");
        return;
      }
      setImageFile(originFile);
      setImageError("");
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(originFile);
      message.success("Image uploaded successfully!");
    } else handleImageRemove();
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setFileList([]);
    setImagePreview(editMeal?.image ? `${imageUrl}/${editMeal?.image}` : "");
    setImageError("Image is required");
    message.info("Image removed");
  };

  // Submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Get description from ref; fallback to initial value if not found
      let descriptionValue = editorContentRef.current;
      if (!descriptionValue || typeof descriptionValue !== "string") {
        descriptionValue = "";
      }

      // Image required check
      const needsImage = !imageFile && !imagePreview;
      if (needsImage) {
        setImageError("Image is required");
        return;
      } else setImageError("");

      const formData = new FormData();
      formData.append("mealCategory", values.mealCategory);
      formData.append("name", values.name);
      formData.append("description", descriptionValue);

      if (imageFile) formData.append("image", imageFile);

      if (editMeal) await onUpdate(editMeal._id, formData);
      else await onAdd(formData);

      form.resetFields();
      setImageFile(null);
      setFileList([]);
      setImagePreview("");
      setImageError("");
      // Reset editor description on new entry/close
      editorContentRef.current = "";
      setTimeout(() => {
        try {
          if (editorRef.current?.editor) {
            editorRef.current.editor.value = "";
          }
        } catch {}
      }, 0);
    } catch (err) {
      console.error(err);
    }
  };

  // Main JSX
  return (
    <Modal
      open={open}
      title={
        <div style={{ fontSize: 19, fontWeight: 700, color: "#fff" }}>
          {editMeal ? "Edit Meal" : "Create New Meal"}
        </div>
      }
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={editMeal ? "Update Meal" : "Create Meal"}
      cancelText="Cancel"
      width={900}
      destroyOnClose
      bodyStyle={{ padding: 32, background: "#181818" }}
    >
      <Form form={form} layout="vertical" size="large">
        {/* Meal Category */}
        <Form.Item
          label={
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
              Meal Category
            </span>
          }
          name="mealCategory"
          rules={[{ required: true, message: "Please select meal category" }]}
        >
          <Select
            placeholder="Select meal category"
            showSearch
            filterOption={(input, option) =>
              (option?.children as any)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            optionFilterProp="children"
            loading={!catData}
            disabled={!catData}
            dropdownStyle={{ background: "#232323", color: "#fff" }}
          >
            {catData?.data?.map((cat: MealCategory) => (
              <Option key={cat._id} value={cat._id} style={{ color: "#fff" }}>
                {cat.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Meal Name */}
        <Form.Item
          label={
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
              Name
            </span>
          }
          name="name"
          rules={[
            { required: true, message: "Please enter meal name" },
            { min: 2, message: "Meal name must be at least 2 characters" },
            { max: 100, message: "Meal name must be less than 100 characters" },
          ]}
        >
          <Input placeholder="Enter meal name" />
        </Form.Item>

        {/* Image Upload Section */}
        <Form.Item
          required
          label={
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
              Image
            </span>
          }
          validateStatus={imageError ? "error" : ""}
          help={imageError && <span style={{ color: "#ff4d4f" }}>{imageError}</span>}
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
                borderRadius: 15,
                border: imageError
                  ? "2px solid #ff4d4f"
                  : "2px dashed #333",
                height: 210,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#151515",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <InboxOutlined
                  style={{ fontSize: 58, color: "#23aaff" }}
                />
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#e8e8e8",
                    marginBottom: 6,
                  }}
                >
                  Click or drag image to upload
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "#ababab",
                    margin: 0,
                  }}
                >
                  Support: JPG, PNG, WEBP • Max size: 5MB
                </p>
              </div>
            </Dragger>
          ) : (
            <Card
              bordered={false}
              style={{
                borderRadius: 15,
                background: "#141414",
                height: 210,
                display: "flex",
                alignItems: "stretch",
                boxShadow: "0px 1.5px 16px #00000014",
                border: imageError
                  ? "2px solid #ff4d4f"
                  : "1.5px solid #232323",
              }}
              bodyStyle={{ height: "100%", padding: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 22,
                  alignItems: "flex-start",
                  height: "100%",
                }}
              >
                {/* Image Preview */}
                <div style={{ flex: "0 0 276px", height: "100%" }}>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: 210,
                      objectFit: "contain",
                      borderTopLeftRadius: 15,
                      borderBottomLeftRadius: 15,
                      background: "#141414",
                    }}
                    preview={{
                      mask: (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 15,
                            color: "#fff",
                          }}
                        >
                          <EyeOutlined /> Preview
                        </div>
                      ),
                    }}
                  />
                </div>

                {/* Image Actions */}
                <div
                  style={{
                    flex: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Space direction="vertical" size={18} style={{ width: "100%" }}>
                    {imageFile && (
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#fff",
                            marginBottom: 10,
                            fontWeight: 600,
                          }}
                        >
                          File Details:
                        </div>
                        <div
                          style={{
                            color: "#fff",
                            padding: "13px 17px",
                            borderRadius: 9,
                            border: "1.5px solid #282828",
                            fontSize: 14,
                            background: "#191919",
                          }}
                        >
                          <div style={{ marginBottom: 7 }}>
                            <FileImageOutlined
                              style={{ marginRight: 10, color: "#23aaff" }}
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
                    <Space size={10}>
                      <Upload
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/*"
                        showUploadList={false}
                        onChange={handleImageChange}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          style={{
                            borderRadius: 7,
                            background: "#212c3a",
                            color: "#fff",
                            border: "1.5px solid #23aaff",
                            fontWeight: 600,
                            height: 38,
                          }}
                        >
                          Change Image
                        </Button>
                      </Upload>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleImageRemove}
                        style={{
                          borderRadius: 7,
                          background: "#20191a",
                          border: "none",
                          color: "#ff7171",
                          fontWeight: 600,
                          height: 38,
                        }}
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
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
              Description
            </span>
          }
        >
          <div
            style={{
              border: "1.5px solid #242424",
              borderRadius: 13,
              overflow: "hidden",
              transition: "all 0.3s",
              background: "#131313",
            }}
          >
            <JoditEditor
              ref={editorRef}
              value={editorContentRef.current}
              config={joditConfig as any}
              tabIndex={1}
              onChange={(newContent: string) => {
                editorContentRef.current = newContent || "";
              }}
            />
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
