import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCountryByCode } from '../services/api';
import Spinner from '../components/Spinner';
import { useCountries } from '../context/CountryContext';
import { useAuth } from '../context/AuthContext';

function CountryDetailPage() {
    const [country, setCountry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { code } = useParams();
    const { addFavorite, removeFavorite, isFavorite } = useCountries();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchCountry = async () => {
            try {
                setLoading(true);
                const data = await getCountryByCode(code);
                setCountry(data[0]);
            } catch (err) {
                setError('Failed to fetch country details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCountry();
    }, [code]);

    const handleFavoriteClick = () => {
        if (isFavorite(country.cca3)) {
            removeFavorite(country.cca3);
        } else {
            addFavorite(country);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Spinner />
            </div>
        );
    }

    if (error || !country) {
        return (
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
                {error || 'Country not found'}
            </div>
        );
    }

    const formatPopulation = (population) => {
        return population.toLocaleString();
    };

    const getLanguages = () => {
        return country.languages
            ? Object.values(country.languages).join(', ')
            : 'N/A';
    };

    const getCurrencies = () => {
        return country.currencies
            ? Object.values(country.currencies)
                .map((currency) => currency.name)
                .join(', ')
            : 'N/A';
    };

    return (
        <div>
            <div className="mb-8">
                <Link to="/" className="btn btn-outline inline-flex items-center">
                    <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Back
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                    <div className="relative">
                        <img
                            src={country.flags.svg}
                            alt={`Flag of ${country.name.common}`}
                            className="w-full h-auto shadow-lg rounded-md"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-start">
                        <h1 className="text-3xl font-bold mb-6">{country.name.common}</h1>

                        {isAuthenticated && (
                            <button
                                onClick={handleFavoriteClick}
                                className="p-2 flex items-center justify-center rounded-full hover:bg-gray-100"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill={isFavorite(country.cca3) ? 'currentColor' : 'none'}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    style={{ color: isFavorite(country.cca3) ? '#dc2626' : '#6b7280' }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <p>
                                <span className="font-semibold">Native Name:</span>{' '}
                                {country.name.nativeName
                                    ? Object.values(country.name.nativeName)[0].common
                                    : country.name.common}
                            </p>
                            <p>
                                <span className="font-semibold">Population:</span>{' '}
                                {formatPopulation(country.population)}
                            </p>
                            <p>
                                <span className="font-semibold">Region:</span> {country.region}
                            </p>
                            <p>
                                <span className="font-semibold">Sub Region:</span>{' '}
                                {country.subregion || 'N/A'}
                            </p>
                            <p>
                                <span className="font-semibold">Capital:</span>{' '}
                                {country.capital && country.capital.length > 0
                                    ? country.capital.join(', ')
                                    : 'N/A'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p>
                                <span className="font-semibold">Top Level Domain:</span>{' '}
                                {country.tld ? country.tld.join(', ') : 'N/A'}
                            </p>
                            <p>
                                <span className="font-semibold">Currencies:</span>{' '}
                                {getCurrencies()}
                            </p>
                            <p>
                                <span className="font-semibold">Languages:</span>{' '}
                                {getLanguages()}
                            </p>
                        </div>
                    </div>

                    {country.borders && country.borders.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-3">Border Countries:</h3>
                            <div className="flex flex-wrap gap-2">
                                {country.borders.map((border) => (
                                    <Link
                                        key={border}
                                        to={`/country/${border}`}
                                        className="px-4 py-1 bg-white shadow rounded-sm hover:shadow-md"
                                    >
                                        {border}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CountryDetailPage;
