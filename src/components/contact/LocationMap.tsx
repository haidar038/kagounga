import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon issue with Leaflet in Vite/Webpack
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMapProps {
    latitude: number;
    longitude: number;
    locationName: string;
    address: string;
}

export const LocationMap = ({ latitude, longitude, locationName, address }: LocationMapProps) => {
    // Function to open Google Maps with directions
    const openGoogleMapsDirections = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        window.open(url, "_blank");
    };

    return (
        <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-border">
            <MapContainer center={[latitude, longitude]} zoom={15} scrollWheelZoom={false} className="h-full w-full z-0">
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                    position={[latitude, longitude]}
                    eventHandlers={{
                        click: () => {
                            openGoogleMapsDirections();
                        },
                    }}
                >
                    <Popup>
                        <div className="text-center p-2">
                            <p className="font-semibold text-sm mb-1">{locationName}</p>
                            <p className="text-xs text-muted mb-3">{address}</p>
                            <button onClick={openGoogleMapsDirections} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                Get Directions
                            </button>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};
