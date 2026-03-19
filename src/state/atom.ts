import { atom } from "recoil";
import { TBreadcrumbs } from "./types";

// Nome da aplicação
export const nomeAplicacao = atom<string>({
  key: "observatorio-iftm",
  default: "Observatório IFTM",
});

// Subtítulo da aplicação
export const subtitulo = atom<string>({
  key: "subtitulo",
  default: "",
});

// Se está carregando ou não
export const loading = atom<boolean>({
  key: "filtros",
  default: false,
});

export const breadcrumbs = atom<TBreadcrumbs[]>({
  key: "breadcrumbs",
  default: [
    {
      route: "/",
      title: "home",
    },
  ],
});
