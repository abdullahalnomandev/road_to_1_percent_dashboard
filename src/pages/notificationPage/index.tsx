import { useState, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import { useGetNotificationsQuery } from "../../redux/apiSlices/notificationSlice";
import { Spin, Pagination } from "antd";

// Utility for date display
function formatDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const NotificationPage: React.FC = () => {
  // Set initial state for page and pageSize
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Always pass latest page/pageSize to query
  const { data, isLoading } = useGetNotificationsQuery({
    page,
    limit: pageSize,
  });

  // Get notifications, pagination details
  const notifications: any[] = data?.data || [];

  // Defensive: default values if not returned from API yet
  const total = data?.pagination?.total ?? 0;
  const backendPage = data?.pagination?.page ?? 1;

  // If backend returns a different page than our state, sync it
  useEffect(() => {
    if (!isLoading && typeof backendPage === "number" && backendPage !== page) {
      setPage(backendPage);
    }
    // eslint-disable-next-line
  }, [backendPage, isLoading]);

  return (
    <div
      style={{
        minHeight: 590,
        padding: "0",
        overflowY: "auto",
      }}
    >
      {/* Main Body */}
      <div
        style={{
          margin: "32px auto",
          background: "linear-gradient(135deg, rgb(2, 6, 23) 0%, rgb(10, 15, 31) 100%)",
          borderRadius: 15,
          boxShadow: "0 0 0 1.5px #383b40, 0 6px 40px 0 #18192040",
          padding: "32px 18px 34px 18px",
        }}
      >
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
            <Spin tip="Loading notifications..." size="large" />
          </div>
        ) : notifications.length === 0 ? (
          <div
            style={{
              color: "#8C949E",
              textAlign: "center",
              padding: "48px 0",
              fontSize: 16,
              fontWeight: 500,
              background: "#17181c",
              borderRadius: 12,
            }}
          >
            No notifications found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifications?.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#2E2E2E",
                  borderRadius: 10,
                  height: 62,
                  marginBottom: "0",
                }}
              >
                <div
                  style={{
                    width: 50,
                    minWidth: 50,
                    height: 50,
                    background: "#3F522E",
                    borderRadius: 8,
                    margin: "0 8px",
                    marginRight: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FiBell style={{ color: "#A3C64B", fontSize: 20 }} />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ color: "#ffff", fontWeight: 700, fontSize: 15, letterSpacing: 0.2 }}>
                    {item.title ?? "Email Notification"}
                  </span>
                  <span style={{
                    color: "#BABABA",
                    fontSize: 13,
                    fontWeight: 400,
                    letterSpacing: 0.1,
                    marginTop: 1,
                  }}>
                    {item.message ?? "Lorem ipsum dolor sit amet, put all your content"}
                  </span>
                  <span style={{ color: "#6C7B6A", fontSize: 12, marginTop: 2 }}>
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            ))}
            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  showSizeChanger={false}
                  onChange={newPage => setPage(newPage)}
                  style={{ background: "none" }}
                />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
