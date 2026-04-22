"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Phone, Clock, Users, X } from "lucide-react";
import Link from "next/link";
import { Venue } from "@/lib/types";

interface VenuesMapProps {
  venues: Venue[];
}

// Типы для Яндекс Карт
declare global {
  interface Window {
    ymaps?: any;
  }
}

const getMarkerColor = (type: string): string => {
  switch (type) {
    case "студия":
      return "#3b82f6"; // blue
    case "концертный зал":
      return "#8b5cf6"; // purple
    case "репетиционная база":
      return "#10b981"; // green
    default:
      return "#6b7280"; // gray
  }
};

export function VenuesMap({ venues }: VenuesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Загружаем API Яндекс Карт
    if (
      !window.ymaps &&
      !document.querySelector('script[src*="api-maps.yandex.ru"]')
    ) {
      const script = document.createElement("script");
      script.src =
        "https://api-maps.yandex.ru/2.1/?apikey=YOUR_API_KEY&lang=ru_RU";
      script.async = true;
      script.onload = () => {
        window.ymaps?.ready(() => {
          setIsMapLoaded(true);
        });
      };
      document.head.appendChild(script);
    } else if (window.ymaps) {
      window.ymaps.ready(() => {
        setIsMapLoaded(true);
      });
    }
  }, []);

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return;

    // Создаем карту
    const map = new window.ymaps.Map(mapRef.current, {
      center: [55.751244, 37.618423], // Центр Москвы
      zoom: 11,
      controls: ["zoomControl", "fullscreenControl", "geolocationControl"],
    });

    mapInstanceRef.current = map;

    // Добавляем маркеры для каждого учреждения
    venues.forEach((venue) => {
      const placemark = new window.ymaps.Placemark(
        venue.coordinates,
        {
          balloonContent: `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${venue.name}</h3>
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">${venue.type}</p>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">${venue.address}</p>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 14px;">⭐ ${venue.rating}</span>
                <span style="font-size: 14px; font-weight: 600;">${venue.pricePerHour.toLocaleString("ru-RU")} руб/час</span>
              </div>
            </div>
          `,
        },
        {
          preset: "islands#circleDotIcon",
          iconColor: getMarkerColor(venue.type),
        },
      );

      // Обработчик клика на маркер
      placemark.events.add("click", () => {
        setSelectedVenue(venue);
      });

      map.geoObjects.add(placemark);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapLoaded, venues]);

  return (
    <div className="relative w-full h-[600px]">
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg overflow-hidden border border-border"
      />

      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка карты...</p>
          </div>
        </div>
      )}

      {/* Информационное окно выбранного учреждения */}
      {selectedVenue && (
        <Card className="absolute top-4 right-4 w-80 shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  {selectedVenue.name}
                </h3>
                <Badge className="text-xs">{selectedVenue.type}</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setSelectedVenue(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  {selectedVenue.address}
                </span>
              </div>

              {selectedVenue.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {selectedVenue.phone}
                  </span>
                </div>
              )}

              {selectedVenue.workingHours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {selectedVenue.workingHours}
                  </span>
                </div>
              )}

              {selectedVenue.capacity && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    До {selectedVenue.capacity} чел.
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {selectedVenue.description}
            </p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-medium">{selectedVenue.rating}</span>
              </div>
              <span className="font-semibold text-lg">
                {selectedVenue.pricePerHour.toLocaleString("ru-RU")} руб/час
              </span>
            </div>

            <Button asChild className="w-full">
              <Link href={`/venues/${selectedVenue.id}`}>
                Профиль учреждения
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Легенда */}
      <Card className="absolute bottom-4 left-4 shadow-lg">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
              <span className="text-xs text-muted-foreground">Студия</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10b981]" />
              <span className="text-xs text-muted-foreground">
                Репетиционная база
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
              <span className="text-xs text-muted-foreground">
                Концертный зал
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
