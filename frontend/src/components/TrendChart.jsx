import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TrendChart = ({ data, dataKey, color, title }) => {
    const chartData = data && data.length > 0 ? data : [
        { name: 'Day 1', [dataKey]: 0 },
        { name: 'Day 2', [dataKey]: 0 },
        { name: 'Day 3', [dataKey]: 0 },
        { name: 'Day 4', [dataKey]: 0 },
        { name: 'Day 5', [dataKey]: 0 },
    ];

    return (
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-4 h-full">
            <h3 className="text-[#0F172A] text-sm font-semibold mb-3">{title}</h3>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fill: '#8593A6', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#8593A6', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderColor: '#E2E8F0', color: '#0F172A', borderRadius: 6, fontSize: 12 }}
                            itemStyle={{ color: '#0F172A' }}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#gradient-${dataKey})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrendChart;
