import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Badge,
  theme,
  Drawer,
  Button,
} from "antd";
import { BellOutlined, LogoutOutlined, MenuOutlined } from "@ant-design/icons";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import type { MenuProps } from "antd";
import React from "react";
import { MENU_CONFIG } from "../constant/sidebarMenue";
import { handleLogout } from "../services/auth.service";
import { useProfileQuery } from "../redux/apiSlices/authSlice";
import { imageUrl } from "../redux/api/baseApi";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

function getMenuItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuProps["items"]
): Required<MenuProps>["items"][number] {
  return {
    key,
    icon,
    children,
    label,
  };
}

const LOGOUT_ITEM = {
  key: "logout",
  label: <span>Logout</span>,
  icon: <LogoutOutlined style={{ color: "red" }} />,
};

const menuItems: MenuProps["items"] = MENU_CONFIG.map((item) =>
  getMenuItem(item.label, item.key, item.icon)
);

const logoutMenuItem: MenuProps["items"] = [
  getMenuItem(LOGOUT_ITEM.label, LOGOUT_ITEM.key, LOGOUT_ITEM.icon),
];

// Dynamically generate the key to path mapping
const keyToPath: Record<string, string | undefined> = MENU_CONFIG.reduce(
  (acc, cur) => {
    if (cur.path) acc[cur.key] = cur.path;
    return acc;
  },
  {} as Record<string, string>
);

const logoutKey = LOGOUT_ITEM.key;

const siderWidth = 240;

const getSelectedKey = (pathname: string): string => {
  // Try to find an exact match
  let found = MENU_CONFIG.find((item) => item.path && item.path === pathname);
  if (found) return found.key;

  // Try to find a prefix match for non-root
  found = MENU_CONFIG.find(
    (item) => item.path && item.path !== "/" && pathname.startsWith(item.path)
  );
  if (found) return found.key;

  // If root and menu contains '/', use it
  found = MENU_CONFIG.find((item) => item.path === "/");
  if (pathname === "/" && found) return found.key;

  // Fallback: try to find the first defined path that matches at least leading slash
  found = MENU_CONFIG.find(
    (item) => item.path && pathname.startsWith(item.path)
  );
  if (found) return found.key;

  // Otherwise fallback to first entry
  return MENU_CONFIG[0]?.key ?? "";
};

// -- Responsive: helper hook --
function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);
  return isMobile;
}

