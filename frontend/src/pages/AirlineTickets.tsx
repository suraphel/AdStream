import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AirlinePriceList } from '@/components/AirlinePriceList';
import { Plane, MapPin, Calendar, Users } from 'lucide-react';
import { Link } from 'wouter';

const AirlineTickets: React.FC = () => {
  const { data: airlineListings = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/listings', { categorySlug: 'airline-tickets' }],
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Plane className="h-8 w-8 text-primary" />
                Airline Tickets
              </h1>
              <p className="text-gray-600 mt-2">
                Find and book flights for domestic and international travel
              </p>
            </div>
            <Link href="/post?category=airline-tickets">
              <Button className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Post Flight Deal
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Listings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Available Flights</h2>
              <span className="text-sm text-gray-500">
                {airlineListings.length} flights found
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : airlineListings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No flights available
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Be the first to post a flight deal in this category.
                  </p>
                  <Link href="/post?category=airline-tickets">
                    <Button>Post First Flight</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {airlineListings.map((listing: any) => (
                  <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {listing.title}
                          </h3>
                          
                          {listing.departureCity && listing.arrivalCity && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <MapPin className="h-4 w-4" />
                              <span>{listing.departureCity} → {listing.arrivalCity}</span>
                            </div>
                          )}
                          
                          {listing.departureDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Departure: {new Date(listing.departureDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          
                          {listing.airline && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Plane className="h-4 w-4" />
                              <span>{listing.airline}</span>
                              {listing.flightClass && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  {listing.flightClass}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {listing.passengerCount && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Users className="h-4 w-4" />
                              <span>{listing.passengerCount} passenger{listing.passengerCount > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          
                          <p className="text-gray-700 text-sm mt-3">
                            {listing.description}
                          </p>
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-primary mb-2">
                            {new Intl.NumberFormat('en-ET', {
                              style: 'currency',
                              currency: listing.currency || 'ETB',
                              minimumFractionDigits: 0,
                            }).format(listing.price)}
                          </div>
                          <div className="text-xs text-gray-500 mb-3">
                            per person
                          </div>
                          <Link href={`/listing/${listing.id}`}>
                            <Button size="sm" className="w-full">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Price List Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Flight Prices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AirlinePriceList />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AirlineTickets;