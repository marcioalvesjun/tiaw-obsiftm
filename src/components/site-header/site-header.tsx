import React from "react";

import { Avatar, Header } from "react-dsgov";
import useBusca from "../../hooks/use-busca";
import { useAuth } from "react-oidc-context";
import useSubtituloState from "../../state/hooks/useSubtituloState";
import useNomeAplicacaoState from "../../state/hooks/useNomeAplicacaoState";

export interface ISiteHeaderProps {
  showSearchBar?: boolean;
}

export function SiteHeader({ showSearchBar = false }: ISiteHeaderProps) {
  const [nomeAplicacao] = useNomeAplicacaoState();
  const [subtitulo] = useSubtituloState();
  const busca = useBusca();

  const auth = useAuth();

  return (
    <Header
      urlLogo="https://www.gov.br/++theme++padrao_govbr/img/govbr-logo-large.png"
      systemName="IFTM"
      title={nomeAplicacao}
      subTitle={subtitulo}
      showMenuButton={true}
      contextMenu="tese"
      quickAccessLinks={[]}
      loggedIn={auth?.isAuthenticated}
      onClickLogin={() => {
        auth.signinRedirect({ redirect_uri: window.location.href });
      }}
      onSearch={(searchTerm) => {
        busca(searchTerm);
      }}
      showSearchBar={showSearchBar}
      showLoginButton={false}
      avatar={<Avatar imageSrc="https://picsum.photos/id/823/400" />}
    />
  );
};

