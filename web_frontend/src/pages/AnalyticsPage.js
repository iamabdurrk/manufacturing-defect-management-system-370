import React, { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiGetAnalyticsPareto, apiGetAnalyticsTrends } from "../services/api";
import { toApiError } from "../services/http";

// PUBLIC_INTERFACE
export default function AnalyticsPage() {
  /** Analytics: Pareto + trend charts via backend aggregation pipelines. */
  const [pareto, setPareto] = useState([]);
  const [trends, setTrends] = useState([]);
  const [error, setError] = useState("");

  // Simple filters (optional) that map to the acceptance criteria; backend may ignore unknown params.
  const [productionLine, setProductionLine] = useState("");
  const [defectType, setDefectType] = useState("");
  const [partNumber, setPartNumber] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError("");
      try {
        const [p, t] = await Promise.all([
          apiGetAnalyticsPareto({ production_line: productionLine || undefined }),
          apiGetAnalyticsTrends({
            production_line: productionLine || undefined,
            defect_type: defectType || undefined,
            part_number: partNumber || undefined
          })
        ]);

        const pArr = Array.isArray(p) ? p : p?.items || p?.data || [];
        const tArr = Array.isArray(t) ? t : t?.items || t?.data || [];
        if (!mounted) return;
        setPareto(pArr);
        setTrends(tArr);
      } catch (e) {
        if (!mounted) return;
        setError(toApiError(e).message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productionLine, defectType, partNumber]);

  const paretoData = useMemo(() => {
    // Expected shape: [{ defect_type, count, quantity_affected }, ...]
    return pareto.map((x) => ({
      name: x?.defect_type || x?.defectType || x?.name || "Unknown",
      count: x?.count ?? x?.total ?? 0,
      qty: x?.quantity_affected ?? x?.quantityAffected ?? x?.qty ?? 0
    }));
  }, [pareto]);

  const trendData = useMemo(() => {
    // Expected shape: [{ date: 'YYYY-MM-DD', count: N }, ...] or weekly.
    return trends.map((x) => ({
      date: x?.date || x?.bucket || x?.week || x?.day || "—",
      count: x?.count ?? x?.total ?? 0
    }));
  }, [trends]);

  return (
    <div className="grid">
      {error ? <div className="alert">API error: {error}</div> : null}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Analytics</div>
            <div className="card-desc">Pareto of defect types + defect trends with filters</div>
          </div>
          <div className="inline">
            <input
              className="input"
              placeholder="Production line"
              value={productionLine}
              onChange={(e) => setProductionLine(e.target.value)}
              style={{ width: 180 }}
            />
            <input
              className="input"
              placeholder="Defect type"
              value={defectType}
              onChange={(e) => setDefectType(e.target.value)}
              style={{ width: 180 }}
            />
            <input
              className="input"
              placeholder="Part number"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              style={{ width: 180 }}
            />
          </div>
        </div>

        <div className="grid cols-2">
          <div className="card">
            <div className="card-title">Pareto (Top defect types)</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Endpoint: GET /api/analytics/pareto</div>
            <div style={{ height: 320, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paretoData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-10} height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Trend (Daily/Weekly defect counts)</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Endpoint: GET /api/analytics/trends</div>
            <div style={{ height: 320, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="muted" style={{ fontSize: 12 }}>
          If your backend returns a different payload shape, adapt mapping logic in this page (or normalize in <code>src/services/api.js</code>).
        </div>
      </div>
    </div>
  );
}
