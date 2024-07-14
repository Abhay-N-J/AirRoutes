import { Step, StepLabel, Stepper } from '@mui/material';

const RoutesList = ({ routes }) => {
  
  return (
    <div className="routes-list w-full max-w-3xl px-4">
      {routes.map((route: any, index: number) => (
        <Stepper >
            {route.map((r, i) => (
                <Step key={index + ' ' + i} style={{ margin:"16px"}} >
                  <>
                    <StepLabel>
                      {i == 0 ? r: r.destinationAirport}
                    </StepLabel>
                    {r.airline}
                  </>
                </Step>
              ))}
        </Stepper>
      ))}
    </div>
  );
};

export default RoutesList;