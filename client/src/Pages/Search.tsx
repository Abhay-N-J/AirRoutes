import { useState } from "react"
import SearchBox from "../Components/Autocomplete"
import axios from "axios"
import { Button } from "../components/ui/button";
import NumberInput from "../Components/NumberInput";
import RoutesTable from "../Components/RoutesTable";
import { useToast } from "../components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL  || "http://localhost:9091"

axios.defaults.baseURL = BACKEND_URL

type Airport = {
    country: string,
    city: string,
    IATA: string,
    ICAO: string,
    label: string
}

const Search = () => {
    const { toast }= useToast()
    const [srcValue, setSrcValue] = useState<Airport | null >(null)
    const [dstValue, setDstValue] = useState<Airport | null >(null)
    const [hopValue, setHopValue] = useState<number>(0)

    const [routes, setRoutes] = useState<[]>([])

    const fetchAirportData = async () => {
        const res = await axios.get("/airports")       
        return res.data.airports
    }

    const fetchRoutes = async () => {
        if (srcValue === null || dstValue === null) {
             throw new Error("Empty input")
        }
        else if (srcValue === dstValue) {
            throw new Error("Wrong input")
        }
        const res = await axios.get(`/${(srcValue?.IATA == null ? srcValue?.ICAO : srcValue.IATA)}/${(dstValue?.IATA == null ? dstValue?.ICAO : dstValue.IATA)}/${hopValue}`)
        return res.data.routes.map((route: any[]) => route[0])
    }

    const mutation = useMutation({
        mutationFn: fetchRoutes,
        onSuccess: (data: []) => {
          setRoutes(data);
        },
        onError: (error: Error) => {
          toast({
            title: "Error Searching Routes",
            variant: "destructive",
            description: error.message,
          });
        },
      });

    return ( 
        <>
            <div className="flex items-center justify-center space-x-4 m-4">
                <SearchBox  
                    onChange={setSrcValue}
                    queryKey="airports"
                    queryFn={fetchAirportData}
                    getOptionLabel={(option: Airport) => option.label} 
                    label="Source"
                />
                <SearchBox  
                    onChange={setDstValue}
                    queryKey="airports"
                    queryFn={fetchAirportData}
                    getOptionLabel={(option: Airport) => option.label} 
                    label="Destination"
                />
                <NumberInput initialValue={hopValue} onChange={setHopValue}/>
                <Button variant="destructive" onClick={() => mutation.mutate()}>Search</Button>
            </div>

            <div className="flex flex-col justify-center items-center space-y-8 min-h-screen">
            {mutation.isPending ? <CircularProgress color="inherit" size={20} /> : null}
  
                <RoutesTable routes={routes} />
            </div>
        </>
    )
}

export default Search