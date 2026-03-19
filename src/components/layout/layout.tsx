import { Container, Footer } from "react-dsgov";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { OverlayLoading } from "../overlay-loading";
import { Breadcrumb } from "../breadcrumb";
import { PageTitle } from "../page-title";
import styles from "./layout.module.scss";
import { SiteHeader } from "../site-header";
import { Menu } from "../menu";

export function Layout() {
  const navigate = useNavigate();

  useEffect(() => {
    const computedBasename = (() => {
      const isGithubPagesHost = window.location.hostname.endsWith("github.io");
      if (!isGithubPagesHost) return "";
      const [first] = window.location.pathname.split("/").filter(Boolean);
      return first ? `/${first}` : "";
    })();

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor instanceof HTMLAnchorElement) {
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || anchor.target === '_blank') return;
        
        if (anchor.origin === window.location.origin) {
          e.preventDefault();
          const normalizedPathname =
            computedBasename && anchor.pathname.startsWith(computedBasename)
              ? anchor.pathname.slice(computedBasename.length) || "/"
              : anchor.pathname;

          navigate(normalizedPathname + anchor.search + anchor.hash);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, [navigate]);

  return (
    <div className={styles.page}>
      <SiteHeader />
      <div className={styles.mainWrapper}>
      <Menu />
        <div className={styles.contentWrapper}>
      <Container className={styles.container}>
        <Breadcrumb />
        <PageTitle />
        <Outlet />
      </Container>
        </div>
      </div>
      <Footer
        urlLogo={
          "https://www.gov.br/tesouronacional/++theme++padrao_govbr/img/govbr.png"
        }
        className={styles.footer}
        userLicenseText={
          <>
            Desenvolvido pelo Grupo de Pesquisa em Mineração da Dados e Imagens
            (MiDI) - IFTM - Versão 2.8 (03/03/2025)
          </>
        }
      />
      <OverlayLoading />
    </div>
  );
}
