import React, { useEffect, useState } from "react";

function AdminDashboard({ onLogout }) {
    const [devisList, setDevisList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingDevis, setEditingDevis] = useState(null);

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

    const handleUpdateDevis = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(
                `http://localhost:4000/api/admin/devis/${editingDevis._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(editingDevis),
                }
            );

            if (!res.ok) throw new Error("Erreur mise à jour");
            const updated = await res.json();

            // Mets à jour la liste des devis
            setDevisList((prev) =>
                prev.map((d) => (d._id === updated._id ? updated : d))
            );

            setEditingDevis(null);
            alert("✅ Devis mis à jour !");
        } catch (err) {
            console.error(err);
            alert("❌ Erreur lors de la mise à jour");
        }
    };

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
                            <th>Actions</th>
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
                                                        border: "1px solid #ccc",
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
                                    <button
                                        onClick={() => setEditingDevis(devis)}
                                        style={{
                                            backgroundColor: "#2196F3",
                                            color: "white",
                                            padding: "6px 12px",
                                            borderRadius: "4px",
                                            border: "none",
                                            cursor: "pointer",
                                            marginRight: "5px",
                                        }}
                                    >
                                        ✏️ Modifier
                                    </button>

                                    <button
                                        onClick={async () => {
                                            const token = localStorage.getItem("token");
                                            try {
                                                const res = await fetch(
                                                    `http://localhost:4000/api/admin/devis/${devis._id}/pdf`,
                                                    {
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                        },
                                                    }
                                                );

                                                if (!res.ok) {
                                                    throw new Error("Erreur téléchargement PDF");
                                                }

                                                const blob = await res.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url;
                                                a.download = `devis-${devis._id}.pdf`;
                                                document.body.appendChild(a);
                                                a.click();
                                                a.remove();
                                                window.URL.revokeObjectURL(url);
                                            } catch (err) {
                                                alert("Impossible de télécharger le PDF");
                                                console.error(err);
                                            }
                                        }}
                                        style={{
                                            backgroundColor: "#4CAF50",
                                            color: "white",
                                            padding: "6px 12px",
                                            borderRadius: "4px",
                                            border: "none",
                                            cursor: "pointer",
                                        }}
                                    >
                                        📄 Télécharger
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {editingDevis && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "20px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        background: "#f9f9f9",
                    }}
                >
                    <h2>Modifier le devis</h2>
                    <form onSubmit={handleUpdateDevis}>
                        <label>Service</label>
                        <input
                            type="text"
                            value={editingDevis.service}
                            onChange={(e) =>
                                setEditingDevis({
                                    ...editingDevis,
                                    service: e.target.value,
                                })
                            }
                        />

                        <label>Quantité</label>
                        <input
                            type="number"
                            value={editingDevis.quantite}
                            onChange={(e) =>
                                setEditingDevis({
                                    ...editingDevis,
                                    quantite: e.target.value,
                                })
                            }
                        />

                        <label>Prix estimé</label>
                        <input
                            type="number"
                            value={editingDevis.prixEstime}
                            onChange={(e) =>
                                setEditingDevis({
                                    ...editingDevis,
                                    prixEstime: e.target.value,
                                })
                            }
                        />

                        <label>Détails</label>
                        <textarea
                            value={editingDevis.details}
                            onChange={(e) =>
                                setEditingDevis({
                                    ...editingDevis,
                                    details: e.target.value,
                                })
                            }
                        ></textarea>

                        <div style={{ marginTop: "10px" }}>
                            <button
                                type="submit"
                                style={{
                                    marginRight: "10px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                💾 Sauvegarder
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingDevis(null)}
                                style={{
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                ❌ Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
