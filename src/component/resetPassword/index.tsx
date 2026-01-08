import React, { useState, useRef, useEffect } from "react";
import { Form, Input, Button, Typography, message, Divider } from "antd";
import { LockOutlined, ReloadOutlined, LoginOutlined } from "@ant-design/icons";
import { useForgetPasswordMutation, useResetPasswordMutation } from "../../redux/apiSlices/authSlice";
import { useNavigate, useLocation } from "react-router-dom";

const { Text, Title } = Typography;

const beautifyBgGradient =
  "radial-gradient(ellipse 100% 120% at 60% 0%, #141421 0%, #141922 40%, #131D23 70%, #141421 100%)";
const loginBoxShadow =
  "0 8px 32px 0 rgba(209,252,91,0.18), 0 1.5px 4px rgba(65,103,40,0.12)";

// Professional OTP input with 6 individual boxes
const OtpInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  autoFocus?: boolean;
}> = ({ value, onChange, autoFocus }) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const newValue = e.target.value.replace(/\D/g, "");
    if (!newValue) {
      let valArr = value.split("");
      valArr[idx] = "";
      onChange(valArr.join(""));
      return;
    }
    if (newValue.length > 1) {
      let chars = newValue.split("").slice(0, 6 - idx);
      let valArr = value.split("");
      for (let i = 0; i < chars.length; ++i) {
        valArr[idx + i] = chars[i];
      }
      onChange(valArr.join(""));
      const nextIdx = Math.min(idx + chars.length, 5);
      if (nextIdx < 6 && inputsRef.current[nextIdx]) {
        inputsRef.current[nextIdx]?.focus();
      }
      return;
    }
    let valArr = value.split("");
    valArr[idx] = newValue[0];
    onChange(valArr.join(""));
    if (idx < 5 && newValue && inputsRef.current[idx + 1]) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (
      (e.key === "ArrowLeft" && idx > 0) ||
      (e.key === "ArrowUp" && idx > 0)
    ) {
      inputsRef.current[idx - 1]?.focus();
      e.preventDefault();
    } else if (
      (e.key === "ArrowRight" && idx < 5) ||
      (e.key === "ArrowDown" && idx < 5)
    ) {
      inputsRef.current[idx + 1]?.focus();
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}

          ref={(el:any) => (inputsRef.current[idx] = el)}
          value={value[idx] || ""}
          onChange={e => handleChange(e, idx)}
          onKeyDown={e => handleKeyDown(e, idx)}
          style={{
            width: 44,
            height: 50,
            textAlign: "center",
            fontSize: 26,
            borderRadius: 8,
            border: "1.5px solid #242b1f",
            outline: "none",
            boxShadow: "0 1.5px 4px rgba(65,103,40,0.07)",
            background: "#181e11",
            color: "#f0fdf4",
            fontWeight: 600,
            letterSpacing: "1px"
          }}
          autoComplete={idx === 0 ? "one-time-code" : undefined}
          aria-label={`OTP digit ${idx + 1}`}
        />
      ))}
    </div>
  );
};

