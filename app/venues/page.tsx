'use client';

import { useState } from 'react';
import Link from 'next/link';
import { venues } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MapPin, Star, Search, Filter, Calendar, Clock, Mic2, Building2 } from 'lucide-react';

const venueTypes = ['Все', 'студия', 'репетиционная база', 'концертный зал'];

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [venueType, setVenueType] = useState('Все');
  const [selectedVenue, setSelectedVenue] = useState<typeof venues[0] | null>(null);

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = !searchQuery || 
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = venueType === 'Все' || venue.type === venueType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'студия': return Mic2;
      case 'концертный зал': return Building2;
      default: return MapPin;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'студия': return 'bg-primary text-primary-foreground';
      case 'концертный зал': return 'bg-secondary text-secondary-foreground';
      case 'репетиционная база': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Каталог учреждений</h1>
        <p className="text-muted-foreground">
          Найдите студию, репетиционную базу или концертную площадку
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск по названию или адресу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={venueType} onValueChange={setVenueType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Тип учреждения" />
              </SelectTrigger>
              <SelectContent>
                {venueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type === 'Все' ? 'Все типы' : type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Найдено: {filteredVenues.length} учреждений
      </p>

      {/* Venues Grid */}
      {filteredVenues.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredVenues.map(venue => {
            const TypeIcon = getTypeIcon(venue.type);
            return (
              <Card key={venue.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <TypeIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{venue.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {venue.address}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getTypeColor(venue.type)}>
                      {venue.type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {venue.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {venue.equipment.slice(0, 3).map(eq => (
                      <Badge key={eq} variant="outline" className="text-xs">
                        {eq}
                      </Badge>
                    ))}
                    {venue.equipment.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{venue.equipment.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        {venue.rating}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {venue.pricePerHour.toLocaleString('ru-RU')} руб/час
                      </span>
                    </div>
                    
                    <Button asChild variant="outline" size="sm" className="bg-transparent mr-2">
                        <Link href={`/venues/${venue.id}`}>
                          Подробнее
                        </Link>
                      </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setSelectedVenue(venue)}>
                          <Calendar className="h-4 w-4 mr-1.5" />
                          Забронировать
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Бронирование: {venue.name}</DialogTitle>
                          <DialogDescription>
                            {venue.address}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <label className="text-sm font-medium">Дата</label>
                            <Input type="date" className="mt-1.5" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Время начала</label>
                              <Input type="time" className="mt-1.5" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Время окончания</label>
                              <Input type="time" className="mt-1.5" />
                            </div>
                          </div>
                          <div className="pt-4 border-t border-border">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Стоимость за час:</span>
                              <span className="font-medium">{venue.pricePerHour.toLocaleString('ru-RU')} руб</span>
                            </div>
                          </div>
                          <Button className="w-full">
                            Отправить заявку
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">
                            В MVP-версии бронирование симулируется
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Учреждения не найдены
            </h3>
            <p className="text-muted-foreground">
              Попробуйте изменить параметры поиска
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
