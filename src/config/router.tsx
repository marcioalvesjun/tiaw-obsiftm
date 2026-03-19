import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import Principal from "../pages";
import Busca from "../pages/Busca/Busca";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <>
          <Principal />
        </>,
      },
      {
        path: "/busca",
        element: <>
          <Busca />
        </>,
      }
    ]
  }

]);

export default router;