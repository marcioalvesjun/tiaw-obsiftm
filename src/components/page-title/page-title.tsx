import { useBreadcrumbs } from "../../state";

export function PageTitle() {
  const [breadcrumbs] = useBreadcrumbs();
  
  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  let title = "Página inicial";
  
  if (breadcrumbs.length > 2 && breadcrumbs[1].route === "/indicadores") {
     title = breadcrumbs.slice(2).map(b => b.title).join(' - ');
  } else if (breadcrumbs.length > 1) {
     title = breadcrumbs.slice(1).map(b => b.title).join(' - ');
  }

  return (
    <h1 style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
      {title}
    </h1>
  );
}
