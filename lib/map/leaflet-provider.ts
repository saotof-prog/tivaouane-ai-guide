/**
 * Fournisseur de carte Leaflet (implémentation par défaut).
 * Chargé dynamiquement côté client uniquement (SSR-safe).
 */

import type { MapProvider, MapProviderProps, MapLocation, Coordinates } from "./types";
import { DEFAULT_MAP_CONFIG } from "./locations";
import type * as L from "leaflet";

/** Instance Leaflet (typage minimal). */
type LeafletMap = L.Map;
type LeafletMarker = L.Marker;
type LeafletIcon = L.DivIcon;
type LeafletTileLayer = L.TileLayer;

/** Charge Leaflet et ses styles côté client. */
async function loadLeaflet(): Promise<{
  default: typeof import("leaflet");
  markerIcon: typeof L.Icon.Default;
  markerShadow: typeof L.Icon.Default;
}> {
  if (typeof window === "undefined") {
    throw new Error("Leaflet ne peut être chargé que côté client");
  }

  // Charge le CSS Leaflet une seule fois
  if (!document.querySelector('link[href*="leaflet.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }

  const L = await import("leaflet");

  // Fix pour les images de marqueur par défaut (CDN unpkg)
  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  return { default: L, markerIcon: L.Icon.Default, markerShadow: L.Icon.Default };
}

/** Crée une icône personnalisée par catégorie. */
function createCategoryIcon(L: typeof import("leaflet"), categoryColor: string): LeafletIcon {
  return L.divIcon({
    className: "tivaouane-marker",
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        background: ${categoryColor};
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 12px;
          color: white;
          font-weight: bold;
        "></span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

/** Crée une icône pour le marqueur sélectionné. */
function createSelectedIcon(L: typeof import("leaflet"), categoryColor: string): LeafletIcon {
  return L.divIcon({
    className: "tivaouane-marker tivaouane-marker--selected",
    html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        background: ${categoryColor};
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 3px ${categoryColor}40;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: tivaouane-pulse 1.5s ease-in-out infinite;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 14px;
          color: white;
          font-weight: bold;
        "></span>
      </div>
      <style>
        @keyframes tivaouane-pulse {
          0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 3px ${categoryColor}40; }
          50% { box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 6px ${categoryColor}20; }
        }
      </style>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

/** Implémentation du fournisseur Leaflet. */
export async function createLeafletMapProvider(container: HTMLElement): Promise<MapProvider> {
  const { default: L } = await loadLeaflet();

  let map: LeafletMap | null = null;
  let tileLayer: LeafletTileLayer | null = null;
  const markers = new Map<string, LeafletMarker>();
  let currentProps: MapProviderProps | null = null;
  let selectedLocationId: string | null = null;

  function updateMarkerIcon(location: MapLocation, isSelected: boolean): void {
    const marker = markers.get(location.id);
    if (!marker) return;

    const color = getCategoryColor(location.category);
    const icon = isSelected
      ? createSelectedIcon(L, color)
      : createCategoryIcon(L, color);
    marker.setIcon(icon);
    marker.setZIndexOffset(isSelected ? 1000 : 0);
  }

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

  function setTheme(theme: "light" | "dark"): void {
    if (!map || !tileLayer) return;

    // Leaflet n'a pas de thème natif pour OSM, on utilise un filtre CSS sur le conteneur
    container.style.filter = theme === "dark" ? "invert(90%) hue-rotate(180deg)" : "none";

    // Correction pour les images (marqueurs, popups) qui ne doivent pas être inversées
    const styleId = "tivaouane-leaflet-theme-fix";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = theme === "dark"
      ? `
        .leaflet-container .leaflet-marker-icon,
        .leaflet-container .leaflet-popup-content-wrapper,
        .leaflet-container .leaflet-popup-tip,
        .leaflet-container .leaflet-control-zoom,
        .leaflet-container .leaflet-control-attribution {
          filter: invert(90%) hue-rotate(180deg) !important;
        }
        .leaflet-container .leaflet-popup-content {
          color: #1C1A15 !important;
        }
      `
      : "";
  }

  function createMarker(location: MapLocation): LeafletMarker {
    const color = getCategoryColor(location.category);
    const isSelected = location.id === selectedLocationId;
    const icon = isSelected ? createSelectedIcon(L, color) : createCategoryIcon(L, color);

    const marker = L.marker([location.coordinates.latitude, location.coordinates.longitude], {
      icon,
      title: location.name,
      alt: location.name,
      riseOnHover: true,
      zIndexOffset: isSelected ? 1000 : 0,
    });

    // Popup accessible
    const popupContent = `
      <div class="tivaouane-popup" style="min-width: 200px; max-width: 280px;">
        <h3 style="margin: 0 0 8px; font-size: 1rem; font-weight: 600; color: #1C1A15;">${location.name}</h3>
        <p style="margin: 0 0 12px; font-size: 0.875rem; color: #4A453D; line-height: 1.5;">${location.description ?? "Aucune description disponible."}</p>
        <button
          data-action="select"
          data-id="${location.id}"
          style="
            width: 100%;
            padding: 8px 12px;
            background: ${color};
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
          "
        >
          Voir les détails
        </button>
      </div>
    `;

    marker.bindPopup(popupContent, {
      className: "tivaouane-popup-container",
      closeButton: true,
      autoClose: false,
      closeOnEscapeKey: true,
    });

    // Événement sélection via popup
    marker.on("popupopen", () => {
      const popupElement = document.querySelector(`.leaflet-popup[data-leaflet-popup="${location.id}"]`) ??
        marker.getPopup()?.getElement();
      if (popupElement) {
        const btn = popupElement.querySelector('button[data-action="select"]') as HTMLButtonElement | null;
        btn?.addEventListener("click", () => {
          currentProps?.onLocationSelect?.(location);
        });
      }
    });

    // Événement clic direct sur le marqueur
    marker.on("click", () => {
      currentProps?.onLocationSelect?.(location);
    });

    return marker;
  }

  return {
    async init(props: MapProviderProps) {
      currentProps = props;

      map = L.map(container, {
        center: [props.initialViewport.center.latitude, props.initialViewport.center.longitude],
        zoom: props.initialViewport.zoom,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
        preferCanvas: false,
      });

      // Tuiles OpenStreetMap
      tileLayer = L.tileLayer(props.defaultTileUrl ?? DEFAULT_MAP_CONFIG.defaultTileUrl, {
        attribution: props.tileAttribution ?? DEFAULT_MAP_CONFIG.tileAttribution,
        maxZoom: 19,
        minZoom: 1,
        detectRetina: true,
        crossOrigin: true,
      }).addTo(map);

      // Thème initial
      setTheme(props.theme ?? "light");

      // Marqueurs initiaux
      props.locations.forEach((loc) => {
        const marker = createMarker(loc);
        marker.addTo(map!);
        markers.set(loc.id, marker);
      });

      // Événements caméra
      map.on("moveend", () => {
        if (!map) return;
        const center = map.getCenter();
        const zoom = map.getZoom();
        props.onViewportChange?.({
          center: { latitude: center.lat, longitude: center.lng },
          zoom,
        });
      });

      // Clic sur le fond de carte = désélection
      map.on("click", (e: L.LeafletMouseEvent) => {
        // Vérifie si le clic est sur un marqueur (popup ouvert)
        const target = e.originalEvent.target as HTMLElement | null;
        const isMarkerClick = target?.closest?.(".leaflet-marker-icon, .leaflet-popup");
        if (!isMarkerClick) {
          props.onMapClick?.();
          props.onLocationSelect?.(null);
        }
      });

      // Accessibilité : focus sur la carte au clavier
      container.setAttribute("tabindex", "0");
      container.setAttribute("role", "application");
      container.setAttribute("aria-label", "Carte interactive de Tivaouane");
    },

    setLocations(locations: MapLocation[]) {
      if (!map) return;

      // Supprime les marqueurs qui ne sont plus dans la liste
      const locationIds = new Set(locations.map((l) => l.id));
      markers.forEach((marker, id) => {
        if (!locationIds.has(id)) {
          map!.removeLayer(marker);
          markers.delete(id);
        }
      });

      // Ajoute ou met à jour les marqueurs
      locations.forEach((loc) => {
        let marker = markers.get(loc.id);
        if (marker) {
          // Met à jour position et popup si nécessaire
          marker.setLatLng([loc.coordinates.latitude, loc.coordinates.longitude]);
          updateMarkerIcon(loc, loc.id === selectedLocationId);
        } else {
          marker = createMarker(loc);
          marker.addTo(map!);
          markers.set(loc.id, marker);
        }
      });
    },

    setCenter(center: Coordinates, zoom?: number) {
      if (!map) return;
      map.setView([center.latitude, center.longitude], zoom ?? map.getZoom(), { animate: true });
    },

    setZoom(zoom: number) {
      if (!map) return;
      map.setZoom(Math.max(1, Math.min(19, zoom)), { animate: true });
    },

    setSelectedLocation(location: MapLocation | null) {
      selectedLocationId = location?.id ?? null;

      // Met à jour l'icône de tous les marqueurs
      markers.forEach((marker, id) => {
        const loc = currentProps?.locations.find((l) => l.id === id);
        if (loc) {
          updateMarkerIcon(loc, id === selectedLocationId);
        }
      });

      // Ouvre le popup du lieu sélectionné
      if (location) {
        const marker = markers.get(location.id);
        marker?.openPopup();
        // Centre sur le marqueur sans changer le zoom
        map?.panTo([location.coordinates.latitude, location.coordinates.longitude], { animate: true });
      } else {
        // Ferme tous les popups
        map?.closePopup();
      }
    },

    setTheme(theme: "light" | "dark") {
      setTheme(theme);
    },

    destroy() {
      if (map) {
        map.off("moveend");
        map.off("click");
        markers.forEach((marker) => map!.removeLayer(marker));
        markers.clear();
        if (tileLayer) map.removeLayer(tileLayer);
        map.remove();
        map = null;
        tileLayer = null;
        currentProps = null;
      }
    },
  };
}