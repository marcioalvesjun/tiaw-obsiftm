import { Menu as MenuGov } from "react-dsgov";

export function Menu() {
  const menuData = [
    {
      label: "Página inicial",
      link: "/",
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
            { label: "Consulta por Campus", link: "/indicadores/producao-bibliografica/consulta-por-campus" },
            { label: "Consulta por Período", link: "/indicadores/producao-bibliografica/consulta-por-periodo" },
            { label: "Consulta por Docente", link: "/indicadores/producao-bibliografica/consulta-por-docente" },
          ]
        },
        {
          label: "Orientações",
          submenu: [
            { label: "Consulta por Campus", link: "/indicadores/orientacoes/consulta-por-campus" },
            { label: "Consulta por Período", link: "/indicadores/orientacoes/consulta-por-periodo" },
          ]
        },
        {
          label: "Inovação",
          submenu: [
            { label: "Consulta por Campus", link: "/indicadores/inovacao/consulta-por-campus" },
            { label: "Consulta por Período", link: "/indicadores/inovacao/consulta-por-periodo" },
          ]
        }
      ]
    },
    {
      label: "Sobre",
      link: "/sobre",
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
