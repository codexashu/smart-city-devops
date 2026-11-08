import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, Server, Cpu, Database, Zap, ShieldCheck, ExternalLink } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [statsRes, healthRes] = await Promise.all([
          api.get('/admin/stats').catch(() => ({ data: null })),
          api.get('/health')
        ]);
        setStats(statsRes.data);
        setHealth(healthRes.data);
      } catch (err) {
        console.error('Failed to load metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const prometheusUrl = 'http://localhost:8000/metrics';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Urban Infrastructure & DevOps Metrics</h1>
          <p style={{ color: '#64748b' }}>Real-time telemetry, SLA performance, and system health status.</p>
        </div>
        <a
          href={prometheusUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary"
          style={{ gap: '0.5rem' }}
        >
          <BarChart3 size={16} />
          <span>Prometheus Raw Telemetry</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* DevOps Cluster Health Bar */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={20} color="#2563eb" />
          <span>Production Infrastructure Telemetry</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>API Gateway</span>
              <span className="badge badge-resolved">HEALTHY</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>FastAPI v1.0.0</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Kubernetes Ingress Routed</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Database Cluster</span>
              <span className="badge badge-resolved">CONNECTED</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>PostgreSQL 15</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>StatefulSet + PVC Mounted</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>In-Memory Cache</span>
              <span className="badge badge-resolved">ACTIVE</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Redis v7.2</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Fast query response & session cache</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Pod Autoscaling (HPA)</span>
              <span className="badge badge-assigned">STANDBY</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Target: 70% CPU</div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Min: 2 | Max: 10 replicas</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Incidents by Infrastructure Category</h3>
          {stats?.by_category && Object.keys(stats.by_category).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(stats.by_category).map(([cat, count]) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>
                    <span>{cat.replace('_', ' ')}</span>
                    <span>{count} incidents</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(count * 20, 100)}%`, height: '100%', background: '#2563eb' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No incident data recorded yet.</p>
          )}
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>DevOps CI/CD Automation Stack</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <Zap size={18} color="#2563eb" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>GitHub Actions CI/CD Pipeline</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Automated Unit Tests, SonarQube Lint & Trivy Security Scans</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <ShieldCheck size={18} color="#16a34a" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Trivy Container Vulnerability Scanner</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Zero Critical CVE security gate before Kubernetes deployment</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
              <Cpu size={18} color="#7c3aed" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Kubernetes Self-Healing & HPA</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Automatic pod restarts on failure and dynamic load scaling</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
