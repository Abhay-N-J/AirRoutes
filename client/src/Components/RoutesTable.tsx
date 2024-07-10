import React from 'react';

const RoutesList = ({ routes }) => {
  return (
    <div className="routes-list">
      {routes.map((route, index) => (
        <div className="flex space-x-4 p-4 bg-gray-900">
            {route.map((r, i) => (
                <div className="flex-1 text-center text-white">
                    {i == 0 ? r: <div>{ r.destinationAirport + `(${r.airline})`}</div>}
                </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default RoutesList;