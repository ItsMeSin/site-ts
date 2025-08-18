import React, { useEffect, useState } from "react";

function AdminDashboard({ onLogout }) {
    const [devisList, setDevisList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            onLogout();
            return;
        }

        fetch("http://localhost:4000/api/admin/devis", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    onLogout();
                    return;
                }
                return res.json();
            })
            .then((data) => {
                if (data) {
                    setDevisList(data);
                }
            })
            .catch(() => setError("Erreur lors du chargement des devis"))
            .finally(() => setLoading(false));
    }, [onLogout]);

    return (
        <div style={{ padding: "20px" }}>
            <h1>📋 Tableau des devis</h1>

            <button
                onClick={() => {
                    localStorage.removeItem("token");
                    onLogout();
                }}
                style={{ marginBottom: "20px" }}
            >
                Déconnexion
            </button>

            {loading && <p>Chargement...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && devisList.length === 0 && <p>Aucun devis pour le moment.</p>}

            {!loading && devisList.length > 0 && (
                <table
                    border="1"
                    cellPadding="10"
                    style={{ borderCollapse: "collapse", width: "100%" }}
                >
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Service</th>
                            <th>Prix estimé</th>
                            <th>Photos</th>
                            <th>Date</th>
                            <th>PDF</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devisList.map((devis) => (
                            <tr key={devis._id}>
                                <td>{devis.nom}</td>
                                <td>{devis.email}</td>
                                <td>{devis.telephone}</td>
                                <td>{devis.service}</td>
                                <td>{devis.prixEstime} €</td>
                                <td>
                                    {devis.photos && devis.photos.length > 0 ? (
                                        devis.photos.map((photo, index) => (
                                            <a
                                                key={index}
                                                href={`http://localhost:4000${photo}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <img
                                                    src={`http://localhost:4000${photo}`}
                                                    alt={`Photo ${index + 1}`}
                                                    style={{
                                                        width: "60px",
                                                        height: "60px",
                                                        objectFit: "cover",
                                                        marginRight: "5px",
                                                        borderRadius: "4px",
                                                        border: "1px solid #ccc"
                                                    }}
                                                />
                                            </a>
                                        ))
                                    ) : (
                                        <span>Aucune</span>
                                    )}
                                </td>
                                <td>{new Date(devis.date).toLocaleDateString()}</td>
                                <td>
                                    <a
                                        href={`http://localhost:4000/pdfs/devis-${devis._id}.pdf`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            backgroundColor: "#4CAF50",
                                            color: "white",
                                            padding: "6px 12px",
                                            borderRadius: "4px",
                                            textDecoration: "none"
                                        }}
                                    >
                                        📄 Télécharger
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminDashboard;
