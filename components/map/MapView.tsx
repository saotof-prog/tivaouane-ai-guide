"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { MapProvider, MapViewport, MapLocation, PlaceFilters } from "@/lib/map/types";
import { DEFAULT_MAP_CONFIG, TIVAOUANE_LOCATIONS, searchLocations } from "@/lib/map/locations";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { SearchInput } from "@/components/ui/search-input";
import { CategoryFilter } from "@/components/ui/category-filter";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, XIcon } from "@/components/home/icons";
import Image from "next/image";

export interface MapViewProps {
  /** Hauteur de la carte (classe Tailwind). */
  height?: string;
  /** Filtres initiaux. */
  initialFilters?: PlaceFilters;
  /** Callback lors de la sélection d'un lieu. */
  onLocationSelect?: (location: MapLocation | null) => void;
  /** Lieux à afficher (override des défauts). */
  locations?: MapLocation[];
  /** Vue initiale (override). */
  initialViewport?: MapViewport;
  /** Thème forcé (sinon déduit du système). */
  theme?: "light" | "dark";
}

export function MapView({
  height = "h-[60vh] min-h-[400px]",
  initialFilters,
  onLocationSelect,
  locations = TIVAOUANE_LOCATIONS,
  initialViewport = DEFAULT_MAP_CONFIG.defaultViewport,
  theme,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const providerRef = useRef<MapProvider | null>(null);
  const isInitializedRef = useRef(false);
  const onLocationSelectRef = useRef(onLocationSelect);
  const initialViewportRef = useRef(initialViewport);
  const themeRef = useRef(theme);

  // Keep refs in sync
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);
  useEffect(() => {
    initialViewportRef.current = initialViewport;
  }, [initialViewport]);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const [viewport, setViewport] = useState<MapViewport>(initialViewport);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [filters, setFilters] = useState<PlaceFilters>(initialFilters ?? { query: "", category: "all" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lieux filtrés
  const filteredLocations = useMemo(
    () => searchLocations(locations, filters.query, filters.category),
    [locations, filters.query, filters.category],
  );

  // Initialisation de la carte (côté client uniquement)
  useEffect(() => {
    if (isInitializedRef.current || !mapContainerRef.current) return;

    let mounted = true;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { createLeafletMapProvider } = await import("@/lib/map/leaflet-provider");
        const provider = await createLeafletMapProvider(mapContainerRef.current!);
        providerRef.current = provider;

        await provider.init({
          container: mapContainerRef.current!,
          initialViewport: initialViewportRef.current,
          locations: filteredLocations,
          onViewportChange: (vp) => {
            if (mounted) setViewport(vp);
          },
          onLocationSelect: (loc) => {
            if (mounted) {
              setSelectedLocation(loc);
              onLocationSelectRef.current?.(loc);
            }
          },
          onMapClick: () => {
            if (mounted) {
              setSelectedLocation(null);
              onLocationSelectRef.current?.(null);
            }
          },
          theme: themeRef.current,
        });

        isInitializedRef.current = true;
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Impossible d'initialiser la carte");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initMap();

    return () => {
      mounted = false;
      providerRef.current?.destroy();
      providerRef.current = null;
      isInitializedRef.current = false;
    };
  }, []); // Exécution unique au montage

  // Mise à jour des lieux filtrés
  useEffect(() => {
    providerRef.current?.setLocations(filteredLocations);
  }, [filteredLocations]);

  // Mise à jour du thème
  useEffect(() => {
    if (theme) {
      providerRef.current?.setTheme(theme);
    }
  }, [theme]);

  // Centrer sur un lieu sélectionné depuis l'extérieur
  const centerOnLocation = useCallback(
    (location: MapLocation, zoom = 16) => {
      providerRef.current?.setCenter(location.coordinates, zoom);
      providerRef.current?.setSelectedLocation(location);
      setSelectedLocation(location);
      onLocationSelect?.(location);
    },
    [onLocationSelect],
  );

  // Gestionnaires de filtres
  const handleSearchChange = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, query }));
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category: category as PlaceFilters["category"] }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ query: "", category: "all" });
  }, []);

  const hasActiveFilters = filters.query !== "" || filters.category !== "all";

  return (
    <div className={cn("relative flex flex-col", height)}>
      {/* Barre de recherche et filtres */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <SearchInput
            placeholder="Rechercher un lieu (nom, description…)"
            value={filters.query}
            onChange={handleSearchChange}
            className="max-w-xs sm:max-w-md"
            aria-label="Rechercher un lieu sur la carte"
          />
        </div>
        <div className="flex items-center gap-2">
          <CategoryFilter
            options={[
              { id: "all", label: "Tous" },
              { id: "religieux", label: "Religieux" },
              { id: "marches", label: "Marchés" },
              { id: "restauration", label: "Restauration" },
              { id: "hebergement", label: "Hébergement" },
              { id: "espaces", label: "Espaces" },
            ]}
            value={filters.category}
            onChange={handleCategoryChange}
            aria-label="Filtrer par catégorie"
          />
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="p-2 rounded-lg bg-background/90 backdrop-blur border border-border text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Effacer les filtres"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Conteneur carte */}
      <div
        ref={mapContainerRef}
        className={cn(
          "relative flex-1 min-h-[400px] rounded-2xl overflow-hidden border border-border bg-muted",
          isLoading && "opacity-50 pointer-events-none",
        )}
        role="application"
        aria-label="Carte interactive de Tivaouane"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center space-y-2">
              <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Chargement de la carte…</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-destructive/10 border border-destructive/20 rounded-2xl z-20">
            <div className="text-center space-y-2 max-w-md">
              <p className="text-destructive font-medium">Erreur de chargement</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mx-auto px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors"
              >
                Recharger la page
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Légende catégories */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap justify-center gap-1.5" aria-label="Légende des catégories">
        {[
          { id: "religieux" as const, label: "Religieux" },
          { id: "marches" as const, label: "Marchés" },
          { id: "restauration" as const, label: "Restauration" },
          { id: "hebergement" as const, label: "Hébergement" },
          { id: "espaces" as const, label: "Espaces" },
        ].map((cat) => (
          <Badge
            key={cat.id}
            variant="outline"
            className="text-xs gap-1.5 px-2 py-1"
            style={{ borderColor: getCategoryColor(cat.id), color: getCategoryColor(cat.id) }}
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: getCategoryColor(cat.id) }}
              aria-hidden="true"
            />
            {cat.label}
          </Badge>
        ))}
      </div>

      {/* Info lieu sélectionné - bas de carte */}
      {selectedLocation && (
        <div
          className="absolute bottom-3 left-3 right-3 z-10 animate-slide-up"
          role="region"
          aria-label={`Détails de ${selectedLocation.name}`}
        >
          <SelectedLocationCard
            location={selectedLocation}
            onClose={() => {
              setSelectedLocation(null);
              providerRef.current?.setSelectedLocation(null);
              onLocationSelect?.(null);
            }}
            onCenter={() => centerOnLocation(selectedLocation)}
          />
        </div>
      )}

      {/* Nombre de résultats */}
      {filteredLocations.length !== locations.length && (
        <div className="absolute top-3 right-3 z-10" aria-live="polite">
          <Badge variant="secondary" className="text-xs px-2 py-1">
            {filteredLocations.length} / {locations.length} lieux
          </Badge>
        </div>
      )}
    </div>
  );
}

