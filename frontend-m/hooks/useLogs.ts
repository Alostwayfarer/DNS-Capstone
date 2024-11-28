import { useEffect, useState } from 'react';
import { getLogs } from '../api';

export const useLogs = () => {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await getLogs();
                setLogs(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    return { logs, loading, error };
};
