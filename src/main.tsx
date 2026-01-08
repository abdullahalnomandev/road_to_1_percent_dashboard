import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider, theme as antdTheme } from "antd";
import "./index.css";
import { Provider } from 'react-redux';
import store from './redux/store.ts';
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index.tsx";

const AppProviders = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#D1FC5B",
          colorTextBase: "black",
        },
        components: {
          Table: {
            colorBgContainer: "#1C1C1C",
            headerColor: "#ffff",
            borderColor: "#bdbdbd",
            headerBorderRadius: 0,
            headerSplitColor: "transparent", // remove table header border right
          },
          Form: {
            labelColor: '#ffff',
          },
          Pagination: {
            colorBgContainer: "#ffff",
            colorText: "black",
          },
          Select: {
            // Can't change popup/dropdown color here, has to be done via popupClassName/custom CSS!
            // These work for the base input, not dropdown itself.
            colorBgContainer: "#586A26",
            colorText: "white",
            colorTextPlaceholder: "white",
            // Do NOT use colorBorder here. AntD expects a color not "none".
            optionSelectedBg: "#D1FC5B",
            optionSelectedColor: "black",
            colorIcon: "white", // custom icon color for arrow
            colorBorder: "#586A26",
            colorTextDisabled: "#B7B7B7",
          },
          Input: {
            colorBgContainer: "#000", // make input background black
            colorText: "white", // make input text white
            colorTextPlaceholder: "#9ca3af", // placeholder color gray
            colorBorder: "#232323",
            // colorItemText is not a valid property for Input component tokens
          },
          Modal: {
            contentBg: "#1C1C1C",
            headerBg: "#1C1C1C",
            titleColor: "white",
            colorText: "#ffff",
          },
          Descriptions: {
            colorBgContainer: "#1C1C1C", // overall descriptions bg
            titleColor: "#fff", // title color (if any)
            colorText: "#fff", // default text color
            labelColor: "#B7FF39", // label color
          },
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
        <AppProviders />
    </Provider>
  </StrictMode>
);

// colorBgBase:  '#ffffff',
// colorTextBase:  '#020617',
// borderRadius: 12,
