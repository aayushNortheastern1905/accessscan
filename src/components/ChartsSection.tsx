import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import type { AuditResult, Category, Severity } from '../types';

const SEVERITY_COLORS: Record<Severity, string> = {
  Critical: '#DC2626',
  Serious: '#EA580C',
  Moderate: '#CA8A04',
  Minor: '#2563EB',
};

const CATEGORY_COLORS = [
  '#5C6AC4', '#008060', '#D97706', '#DC2626',
  '#7C3AED', '#0891B2', '#BE185D', '#65A30D', '#EA580C', '#6B7280', '#1D4ED8',
];

interface Props {
  result: AuditResult;
}

export default function ChartsSection({ result }: Props) {
  const categories = [...new Set(result.violations.map((v) => v.category))] as Category[];
  const categoryData = categories
    .map((cat) => ({ name: cat, value: result.violations.filter((v) => v.category === cat).length }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const severityData = (['Critical', 'Serious', 'Moderate', 'Minor'] as Severity[]).map((sev) => ({
    severity: sev,
    count: result.violations.filter((v) => v.severity === sev).length,
    fill: SEVERITY_COLORS[sev],
  })).filter((d) => d.count > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

      {/* Donut — by category */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Violations by Category</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {categoryData.map((_, i) => (
                <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} (${Math.round((value / result.violations.length) * 100)}%)`,
                name,
              ]}
              contentStyle={{ borderRadius: 8, border: '1px solid #f3f4f6', fontSize: 13 }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar — by severity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Violations by Severity</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={severityData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="severity" tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip
              formatter={(value: number) => [value, 'Violations']}
              contentStyle={{ borderRadius: 8, border: '1px solid #f3f4f6', fontSize: 13 }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {severityData.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
