import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GoogleMapsLocationPickerProps {
  value: string;
  onChange: (location: string, lat?: number, lng?: number) => void;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export function GoogleMapsLocationPicker({ value, onChange }: GoogleMapsLocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch API key from edge function
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-maps-key');
        if (error) throw error;
        if (data?.apiKey) {
          setApiKey(data.apiKey);
        }
      } catch (error) {
        console.log("Google Maps API key not available");
      }
    };
    fetchApiKey();
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey || isMapLoaded) return;

    const loadScript = () => {
      if (window.google?.maps) {
        setIsMapLoaded(true);
        return;
      }

      window.initGoogleMaps = () => {
        setIsMapLoaded(true);
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadScript();
  }, [apiKey, isMapLoaded]);

  // Initialize map when showing
  useEffect(() => {
    if (!showMap || !isMapLoaded || !mapRef.current || !window.google) return;

    const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India center

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 5,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    markerRef.current = new window.google.maps.Marker({
      map: mapInstanceRef.current,
      draggable: true,
    });

    // Click to place marker
    mapInstanceRef.current.addListener('click', (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      markerRef.current.setPosition(e.latLng);
      reverseGeocode(lat, lng);
    });

    // Drag marker
    markerRef.current.addListener('dragend', (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      reverseGeocode(lat, lng);
    });

  }, [showMap, isMapLoaded]);

  // Initialize autocomplete
  useEffect(() => {
    if (!isMapLoaded || !inputRef.current || !window.google || autocompleteRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'in' },
      fields: ['formatted_address', 'geometry'],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onChange(place.formatted_address || '', lat, lng);
        
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter(place.geometry.location);
          mapInstanceRef.current.setZoom(15);
          markerRef.current.setPosition(place.geometry.location);
        }
      }
    });
  }, [isMapLoaded, onChange]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        onChange(results[0].formatted_address, lat, lng);
      }
    });
  }, [onChange]);

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
        
        if (mapInstanceRef.current && markerRef.current) {
          const pos = { lat: latitude, lng: longitude };
          mapInstanceRef.current.setCenter(pos);
          mapInstanceRef.current.setZoom(15);
          markerRef.current.setPosition(pos);
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

  if (!apiKey) {
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
          onChange={(e) => onChange(e.target.value)}
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
      </div>

      {showMap && (
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-lg border border-border overflow-hidden"
        />
      )}
    </div>
  );
}