const ResetPassword: React.FC = () => {
  const [step, setStep] = useState<"otp" | "reset">("otp");
  const [otp, setOtp] = useState("");
  const [otpRaw, setOtpRaw] = useState(""); // controlled value for 6-box
  const [loading, setLoading] = useState(false);

  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();
  const [forgetPassword] = useForgetPasswordMutation();

  const [formOtp] = Form.useForm();
  const [formReset] = Form.useForm();
  const [email, setEmail] = useState<string>("");
  const [resendTimer, setResendTimer] = useState(0);
  const resendRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Set email from form query on mount if possible
  useEffect(() => {
    // Try to get email from form or from query params
    let _email = formOtp.getFieldValue("email");
    if (!_email) {
      const params = new URLSearchParams(location.search);
      _email = params.get("email") || "a";
    }
    setEmail(_email);
  }, [formOtp, location.search]);

  // Timer logic for resend button enable/disable
  useEffect(() => {
    if (resendTimer > 0) {
      resendRef.current = window.setTimeout(() => setResendTimer(timer => timer - 1), 1000);
    } else {
      if (resendRef.current) clearTimeout(resendRef.current);
    }
    return () => {
      if (resendRef.current) clearTimeout(resendRef.current);
    }
  }, [resendTimer]);

  // Step 1: Enter OTP via 6 boxes
  const handleOtpSubmit = async () => {
    setLoading(true);
    try {
      if (otpRaw.length !== 6 || !/^\d{6}$/.test(otpRaw)) {
        message.error("OTP must be exactly 6 digits (numbers only).");
        setLoading(false);
        return;
      }
      setOtp(otpRaw);
      setStep("reset");
    } catch (err) {
      message.error("OTP Verification failed. Please check your code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set new password using OTP (6 digits), do not include email in payload
  const handleResetSubmit = async (values: { newPassword: string; confirmPassword: string }) => {
    setLoading(true);
    try {
      await resetPassword({
        otp,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }).unwrap();

      message.success("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1300);
    } catch (err: any) {
      message.error(
        err?.data?.message ||
          err?.message ||
          "Password reset failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle resend password logic
  const handleResend = async () => {
    setLoading(true);
    let userEmail = email;
    // Try to get email from form, URL params or fallback
    let _formEmail = formOtp.getFieldValue("email");
    if (_formEmail) userEmail = _formEmail;
    if (!userEmail) {
      const params = new URLSearchParams(location.search);
      userEmail = params.get("email") || "a";
    }
    if (!userEmail) userEmail = "a";
    try {
      await forgetPassword({ email: userEmail }).unwrap();
      setResendTimer(30); // start resend timer
      setEmail(userEmail); // update state
      message.success("Reset password email sent.");
    } catch (err: any) {
      message.error(
        err?.data?.message ||
          err?.message ||
          "Failed to send reset password email."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handler to redirect to login page
  const handleGoToLogin = () => {
    navigate("/login");
  }

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
            {step === "otp" ? "Enter Reset Code" : "Reset Password"}
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
            {step === "otp"
              ? "Enter the 6-digit code sent to your email to verify your identity."
              : "Enter your new password below."}
          </Text>
        </div>
        <Divider
          style={{ marginBottom: 24, marginTop: 0, borderColor: "#3f3f46" }}
        />
        {/* OTP Step: use professional 6-box field */}
        {step === "otp" && (
          <Form
            form={formOtp}
            name="reset-otp"
            layout="vertical"
            onFinish={handleOtpSubmit}
            requiredMark={false}
            style={{ width: "100%" }}
          >
            <Form.Item
              required
              // No name, we directly use custom logic
              validateStatus={
                (!otpRaw || otpRaw.length < 6) ? "error" : undefined
              }
              help={
                !otpRaw || otpRaw.length < 6
                  ? "Enter a 6-digit code."
                  : undefined
              }
            >
              <OtpInput
                value={otpRaw}
                onChange={val => {
                  setOtpRaw(val.replace(/\D/g, "").slice(0, 6));
                }}
                autoFocus
              />
            </Form.Item>
            <Form.Item>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <Button
                  style={{ color: "#fff", flex: 1 }}
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  disabled={otpRaw.length !== 6}
                >
                  Verify Code
                </Button>
                <Button
                  style={{ marginLeft: 10, flex: 1, color: "#ffff", border:'1px solid #ffff' }}
                  type="text"
                  icon={<ReloadOutlined />}
                  size="large"
                  disabled={loading || resendTimer > 0}
                  onClick={handleResend}
                  title={
                    resendTimer > 0
                      ? `Wait ${resendTimer}s to resend`
                      : "Get a new code by requesting password reset again."
                  }
                >
                  {resendTimer > 0 ? `Resend (${resendTimer})` : "Resend"}
                </Button>
              </div>
            </Form.Item>
            {/* Redirect to login option */}
            <Form.Item style={{ marginBottom: 0 }}>
              <div style={{ textAlign: "center", marginTop: 18 }}>
                <Button
                  type="link"
                  icon={<LoginOutlined />}
                  style={{ color: "#a3e635", fontWeight: 500, padding: 0 }}
                  onClick={handleGoToLogin}
                  tabIndex={-1}
                >
                  Back to Login
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
        {/* Reset Step */}
        {step === "reset" && (
          <Form
            form={formReset}
            name="reset-password"
            layout="vertical"
            onFinish={handleResetSubmit}
            requiredMark={false}
            style={{ width: "100%" }}
            initialValues={{ newPassword: "", confirmPassword: "" }}
          >
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: "Please enter your new password." },
                { min: 8, message: "Password must be at least 8 characters long." },
              ]}
              hasFeedback
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined style={{ marginRight: 5 }} />}
                placeholder="Enter your new password"
                autoComplete="new-password"
                className="login-placeholder-gray"
                style={{ color: "#e5e7eb", cursor: "pointer" }}
              />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['newPassword']}
              hasFeedback
              rules={[
                { required: true, message: "Please confirm your new password." },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  }
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ marginRight: 5 }} />}
                placeholder="Confirm password"
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
                loading={loading || isResettingPassword}
              >
                Change Password
              </Button>
            </Form.Item>
            {/* Redirect to login option */}
            <Form.Item style={{ marginBottom: 0 }}>
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <Button
                  type="link"
                  icon={<LoginOutlined />}
                  style={{ color: "#a3e635", fontWeight: 500, padding: 0 }}
                  onClick={handleGoToLogin}
                  tabIndex={-1}
                >
                  Back to Login
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
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

export default ResetPassword;
