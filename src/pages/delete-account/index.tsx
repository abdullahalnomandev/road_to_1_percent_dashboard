import React from "react";
import { Form, Input, Button, Typography, message, Divider } from "antd";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
  // UserOutlined, // not used
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useDeleteUserMutation } from "../../redux/apiSlices/authSlice";

const { Text, Title } = Typography;

// -- Professional Theme Colors --
const beautifyBgGradient =
  "radial-gradient(ellipse 100% 120% at 60% 0%, #141421 0%, #141922 40%, #131D23 70%, #141421 100%)";
const loginBoxShadow =
  "0 8px 32px 0 rgba(209,252,91,0.18), 0 1.5px 4px rgba(65,103,40,0.12)";

// Main Page
const DeleteAccountPage: React.FC = () => {
  const [form] = Form.useForm();
  const [deleteUser, { isLoading: loading }] = useDeleteUserMutation();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
       await deleteUser({
        ...values
      }).unwrap();
      message.success("User deleted successfully!");
    } catch (err: any) {
      if (err?.data?.errorMessages?.length) {
        message.error(err.data.errorMessages[0].message);
      } else if (err?.data?.message) {
        message.error(err.data.message);
      } else {
        message.error("Sign in failed. Please try again.");
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: beautifyBgGradient,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#e5e7eb",
      }}
    >
      {/* Elegant floating shapes */}
      <div
        style={{
          position: "absolute",
          top: 32,
          right: 136,
          width: 112,
          height: 112,
          background:
            "radial-gradient(circle, rgba(209,252,91,0.34) 58%, transparent 100%)",
          borderRadius: "50%",
          filter: "blur(17px)",
          opacity: 0.14,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 18,
          bottom: 12,
          width: 228,
          height: 98,
          background:
            "radial-gradient(ellipse at right, rgba(163,230,53,0.15) 60%, transparent 100%)",
          borderRadius:
            "58% 39% 66% 48% / 67% 30% 66% 30%",
          filter: "blur(36px)",
          opacity: 0.21,
          zIndex: 0,
        }}
      />
      <div
        style={{
          width: 450,
          maxWidth: "97vw",
          boxShadow: loginBoxShadow,
          //   background: loginCardBg,
          borderRadius: 18,
          padding: "38px 36px 34px 36px",
          //   border: cardBorder,
          zIndex: 1,
          minHeight: 415,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <img
            src="https://rt1percent.com/cdn/shop/files/favicon_black_circle_512.png"
            alt="Logo"
            style={{
              width: 54,
              height: 54,
              borderRadius: "100px",
              marginBottom: 8,
              border: "2.5px solid #a3e63522",
              boxShadow: "0 2px 10px #d1fc5b33",
              background: "#1f2a19",
            }}
          />
          <Title
            level={3}
            style={{
              color: "#f9fafb",
              margin: 0,
              fontWeight: 700,
              fontSize: 27,
              letterSpacing: "0.01em",
              textAlign: "center",
              lineHeight: 1.19,
            }}
          >
            Delete Your Account.
          </Title>
          <Text
            style={{
              color: "#ffff",
              fontWeight: 500,
              fontSize: 15,
              marginTop: 4,
            }}
          >
            Please enter your password to confirm account deletion.
          </Text>
        </div>
        <Divider
          style={{
            marginBottom: 24,
            marginTop: 0,
            borderColor: "#3f3f46",
          }}
        />
        <Form
          form={form}
          name="login"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          style={{ width: "100%" }}
          initialValues={{ email: "", password: "" }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter your email address.",
              },
              {
                type: "email",
                message: "This is not a valid email address.",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ marginRight: 5 }} />}
              placeholder="user@email.com"
              autoComplete="email"
              size="large"
              // For inline style, placeholder color doesn't work; need CSS override
              className="login-placeholder-gray"
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password.",
              },
              {
                min: 6,
                message: "Password must be at least 6 characters.",
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined style={{ marginRight: 5 }} />}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="login-placeholder-gray"
              style={{ color: "#e5e7eb", cursor: "pointer" }}
              iconRender={(visible) =>
                visible ? (
                  <span style={{ color: "#a3e635" }}>
                    <EyeOutlined />
                  </span>
                ) : (
                  <span style={{ color: "#a3e635" }}>
                    <EyeInvisibleOutlined />
                  </span>
                )
              }
            />
          </Form.Item>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 10,
            }}
          >
            <Link to="/forget-password">
              <Text
                style={{
                  color: "#a3e635",
                }}
              >
                Forgot password?
              </Text>
            </Link>
          </div>
          <Form.Item>
            <Button
              danger
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Delete Account
            </Button>
          </Form.Item>
        </Form>
        {/* Custom CSS to set placeholder color to gray */}
        <style>
          {`
          .login-placeholder-gray::placeholder {
            color: #9ca3af !important;
            opacity: 1 !important;
          }
          /* For password input inside .ant-input-affix-wrapper */
          .login-placeholder-gray input::placeholder {
            color: #9ca3af !important;
            opacity: 1 !important;
          }
          `}
        </style>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
