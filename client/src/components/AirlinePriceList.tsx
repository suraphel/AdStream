import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plane, Clock, Users, Star } from 'lucide-react';

interface FlightPrice {
  id: string;
  route: string;
  airline: string;
  class: string;
  price: number;
  currency: string;
  duration: string;
  stops: number;
  departureTime: string;
  arrivalTime: string;
  availability: number;
  isPromoted?: boolean;
}

const sampleFlightPrices: FlightPrice[] = [
  {
    id: '1',
    route: 'Addis Ababa → Dubai',
    airline: 'Ethiopian Airlines',
    class: 'Economy',
    price: 25000,
    currency: 'ETB',
    duration: '3h 45m',
    stops: 0,
    departureTime: '08:30',
    arrivalTime: '12:15',
    availability: 12,
    isPromoted: true
  },
  {
    id: '2',
    route: 'Addis Ababa → Nairobi',
    airline: 'Ethiopian Airlines',
    class: 'Economy',
    price: 18500,
    currency: 'ETB',
    duration: '2h 15m',
    stops: 0,
    departureTime: '14:20',
    arrivalTime: '16:35',
    availability: 8
  },
  {
    id: '3',
    route: 'Addis Ababa → London',
    airline: 'Ethiopian Airlines',
    class: 'Business',
    price: 95000,
    currency: 'ETB',
    duration: '7h 30m',
    stops: 0,
    departureTime: '23:30',
    arrivalTime: '06:00+1',
    availability: 3
  },
  {
    id: '4',
    route: 'Addis Ababa → Cairo',
    airline: 'EgyptAir',
    class: 'Economy',
    price: 22000,
    currency: 'ETB',
    duration: '4h 20m',
    stops: 0,
    departureTime: '16:45',
    arrivalTime: '21:05',
    availability: 15
  },
  {
    id: '5',
    route: 'Addis Ababa → Istanbul',
    airline: 'Turkish Airlines',
    class: 'Economy',
    price: 28000,
    currency: 'ETB',
    duration: '5h 15m',
    stops: 0,
    departureTime: '01:25',
    arrivalTime: '06:40',
    availability: 6
  },
  {
    id: '6',
    route: 'Dire Dawa → Addis Ababa',
    airline: 'Ethiopian Airlines',
    class: 'Economy',
    price: 4500,
    currency: 'ETB',
    duration: '1h 20m',
    stops: 0,
    departureTime: '07:30',
    arrivalTime: '08:50',
    availability: 20
  }
];

export function AirlinePriceList() {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: currency === 'ETB' ? 'ETB' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getClassBadgeColor = (flightClass: string) => {
    switch (flightClass.toLowerCase()) {
      case 'first': return 'bg-purple-100 text-purple-800';
      case 'business': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: number) => {
    if (availability <= 3) return 'text-red-600';
    if (availability <= 10) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Current Flight Prices</h3>
        <Badge variant="outline" className="text-xs">
          Updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      <div className="grid gap-4">
        {sampleFlightPrices.map((flight) => (
          <Card key={flight.id} className={`relative ${flight.isPromoted ? 'ring-2 ring-primary' : ''}`}>
            {flight.isPromoted && (
              <div className="absolute -top-2 left-4">
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  Promoted
                </Badge>
              </div>
            )}
            
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">{flight.route}</span>
                    <Badge className={getClassBadgeColor(flight.class)}>
                      {flight.class}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-2">
                    {flight.airline}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {flight.duration}
                    </div>
                    <div>
                      {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className={getAvailabilityColor(flight.availability)}>
                        {flight.availability} seats
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>Depart: {flight.departureTime}</span>
                    <span>Arrive: {flight.arrivalTime}</span>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-primary">
                    {formatPrice(flight.price, flight.currency)}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    per person
                  </div>
                  <Button size="sm" className="w-full">
                    Book Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="text-center">
            <h4 className="font-semibold mb-2">Need a Custom Quote?</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Looking for group bookings, special routes, or custom travel packages?
            </p>
            <Button variant="outline" size="sm">
              Contact Travel Agent
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}