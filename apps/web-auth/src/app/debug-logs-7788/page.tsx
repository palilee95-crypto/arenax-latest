"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@arenax/database";

export default function DebugLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            const { data, error } = await supabase
                .from('system_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (data) setLogs(data);
            setLoading(false);
        };
        fetchLogs();
    }, []);

    return (
        <div style={{ padding: '2rem', background: '#000', color: '#fff', fontFamily: 'monospace' }}>
            <h1>Debug System Logs</h1>
            {loading ? <p>Loading...</p> : (
                <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Level</th>
                            <th>Message</th>
                            <th>Source</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td>{new Date(log.created_at).toLocaleString()}</td>
                                <td style={{ color: log.level === 'error' ? 'red' : 'white' }}>{log.level}</td>
                                <td>{log.message}</td>
                                <td>{log.source}</td>
                                <td><pre>{JSON.stringify(log.details, null, 2)}</pre></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
