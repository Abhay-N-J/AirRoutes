import { useEffect, useState } from "react"
import SearchBox from "../Components/Autocomplete"
import axios from "axios"
import { Button } from "../components/ui/button";
import NumberInput from "../Components/NumberInput";
import RoutesTable from "../Components/RoutesTable";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL  || "http://localhost:9091"
console.log(BACKEND_URL);

axios.defaults.baseURL = BACKEND_URL

type Airports = {
    country: string,
    city: string,
    IATA: string,
    ICAO: string
}

const Search = () => {
    const [airports, setAirports] = useState<Airports[]>([])
    const [srcValue, setSrcValue] = useState<Airports>()
    const [dstValue, setDstValue] = useState<Airports>()

    const [routes, setRoutes] = useState<[]>([])

    useEffect(() => {
        axios.get("/airports")
            .then(res => {
                setAirports(res.data.airports)
            })
    }, [])

    const handleSearch = () => {
        console.log("Searching");        
        axios.get(`/${(srcValue?.IATA == null ? srcValue?.ICAO : srcValue.IATA)}/${(dstValue?.IATA == null ? dstValue?.ICAO : dstValue.IATA)}/`)
            .then(res => {
                console.log(res.data);
                setRoutes(res.data.routes.map((route: any[]) => route[0]))
            })
    }


    return ( 
        <>
            <div className="flex items-center space-x-4" >
                <SearchBox  
                    onChange={setSrcValue}
                    options={airports} 
                    getOptionLabel={(option: Airports) => option.city + ", " + option.country + ', ' + (option.IATA == null ? option.ICAO : option.IATA)} 
                    label="Source"
                />
                <SearchBox  
                    onChange={setDstValue}
                    options={airports} 
                    getOptionLabel={(option: Airports) => option.city + ", " + option.country + ', ' + (option.IATA == null ? option.ICAO : option.IATA)} 
                    label="Destination"
                />
                <NumberInput/>
                <Button onClick={handleSearch}>Search</Button>
            </div>

            <div className="space-x-4">
                Routes
                <RoutesTable routes={routes} />
            </div>
        </>
    )
}

export default Search