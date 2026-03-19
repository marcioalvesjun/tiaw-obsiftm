import { useEffect, useMemo, useState } from "react";
import { Card } from "react-dsgov";
import useObservatorioService from "../../../../hooks/use-observatorio-service";
import {
  StackedBarChart,
  StackedBarChartDatum,
  StackedBarChartSegment,
} from "../../../../components/charts/stacked-bar-chart/stacked-bar-chart";
import styles from "./search-by-period.module.scss";

export function SearchByPeriodBibliographic() {
  const observatorioService = useObservatorioService();

  type BibliographicItemKey =
    | "eventoArtigoCompleto"
    | "eventoArtigoResumo"
    | "revistaArtigo"
    | "capituloLivro"
    | "livro";

  type ProducaoBibliograficaRow = {
    ano: number;
    instituicaoID?: number | null;
    instituicao?: {
      id?: number | null;
      nome?: string | null;
      sigla?: string | null;
      quantidadeProfessores?: number | null;
      professores?: unknown;
    } | null;
    eventoArtigoCompleto?: number | null;
    eventoArtigoResumo?: number | null;
    revistaArtigo?: number | null;
    capituloLivro?: number | null;
    livro?: number | null;
  };

  const bibliographicSegments = useMemo<Array<StackedBarChartSegment<BibliographicItemKey>>>(
    () => [
      { key: "eventoArtigoCompleto", label: "Artigo completo em evento", color: "#0D6EFD" },
      { key: "eventoArtigoResumo", label: "Resumo em evento", color: "#198754" },
      { key: "revistaArtigo", label: "Artigo em periodico", color: "#6F42C1" },
      { key: "capituloLivro", label: "Capitulo de Livro", color: "#FD7E14" },
      { key: "livro", label: "Livro", color: "#DC3545" },
    ],
    [],
  );

  const periodicalSegments = useMemo<Array<StackedBarChartSegment<"revistaArtigo">>>(
    () => [
      {
        key: "revistaArtigo",
        label: "Artigo em periodico",
        color: bibliographicSegments.find((s) => s.key === "revistaArtigo")?.color ?? "#6F42C1",
      },
    ],
    [bibliographicSegments],
  );

  const allBibliographicKeys = useMemo<BibliographicItemKey[]>(
    () => bibliographicSegments.map((s) => s.key),
    [bibliographicSegments],
  );

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ProducaoBibliograficaRow[]>([]);

  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  const [activeBibliographicKeys, setActiveBibliographicKeys] = useState<BibliographicItemKey[]>(allBibliographicKeys);

  useEffect(() => {
    setActiveBibliographicKeys(allBibliographicKeys);
  }, [allBibliographicKeys]);

  const toggleYear = (year: number) => {
    setSelectedYears((prev) => {
      const has = prev.includes(year);
      if (has) return prev.filter((y) => y !== year);
      return [...prev, year];
    });
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = (await observatorioService.getProducaoBibliografica(0)) as ProducaoBibliograficaRow[];
        if (!mounted) return;
        setRows(data ?? []);
      } catch (e) {
        console.error("Failed to load ProducaoBibliografica:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [observatorioService]);

  const yearsAll = useMemo(() => {
    const set = new Set<number>();
    rows.forEach((r) => set.add(Number(r.ano)));
    return Array.from(set).sort((a, b) => a - b);
  }, [rows]);

  useEffect(() => {
    if (yearsAll.length === 0) return;

    setSelectedYears((prev) => {
      if (prev.length === 0) return yearsAll;
      const next = prev.filter((y) => yearsAll.includes(y));
      return next.length === 0 ? yearsAll : next;
    });
  }, [yearsAll]);

  const rowsFilteredByYears = useMemo(() => {
    if (selectedYears.length === 0) return [];
    return rows.filter((r) => selectedYears.includes(Number(r.ano)));
  }, [rows, selectedYears]);

  const yearsSelected = useMemo(() => {
    const next = selectedYears.slice();
    next.sort((a, b) => a - b);
    return next;
  }, [selectedYears]);

  const denomProfessoresByYear = useMemo(() => {
    const map = new Map<number, number>();
    rowsFilteredByYears.forEach((r) => {
      const year = Number(r.ano);
      const denom = Number(r.instituicao?.quantidadeProfessores ?? 0);
      map.set(year, (map.get(year) ?? 0) + denom);
    });
    return map;
  }, [rowsFilteredByYears]);

  const bibliographicQuantityData = useMemo<Array<StackedBarChartDatum<BibliographicItemKey>>>(() => {
    const emptyValues = (): Record<BibliographicItemKey, number> => ({
      eventoArtigoCompleto: 0,
      eventoArtigoResumo: 0,
      revistaArtigo: 0,
      capituloLivro: 0,
      livro: 0,
    });

    const map = new Map<number, Record<BibliographicItemKey, number>>();
    yearsSelected.forEach((y) => map.set(y, emptyValues()));

    rowsFilteredByYears.forEach((r) => {
      const year = Number(r.ano);
      if (!map.has(year)) map.set(year, emptyValues());
      const acc = map.get(year)!;
      acc.eventoArtigoCompleto += Number(r.eventoArtigoCompleto ?? 0);
      acc.eventoArtigoResumo += Number(r.eventoArtigoResumo ?? 0);
      acc.revistaArtigo += Number(r.revistaArtigo ?? 0);
      acc.capituloLivro += Number(r.capituloLivro ?? 0);
      acc.livro += Number(r.livro ?? 0);
    });

    return yearsSelected.map((y) => ({ x: y, values: map.get(y) ?? emptyValues() }));
  }, [rowsFilteredByYears, yearsSelected]);

  const bibliographicAverageData = useMemo<Array<StackedBarChartDatum<BibliographicItemKey>>>(() => {
    return bibliographicQuantityData.map((d) => {
      const denom = denomProfessoresByYear.get(Number(d.x)) ?? 0;
      const values = { ...d.values };

      (Object.keys(values) as BibliographicItemKey[]).forEach((k) => {
        values[k] = denom > 0 ? values[k] / denom : 0;
      });

      return { x: d.x, values };
    });
  }, [bibliographicQuantityData, denomProfessoresByYear]);

  const periodicalQuantityData = useMemo<Array<StackedBarChartDatum<"revistaArtigo">>>(() => {
    return bibliographicQuantityData.map((d) => ({
      x: d.x,
      values: { revistaArtigo: d.values.revistaArtigo },
    }));
  }, [bibliographicQuantityData]);

  const periodicalAverageData = useMemo<Array<StackedBarChartDatum<"revistaArtigo">>>(() => {
    return bibliographicAverageData.map((d) => ({
      x: d.x,
      values: { revistaArtigo: d.values.revistaArtigo },
    }));
  }, [bibliographicAverageData]);

  const hasProfessorDetails = useMemo(() => {
    return rowsFilteredByYears.some((r) => Array.isArray(r.instituicao?.professores));
  }, [rowsFilteredByYears]);

  const docProductionCountsData = useMemo<Array<StackedBarChartDatum<BibliographicItemKey>>>(() => {
    return bibliographicQuantityData.map((d) => {
      const year = Number(d.x);
      const totalDocentes = denomProfessoresByYear.get(year) ?? 0;
      const totalProduction = (Object.keys(d.values) as BibliographicItemKey[]).reduce((sum, k) => sum + (d.values[k] ?? 0), 0);

      const values: Record<BibliographicItemKey, number> = {
        eventoArtigoCompleto: 0,
        eventoArtigoResumo: 0,
        revistaArtigo: 0,
        capituloLivro: 0,
        livro: 0,
      };

      (Object.keys(values) as BibliographicItemKey[]).forEach((k) => {
        values[k] =
          totalDocentes > 0 && totalProduction > 0 ? Math.round((totalDocentes * (d.values[k] ?? 0)) / totalProduction) : 0;
      });

      return { x: year, values };
    });
  }, [bibliographicQuantityData, denomProfessoresByYear]);

  const docProductionPercentData = useMemo<Array<StackedBarChartDatum<BibliographicItemKey>>>(() => {
    return bibliographicQuantityData.map((d) => {
      const totalProduction = (Object.keys(d.values) as BibliographicItemKey[]).reduce((sum, k) => sum + (d.values[k] ?? 0), 0);

      const values: Record<BibliographicItemKey, number> = {
        eventoArtigoCompleto: 0,
        eventoArtigoResumo: 0,
        revistaArtigo: 0,
        capituloLivro: 0,
        livro: 0,
      };

      (Object.keys(values) as BibliographicItemKey[]).forEach((k) => {
        values[k] = totalProduction > 0 ? (d.values[k] ?? 0) / totalProduction * 100 : 0;
      });

      return { x: d.x, values };
    });
  }, [bibliographicQuantityData]);

  const [activePeriodicalKeys, setActivePeriodicalKeys] = useState<Array<"revistaArtigo">>(["revistaArtigo"]);

  useEffect(() => {
    if (activeBibliographicKeys.includes("revistaArtigo")) setActivePeriodicalKeys(["revistaArtigo"]);
    else setActivePeriodicalKeys([]);
  }, [activeBibliographicKeys]);

  const handlePeriodicalActiveKeysChange = (next: Array<"revistaArtigo">) => {
    setActivePeriodicalKeys(next);
    setActiveBibliographicKeys((prev) => {
      const wants = next.includes("revistaArtigo");
      const has = prev.includes("revistaArtigo");
      if (wants && !has) return [...prev, "revistaArtigo"];
      if (!wants && has) return prev.filter((k) => k !== "revistaArtigo");
      return prev;
    });
  };

  return (
    <div className={styles.container}>
      <Card>
        <Card.Header cardTitle="Produção Bibliográfica - Consulta por Período" />
        <Card.Content>
          <div className={styles.controls}>
            <label className={styles.control}>
              <span className={styles.label}>Anos</span>
              <div className={styles.yearPills} aria-label="Seleção de anos">
                {yearsAll.map((y) => {
                  const selected = selectedYears.includes(y);
                  return (
                    <button
                      key={y}
                      type="button"
                      className={selected ? styles.yearPillSelected : styles.yearPill}
                      onClick={() => toggleYear(y)}
                      aria-pressed={selected}
                      disabled={loading}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>

              <div className={styles.yearPillsActions}>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setSelectedYears(yearsAll)}
                  disabled={loading || yearsAll.length === 0}
                >
                  Selecionar todos
                </button>
                <button
                  type="button"
                  className={styles.actionButtonSecondary}
                  onClick={() => setSelectedYears([])}
                  disabled={loading}
                >
                  Limpar
                </button>
              </div>

              <div className={styles.controlsHint}>
                {loading
                  ? "Carregando dados..."
                  : selectedYears.length
                    ? `${selectedYears.length} ano(s) selecionado(s).`
                    : "Selecione ao menos um ano."}
              </div>
            </label>
          </div>
        </Card.Content>
      </Card>

      <div className={styles.chartsGrid}>
        <Card>
          <Card.Header cardTitle="Produção Bibliográfica: Quantidade x Anos" />
          <Card.Content>
            <StackedBarChart
              data={bibliographicQuantityData}
              segments={bibliographicSegments}
              activeSegmentKeys={activeBibliographicKeys}
              onActiveSegmentKeysChange={setActiveBibliographicKeys}
              formatValue={(v) => String(Math.round(v))}
              segmentLabelMinHeightPercent={0.5}
              emptyStateMessage={loading ? "Carregando..." : "Sem dados para os anos selecionados."}
            />
          </Card.Content>
        </Card>

        <Card>
          <Card.Header cardTitle="Produção Bibliográfica: Média por docente x Anos" />
          <Card.Content>
            <StackedBarChart
              data={bibliographicAverageData}
              segments={bibliographicSegments}
              activeSegmentKeys={activeBibliographicKeys}
              onActiveSegmentKeysChange={setActiveBibliographicKeys}
              formatValue={(v) => (Number.isFinite(v) ? v.toFixed(2) : "0,00")}
              segmentLabelMinHeightPercent={0.5}
              emptyStateMessage="Sem dados para os anos selecionados."
            />
          </Card.Content>
        </Card>

        <Card>
          <Card.Header cardTitle="Docentes com Produção Bibliográfica: Quantidade de Docentes x Anos" />
          <Card.Content>
            <StackedBarChart
              data={docProductionCountsData}
              segments={bibliographicSegments}
              activeSegmentKeys={activeBibliographicKeys}
              onActiveSegmentKeysChange={setActiveBibliographicKeys}
              formatValue={(v) => String(Math.round(v))}
              segmentLabelMinHeightPercent={0.5}
              emptyStateMessage="Sem dados para este indicador."
            />
            {!hasProfessorDetails ? (
              <div className={styles.fallbackNote}>
                Observação: a API não trouxe detalhes de professores; este indicador foi estimado com base na proporção da
                produção.
              </div>
            ) : null}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header cardTitle="Docentes com Produção Bibliográfica: Percentual de Docentes x Anos" />
          <Card.Content>
            <StackedBarChart
              data={docProductionPercentData}
              segments={bibliographicSegments}
              activeSegmentKeys={activeBibliographicKeys}
              onActiveSegmentKeysChange={setActiveBibliographicKeys}
              formatValue={(v) => `${v.toFixed(1)}%`}
              segmentLabelMinHeightPercent={0.5}
              emptyStateMessage="Sem dados para este indicador."
            />
            {!hasProfessorDetails ? (
              <div className={styles.fallbackNote}>
                Observação: a API não trouxe detalhes de professores; este indicador foi estimado com base na proporção da
                produção.
              </div>
            ) : null}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header cardTitle="Produção em Periódicos: Quantidade x Anos" />
          <Card.Content>
            <StackedBarChart
              data={periodicalQuantityData}
              segments={periodicalSegments}
              activeSegmentKeys={activePeriodicalKeys}
              onActiveSegmentKeysChange={handlePeriodicalActiveKeysChange}
              formatValue={(v) => String(Math.round(v))}
              segmentLabelMinHeightPercent={0}
              emptyStateMessage="Sem dados para o indicador de periódicos."
            />
          </Card.Content>
        </Card>

        <Card>
          <Card.Header cardTitle="Produção em Periódicos: Média por professor x Anos" />
          <Card.Content>
            <StackedBarChart
              data={periodicalAverageData}
              segments={periodicalSegments}
              activeSegmentKeys={activePeriodicalKeys}
              onActiveSegmentKeysChange={handlePeriodicalActiveKeysChange}
              formatValue={(v) => (Number.isFinite(v) ? v.toFixed(2) : "0,00")}
              segmentLabelMinHeightPercent={0}
              emptyStateMessage="Sem dados para o indicador de periódicos."
            />
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
