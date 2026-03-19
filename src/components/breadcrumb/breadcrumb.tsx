import { useEffect } from "react";
import { Breadcrumb as BreadcrumbGov } from "react-dsgov";
import { useBreadcrumbs } from "../../state";
import styles from "./breadcrumb.module.scss";
import { Fragment } from "react/jsx-runtime";
import { useLocation, useNavigate } from "react-router-dom";

export function Breadcrumb() {
  const [breadcrumbs, setBreadcrumbs] = useBreadcrumbs();
  const location = useLocation();

  useEffect(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const dynamicBreadcrumbs = [{ route: "/", title: "Página inicial" }];

    let currentPath = "";
    for (const segment of segments) {
      currentPath += `/${segment}`;
      const formattedTitle = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      dynamicBreadcrumbs.push({
        route: currentPath,
        title: formattedTitle,
      });
    }

    setBreadcrumbs(dynamicBreadcrumbs);
  }, [location.pathname, setBreadcrumbs]);

  const navigate = useNavigate();

  return (
    <BreadcrumbGov className={styles.container}>
      {breadcrumbs.map((breadcrumb) => (
        <Fragment key={breadcrumb?.route + breadcrumb?.title}>
          {breadcrumb?.route === "/" ? (
            <BreadcrumbGov.Item 
              home 
              onClick={(e: any) => { e.preventDefault(); navigate(breadcrumb?.route as string); }} 
            />
          ) : (
            <BreadcrumbGov.Item 
              href={breadcrumb?.route}
              onClick={(e: any) => { e.preventDefault(); navigate(breadcrumb?.route as string); }}
            >
              {breadcrumb?.title}
            </BreadcrumbGov.Item>
          )}
        </Fragment>
      ))}
    </BreadcrumbGov>
  );
}
