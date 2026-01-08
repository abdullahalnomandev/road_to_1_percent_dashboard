import { useState, useEffect, useRef } from "react";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  CameraOutlined,
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import {
  Tabs,
  Button,
  Input,
  message,
  Avatar,
  Typography,
  Tooltip,
  Divider,
} from "antd";
import { useProfileQuery } from "../../redux/apiSlices/authSlice";
import { imageUrl } from "../../redux/api/baseApi";
import {
  useUpdateUserMutation,
  useChangePasswordMutation, // <-- import useChangePasswordMutation
} from "../../redux/apiSlices/userSlice";

const { Title, Text } = Typography;

const profileFormFields = [
  {
    name: "name",
    label: "Full Name",
    placeholder: "Enter your full name",
    icon: <UserOutlined />,
    validation: (value: string) => (!value ? "Please enter your name!" : null),
  },
  {
    name: "contact",
    label: "Contact Number",
    placeholder: "Enter your contact number",
    icon: <PhoneOutlined />,
    validation: (value: string) => {
      if (!value) return "Please enter your contact number!";
      if (!/^[\d+\-\s()]+$/.test(value))
        return "Please enter a valid contact number!";
      return null;
    },
  },
];

const passwordFormFields = [
  {
    name: "current",
    label: "Current Password",
    placeholder: "Enter current password",
    validation: (value: string) =>
      !value ? "Please enter your current password!" : null,
  },
  {
    name: "new",
    label: "New Password",
    placeholder: "Enter new password",
    validation: (value: string) => {
      if (!value) return "Please enter your new password!";
      if (value.length < 8) return "Password must be at least 8 characters!";
      return null;
    },
  },
  {
    name: "confirm",
    label: "Confirm New Password",
    placeholder: "Confirm new password",
    validation: (value: string, allValues: any) => {
      if (!value) return "Please confirm your new password!";
      if (value !== allValues.new) return "Passwords do not match!";
      return null;
    },
  },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState("1");
  const { data: userProfile } = useProfileQuery(undefined);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [
    changePassword,
    { isLoading: isChangingPassword },
  ] = useChangePasswordMutation();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [profileValues, setProfileValues] = useState({
    name: "",
    email: "",
    contact: "",
  });

  // Renamed all profileImage to image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfileValues({
      name: userProfile?.data?.name || "",
      email: userProfile?.data?.email || "",
      contact: userProfile?.data?.mobile || "",
    });
    setPreviewImage(undefined);
    setImageFile(null);
  }, [userProfile]);

  const [passwordValues, setPasswordValues] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [profileErrors, setProfileErrors] = useState<any>({});
  const [passwordErrors, setPasswordErrors] = useState<any>({});

  const handleProfileSubmit = async () => {
    const errors: any = {};
    profileFormFields.forEach((field) => {
      const error = field.validation(
        profileValues[field.name as keyof typeof profileValues]
      );
      if (error) errors[field.name] = error;
    });

    setProfileErrors(errors);
    if (Object.keys(errors).length === 0) {
      try {
        // Use FormData to update name and mobile/contact (and image if present)
        const formData = new FormData();
        formData.append("name", profileValues.name);
        formData.append("mobile", profileValues.contact);

        if (imageFile) {
          formData.append("image", imageFile);
        }

        await updateUser(formData).unwrap();
        message.success("Profile updated successfully!");
      } catch (err: any) {
        message.error(
          err?.data?.message ||
          err?.message ||
          "Failed to update profile. Please try again."
        );
      }
    }
  };

  // Updated to use useChangePasswordMutation for password change
  const handlePasswordSubmit = async () => {
    const errors: any = {};
    passwordFormFields.forEach((field) => {
      const error = field.validation(
        passwordValues[field.name as keyof typeof passwordValues],
        passwordValues
      );
      if (error) errors[field.name] = error;
    });

    setPasswordErrors(errors);
    if (Object.keys(errors).length === 0) {
      try {
        await changePassword({
          currentPassword: passwordValues.current,
          newPassword: passwordValues.new,
          confirmPassword: passwordValues.confirm,
        }).unwrap();
        message.success("Password changed successfully!");
        setPasswordValues({ current: "", new: "", confirm: "" });
      } catch (err: any) {
        message.error(
          err?.data?.message ||
          err?.message ||
          "Failed to change password. Please try again."
        );
      }
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const renderProfileFields = () =>
    profileFormFields.map((field: any) => (
      <div key={field.name} style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            fontWeight: 600,
            color: "#e5e7eb",
            fontSize: 14,
            marginBottom: 8,
          }}
        >
          {field.label}
        </label>
        <Input
          size="large"
          placeholder={field.placeholder}
          prefix={
            field.icon && <span style={{ color: "#6b7280" }}>{field.icon}</span>
          }
          value={profileValues[field.name as keyof typeof profileValues]}
          onChange={(e) => {
            setProfileValues({
              ...profileValues,
              [field.name]: e.target.value,
            });
            setProfileErrors({ ...profileErrors, [field.name]: null });
          }}
          status={profileErrors[field.name] ? "error" : ""}
          style={{
            borderRadius: 8,
            fontSize: 15,
            height: 44,
            color: "#f3f4f6",
          }}
          className="dark-input"
        />
        {profileErrors[field.name] && (
          <div style={{ color: "#fca5a5", fontSize: 13, marginTop: 4 }}>
            {profileErrors[field.name]}
          </div>
        )}
      </div>
    ));

  const renderPasswordFields = () =>
    passwordFormFields.map((field: any) => (
      <div key={field.name} style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            fontWeight: 600,
            color: "#e5e7eb",
            fontSize: 14,
            marginBottom: 8,
          }}
        >
          {field.label}
        </label>
        <Input
          size="large"
          type={
            showPasswords[field.name as keyof typeof showPasswords]
              ? "text"
              : "password"
          }
          placeholder={field.placeholder}
          prefix={<LockOutlined style={{ color: "#6b7280" }} />}
          suffix={
            <span
              style={{
                cursor: "pointer",
                color: "#9ca3af",
                transition: "color 0.2s",
              }}
              onClick={() =>
                togglePasswordVisibility(
                  field.name as "current" | "new" | "confirm"
                )
              }
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D1FC5B")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
            >
              {showPasswords[field.name as keyof typeof showPasswords] ? (
                <EyeOutlined style={{ fontSize: 16 }} />
              ) : (
                <EyeInvisibleOutlined style={{ fontSize: 16 }} />
              )}
            </span>
          }
          value={passwordValues[field.name as keyof typeof passwordValues]}
          onChange={(e) => {
            setPasswordValues({
              ...passwordValues,
              [field.name]: e.target.value,
            });
            setPasswordErrors({ ...passwordErrors, [field.name]: null });
          }}
          status={passwordErrors[field.name] ? "error" : ""}
          style={{
            borderRadius: 8,
            fontSize: 15,
            height: 44,
            color: "#f3f4f6",
          }}
          className="dark-input"
        />
        {passwordErrors[field.name] && (
          <div style={{ color: "#fca5a5", fontSize: 13, marginTop: 4 }}>
            {passwordErrors[field.name]}
          </div>
        )}
      </div>
    ));

  // Image preview URL (local, fallback to previous image if none or not changed)
  const getProfileImageSrc = () => {
    if (previewImage) return previewImage;
    if (userProfile?.data?.image) {
      if (userProfile.data.image.startsWith("http")) {
        return userProfile.data.image;
      } else {
        return imageUrl + "/" + userProfile.data.image;
      }
    }
    // fallback
    return "https://noman1.netlify.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FAbdullah_Al_Noman.c5d6012f.jpg&w=640&q=75";
  };

  // Handler for image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      message.error("Selected file is not a valid image");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const tabItems = [
    {
      key: "1",
      label: (
        <span style={{ fontWeight: 600, fontSize: 15, padding: "0 12px" }}>
          Profile Information
        </span>
      ),
      children: (
        <div style={{ padding: "32px 40px", background: "#000" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <div style={{ position: "relative", marginBottom: 20 }}>
              <Avatar
                size={110}
                src={getProfileImageSrc()}
                style={{
                  border: "4px solid #D1FC5B",
                  boxShadow:
                    "0 0 0 4px rgba(209, 252, 91, 0.1), 0 8px 24px rgba(209, 252, 91, 0.2)",
                }}
              />
              <Tooltip title="Change profile picture">
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: -4,
                    background:
                      "linear-gradient(135deg, #D1FC5B 0%, #b8e639 100%)",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(209, 252, 91, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    border: "3px solid #111827",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1) rotate(5deg)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(209, 252, 91, 0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(209, 252, 91, 0.4)";
                  }}
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                >
                  <CameraOutlined
                    style={{ color: "#0a0a0a", fontSize: 16, fontWeight: 700 }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                </span>
              </Tooltip>
            </div>
            <Title
              level={3}
              style={{
                marginBottom: 4,
                color: "#f9fafb",
                fontWeight: 700,
                fontSize: 24,
              }}
            >
              {profileValues.name}
            </Title>
            <Text style={{ fontSize: 14, color: "#9ca3af" }}>
              {profileValues.email}
            </Text>
          </div>

          <div>
            {renderProfileFields()}
            <div>
              <Button
                type="primary"
                size="large"
                block
                onClick={handleProfileSubmit}
                loading={isUpdating}
                style={{
                  borderRadius: 8,
                  background:
                    "linear-gradient(135deg, #D1FC5B 0%, #b8e639 100%)",
                  fontWeight: 700,
                  height: 48,
                  fontSize: 15,
                  boxShadow: "0 4px 16px rgba(209, 252, 91, 0.3)",
                  border: "none",
                  letterSpacing: 0.5,
                  color: "#0a0a0a",
                }}
                className="profile-save-btn"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <span style={{ fontWeight: 600, fontSize: 15, padding: "0 12px" }}>
          Password Settings
        </span>
      ),
      children: (
        <div style={{ padding: "32px 40px", background: "#000" }}>
          <div style={{ marginBottom: 28 }}>
            <Title
              level={4}
              style={{
                marginBottom: 8,
                color: "#f9fafb",
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              Change Password
            </Title>
            <Text style={{ fontSize: 14, color: "#9ca3af" }}>
              Ensure your account is using a strong password to stay secure
            </Text>
          </div>

          <Divider style={{ margin: "24px 0", borderColor: "#374151" }} />

          {renderPasswordFields()}

          <Button
            type="primary"
            size="large"
            block
            onClick={handlePasswordSubmit}
            loading={isChangingPassword}
            style={{
              borderRadius: 8,
              background: "linear-gradient(135deg, #D1FC5B 0%, #b8e639 100%)",
              fontWeight: 700,
              height: 48,
              fontSize: 15,
              boxShadow: "0 4px 16px rgba(209, 252, 91, 0.3)",
              border: "none",
              letterSpacing: 0.5,
              color: "#0a0a0a",
            }}
            className="profile-save-btn"
          >
            Update Password
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        // background: " #000",
        padding: "48px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: "#000",
          borderRadius: 20,
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.5), 0 2px 16px 0 rgba(209, 252, 91, 0.25), 0 0 0 1px rgba(209, 252, 91, 0.12)",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          // Remove 'centered' to align tabs to the start (left)
          tabBarStyle={{
            background: "#0f0f0f",
            margin: 0,
            padding: "0 20px",
            borderBottom: "1px solid #2a2a2a",
          }}
        />
      </div>

      <style>
        {`

        .ant-tabs-tab {
          padding: 16px 8px !important;
          transition: all 0.3s;
          color: #9ca3af !important;
        }

        `}
      </style>
    </div>
  );
}
