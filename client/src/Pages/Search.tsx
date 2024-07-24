import { useEffect, useMemo, useState } from "react";
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
  Slider,
  Switch,
  Typography,
} from "@mui/material";
import VariableSizeCheckboxList from "../Components/VariableSizeCheckBoxList"; // Import the new component

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:9091";

axios.defaults.baseURL = BACKEND_URL;

type Airport = {
  country: string;
  city: string;
  IATA: string;
  ICAO: string;
  label: string;
};

const Search = () => {
  const MAXHOPS = 5;
  const { toast } = useToast();
  const [routes, setRoutes] = useState<[]>([]);
  const [srcValue, setSrcValue] = useState<Airport | null>(null);
  const [dstValue, setDstValue] = useState<Airport | null>(null);
  const [hopValue, setHopValue] = useState<number>(0);
  const [distanceSort, setDistanceSort] = useState<boolean>(false);
  const [airlines, setAirlines] = useState<Map<string, boolean>>(new Map());
  const [airports, setAirports] = useState<Map<string, boolean>>(new Map());
  const [expanded, setExpanded] = useState("false");

  const { computedAirlines, computedAirports } = useMemo(() => {
    if (routes.length === 0)
      return { computedAirlines: new Map(), computedAirports: new Map() };

    const airlineNames = new Map();
    const airportNames = new Map();

    routes.forEach((route: any[]) => {
      if (route[1] > hopValue) return;
      route[0].forEach((r: any, i: number) => {
        if (i !== 0 && i !== route[0].length - 1)
          airportNames.set(r.airportName, true);
        if (i !== 0) airlineNames.set(r.airlineName, true);
      });
    });

    return { computedAirlines: airlineNames, computedAirports: airportNames };
  }, [routes, hopValue]);

  useEffect(() => {
    setAirlines(computedAirlines);
    setAirports(computedAirports);
  }, [computedAirlines, computedAirports]);

  const fetchAirportData = async () => {
    const res = await axios.get("/airports");
    return res.data.airports;
  };

  const fetchRoutes = async () => {
    if (srcValue === null || dstValue === null) {
      throw new Error("Empty input");
    } else if (srcValue === dstValue) {
      throw new Error("Wrong input");
    }
    const res = await axios.get(
      `/${srcValue?.IATA == null ? srcValue?.ICAO : srcValue.IATA}/${
        dstValue?.IATA == null ? dstValue?.ICAO : dstValue.IATA
      }/${MAXHOPS}`
    );

    return res.data.routes;
  };

  const mutation = useMutation({
    mutationFn: fetchRoutes,
    onSuccess: (data: []) => {
      setRoutes(data);
      const airlineNames: Map<string, boolean> = new Map();
      const airportNames: Map<string, boolean> = new Map();
      data.forEach((route: [][]) => {
        route[0].forEach((r: any, i: number) => {
          if (i != 0 && i != route[0].length - 1)
            airportNames.set(r.airportName, true);
          if (i != 0) airlineNames.set(r.airlineName, true);
        });
      });
      setAirlines(airlineNames);
      setAirports(airportNames);
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
        <Button variant="destructive" onClick={() => mutation.mutate()}>
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
                  setHopValue(val as number);
                }}
                step={1}
                min={0}
                max={MAXHOPS}
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
                position: "relative",
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
                      if (checked)
                        setRoutes(routes.sort((a, b) => a[2] - b[2]));
                      else setRoutes(routes.sort((a, b) => a[1] - b[1]));
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
          routes={routes.filter((route) => route[1] <= hopValue)}
          airlineList={airlines}
          airportList={airports}
        />
      </div>
    </>
  );
};

export default Search;
