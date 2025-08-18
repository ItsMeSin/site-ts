import React, { useState, useEffect } from "react";
import "./ArtisansCouvreurSite.css";

export default function ArtisansCouvreurSite() {
    function handleSmoothScroll(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute("href").slice(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: "smooth" });
        }
    }

    const prestations = [
        "Rénovation de toitures",
        "Nettoyage / démoussage",
        "Peinture de façade",
        "Réparation de tuiles",
        "Étanchéité & zinguerie",
    ];

    const beforeAfterPairs = [
        ["photo1.jpg", "photo2.jpg"],
        ["photo3.jpg", "photo4.jpg"],
        ["photo5.jpg", "photo6.jpg"],
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % beforeAfterPairs.length);
    };
    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + beforeAfterPairs.length) % beforeAfterPairs.length);
    };

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
        Rénovation: 1000,
        Nettoyage: 500,
        Peinture: 700,
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

            let result;
            try {
                result = await response.json();
            } catch {
                throw new Error("Réponse serveur invalide");
            }

            if (!response.ok) {
                console.error("❌ Erreur serveur :", result);
                alert("Erreur lors de l’envoi : " + (result.error || "inconnue"));
                return;
            }

            // ✅ succès
            alert("Votre demande de devis a été envoyée !");
            if (result.previewUrl) {
                console.log("📧 Lien Ethereal :", result.previewUrl);
                alert("Lien de prévisualisation du mail : " + result.previewUrl);
            }

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
        } catch (error) {
            console.error("❌ Erreur réseau :", error);
            alert("Erreur de connexion au serveur");
        }
    };

    return (
        <div className="site-wrapper">
            <header className="header">
                <h1>TS COUVERTURE</h1>
                <nav>
                    <a href="#prestations" onClick={handleSmoothScroll}>Prestations</a>
                    <a href="#realisations" onClick={handleSmoothScroll}>Réalisations</a>
                    <a href="#devis" onClick={handleSmoothScroll}>Contact</a>
                </nav>
            </header>

            <section className="hero" style={{ backgroundImage: "url('/photo2.jpg')" }}>
                <div className="overlay"></div>
                <div className="hero-content">
                    <h2>Votre Toiture, Notre Savoir-Faire</h2>
                    <p>Rénovation - Nettoyage - Peinture de façade</p>
                    <button className="button" onClick={() => {
                        const contactSection = document.getElementById('devis');
                        if (contactSection) {
                            contactSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}>Demander un devis gratuit</button>
                </div>
            </section>

            <section id="prestations" className="section">
                <h2>Nos Prestations</h2>
                <div className="cards">
                    {prestations.map((title, idx) => (
                        <div key={idx} className="card">{title}</div>
                    ))}
                </div>
            </section>

            <section id="realisations" className="section grey">
                <h2>Avant / Après</h2>
                <div className="slider">
                    <button className="slider-button left" onClick={prevSlide}>&lt;</button>
                    <div className="slider-images">
                        <img key={beforeAfterPairs[currentSlide][0]} className="slider-img" src={`/${beforeAfterPairs[currentSlide][0]}`} alt="Avant" />
                        <img key={beforeAfterPairs[currentSlide][1]} className="slider-img" src={`/${beforeAfterPairs[currentSlide][1]}`} alt="Après" />
                    </div>
                    <button className="slider-button right" onClick={nextSlide}>&gt;</button>
                </div>
            </section>

            <section id="devis" className="section">
                <h2>Demande de devis</h2>
                <form className="contact-form" onSubmit={handleSubmit} encType="multipart/form-data">
                    <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    <input type="tel" name="telephone" placeholder="Téléphone" value={formData.telephone} onChange={handleChange} />

                    <select name="service" value={formData.service} onChange={handleChange} required>
                        <option value="">-- Choisissez un service --</option>
                        <option value="Rénovation">Rénovation de toitures</option>
                        <option value="Nettoyage">Nettoyage / démoussage</option>
                        <option value="Peinture">Peinture de façade</option>
                    </select>

                    <input type="number" name="quantite" placeholder="Quantité / Heures estimées" min="1" value={formData.quantite} onChange={handleChange} required />

                    <textarea name="details" rows="4" placeholder="Décrivez votre besoin en détail..." value={formData.details} onChange={handleChange} required></textarea>

                    <input type="file" name="photos" multiple accept="image/*" onChange={handleFileChange} />

                    <p>
                        <strong>Estimation :</strong> {formData.prixEstime.toFixed(2)} €
                    </p>

                    <button type="submit">Demander un devis</button>
                </form>
            </section>

            <footer className="footer">
                &copy; 2025 TS COUVERTURE - Tous droits réservés / Certifié DALEP
            </footer>
        </div>
    );
}
