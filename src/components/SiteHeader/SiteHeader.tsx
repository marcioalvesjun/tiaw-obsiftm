import React from "react";

import { Avatar, Header } from "react-dsgov";
import { useNavigate } from "react-router";
import useBusca from "../../hooks/useBusca";
import { useAuth } from "react-oidc-context";
import useSubtituloState from "../../state/hooks/useSubtituloState";
import useNomeAplicacaoState from "../../state/hooks/useNomeAplicacaoState";


export interface ISiteHeaderProps {
    showSearchBar?: boolean
}

const SiteHeader : React.FC<ISiteHeaderProps> = ({showSearchBar = true}) => {
    const [nomeAplicacao,] = useNomeAplicacaoState();
    const [subtitulo, ] = useSubtituloState();
    const busca = useBusca();
    const navigate = useNavigate();

    const auth = useAuth();


    return (
        <Header 
            urlLogo="https://www.gov.br/++theme++padrao_govbr/img/govbr-logo-large.png" 
            systemName="Tesouro Nacional" 
            title={nomeAplicacao}
            subTitle={subtitulo}
            showMenuButton={true}

            quickAccessLinks={[
                {label: 'Link 1', href: () => {navigate("/link1")}},
                {label: 'Link 2', href: () => {navigate("/link2")}},
                {label: 'Link 3', href: () => {navigate("/link3")}},
            ]}

            loggedIn={auth?.isAuthenticated}
            onClickLogin={() => {
                auth.signinRedirect({redirect_uri: window.location.href});
            }}

            onSearch={(searchTerm) => {
                busca(searchTerm);
            }}

            showSearchBar={showSearchBar}

            avatar={<Avatar imageSrc='https://picsum.photos/id/823/400' />}
        />
    );
}

export default SiteHeader;