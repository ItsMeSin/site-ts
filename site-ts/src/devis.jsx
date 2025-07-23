import React, { useEffect, useState } from "react";

const Devis = () => {
    const [formData, setFormData] = useState({
        nom: "",
        email: "",
        telephone: "",
        service: "",
        quantite: 1,
        details: "",
        photos: [],
        prixEstime: 0,
    });

    const tarifs = {
        site: 800,
        design: 500,
        seo: 300,
    };

    useEffect(() => {
        const tarif = tarifs[formData.service] || 0;
        const total = formData.quantite * tarif;
        setFormData((prev) => ({ ...prev, prixEstime: total }));
    }, [formData.service, formData.quantite]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, photos: Array.from(e.target.files) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === "photos") {
                value.forEach((file) => data.append("photos", file));
            } else {
                data.append(key, value);
            }
        });

        try {
            const response = await fetch("http://localhost:4000/api/devis", {
                method: "POST",
                body: data,
            });

            if (response.ok) {
                alert("Demande envoyée avec succès !");
                setFormData({
                    nom: "",
                    email: "",
                    telephone: "",
                    service: "",
                    quantite: 1,
                    details: "",
                    photos: [],
                    prixEstime: 0,
                });
            } else {
                alert("Erreur lors de l'envoi de la demande");
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            alert("Erreur réseau");
        }
    };

    return (
        <section id="devis" className="section">
            <h2>Demande de devis</h2>
            <form className="contact-form" onSubmit={handleSubmit} encType="multipart/form-data">
                <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input type="tel" name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} />

                <select name="service" value={formData.service} onChange={handleChange} required>
                    <option value="">-- Choisissez un service --</option>
                    <option value="site">Création de site web</option>
                    <option value="design">Design graphique</option>
                    <option value="seo">Référencement SEO</option>
                </select>

                <input
                    type="number"
                    name="quantite"
                    placeholder="Quantité / Heures estimées"
                    min="1"
                    value={formData.quantite}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="details"
                    rows="4"
                    placeholder="Décrivez votre besoin en détail..."
                    value={formData.details}
                    onChange={handleChange}
                    required
                ></textarea>

                <input type="file" name="photos" multiple accept="image/*" onChange={handleFileChange} />

                <p>
                    <strong>Estimation :</strong> {formData.prixEstime.toFixed(2)} €
                </p>

                <button type="submit">Demander un devis</button>
            </form>
        </section>
    );
};

export default D