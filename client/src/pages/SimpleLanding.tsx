import { Link } from "wouter";

export default function SimpleLanding() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            EthioMarket - Ethiopian Classified Ads
          </h1>
          <p className="mt-2 text-gray-600">
            Buy and sell anything in Ethiopia - from cars to electronics, jobs to real estate
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find Everything You Need
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            The largest marketplace in Ethiopia with thousands of listings
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/categories">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Browse Categories
              </button>
            </Link>
            <Link href="/post">
              <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Post an Ad
              </button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              🚗
            </div>
            <h3 className="text-xl font-semibold mb-2">Vehicles</h3>
            <p className="text-gray-600">Cars, trucks, motorcycles and more</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              📱
            </div>
            <h3 className="text-xl font-semibold mb-2">Electronics</h3>
            <p className="text-gray-600">Phones, computers, TVs and gadgets</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              🏠
            </div>
            <h3 className="text-xl font-semibold mb-2">Real Estate</h3>
            <p className="text-gray-600">Houses, apartments, land for sale</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h3>
          <p className="text-gray-600 mb-6">
            Join thousands of Ethiopians buying and selling on EthioMarket
          </p>
          <Link href="/post">
            <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Post Your First Ad
            </button>
          </Link>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 EthioMarket. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}