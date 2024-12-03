// page.tsx
"use client";

import React, { useState } from "react";
import { buildServerApi } from "../../api";

const SimplePage = () => {
    const [data, setData] = useState();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFetch = async () => {
        setLoading(true);
        setError("");

        console.log("Fetching data...");
        const payload1 = {
            repoUrl: "https://github.com/lvthillo/python-flask-docker",
            DeploymentName: "after-deployment",
            buildType: "PYTHON",
            port: 8080,
        };
        // const response = await testConnection();
        // // console.error(response);
        // setData(response);
        console.log("haha");
        const serverApiResponse = await buildServerApi.post(
            "/deploy-repo",
            payload1
        );

        // const serverApiResponse = await getBuilds();
        console.log(serverApiResponse);
        setData(serverApiResponse);
        // const serverApiResponse = await buildServerApi.get("/data");
        // setData(serverApiResponse);
    };

    return (
        <div style={{ padding: "20px" }}>
            <button onClick={handleFetch} disabled={loading}>
                {loading ? "Fetching..." : "Fet     ch Data"}
            </button>
            {data && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Fetche d Data:</h3>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
            {error && (
                <div style={{ marginTop: "20px", color: "red" }}>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default SimplePage;
