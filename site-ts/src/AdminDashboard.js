// AdminDashboard.jsx
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

    // 🔹 Calcul total HT/TVA/TTC (utile pour l'édition)
    const calculerTotaux = (prestations) => {
        const totalHT = prestations.reduce(
            (acc, p) => acc + (p.quantite || 0) * (p.prixUnitaire || 0),
            0
        );
        const tva = totalHT * 0.2;
        const totalTTC = totalHT + tva;
        return { totalHT, tva, totalTTC };
    };

    // 🔹 Télécharger / générer le PDF (protégé)
    const handleDownloadPDF = async (devis) => {
        const token = localStorage.getItem("token");
        if (!token) {
            onLogout();
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:4000/api/admin/devis/${devis._id}/pdf`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.status === 401 || res.status === 403) {
                onLogout();
                return;
            }

            if (!res.ok) throw new Error("Erreur lors de la génération/téléchargement du PDF");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            // essayer de récupérer un nom de fichier depuis les headers si présent
            const cd = res.headers.get("content-disposition");
            let filename = `devis-${devis._id}.pdf`;
            if (cd) {
                const m = cd.match(/filename="?(.+?)"?($|;)/);
                if (m && m[1]) filename = m[1];
            }

            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("PDF download error:", err);
            alert("Impossible de télécharger le PDF. Regarde la console / network pour plus d'infos.");
        }
    };

    const handleUpdateDevis = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!editingDevis) return;

        const { totalHT, tva, totalTTC } = calculerTotaux(editingDevis.prestations || []);

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

            setDevisList((prev) => prev.map((d) => (d._id === updated._id ? updated : d)));
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
            prestations: [...(editingDevis.prestations || []), { designation: "", quantite: 1, prixUnitaire: 0 }],
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
                    <table className="devis-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Message</th>
                                <th>Prestations</th>
                                <th>📷 Photos</th>
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
                                    <td data-label="Nom">{devis.nom}</td>
                                    <td data-label="Email">{devis.email}</td>
                                    <td data-label="Téléphone">{devis.telephone}</td>
                                    <td data-label="Message">{devis.details || "—"}</td>
                                    <td data-label="Prestations">
                                        {devis.prestations?.map((p, i) => (
                                            <div key={i}>
                                                {p.designation} ({p.quantite} × {p.prixUnitaire}€)
                                            </div>
                                        ))}
                                    </td>

                                    <td data-label="Photos">
                                        {devis.photos && devis.photos.length > 0 ? (
                                            <div className="photos-grid">
                                                {devis.photos.map((url, i) => (
                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                                        <img src={url} alt={`photo-${i}`} className="photo-thumbnail" />
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <span>—</span>
                                        )}
                                    </td>

                                    <td data-label="Total HT">{(devis.totalHT || 0).toFixed(2)} €</td>
                                    <td data-label="TVA">{(devis.tva || 0).toFixed(2)} €</td>
                                    <td data-label="Total TTC">{(devis.totalTTC || 0).toFixed(2)} €</td>
                                    <td data-label="Date">{new Date(devis.createdAt).toLocaleDateString()}</td>
                                    <td data-label="Actions" className="actions-cell">
                                        <button className="edit" onClick={() => setEditingDevis(devis)}>✏ Modifier</button>

                                        {/* On utilise la fonction protégée pour générer/télécharger le PDF */}
                                        <button className="pdf" onClick={() => handleDownloadPDF(devis)}>📄 PDF</button>

                                        <button className="delete" onClick={() => deleteDevis(devis._id)}>🗑 Supprimer</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* 🔹 Formulaire d’édition */}
                {editingDevis && (
                    <div className="edit-form">
                        <h2>✏ Modifier le devis</h2>
                        <form onSubmit={handleUpdateDevis}>
                            <input
                                type="text"
                                value={editingDevis.nom || ""}
                                onChange={(e) => setEditingDevis({ ...editingDevis, nom: e.target.value })}
                                placeholder="Nom"
                                required
                            />
                            <input
                                type="email"
                                value={editingDevis.email || ""}
                                onChange={(e) => setEditingDevis({ ...editingDevis, email: e.target.value })}
                                placeholder="Email"
                                required
                            />
                            <input
                                type="text"
                                value={editingDevis.telephone || ""}
                                onChange={(e) => setEditingDevis({ ...editingDevis, telephone: e.target.value })}
                                placeholder="Téléphone"
                                required
                            />
                            <textarea
                                value={editingDevis.details || ""}
                                onChange={(e) => setEditingDevis({ ...editingDevis, details: e.target.value })}
                                placeholder="Message"
                            />

                            <h3>Prestations</h3>
                            {editingDevis.prestations?.map((p, i) => (
                                <div key={i} className="prestation-edit">
                                    <input
                                        type="text"
                                        value={p.designation}
                                        onChange={(e) => {
                                            const newPrestations = [...editingDevis.prestations];
                                            newPrestations[i].designation = e.target.value;
                                            setEditingDevis({ ...editingDevis, prestations: newPrestations });
                                        }}
                                        placeholder="Désignation"
                                    />
                                    <input
                                        type="number"
                                        value={p.quantite}
                                        onChange={(e) => {
                                            const newPrestations = [...editingDevis.prestations];
                                            newPrestations[i].quantite = Number(e.target.value);
                                            setEditingDevis({ ...editingDevis, prestations: newPrestations });
                                        }}
                                        placeholder="Quantité"
                                    />
                                    <input
                                        type="number"
                                        value={p.prixUnitaire}
                                        onChange={(e) => {
                                            const newPrestations = [...editingDevis.prestations];
                                            newPrestations[i].prixUnitaire = Number(e.target.value);
                                            setEditingDevis({ ...editingDevis, prestations: newPrestations });
                                        }}
                                        placeholder="Prix unitaire"
                                    />
                                    <button type="button" onClick={() => removePrestation(i)}>❌</button>
                                </div>
                            ))}

                            <button type="button" onClick={addPrestation}>➕ Ajouter prestation</button>
                            <button type="submit">💾 Enregistrer</button>
                            <button type="button" onClick={() => setEditingDevis(null)}>❌ Annuler</button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
