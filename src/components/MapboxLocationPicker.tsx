import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapboxLocationPickerProps {
  value: string;
  onChange: (location: string, lat?: number, lng?: number) => void;
}

export function MapboxLocationPicker({ value, onChange }: MapboxLocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch API key from edge function
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setAccessToken(data.token);
          mapboxgl.accessToken = data.token;
        }
      } catch (error) {
        console.log("Mapbox token not available");
      }
    };
    fetchApiKey();
  }, []);

  // Initialize map when showing
  useEffect(() => {
    if (!showMap || !accessToken || !mapContainerRef.current || mapRef.current) return;

    const defaultCenter: [number, number] = [78.9629, 20.5937]; // India center [lng, lat]

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: defaultCenter,
      zoom: 4,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    markerRef.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat(defaultCenter)
      .addTo(mapRef.current);

    // Click to place marker
    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current?.setLngLat([lng, lat]);
      reverseGeocode(lat, lng);
    });

    // Drag marker
    markerRef.current.on("dragend", () => {
      const lngLat = markerRef.current?.getLngLat();
      if (lngLat) {
        reverseGeocode(lngLat.lat, lngLat.lng);
      }
    });

    mapRef.current.on("load", () => {
      setIsMapLoaded(true);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [showMap, accessToken]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&country=in`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        onChange(data.features[0].place_name, lat, lng);
      }
    } catch (error) {
      console.error("Reverse geocode error:", error);
    }
  }, [accessToken, onChange]);

  const searchLocation = useCallback(async (query: string) => {
    if (!accessToken || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&country=in&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Search error:", error);
    }
  }, [accessToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    searchLocation(val);
  };

  const selectSuggestion = (feature: any) => {
    const [lng, lat] = feature.center;
    onChange(feature.place_name, lat, lng);
    setSuggestions([]);
    setShowSuggestions(false);

    if (mapRef.current && markerRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
      markerRef.current.setLngLat([lng, lat]);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        if (mapRef.current && markerRef.current) {
          mapRef.current.flyTo({ center: [longitude, latitude], zoom: 15 });
          markerRef.current.setLngLat([longitude, latitude]);
        }
        
        await reverseGeocode(latitude, longitude);
        setIsLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "Location Error",
          description: "Unable to get your location. Please enter manually.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
  };

  if (!accessToken) {
    // Fallback to simple input if no API key
    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            placeholder="Enter address or area"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={getCurrentLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Search for a location..."
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={getCurrentLocation}
            disabled={isLoading}
            title="Use my location"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowMap(!showMap)}
            title="Show map"
          >
            <MapPin className="w-4 h-4" />
          </Button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((feature) => (
              <button
                key={feature.id}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-muted text-sm"
                onClick={() => selectSuggestion(feature)}
              >
                {feature.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {showMap && (
        <div 
          ref={mapContainerRef} 
          className="w-full h-64 rounded-lg border border-border overflow-hidden"
        />
      )}
    </div>
  );
}
