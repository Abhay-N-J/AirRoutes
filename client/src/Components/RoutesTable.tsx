import RouteAccordian from "./RouteItem";

const RoutesList = ({ routes, airlineList, airportList }) => {
  if (routes.length === 0) return <div> NO FLIGHTS </div>;

  return (
    <div className="routes-list w-full max-w-3xl px-4 m-4">
      {routes.map((route: any[], index: number) => {
        route = route[0];
        const airports: string[] = [];
        const coords: { position: [number, number]; popupText: string }[] = [];
        const airlines: Set<string> = new Set();
        let exit = false
        route.forEach((r, i) => {    
          if (exit || airportList.get(r.airportName) === false || airlineList.get(r.airlineName) === false) {
            exit = true
            return
          }
          airports.push(r.airportCode);
          if (
            r.latitude != null &&
            r.longitude != null &&
            r.airportCode != null
          )
            coords.push({
              position: [r.latitude, r.longitude],
              popupText: r.airportCode + ", " + r.airportName,
            });
          if (i != r.length && i != 0) {
            airlines.add(r.airlineName);
          }
        });
        if (exit)
            return
        const stops = airports.length - 2;

        return (
          <RouteAccordian
            key={index}
            route={route}
            index={index}
            airlines={airlines}
            stops={stops}
            airports={airports}
            coords={coords}
          />
        );
      })}
    </div>
  );
};

export default RoutesList;
