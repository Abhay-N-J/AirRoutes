import RouteAccordian from "./RouteItem";

const RoutesList = ({ routes }) => {
  if (routes.length === 0) return <div> NO FLIGHTS </div>;

  return (
    <div className="routes-list w-full max-w-3xl px-4 m-4">
      {routes.map((routeArray: any[], index: number) => {
  
        const airports = routeArray[3]
        const airlines = routeArray[4]
        const coords = routeArray[5]
        const stops = routeArray[1]

        return (
          <RouteAccordian
            key={index}
            route={routeArray[0]}
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
