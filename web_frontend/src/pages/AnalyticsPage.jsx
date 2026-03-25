import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { getPareto, getTrends } from "../services/api";
import { Skeleton } from "../components/ui.jsx";

function toISODate(d) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const [loading, setLoading] = React.useState(true);
  const [pareto, setPareto] = React.useState([]);
  const [trends, setTrends] = React.useState([]);

  const [filters, setFilters] = React.useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      start: toISODate(start),
      end: toISODate(end),
      interval: "daily",
      production_line: "",
      part_number: "",
      defect_type_id: ""
    };
  });

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [p, t] = await Promise.all([
          getPareto({ start: filters.start, end: filters.end }),
          getTrends({
            start: filters.start,
            end: filters.end,
            interval: filters.interval,
            production_line: filters.production_line || undefined,
            part_number: filters.part_number || undefined,
            defect_type_id: filters.defect_type_id || undefined
          })
        ]);
        if (!mounted) return;
        setPareto(Array.isArray(p) ? p : p?.items || []);
        setTrends(Array.isArray(t) ? t : t?.items || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [filters]);

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="spread">
        <div className="col" style={{ gap: 4 }}>
          <h1 className="h1" style={{ fontWeight: 950 }}>
            Analytics
          </h1>
          <div className="h2">Pareto and trends (filters update instantly)</div>
        </div>
      </div>

      <div className="card" style={{ padding: 14 }}>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <div className="field">
            <div className="label">Start</div>
            <input
              className="input"
              type="date"
              value={filters.start}
              onChange={(e) => setFilters((f) => ({ ...f, start: e.target.value }))}
            />
          </div>
          <div className="field">
            <div className="label">End</div>
            <input
              className="input"
              type="date"
              value={filters.end}
              onChange={(e) => setFilters((f) => ({ ...f, end: e.target.value }))}
            />
          </div>
          <div className="field">
            <div className="label">Interval</div>
            <select
              className="select"
              value={filters.interval}
              onChange={(e) =>
                setFilters((f) => ({ ...f, interval: e.target.value }))
              }
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div className="field" style={{ minWidth: 210 }}>
            <div className="label">Production line</div>
            <input
              className="input"
              value={filters.production_line}
              onChange={(e) =>
                setFilters((f) => ({ ...f, production_line: e.target.value }))
              }
              placeholder="Optional"
            />
          </div>
          <div className="field" style={{ minWidth: 210 }}>
            <div className="label">Part number</div>
            <input
              className="input"
              value={filters.part_number}
              onChange={(e) =>
                setFilters((f) => ({ ...f, part_number: e.target.value }))
              }
              placeholder="Optional"
            />
          </div>
          <div className="field" style={{ minWidth: 210 }}>
            <div className="label">Defect type ID</div>
            <input
              className="input"
              value={filters.defect_type_id}
              onChange={(e) =>
                setFilters((f) => ({ ...f, defect_type_id: e.target.value }))
              }
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      <div className="row" style={{ alignItems: "stretch" }}>
        <div className="card" style={{ padding: 14, flex: 1 }}>
          <div style={{ fontWeight: 900 }}>Pareto (by defect type)</div>
          <div className="small" style={{ marginTop: 4 }}>
            Count/quantity by defect type for the selected period.
          </div>
          <div style={{ height: 280, marginTop: 12 }}>
            {loading ? (
              <Skeleton height={280} />
            ) : pareto.length === 0 ? (
              <div className="small">No data for these filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pareto}>
                  <XAxis dataKey="defect_type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 14, flex: 1 }}>
          <div style={{ fontWeight: 900 }}>Trends</div>
          <div className="small" style={{ marginTop: 4 }}>
            Defects over time (daily/weekly).
          </div>
          <div style={{ height: 280, marginTop: 12 }}>
            {loading ? (
              <Skeleton height={280} />
            ) : trends.length === 0 ? (
              <div className="small">No data for these filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
