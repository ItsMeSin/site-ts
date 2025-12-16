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
        { nom: "Rénovation de toitures", prix: "à partir de 1000€", description: "Remplacement complet ou partiel de votre toiture." },
        { nom: "Nettoyage / démoussage", prix: "à partir de 500€", description: "Nettoyage haute pression, anti-mousse, hydrofuge." },
        { nom: "Peinture de façade", prix: "à partir de 700€", description: "Rafraîchissement et protection de vos façades." },
        { nom: "Réparation de tuiles", prix: "sur devis", description: "Remplacement de tuiles cassées et réparation de fuites." },
        { nom: "Étanchéité & zinguerie", prix: "sur devis", description: "Pose et entretien de gouttières, chéneaux, bardages." },
    ];

    const beforeAfterPairs = [
        ["photo1.jpg", "photo2.jpg"],
        ["photo3.jpg", "photo4.jpg"],
        ["photo5.jpg", "photo6.jpg"],
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % beforeAfterPairs.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + beforeAfterPairs.length) % beforeAfterPairs.length);

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

    const tarifs = { Rénovation: 1000, Nettoyage: 500, Peinture: 700 };

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
                <h1>TS COUVERTURE PEINTURE</h1>
                <nav>
                    <a href="#prestations" onClick={handleSmoothScroll}>Prestations</a>
                    <a href="#choisir" onClick={handleSmoothScroll}>Pourquoi me choisir</a>
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
                        if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
                    }}>
                        Demander un devis gratuit
                    </button>
                </div>
            </section>
            {/* 💎 Nouvelle section “Pourquoi me choisir” */}
            <section id="choisir" className="section grey">
                <h2>Pourquoi me choisir ?</h2>
                <p className="intro-text">
                    Fort de plus de 5 ans d’expérience dans la couverture et la peinture, j’apporte à chaque projet le même soin et la même exigence.
                    Mon objectif : un travail durable, esthétique et conforme à vos attentes.
                </p>
                <div className="qualities">
                    <div className="quality">
                        <h3>✅ Expertise et savoir-faire</h3>
                        <p>Un artisan qualifié, passionné par le travail bien fait et formé aux techniques modernes et traditionnelles.</p>
                    </div>
                    <div className="quality">
                        <h3>🕒 Respect des délais</h3>
                        <p>Les chantiers sont planifiés avec précision pour garantir une intervention rapide et sans mauvaise surprise.</p>
                    </div>
                    <div className="quality">
                        <h3>💬 Accompagnement personnalisé</h3>
                        <p>Devis clair, conseils adaptés à votre toiture, suivi rigoureux du chantier jusqu’à la livraison.</p>
                    </div>
                    <div className="quality">
                        <h3>📞 Disponibilité 7j/7</h3>
                        <p>Besoin d’une intervention urgente ? Je reste disponible 7 jours sur 7 pour répondre rapidement à vos demandes et assurer le suivi de vos chantiers.</p>
                    </div>

                </div>
            </section>

            {/* 🧱 Section Prestations */}
            <section id="prestations" className="section">
                <h2>Nos Prestations</h2>
                <div className="cards">
                    {prestations.map((item, idx) => (
                        <div key={idx} className="card">
                            <h3>{item.nom}</h3>
                            <p className="price">{item.prix}</p>
                            <p className="description">{item.description}</p>
                            <button onClick={() => {
                                document.getElementById("devis").scrollIntoView({ behavior: "smooth" });
                                setFormData(prev => ({ ...prev, service: item.nom.split(" ")[0] }));
                            }}>
                                Demander un devis
                            </button>
                        </div>
                    ))}
                </div>
            </section>



            {/* 🏗️ Avant / Après */}
            <section id="realisations" className="section">
                <h2>Avant / Après</h2>
                <div className="slider">
                    <button className="slider-button left" onClick={prevSlide}>&lt;</button>
                    <div className="slider-images">
                        <img className="slider-img" src={`/${beforeAfterPairs[currentSlide][0]}`} alt="Avant" />
                        <img className="slider-img" src={`/${beforeAfterPairs[currentSlide][1]}`} alt="Après" />
                    </div>
                    <button className="slider-button right" onClick={nextSlide}>&gt;</button>
                </div>
            </section>



            <section id="intervention" className="section">
                <h2>Zone d'intervention</h2>
                <p>Intervention rapide dans toute la Sarthe </p>
                <div>

                </div>
            </section>

            {/* 📩 Formulaire de contact */}
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

                    <textarea name="details" rows="4" placeholder="Décrivez votre besoin..." value={formData.details} onChange={handleChange} required></textarea>

                    <input type="file" name="photos" multiple accept="image/*" onChange={handleFileChange} />

                    <p><strong>Estimation :</strong> {formData.prixEstime.toFixed(2)} €</p>

                    <button type="submit">Demander un devis</button>
                </form>
            </section>

            <footer className="footer">
                &copy; 2025 TS COUVERTURE PEINTURE - Tous droits réservés / Certifié DALEP
            </footer>
        </div>
    );
}
