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
  Checkbox,
  CircularProgress,
  ClickAwayListener,
  FormControlLabel,
  Slider,
  Switch,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import VariableSizeCheckboxList from "../Components/VariableSizeCheckBoxList";
import dayjs, { Dayjs } from "dayjs";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

axios.defaults.baseURL = BACKEND_URL;

type Airport = {
  country: string;
  city: string;
  IATA: string;
  ICAO: string;
  label: string;
};

const RealtimeSearch = () => {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<[]>([]);
  const [srcValue, setSrcValue] = useState<Airport | null>(null);
  const [dstValue, setDstValue] = useState<Airport | null>(null);
  const [hopValue, setHopValue] = useState<number>(0);
  const [distanceSort, setDistanceSort] = useState<number>(1);
  const [airlines, setAirlines] = useState<Map<string, boolean>>(new Map());
  const [airports, setAirports] = useState<Map<string, boolean>>(new Map());
  const [date, setDate] = useState<Dayjs | null>(dayjs())
  const [expanded, setExpanded] = useState("false");

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
    const res = await axios.post(
      `/realtime/${srcValue?.IATA == null ? srcValue?.ICAO : srcValue.IATA}/${
        dstValue?.IATA == null ? dstValue?.ICAO : dstValue.IATA
      }/${hopValue}`, 
      {
        airlines: Object.fromEntries(airlines),
        airports: Object.fromEntries(airports),
        sortDist: distanceSort,
        date: dayjs(date).format("YYYY-MM-DD"),
      }
    );

    return res.data;
  };

  const mutation = useMutation({
    mutationFn: fetchRoutes,
    onSuccess: (data) => {
      setRoutes(data.routes);
      setAirlines(new Map<string, boolean>(Object.entries(data.airlines)));
      setAirports(new Map<string, boolean>(Object.entries(data.airports)));      
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker 
            label="Departure Date (MM/DD/YYYY)"
            value={date}
            onChange={(newDate) => setDate(newDate)}
            disablePast
          />
        </LocalizationProvider>
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
                onChange={(_, val) => 
                  setHopValue(val as number)
                }
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
              label=""
                control={
                  <Box display="flex" flexDirection="column" alignItems="start" gap={1}>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        checked={distanceSort === 1}
                        onChange={(_, checked) => {
                          checked ? setDistanceSort(1) : setDistanceSort(1);
                        }}
                      />
                      <Typography variant="body2">Sort by distance</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        checked={distanceSort === 2}
                        onChange={(_, checked) => {
                          checked ? setDistanceSort(2) : setDistanceSort(1);
                        }}
                      />
                      <Typography variant="body2">Sort by stops</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Checkbox
                        checked={distanceSort === 3}
                        onChange={(_, checked) => {
                          checked ? setDistanceSort(3) : setDistanceSort(1);
                        }}
                      />
                      <Typography variant="body2">Sort by duration</Typography>
                    </Box>
                  </Box>
                }
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
    </>
  );
};

export default RealtimeSearch;
