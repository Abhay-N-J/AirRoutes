import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CircularProgress } from '@mui/material';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL  || "http://localhost:9091"
axios.defaults.baseURL = BACKEND_URL

const MapComponent: React.FC = () => {
    const { isLoading, isError, data, error } = useQuery({
        queryKey: [ "routes" ],
        queryFn: async () => {
            const res = await axios.get('/directRoutes')
            return res.data;
        }
    })
    if (isLoading) return (<CircularProgress color="inherit" size={20} />)
    if (isError || data == undefined ) return (<p> {error?.message} </p>)
    const airports = data.airports || []; 
    const routes = data.routes || []; 

    const connectDots = () =>{
      return (Object.keys(routes).map((route, index) => (
        routes[route].map((r, i) => (
          (
            airports[route] === null ? <></> :
            <Polyline positions={[[airports[route]?.latitude || 1, airports[route]?.longitude || 1], [r?.latitude || 1, r?.longitude || 1]]}/>
          )
        ))
      )))
    }
    return (
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100vh', width: '100%' }}>
          <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {Object.keys(airports).map((airport, index) => (
              <React.Fragment key={index}>
                <Marker position={[airports[airport].latitude, airports[airport].longitude]}>
                    <Popup>{airports[airport].city + ", " + airports[airport].country}</Popup>
                </Marker>
              </React.Fragment>
          ))}
          {connectDots()}
        </MapContainer>
    );
};

export default MapComponent;
