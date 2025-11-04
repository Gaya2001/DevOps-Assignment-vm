function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0 text-center md:text-left">
                        <h3 className="text-2xl font-extrabold text-blue-500">GeoView</h3>
                        <p className="text-gray-400 mt-2">Explore countries around the world</p>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-sm">Powered by REST Countries API</p>
                        <p className="text-gray-400 mt-2 text-sm">
                            &copy; {new Date().getFullYear()} CountryExplorer. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
