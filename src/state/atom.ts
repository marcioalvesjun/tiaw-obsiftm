import { atom } from "recoil";

// Nome da aplicação
export const nomeAplicacao = atom<string>({
    key: "nomeAplicacao",
    default: "Minha Aplicação"
});

// Subtítulo da aplicação
export const subtitulo = atom<string>({
    key: "subtitulo",
    default: ""
});

// Se está carregando ou não
export const loading = atom<boolean>({
    key: 'filtros',
    default: false
})
