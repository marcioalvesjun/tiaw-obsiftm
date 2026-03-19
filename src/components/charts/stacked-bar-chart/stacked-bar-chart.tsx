import { useMemo, useState } from "react";
import styles from "./stacked-bar-chart.module.scss";

export type StackedBarChartSegment<K extends string> = {
  key: K;
  label: string;
  color: string;
};

export type StackedBarChartDatum<K extends string> = {
  x: number | string;
  values: Record<K, number>;
};

export type StackedBarChartProps<K extends string> = {
  data: Array<StackedBarChartDatum<K>>;
  segments: Array<StackedBarChartSegment<K>>;
  activeSegmentKeys?: K[];
  onActiveSegmentKeysChange?: (next: K[]) => void;
  defaultActiveSegmentKeys?: K[];

  chartTitle?: string;
  chartDescription?: string;

  showLegend?: boolean;
  segmentLabelMinHeightPercent?: number;
  formatValue?: (value: number) => string;
  emptyStateMessage?: string;

  showDataTable?: boolean;
  dataTableDefaultOpen?: boolean;
  dataTableLabel?: string;
};

function uniq<K extends string>(arr: K[]): K[] {
  return Array.from(new Set(arr));
}

export function StackedBarChart<K extends string>({
  data,
  segments,
  activeSegmentKeys,
  onActiveSegmentKeysChange,
  defaultActiveSegmentKeys,
  chartTitle,
  chartDescription,
  showLegend = true,
  showDataTable = true,
  dataTableDefaultOpen = false,
  dataTableLabel = "Tabela de dados do gráfico",
  segmentLabelMinHeightPercent = 2,
  formatValue = (v) => String(v),
  emptyStateMessage = "Sem dados para exibir.",
}: StackedBarChartProps<K>) {
  const barMaxHeightPx = 280;

  const defaultKeys = useMemo(() => {
    const keys = defaultActiveSegmentKeys ?? segments.map((s) => s.key);
    return uniq(keys);
  }, [defaultActiveSegmentKeys, segments]);

  const [internalActiveKeys, setInternalActiveKeys] = useState<K[]>(defaultKeys);

  const activeKeys = activeSegmentKeys ?? internalActiveKeys;
  const activeKeySet = useMemo(() => new Set(activeKeys), [activeKeys]);

  const visibleSegments = useMemo(
    () => segments.filter((s) => activeKeySet.has(s.key)),
    [segments, activeKeySet],
  );

  const totalsByDatum = useMemo(() => {
    return data.map((d) => visibleSegments.reduce((sum, s) => sum + (d.values[s.key] ?? 0), 0));
  }, [data, visibleSegments]);

  const maxTotal = useMemo(() => {
    return totalsByDatum.length ? Math.max(...totalsByDatum) : 0;
  }, [totalsByDatum]);

  const handleToggle = (key: K) => {
    const prev = activeKeys;
    const next = activeKeySet.has(key) ? prev.filter((k) => k !== key) : uniq([...prev, key]);
    onActiveSegmentKeysChange ? onActiveSegmentKeysChange(next) : setInternalActiveKeys(next);
  };

  return (
    <div className={styles.container}>
      {showLegend ? (
        <fieldset className={styles.legend} aria-label="Itens do gráfico">
          {chartTitle ? <legend className={styles.srOnly}>{chartTitle}</legend> : <legend className={styles.srOnly}>Itens do gráfico</legend>}
          {segments.map((s) => (
            <label key={s.key} className={styles.legendItem} title={s.label}>
              <input
                type="checkbox"
                checked={activeKeySet.has(s.key)}
                onChange={() => handleToggle(s.key)}
                aria-label={`Mostrar/ocultar ${s.label}`}
              />
              <span className={styles.legendColor} style={{ background: s.color }} />
              <span className={styles.legendLabel}>{s.label}</span>
            </label>
          ))}
        </fieldset>
      ) : null}

      <div className={styles.chartScroller} role="img" aria-label="Gráfico de barras empilhadas por ano">
        {chartDescription ? <div className={styles.srOnly}>{chartDescription}</div> : null}
        {data.length === 0 ? (
          <div className={styles.emptyState}>{emptyStateMessage}</div>
        ) : visibleSegments.length === 0 ? (
          <div className={styles.emptyState}>Selecione ao menos um item.</div>
        ) : (
          <div className={styles.chart}>
            {data.map((d, idx) => {
              const totalSelected = totalsByDatum[idx] ?? 0;
              const barHeightPx = maxTotal > 0 ? Math.round((totalSelected / maxTotal) * barMaxHeightPx) : 0;

              let cumulativeBottomPercent = 0;
              const segmentsToRender = visibleSegments
                .map((s) => {
                  const value = d.values[s.key] ?? 0;
                  if (totalSelected <= 0 || value <= 0) return null;

                  const heightPercent = (value / totalSelected) * 100;
                  const bottomPercent = cumulativeBottomPercent;
                  cumulativeBottomPercent += heightPercent;

                  return { ...s, value, heightPercent, bottomPercent };
                })
                .filter(Boolean) as Array<
                StackedBarChartSegment<K> & { value: number; heightPercent: number; bottomPercent: number }
              >;

              return (
                <div key={String(d.x)} className={styles.barColumn}>
                  <div className={styles.bar} style={{ height: `${barHeightPx}px` }}>
                    {segmentsToRender.map((seg) => {
                      const showLabel = seg.heightPercent >= segmentLabelMinHeightPercent;
                      return (
                        <div
                          key={seg.key}
                          className={styles.segment}
                          style={{
                            background: seg.color,
                            height: `${seg.heightPercent}%`,
                            bottom: `${seg.bottomPercent}%`,
                          }}
                          title={`${seg.label}: ${formatValue(seg.value)}`}
                        >
                          {showLabel ? <span className={styles.segmentLabel}>{formatValue(seg.value)}</span> : null}
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.yearLabel}>{d.x}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDataTable && data.length > 0 && visibleSegments.length > 0 ? (
        <details className={styles.dataTableDetails} open={dataTableDefaultOpen}>
          <summary className={styles.dataTableSummary}>
            {dataTableLabel}
          </summary>
          <div className={styles.dataTableWrapper} role="region" aria-label={chartTitle ? `${chartTitle}: ${dataTableLabel}` : dataTableLabel}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th scope="col">Categoria</th>
                  <th scope="col">Total</th>
                  {visibleSegments.map((s) => (
                    <th scope="col" key={s.key}>
                      {s.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((d, idx) => {
                  const totalSelected = totalsByDatum[idx] ?? 0;
                  return (
                    <tr key={String(d.x)}>
                      <td>{String(d.x)}</td>
                      <td>{formatValue(totalSelected)}</td>
                      {visibleSegments.map((s) => (
                        <td key={`${String(d.x)}-${s.key}`}>{formatValue(d.values[s.key] ?? 0)}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </div>
  );
}

