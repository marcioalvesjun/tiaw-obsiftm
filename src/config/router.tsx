import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "../components";
import { 
  About, 
  Home,
  SearchByCampusBibliographic,
  SearchByPeriodBibliographic,
  SearchByProfessorBibliographic,
  SearchByCampusOrientations,
  SearchByPeriodOrientations,
  SearchByCampusInnovation,
  SearchByPeriodInnovation
} from "../pages";

const computedBasename = (() => {
  if (typeof window === "undefined") return undefined;
  const isGithubPagesHost = window.location.hostname.endsWith("github.io");
  if (!isGithubPagesHost) return undefined;
  const [first] = window.location.pathname.split("/").filter(Boolean);
  return first ? `/${first}` : undefined;
})();

const indicadoresDefaultPath = "/indicadores/producao-bibliografica/consulta-por-periodo";

const router = createBrowserRouter(
  [
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <>
            <Home />
          </>
        ),
      },
      {
        path: "/sobre",
        element: (
          <>
            <About />
          </>
        ),
      },
      {
        path: "/indicadores",
        element: <Navigate to={indicadoresDefaultPath} replace />,
      },
      {
        path: "/indicadores/producao-bibliografica",
        element: <Navigate to={indicadoresDefaultPath} replace />,
      },
      {
        path: "/indicadores/orientacoes",
        element: <Navigate to={indicadoresDefaultPath} replace />,
      },
      {
        path: "/indicadores/inovacao",
        element: <Navigate to={indicadoresDefaultPath} replace />,
      },
      {
        path: "/indicadores/producao-bibliografica/consulta-por-campus",
        element: <SearchByCampusBibliographic />,
      },
      {
        path: "/indicadores/producao-bibliografica/consulta-por-periodo",
        element: <SearchByPeriodBibliographic />,
      },
      {
        path: "/indicadores/producao-bibliografica/consulta-por-docente",
        element: <SearchByProfessorBibliographic />,
      },
      {
        path: "/indicadores/orientacoes/consulta-por-campus",
        element: <SearchByCampusOrientations />,
      },
      {
        path: "/indicadores/orientacoes/consulta-por-periodo",
        element: <SearchByPeriodOrientations />,
      },
      {
        path: "/indicadores/inovacao/consulta-por-campus",
        element: <SearchByCampusInnovation />,
      },
      {
        path: "/indicadores/inovacao/consulta-por-periodo",
        element: <SearchByPeriodInnovation />,
      },
    ],
  },
],
  { basename: computedBasename },
);

export default router;
