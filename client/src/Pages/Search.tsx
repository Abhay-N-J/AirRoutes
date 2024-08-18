import { useState } from "react";
import SearchBox from "../Components/Autocomplete";
import axios from "axios";
import { Button } from "../components/ui/button";
import RoutesTable from "../Components/RoutesTable";
import { useToast } from "../components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  ClickAwayListener,
  FormControlLabel,
  IconButton,
  Slider,
  Switch,
  Typography,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VariableSizeCheckboxList from "../Components/VariableSizeCheckBoxList"; // Import the new component

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

axios.defaults.baseURL = BACKEND_URL;

type Airport = {
  country: string;
  city: string;
  IATA: string;
  ICAO: string;
  label: string;
};

interface FetchRoutesParams {
  airlines: Map<string, boolean>;
  airports: Map<string, boolean>;
  sortDist: boolean;
  page: number;
  hops: number;
}

const Search = () => {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<[]>([]);
  const [srcValue, setSrcValue] = useState<Airport | null>(null);
  const [dstValue, setDstValue] = useState<Airport | null>(null);
  const [hopValue, setHopValue] = useState<number>(0);
  const [distanceSort, setDistanceSort] = useState<boolean>(false);
  const [airlines, setAirlines] = useState<Map<string, boolean>>(new Map());
  const [airports, setAirports] = useState<Map<string, boolean>>(new Map());
  const [expanded, setExpanded] = useState("false");
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  

  const fetchAirportData = async () => {
    const res = await axios.get("/airports");
    return res.data.airports;
  };

  const fetchRoutes = async ({ airlines, airports, sortDist, page, hops }: FetchRoutesParams) => {
    if (srcValue === null || dstValue === null) {
      throw new Error("Empty input");
    } else if (srcValue === dstValue) {
      throw new Error("Wrong input");
    }
    const res = await axios.get(
      `/${srcValue?.IATA == null ? srcValue?.ICAO : srcValue.IATA}/${
        dstValue?.IATA == null ? dstValue?.ICAO : dstValue.IATA
      }/${hops}`, 
      {
        params: {
          airlines: JSON.stringify(Object.fromEntries(airlines)),
          airports: JSON.stringify(Object.fromEntries(airports)),
          sortDist: sortDist,
          page: page,
        }
      }
    );
    return res.data;
  };


  const mutation = useMutation({
    mutationFn: (params: FetchRoutesParams) => fetchRoutes(params),
    onSuccess: (data) => {
      setRoutes(data.routes);
      setAirlines(new Map<string, boolean>(Object.entries(data.airlines)));
      setAirports(new Map<string, boolean>(Object.entries(data.airports)));    
      setTotalPages(data.totalPages)  
      setPage(data.page)
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
        <Button variant="destructive" onClick={() => mutation.mutate({
            airlines: airlines, 
            airports: airports, 
            sortDist: distanceSort, 
            page: page,
            hops: hopValue,
          })
        }>
          Search
        </Button>
      </div>
      <ClickAwayListener onClickAway={() => setExpanded("false")}>
        <Box
          display="flex"
          justifyContent="space-around"
          alignItems="center"
          width="100%"
        >
          Filters
          <Accordion
            disableGutters
            expanded={expanded === "airlines"}
            onChange={() =>
              setExpanded(expanded === "airlines" ? "false" : "airlines")
            }
            elevation={2}
            sx={{ zIndex: 2 }}
          >
            <AccordionSummary>
              <Typography>Airlines</Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                position: "absolute",
                backgroundColor: "black",
                boxShadow: 3,
              }}
            >
              <VariableSizeCheckboxList
                items={Array.from(airlines.keys())}
                checkedItems={airlines}
                onChange={(airline, checked) => {
                  const updatedAirlines = new Map(airlines);
                  updatedAirlines.set(airline, checked);
                  setAirlines(updatedAirlines);
                  mutation.mutate({
                    airlines: updatedAirlines, 
                    airports: airports, 
                    sortDist: distanceSort, 
                    page: 1,
                    hops: hopValue,
                  })
                }}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion
            disableGutters
            expanded={expanded === "airports"}
            onChange={() =>
              setExpanded(expanded === "airports" ? "false" : "airports")
            }
            elevation={2}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <AccordionSummary>
              <Typography>Airports</Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                position: "absolute",
                backgroundColor: "black",
                boxShadow: 3,
              }}
            >
              <VariableSizeCheckboxList
                items={Array.from(airports.keys())}
                checkedItems={airports}
                onChange={(airport, checked) => {
                  const updatedAirports = new Map(airports);
                  updatedAirports.set(airport, checked);
                  setAirports(updatedAirports);
                  mutation.mutate({
                    airlines: airlines, 
                    airports: updatedAirports, 
                    sortDist: distanceSort, 
                    page: 1,
                    hops: hopValue,
                  })
                }}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion
            disableGutters
            elevation={2}
            sx={{ position: "relative", zIndex: 1 }}
            expanded={expanded === "stops"}
            onChange={() =>
              setExpanded(expanded === "stops" ? "false" : "stops")
            }
          >
            <AccordionSummary>
              <Typography>Stops</Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                position: "absolute",
                backgroundColor: "black",
                boxShadow: 3,
              }}
            >
              <Slider
                value={hopValue}
                onChange={(_, val) => {
                  setHopValue(val as number)
                  mutation.mutate({
                    airlines: airlines, 
                    airports: airports, 
                    sortDist: distanceSort, 
                    page: 1,
                    hops: val as number
                  })
                }}
                step={1}
                min={0}
                max={10}
                valueLabelDisplay="auto"
                sx={{ width: 100 }}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion
            disableGutters
            elevation={2}
            sx={{position: 'relative', zIndex: 1 }}
            expanded={expanded === "distance"}
            onChange={() => 
              setExpanded(expanded === "distance" ? "false" : "distance")
            }
          >
            <AccordionSummary>
              <Typography>Sort by</Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                position: "absolute",
                backgroundColor: "black",
                boxShadow: 3,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={distanceSort}
                    onChange={(_, checked) => {
                      setDistanceSort(checked);
                      mutation.mutate({
                        airlines: airlines, 
                        airports: airports, 
                        sortDist: checked, 
                        page: 1,
                        hops: hopValue,
                      })
                    }}
                  />
                }
                label={distanceSort ? "Sorted by distance" : "Sorted by stops"}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      </ClickAwayListener>
      <div className="flex flex-col justify-center items-center space-y-8 min-h-screen">
        {mutation.isPending ? (
          <CircularProgress color="inherit" size={20} />
        ) : null}

        <RoutesTable
          routes={routes}
        />
      </div>
      <Box
          component="footer"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            backgroundColor: '#f0f0f0',
            borderTop: '1px solid #ddd',
          }}
        >
          <IconButton
            onClick={() => {
              if (page > 1) {
                setPage(page - 1)
                mutation.mutate({
                  airlines: airlines, 
                  airports: airports, 
                  sortDist: distanceSort, 
                  page: page - 1,
                  hops: hopValue,
                })
              }
            }}
          >
            <ArrowBackIcon />
            <Typography variant="caption" sx={{ ml: 1 }}>Previous</Typography>
          </IconButton>

          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Typography variant="caption">{`Page: ${page} of ${totalPages} pages`}</Typography>
          </Box>

          <IconButton 
            onClick={() => {
              if (page < totalPages) {
                setPage(page + 1)
                  mutation.mutate({
                    airlines: airlines, 
                    airports: airports, 
                    sortDist: distanceSort, 
                    page: page + 1,
                    hops: hopValue,
                 })
              }
            }}
          >
            <Typography variant="caption" sx={{ mr: 1 }}>Next</Typography>
            <ArrowForwardIcon />
          </IconButton>
        </Box>
    </>
  );
};

export default Search;
