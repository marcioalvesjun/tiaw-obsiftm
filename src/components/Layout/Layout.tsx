import { Footer } from "react-dsgov";
import SiteHeader from "../SiteHeader/SiteHeader";
import { Outlet } from "react-router";
import OverlayLoading from "../OverlayLoading/OverlayLoading";
import styles from './Layout.module.scss';

const Layout : React.FC = () => {
    return (
        <>
            <SiteHeader />
            <div className={styles.conteudo}>
                <Outlet />
            </div>
            <Footer urlLogo={'https://www.gov.br/tesouronacional/++theme++padrao_govbr/img/govbr.png'} />
            <OverlayLoading />
        </>
    );
}

export default Layout;