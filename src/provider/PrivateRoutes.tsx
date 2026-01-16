import { Navigate, useLocation } from "react-router-dom";
import { useProfileQuery } from "../redux/apiSlices/authSlice";


const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const { data: profile, isLoading, isFetching, isError } = useProfileQuery(undefined)

  console.log(profile)

  if (isLoading || isFetching) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          color: "#444",
          fontSize: "1.15rem",
          letterSpacing: 0.2,
        }}
      >
        <span
          style={{
            fontWeight: 500,
            fontSize: "1.3rem",
            marginBottom: ".8rem",
          }}
        >
          Please wait...
        </span>
      </div>
    );
  }

  if (isError || !profile?.data) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (profile?.data) {
    return children;
  }

};

export default PrivateRoute;