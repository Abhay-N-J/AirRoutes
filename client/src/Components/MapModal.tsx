import { forwardRef } from "react";
import { Box } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet"
import 'leaflet/dist/leaflet.css';


interface MapModalProps {
    center?: [number, number];
    zoom?: number;
    markers?: { position: [number, number]; popupText: string }[];
}

const redIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/ios-filled/100/FA5252/marker.png',
    iconSize: [48, 48], // Adjust size as needed
    iconAnchor: [24, 48], // Adjust anchor as needed
    popupAnchor: [0, -24]
  });

  const greenIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/ios-filled/100/40C057/marker.png',
    iconSize: [48, 48], // Adjust size as needed
    iconAnchor: [24, 48], // Adjust anchor as needed
    popupAnchor: [0, -24]
  });


const MapModal = forwardRef<HTMLDivElement, MapModalProps>(({
    center = [51.505, -0.09],
    zoom = 13,
    markers = [],            
    ...props
}, ref) => {
    
    const positions = markers.map(marker => marker.position);
    return (
        <Box
            ref={ref}
            sx={{
                position: "relative",
                height: "70%", // Adjust height
                width: "50%",  // Adjust width
                bgcolor: "background.paper",
                p: 4,
                borderRadius: 1,
                overflow: "hidden", 
            }}
            {...props}
        >
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {markers.map((marker, index) => (
                    <Marker key={index} position={marker.position} icon={index == 0 ? greenIcon: index == markers.length - 1 ? redIcon: new L.Icon.Default()}>
                        <Popup>{marker.popupText}</Popup>
                    </Marker>
                ))}
                <Polyline positions={positions} color="blue" />

            </MapContainer>
        </Box>
    );
});

export default MapModal;
