import { Card } from "react-dsgov";
import styles from "./about.module.scss";
import { useEffect } from "react";
import useObservatorioService from "../../hooks/use-observatorio-service";

export function About() {
  const observatorioService = useObservatorioService();

  useEffect(() => {
    observatorioService.getProducaoBibliografica()
      .then(data => console.log("Test getProducaoBibliografica:", data))
      .catch(err => console.error("Error fetching getProducaoBibliografica:", err));
  }, [observatorioService]);

  return (
    <div className={styles.container}>
      <Card>
        <Card.Header cardTitle="Histórico" />
        <Card.Content>
          O Observatório IFTM foi idealizado em setembro de 2018, pelo docente
          Ernani Viriato de Melo (IFTM Campus Avançado Uberaba Parque
          Tecnológico). Ernani percebeu a necessidade de termos um único
          ambiente para entender e analisar o perfil pesquisador da instituição.
          Em maio de 2019 foi disponibilizada a primeira versão do Observatório.
          Desde então, esta ferramenta vem adquirindo novas funcionalidades para
          auxiliar na gestão e diagnóstico. Além de proporcionar novos projetos
          de ensino e pesquisa para alunos do IFTM.
        </Card.Content>
      </Card>
      <Card>
        <Card.Header cardTitle="Perguntas Frequentes" />
        <Card.Content>
          Como acesso o sistema? Todos os docentes já possuem uma conta de
          usuário no sistema. A conta é vínculada ao email institucional. Quem
          realiza a autenticação é o próprio Google. Sou docente e não estou no
          sistema. O que devo fazer? Você deve enviar um email para o líder do
          projeto reportando o problema. Isto pode ocorrer devido ao fato que
          verificamos apenas uma vez ao ano quais docentes deixaram ou entraram
          na instituição. Se eu, docente da instituição, alterar o meu currículo
          Lattes, automaticamente os indicadores serão alterados? Não. Os
          indicadores são calculados uma vez ao mês. No máximo em 30 dias os
          indicadores serão atualizados após sua alteração na Plataforma Lattes.
        </Card.Content>
      </Card>
      <Card>
        <Card.Header cardTitle="Agradecimentos" />
        <Card.Content>
          Agradecemos aos vários alunos do IFTM que contribuíram para o
          desenvolvimento do Observatório. Agradecemos a equipe de TI do campus
          e da reitoria, em especial o Lorenzzo Egydio Mollinar da Cruz e Tiago
          Souza Silva. Agradecemos o apoio da Pró-Reitoria de Pesquisa,
          Pós-Graduação e Inovação do IFTM.
        </Card.Content>
      </Card>
    </div>
  );
}
