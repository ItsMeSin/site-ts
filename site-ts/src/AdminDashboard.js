import React, { useEffect, useState } from "react";

function AdminDashboard() {
    const [devisList, setDevisList] = useState([]);

    useEffect(() => {
        fetch("http://localhost:4000/api/devis")
            .then((res) => res.json())
            .then((data) => setDevisList(data))
            .catch((err) => console.error("Erreur de chargement :", err));
    }, []);

    return (
        <div>
            <h1>Tableau des devis</h1>
            {devisList.length === 0 ? (
                <p>Aucun devis pour le moment.</p>
            ) : (
                <ul>
                    {devisList.map((devis, index) => (
                        <li key={index}>
                            <strong>{devis.nom}</strong> - {devis.service} - {devis.prixEstime} €
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default AdminDashboard;
