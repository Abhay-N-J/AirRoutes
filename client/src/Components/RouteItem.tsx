import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Modal,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import LocationOn from "@mui/icons-material/LocationOn";
import MapModal from "./MapModal";
import { useState } from "react";

const RouteAccordian = (props: {
  index: number;
  route: any[];
  airports: string[];
  airlines: Set<string>;
  stops: number;
  coords: { position: [number, number]; popupText: string }[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Accordion key={props.index} className="m-4">
      <AccordionSummary>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography>{Array.from(props.airports).join(", ")}</Typography>
          <Typography>{Array.from(props.airlines).join(", ")}</Typography>
          <Typography>{" Stops: " + props.stops}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails onClick={() => setOpen(true)}>
        <Box sx={{ display: "flex", gap: 15}}>
          <Box>
            <Stepper orientation="vertical">
              {props.route.map((r, i) => (
                <Step key={props.index + " " + i} style={{ margin: "16px" }}>
                  <>
                    <StepLabel
                      icon={
                        i == 0 || i == props.route.length - 1 ? (
                          <LocationOn></LocationOn>
                        ) : (
                          i
                        )
                      }
                    >
                      {r.airportName +
                        ", " +
                        r.airportCode +
                        (i != 0 ? `(${r.airlineName})` : "")}
                    </StepLabel>
                  </>
                </Step>
              ))}
            </Stepper>
          </Box>
          <Box 
            onClick={(e) => e.stopPropagation()}
            sx={{
              width: "700px",
              height: "400px",
            }}
          >
            <MapModal
              center={props.coords[0].position}
              markers={props.coords}
              zoom={5}
            />
          </Box>
        </Box>
      </AccordionDetails>
      <Modal
        keepMounted={false}
        key={props.coords.toString()}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{ 
            width: "70%",
            height: "50%"
          }}
        >
          <MapModal
            center={props.coords[0].position}
            markers={props.coords}
            zoom={5}
          />
        </Box>
      </Modal>
    </Accordion>
  );
};

export default RouteAccordian;
