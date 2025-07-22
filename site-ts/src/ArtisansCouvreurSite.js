import React, { useState } from "react";
import "./ArtisansCouvreurSite.css";

export default function ArtisansCouvreurSite() {

    function handleSmoothScroll(e) {
        e.preventDefault(); // Empêche le saut instantané
        const targetId = e.currentTarget.getAttribute("href").slice(1); // récupère "prestations" par exemple
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

    return (
        <div className="site-wrapper">
            <header className="header">
                <h1>TS COUVERTURE</h1>
                <nav>
                    <a href="#prestations" onClick={handleSmoothScroll}>Prestations</a>
                    <a href="#realisations" onClick={handleSmoothScroll}>Réalisations</a>
                    <a href="#contact" onClick={handleSmoothScroll}>Contact</a>
                </nav>

            </header>

            <section className="hero" style={{ backgroundImage: "url('/photo2.jpg')" }}>
                <div className="overlay"></div>
                <div className="hero-content">
                    <h2>Votre Toiture, Notre Savoir-Faire</h2>
                    <p>Rénovation - Nettoyage - Peinture de façade</p>
                    <button
                        className="button"
                        onClick={() => {
                            const contactSection = document.getElementById('contact');
                            if (contactSection) {
                                contactSection.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    >
                        Demander un devis gratuit
                    </button>
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
                        <img
                            key={beforeAfterPairs[currentSlide][0]}
                            className="slider-img"
                            src={`/${beforeAfterPairs[currentSlide][0]}`}
                            alt="Avant"
                        />
                        <img
                            key={beforeAfterPairs[currentSlide][1]}
                            className="slider-img"
                            src={`/${beforeAfterPairs[currentSlide][1]}`}
                            alt="Après"
                        />
                    </div>

                    <button className="slider-button right" onClick={nextSlide}>&gt;</button>
                </div>
            </section>

            <section id="contact" className="section">
                <h2>Contactez-nous</h2>
                <form
                    className="contact-form"
                    action="https://formspree.io/f/mwpqllrz"  // ← remplace par ton vrai lien Formspree
                    method="POST"
                >
                    <input type="text" name="nom" placeholder="Nom" required />
                    <input type="email" name="email" placeholder="Email" required />
                    <input type="tel" name="telephone" placeholder="Téléphone" />
                    <textarea name="message" rows="4" placeholder="Votre message..." required></textarea>
                    <button type="submit">Envoyer</button>
                </form>

            </section>

            <footer className="footer">
                &copy; 2025 TS COUVERTURE - Tous droits réservés / Certifié DALEP
            </footer>
        </div>
    );
}
