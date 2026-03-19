import { http, HttpResponse } from 'msw';

import dataProducaoBibliografica from './data/producao-bibliografica.json';
import dataOrientacao from './data/orientacao.json';
import dataUltimaAtualizacao from './data/ultima-atualizacao-lattes.json';
import dataTitularidade from './data/titularidade.json';
import dataFormacaoAcademica from './data/formacao-academica.json';
import dataAssuntos from './data/assuntos.json';

export const handlers = [
  http.get('https://obsiftm.midi.upt.iftm.edu.br/api/Indicadores/ProducaoBibliografica', () => {
    return HttpResponse.json(dataProducaoBibliografica);
  }),
  http.get('https://obsiftm.midi.upt.iftm.edu.br/api/Indicadores/Orientacao', () => {
    return HttpResponse.json(dataOrientacao);
  }),
  http.get('https://obsiftm.midi.upt.iftm.edu.br/api/Pesquisadores/UltimaAtualizacaoLattes', () => {
    return HttpResponse.json(dataUltimaAtualizacao);
  }),
  http.get('https://obsiftm.midi.upt.iftm.edu.br/api/Pesquisadores/Titularidade', () => {
    return HttpResponse.json(dataTitularidade);
  }),
  http.get('https://obsiftm.midi.upt.iftm.edu.br/api/Pesquisadores/FormacaoAcademica', () => {
    return HttpResponse.json(dataFormacaoAcademica);
  }),
  http.get('https://obsiftm.midi.upt.iftm.edu.br/api/Indicadores/Assuntos', () => {
    return HttpResponse.json(dataAssuntos);
  })
];
