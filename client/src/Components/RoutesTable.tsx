import RouteAccordian from './RouteItem';

const RoutesList = ({ routes }) => {
  
    if (routes.length === 0) return <div> NO FLIGHTS </div>;

  return (
    <div className="routes-list w-full max-w-3xl px-4">
      {routes.map((route: any[], index: number) => {
        route = route[0]
        let airports = "";
        const coords: { position: [number, number]; popupText: string }[] = []
        const airlines: Set<string> = new Set();
        let stops = 0;

        route.forEach((r, i) => {
          airports += r.airportCode + (i != route.length - 1 ? " - ": "")
          if (r.latitude != null && r.longitude != null && r.airportCode != null) 
          coords.push({
            position: [r.latitude, r.longitude],
            popupText: r.airportCode + ", " + r.airportName,
          })
          if (i != r.length && i != 0) {
            airlines.add(r.airlineName)
            stops++
          }
        })
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
        )
      })}
    </div>
  );
};

export default RoutesList;