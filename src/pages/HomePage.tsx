import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    const { theme } = useTheme();

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className={`py-20 ${theme.background}`}>
                <div className="container mx-auto px-4 text-center">
                    <h1 className={`text-5xl md:text-6xl font-bold ${theme.text} mb-6`}>
                        Welcome to CrestOAK College
                    </h1>
                    <p className={`text-xl ${theme.text} opacity-75 mb-8 max-w-2xl mx-auto`}>
                        Empowering minds, shaping futures. Excellence in education since 1985.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            to="/admissions"
                            className={`px-8 py-3 rounded-lg ${theme.button.primary.background} ${theme.button.primary.text} font-semibold transition-transform hover:scale-105`}
                        >
                            Apply Now
                        </Link>
                        <Link
                            to="/about"
                            className={`px-8 py-3 rounded-lg border-2 ${theme.card.border} ${theme.text} font-semibold transition-transform hover:scale-105`}
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Choose CrestOAK?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card text-center">
                            <div className="text-4xl mb-4">🎓</div>
                            <h3 className="text-xl font-semibold mb-2">Academic Excellence</h3>
                            <p className="text-gray-600">Top-ranked programs with experienced faculty</p>
                        </div>
                        <div className="card text-center">
                            <div className="text-4xl mb-4">🌍</div>
                            <h3 className="text-xl font-semibold mb-2">Global Community</h3>
                            <p className="text-gray-600">Diverse student body from over 50 countries</p>
                        </div>
                        <div className="card text-center">
                            <div className="text-4xl mb-4">💼</div>
                            <h3 className="text-xl font-semibold mb-2">Career Success</h3>
                            <p className="text-gray-600">95% graduate employment rate</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={`py-16 ${theme.button.primary.background}`}>
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-white opacity-90 mb-8">Join thousands of successful alumni</p>
                    <Link
                        to="/apply"
                        className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold transition-transform hover:scale-105"
                    >
                        Apply Today
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
