import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

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
                if (data) setDevisList(data);
            })
            .catch(() => setError("Erreur lors du chargement des devis"))
            .finally(() => setLoading(false));
    }, [onLogout]);

    // 🔹 Calcul total HT/TVA/TTC
    const calculerTotaux = (prestations) => {
        const totalHT = prestations.reduce(
            (acc, p) => acc + (p.quantite || 0) * (p.prixUnitaire || 0),
            0
        );
        const tva = totalHT * 0.2;
        const totalTTC = totalHT + tva;
        return { totalHT, tva, totalTTC };
    };

    const handleUpdateDevis = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const { totalHT, tva, totalTTC } = calculerTotaux(editingDevis.prestations);

        try {
            const res = await fetch(
                `http://localhost:4000/api/admin/devis/${editingDevis._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ ...editingDevis, totalHT, tva, totalTTC }),
                }
            );

            if (!res.ok) throw new Error("Erreur mise à jour");
            const updated = await res.json();

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

    const addPrestation = () => {
        setEditingDevis({
            ...editingDevis,
            prestations: [
                ...(editingDevis.prestations || []),
                { designation: "", quantite: 1, prixUnitaire: 0 },
            ],
        });
    };

    const removePrestation = (index) => {
        const newPrestations = [...editingDevis.prestations];
        newPrestations.splice(index, 1);
        setEditingDevis({ ...editingDevis, prestations: newPrestations });
    };

    const deleteDevis = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce devis ?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:4000/api/admin/devis/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Erreur suppression");

            setDevisList((prev) => prev.filter((d) => d._id !== id));
            alert("🗑 Devis supprimé !");
        } catch (err) {
            console.error(err);
            alert("❌ Erreur lors de la suppression");
        }
    };

    return (
        <div className="dashboard-container">

            {/* 🔹 HEADER FIXE */}
            <header className="dashboard-header">
                <h1>📋 Tableau des devis</h1>
                <button
                    className="logout"
                    onClick={() => {
                        localStorage.removeItem("token");
                        onLogout();
                    }}
                >
                    Déconnexion
                </button>
            </header>

            <main className="dashboard-content">
                {loading && <p>Chargement...</p>}
                {error && <p className="error">{error}</p>}
                {!loading && devisList.length === 0 && <p>Aucun devis pour le moment.</p>}

                {!loading && devisList.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Message</th>
                                <th>Prestations</th>
                                <th>Total HT</th>
                                <th>TVA</th>
                                <th>Total TTC</th>
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
                                    <td>{devis.details || "—"}</td>
                                    <td>
                                        {devis.prestations?.map((p, i) => (
                                            <div key={i}>
                                                {p.designation} ({p.quantite} × {p.prixUnitaire}€)
                                            </div>
                                        ))}
                                    </td>
                                    <td>{(devis.totalHT || 0).toFixed(2)} €</td>
                                    <td>{(devis.tva || 0).toFixed(2)} €</td>
                                    <td>{(devis.totalTTC || 0).toFixed(2)} €</td>
                                    <td>{new Date(devis.createdAt).toLocaleDateString()}</td>
                                    <td className="actions-cell">
                                        <button className="edit" onClick={() => setEditingDevis(devis)}>
                                            ✏ Modifier
                                        </button>
                                        <button
                                            className="pdf"
                                            onClick={async () => {
                                                const token = localStorage.getItem("token");
                                                try {
                                                    const res = await fetch(
                                                        `http://localhost:4000/api/admin/devis/${devis._id}/pdf`,
                                                        {
                                                            headers: { Authorization: `Bearer ${token}` },
                                                        }
                                                    );
                                                    if (!res.ok) throw new Error("Erreur PDF");

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
                                                }
                                            }}
                                        >
                                            📄 PDF
                                        </button>
                                        <button className="delete" onClick={() => deleteDevis(devis._id)}>
                                            🗑 Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </main>

            {/* Formulaire édition devis */}
            {editingDevis && (
                <div className="edit-form">
                    <h2>Modifier le devis</h2>
                    <form onSubmit={handleUpdateDevis}>
                        <h3>Prestations</h3>
                        {editingDevis.prestations?.map((p, index) => (
                            <div key={index} className="prestation-line">
                                <input
                                    type="text"
                                    placeholder="Désignation"
                                    value={p.designation}
                                    onChange={(e) => {
                                        const newPrestations = [...editingDevis.prestations];
                                        newPrestations[index].designation = e.target.value;
                                        setEditingDevis({
                                            ...editingDevis,
                                            prestations: newPrestations,
                                        });
                                    }}
                                />
                                <input
                                    type="number"
                                    placeholder="Quantité"
                                    value={p.quantite}
                                    onChange={(e) => {
                                        const newPrestations = [...editingDevis.prestations];
                                        newPrestations[index].quantite = Number(e.target.value);
                                        setEditingDevis({
                                            ...editingDevis,
                                            prestations: newPrestations,
                                        });
                                    }}
                                />
                                <input
                                    type="number"
                                    placeholder="Prix unitaire"
                                    value={p.prixUnitaire}
                                    onChange={(e) => {
                                        const newPrestations = [...editingDevis.prestations];
                                        newPrestations[index].prixUnitaire = Number(e.target.value);
                                        setEditingDevis({
                                            ...editingDevis,
                                            prestations: newPrestations,
                                        });
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removePrestation(index)}
                                    className="delete"
                                >
                                    Supprimer
                                </button>
                            </div>
                        ))}

                        <button type="button" onClick={addPrestation} className="edit">
                            ➕ Ajouter prestation
                        </button>

                        <div style={{ marginTop: "20px" }}>
                            <button type="submit" className="pdf">
                                Sauvegarder
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingDevis(null)}
                                className="delete"
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
