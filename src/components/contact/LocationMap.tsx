import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Location data for all Kagōunga distribution points
const locations = [
    {
        id: 0,
        name: "Kagōunga Head Office",
        address: "Jl. Pertamina, Jambula, Ternate, Maluku Utara 97719",
        phone: "+62 811-1538-111",
        note: "Main Headquarters",
        latitude: 0.7581355,
        longitude: 127.3292853,
        isMain: true,
    },
    {
        id: 1,
        name: "Order Desk Kagōunga®",
        address: "Jalan Melati No.454, Tanah Tinggi, Ternate",
        phone: "+628-111-538-111",
        note: "Support 24/7",
        latitude: 0.7808148,
        longitude: 127.3785366,
    },
    {
        id: 2,
        name: "Bela Hotel & Convention",
        address: "Jalan Raya Jati No.500, Jati, Ternate",
        latitude: 0.778607,
        longitude: 127.376382,
    },
    {
        id: 3,
        name: "Pakesang | Pusat Oleh Oleh",
        address: "Jalan Kapitan Pattimura, Kalumpang, Ternate",
        latitude: 0.7874396,
        longitude: 127.3808758,
    },
    {
        id: 4,
        name: "Taranoate | Pusat Oleh Oleh",
        address: "Jl. Sultan M. Djabir Sjah, Gamalama, Ternate",
        latitude: 0.7902013,
        longitude: 127.390588,
    },
    {
        id: 5,
        name: "Kantor Pos Indonesia",
        address: "Jalan Pahlawan Revolusi, Gamalama, Ternate",
        latitude: 0.7881151,
        longitude: 127.3884662,
    },
    {
        id: 6,
        name: "RDSMHRB x Monoi Outlet",
        address: "The North Palace Bld., Akehuda, Ternate",
        latitude: 0.8257273,
        longitude: 127.3842507,
    },
    {
        id: 7,
        name: "NUKILA Dive Center",
        address: "Jl. Sultan M. Djabir Sjah, Gamalama, Ternate",
        latitude: 0.7874627,
        longitude: 127.3899611,
    },
    {
        id: 8,
        name: "Sultan Babullah Airport (TTE)",
        address: "Lely Bintang Souvenir Shop, Entrance Gate & Waiting Room, Ternate",
        latitude: 0.8332012,
        longitude: 127.3767425,
    },
    {
        id: 9,
        name: "Depot Muhajirin",
        address: "Jalan Falajawa No.12, Muhajirin, Ternate",
        latitude: 0.7846045,
        longitude: 127.3875048,
    },
    {
        id: 10,
        name: "Okky Bakery",
        address: "Jalan Falajawa No.1, Muhajirin, Ternate",
        latitude: 0.7841207,
        longitude: 127.3864448,
    },
    {
        id: 11,
        name: "Rumah Tenun Puta Dino",
        address: "Jalan Raya Topo No.3, Soasio, Ternate",
        latitude: 0.6510824,
        longitude: 127.442163,
    },
];

// Create custom accent-colored circle marker with pulse animation
const createPulseIcon = (isMain: boolean = false) => {
    const size = isMain ? 20 : 14;
    const pulseSize = isMain ? 40 : 28;

    return L.divIcon({
        className: "custom-pulse-marker",
        html: `
            <div class="pulse-marker-container" style="width: ${pulseSize}px; height: ${pulseSize}px; position: relative;">
                <div class="pulse-ring" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: ${pulseSize}px;
                    height: ${pulseSize}px;
                    border-radius: 50%;
                    background: rgba(67, 97, 238, 0.3);
                    animation: pulse-animation 2s ease-out infinite;
                "></div>
                <div class="marker-dot" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #4361EE 0%, #3B53CC 100%);
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                "></div>
            </div>
        `,
        iconSize: [pulseSize, pulseSize],
        iconAnchor: [pulseSize / 2, pulseSize / 2],
        popupAnchor: [0, -pulseSize / 2],
    });
};

// Component to open popup on the main marker
function OpenMainPopup({ mainLocation }: { mainLocation: (typeof locations)[0] }) {
    const map = useMap();
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        // Find the main marker and open its popup after a short delay
        const timeout = setTimeout(() => {
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    const latLng = layer.getLatLng();
                    if (latLng.lat === mainLocation.latitude && latLng.lng === mainLocation.longitude) {
                        layer.openPopup();
                    }
                }
            });
        }, 500);

        return () => clearTimeout(timeout);
    }, [map, mainLocation]);

    return null;
}

interface LocationMapProps {
    latitude: number;
    longitude: number;
    locationName: string;
    address: string;
}

export const LocationMap = ({ latitude, longitude }: LocationMapProps) => {
    const mainLocation = locations.find((loc) => loc.isMain) || locations[0];

    // Function to open Google Maps with directions
    const openGoogleMapsDirections = (lat: number, lng: number) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, "_blank");
    };

    return (
        <>
            <style>{`
                @keyframes pulse-animation {
                    0% {
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(2);
                        opacity: 0;
                    }
                }
                .custom-pulse-marker {
                    background: transparent !important;
                    border: none !important;
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 12px !important;
                    padding: 0 !important;
                }
                .leaflet-popup-content {
                    margin: 0 !important;
                    min-width: 200px;
                }
            `}</style>
            <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-border">
                <MapContainer center={[mainLocation.latitude, mainLocation.longitude]} zoom={13} scrollWheelZoom={false} className="h-full w-full z-0">
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {locations.map((location) => (
                        <Marker key={location.id} position={[location.latitude, location.longitude]} icon={createPulseIcon(location.isMain)}>
                            <Popup>
                                <div className="p-3 min-w-[220px]">
                                    <p className="font-bold text-sm text-slate-900 mb-1">{location.name}</p>
                                    <p className="text-xs text-slate-600 mb-2">{location.address}</p>
                                    {location.phone && (
                                        <p className="text-xs text-slate-600 mb-1">
                                            📞{" "}
                                            <a href={`tel:${location.phone}`} className="text-accent hover:underline">
                                                {location.phone}
                                            </a>
                                        </p>
                                    )}
                                    {location.note && <p className="text-xs text-accent font-medium mb-2">✨ {location.note}</p>}
                                    <button
                                        onClick={() => openGoogleMapsDirections(location.latitude, location.longitude)}
                                        className="w-full rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent/90 transition-colors mt-2"
                                    >
                                        Get Directions
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    <OpenMainPopup mainLocation={mainLocation} />
                </MapContainer>
            </div>
        </>
    );
};
