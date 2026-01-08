import React, { useState } from "react";
import { Form, Input, Button, Typography, message, Divider } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useForgetPasswordMutation } from "../../redux/apiSlices/authSlice";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

const beautifyBgGradient =
  "radial-gradient(ellipse 100% 120% at 60% 0%, #141421 0%, #141922 40%, #131D23 70%, #141421 100%)";
const loginBoxShadow =
  "0 8px 32px 0 rgba(209,252,91,0.18), 0 1.5px 4px rgba(65,103,40,0.12)";

const ForgetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [forgetPassword] = useForgetPasswordMutation();
  const navigate = useNavigate();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);

    try {
      // Expecting API to require { "email": "user@email.com" } as body, per instruction
      const result = await forgetPassword({ email: values.email }).unwrap();

      form.resetFields();
      if (result) {
        navigate(`/reset-password?email=${encodeURIComponent(values.email)}`);
      }
    } catch (error: any) {
      message.error(
        error?.data?.message ||
          error?.message ||
          "Failed to send reset code. Please try again."
      );
    } finally {
      setLoading(false);
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
          borderRadius: "58% 39% 66% 48% / 67% 30% 66% 30%",
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
          borderRadius: 18,
          padding: "38px 36px 34px 36px",
          zIndex: 1,
          minHeight: 350,
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
            Forgot Password
          </Title>
          <Text
            style={{
              color: "#a3e635",
              fontWeight: 500,
              fontSize: 15,
              marginTop: 4,
              textAlign: "center",
              display: "block",
              maxWidth: 360,
            }}
          >
            Enter your email address below and we'll send you a code to reset
            your password.
          </Text>
        </div>
        <Divider
          style={{ marginBottom: 24, marginTop: 0, borderColor: "#3f3f46" }}
        />
        <Form
          form={form}
          name="forget-password"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          style={{ width: "100%" }}
          initialValues={{ email: "" }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email address." },
              { type: "email", message: "This is not a valid email address." },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ marginRight: 5 }} />}
              placeholder="user@email.com"
              autoComplete="email"
              size="large"
              className="login-placeholder-gray"
            />
          </Form.Item>
          <Form.Item>
            <Button
              style={{ color: "black" }}
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Send Code
            </Button>
          </Form.Item>
        </Form>
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

export default ForgetPassword;
