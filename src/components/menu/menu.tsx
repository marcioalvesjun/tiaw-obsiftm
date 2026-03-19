import { Menu as MenuGov } from "react-dsgov";

export function Menu() {
  const basePath = process.env.PUBLIC_URL ? process.env.PUBLIC_URL.replace(/\/$/, "") : "";
  const withBase = (path: string) => `${basePath}${path}`;

  const menuData = [
    {
      label: "Página inicial",
      link: withBase("/"),
      icon: "fas fa-home",
      divider: true,
    },
    {
      label: "Indicadores",
      icon: "fas fa-chart-bar",
      submenu: [
        {
          label: "Produção Bibliográfica",
          submenu: [
            { label: "Consulta por Campus", link: withBase("/indicadores/producao-bibliografica/consulta-por-campus") },
            { label: "Consulta por Período", link: withBase("/indicadores/producao-bibliografica/consulta-por-periodo") },
            { label: "Consulta por Docente", link: withBase("/indicadores/producao-bibliografica/consulta-por-docente") },
          ]
        },
        {
          label: "Orientações",
          submenu: [
            { label: "Consulta por Campus", link: withBase("/indicadores/orientacoes/consulta-por-campus") },
            { label: "Consulta por Período", link: withBase("/indicadores/orientacoes/consulta-por-periodo") },
          ]
        },
        {
          label: "Inovação",
          submenu: [
            { label: "Consulta por Campus", link: withBase("/indicadores/inovacao/consulta-por-campus") },
            { label: "Consulta por Período", link: withBase("/indicadores/inovacao/consulta-por-periodo") },
          ]
        }
      ]
    },
    {
      label: "Sobre",
      link: withBase("/sobre"),
      icon: "fas fa-info-circle",
    },
  ];

  return (
    <MenuGov 
      id="main-navigation" 
      type="push" 
      data={menuData} 
    />
  );
}