const DashboardLayout: React.FC = () => {

  const { data: profile } = useProfileQuery(undefined)

  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = React.useMemo(
    () => getSelectedKey(location.pathname),
    [location.pathname]
  );
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleMenuClick: MenuProps["onClick"] = (info) => {
    const path = keyToPath[info.key];
    if (path !== undefined) {
      navigate(path);
      setDrawerOpen(false);
    }
    // For logout and other actions, implement as needed here
  };

  const handleLogoutClick: MenuProps["onClick"] = () => {
    handleLogout();
  };

  // --- SIDER CONTENT FACTORY ---
  const SidebarContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: `calc(100% - ${isMobile ? 112 : 122}px)`,
        overflow: "auto",
        minHeight: 0,
        // background: "red",
        background: "#2E2E2E",
        marginTop: isMobile ? 0 : 10,
        borderTopRightRadius: isMobile ? 0 : 10,
      }}
    >
      {/* Main navigation menu, grow to take up space */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{
            borderInline: 0,
            background: "transparent",
            padding: 16,
            flex: 1,
            minHeight: 0,
          }}
          theme="dark"
          onClick={handleMenuClick}
          className="dashboard-menu more-y-gap-menu"
        />
        <style>
          {`
            .more-y-gap-menu .ant-menu-item {
              margin-bottom: 15px !important; /* Adjust gap as desired */
            }
            .more-y-gap-menu .ant-menu-item:last-child {
              margin-bottom: 0 !important;
            }
          `}
        </style>
      </div>
    </div>
  );

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "#111827",
        flexDirection: "row",
      }}
    >
      {/* Responsive Sidebar */}
      {isMobile ? (
        <>
          <Drawer
            placement="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            width={siderWidth}
            closable={false}
            bodyStyle={{
              padding: 0,
              background: "#020617",
            }}
          >
            {/* Logo/Header */}
            <div
              style={{
                height: 64,
                display: "flex",
                alignItems: "center",
                paddingInline: 24,
                // borderBottom: "1px solid #1f2937",
                color: "#e5e7eb",
                fontWeight: 600,
                fontSize: 18,
                background: "#2E2E2E",
                letterSpacing: 1,
                flexShrink: 0,
                // borderBottomRightRadius: 10,
              }}
            >
              <Link
                to="/"
                style={{
                  fontWeight: 700,
                  color: "#fff",
                  fontSize: 26,
                  letterSpacing: 0,
                  lineHeight: "44px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Road <span style={{ fontWeight: 600 }}>to&nbsp;1%</span>
              </Link>
            </div>
            {SidebarContent}
            {/* Logout at the absolute bottom without scroll */}
            <div
              style={{
                flexShrink: 0,
                // no paddingBottom needed for mobile
              }}
            >
              <Menu
                mode="inline"
                selectedKeys={selectedKey === logoutKey ? [logoutKey] : []}
                items={logoutMenuItem}
                style={{
                  borderInline: 0,
                  background: "#2E2E2E",
                  paddingInline: 16,
                  flex: 1,
                }}
                theme="dark"
                onClick={handleLogoutClick}
                className="dashboard-menu logout-menu"
              />
              <style>
                {`
            .logout-menu .ant-menu-item {
              background: #black !important;
            }
            .logout-menu .ant-menu-item-selected {
              color: #fff !important;
            }
          `}
              </style>
            </div>
            <style>
              {`
                .dashboard-menu .ant-menu-item-selected {
                  color: #fff !important;
                }
              `}
            </style>
            <style>
              {`
                .dashboard-menu .ant-menu-item-selected {
                  color: #000 !important;
                }
              `}
            </style>
          </Drawer>
        </>
      ) : (
        <Sider
          width={siderWidth}
          style={{
            background: "#020617",
            // borderRight: "1px solid #1f2937",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            height: "100vh",
            zIndex: 100,
            // overflow: "auto",
            display: "flex",
            flexDirection: "column",
            transition: "width 0.2s",
          }}
        >
          {/* Logo/Header */}
          <div
            style={{
              height: 64,
              display: "flex",
              alignItems: "center",
              paddingInline: 24,
              // borderBottom: "1px solid #1f2937",
              color: "#e5e7eb",
              background: "#2E2E2E",
              fontWeight: 600,
              fontSize: 18,
              letterSpacing: 1,
              flexShrink: 0,
              borderBottomRightRadius: 10,
            }}
          >
            <Link
              to="/"
              style={{
                fontWeight: 700,
                color: "#fff",
                fontSize: 26,
                letterSpacing: 0,
                lineHeight: "44px",
                textDecoration: "none",
              }}
            >
              Road <span style={{ fontWeight: 600 }}>to&nbsp;1%</span>
            </Link>
          </div>
          {SidebarContent}
          {/* Logout at the absolute bottom without scroll */}
          <div
            style={{
              flexShrink: 0,
              paddingBottom: isMobile ? 0 : 16,
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={selectedKey === logoutKey ? [logoutKey] : []}
              items={logoutMenuItem}
              style={{
                borderInline: 0,
                background: "#2E2E2E",
                paddingInline: 16,
                flex: 1,
              }}
              theme="dark"
              onClick={handleLogoutClick}
              className="dashboard-menu logout-menu"
            />
            <style>
              {`
            .logout-menu .ant-menu-item {
              background: #black !important;
            }
            .logout-menu .ant-menu-item-selected {
              color: #fff !important;
            }
          `}
            </style>
          </div>
          <style>
            {`
              .dashboard-menu .ant-menu-item-selected {
                color: #fff !important;
              }
            `}
          </style>
          <style>
            {`
              .dashboard-menu .ant-menu-item-selected {
                color: #000 !important;
              }
            `}
          </style>
        </Sider>
      )}

      {/* Main Content Wrapper */}
      <Layout
        style={{
          marginLeft: isMobile ? 0 : siderWidth,
          background:
            "linear-gradient(135deg, rgb(2, 6, 23) 0%, rgb(10, 15, 31) 100%)",
          minHeight: "100vh",
          transition: "margin-left 0.2s",
        }}
      >
        {/* Fixed/Header: with hamburger for mobile & responsive tweaks */}
        <Header
          style={{
            position: "fixed",
            left: isMobile ? 0 : siderWidth,
            right: 0,
            top: 0,
            zIndex: 101,
            paddingInline: isMobile ? 12 : 32,
            background: "#2E2E2E",
            // borderBottom: '1px solid #1f2937',
            marginLeft: 10,
            borderBottomLeftRadius: 10,
            display: "flex",
            height: 64,
            alignItems: "center",
            justifyContent: "space-between",
            width: isMobile ? "100%" : `calc(100% - ${siderWidth}px)`,
            transition: "left 0.2s,width 0.2s",
          }}
        >
          {/* Hamburger on mobile */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 10 : 20,
            }}
          >
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined style={{ color: "#fff", fontSize: 22 }} />}
                onClick={() => setDrawerOpen(true)}
                style={{ marginRight: 8 }}
              />
            )}
            {/* Dynamically show selected menu label as header */}
            <Text
              style={{
                color: "#f9fafb",
                fontSize: isMobile ? 18 : 22,
                fontWeight: 600,
              }}
            >
              {
                // Try to get selected item's label for header
                MENU_CONFIG.find((item) => item.key === selectedKey)?.label ??
                  ""
              }
            </Text>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 12 : 24,
            }}
          >
            <Link to="/notifications">
              <Badge count={0} size="small" color="#84cc16">
                <BellOutlined style={{ color: "#9ca3af", fontSize: 18 }} />
              </Badge>
            </Link>
            <div
              style={{
                display: isMobile ? "none" : "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                onClick={() => navigate("/profile")}
              >
                <Avatar
                  src={
                    profile?.data?.profileImage?.startsWith("http")
                      ? profile.data.profileImage
                      : `${imageUrl}/${profile.data.profileImage}`
                  }
                />
                <Text style={{ color: "#f9fafb", fontWeight: 500 }}>
                  {profile?.data?.name}
                </Text>
              </div>
              </div>
            </div>
        </Header>
        {/* Main Content Padding for fixed header */}
        <Content
          style={{
            margin: 10,
            marginTop: 74, // 64px header + 10px margin
            background: token.colorBgContainer,
            backgroundColor: "#2E2E2E",
            borderRadius: 10,
            padding: isMobile ? 12 : 24,
            // minHeight: `calc(100vh - 74px)`,
            transition: "padding 0.2s",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      <style>
        {`
          /* Hide Sider on mobile (keep only Drawer version) */
          @media (max-width: 767px) {
            .ant-layout-sider {
              display: none !important;
            }
          }
        `}
      </style>
    </Layout>
  );
};

export default DashboardLayout;