/** Carte de détails pour un lieu sélectionné. */
interface SelectedLocationCardProps {
  location: MapLocation;
  onClose: () => void;
  onCenter: () => void;
}

function SelectedLocationCard({ location, onClose, onCenter }: SelectedLocationCardProps) {
  const categoryColor = getCategoryColor(location.category);

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
      {location.image && (
        <div className="relative h-32 w-full overflow-hidden">
          <Image
            src={location.image}
            alt={`Vue de ${location.name}`}
            fill
            className="object-cover"
            sizes="100vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
          <span
            className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-white rounded-full bg-black/50 backdrop-blur"
          >
            {getCategoryLabel(location.category)}
          </span>
        </div>
      )}

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{location.name}</h3>
            <p className="text-xs text-muted-foreground">{getCategoryLabel(location.category)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Fermer les détails"
          >
            <XIcon className="size-4" aria-hidden="true" />
          </button>
        </div>

        {location.description && (
          <p className="text-sm text-foreground/80 line-clamp-3">{location.description}</p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={onCenter}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <MapPinIcon className="size-3.5" aria-hidden="true" />
            Centrer
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <span className="size-3.5" aria-hidden="true">→</span>
            Détails
          </button>
        </div>
      </div>
    </div>
  );
}

/** Utilitaires de couleur partagés (dupliqués pour éviter import circulaire côté client). */
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    religieux: "#0B5A3A",
    marches: "#C79A3B",
    restauration: "#B95430",
    hebergement: "#6E4F22",
    espaces: "#5C431F",
  };
  return colors[category] ?? "#0B5A3A";
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    religieux: "Lieux religieux",
    marches: "Marchés & artisanat",
    restauration: "Restauration",
    hebergement: "Hébergement",
    espaces: "Espaces & places",
  };
  return labels[category] ?? category;
}

export function MapWrapper({ children }: { children: React.ReactNode }) {
  return <Container className="flex flex-1 flex-col">{children}</Container>;
}