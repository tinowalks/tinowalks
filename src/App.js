import React from "react";
import logo from "./logo.svg";
import "./App.css";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = { totalDistanceTraveled: 0, coords: null, updates: 0 };

    ["onPositionChanged"].forEach((methodName) => {
      this[methodName] = this[methodName].bind(this);
    });
  }

  componentDidMount() {
    navigator.geolocation.watchPosition(
      this.onPositionChanged,
      handleError,
      POSITION_OPTIONS
    );
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {this.state.coords !== null && (
            <>
              <p>Longitude: {this.state.coords.longitude}°</p>
              <p>Latitude: {this.state.coords.latitude}°</p>
              <p>
                Total distance travelled: {this.state.totalDistanceTraveled}m
              </p>
              <p>Updates: {this.state.updates}</p>
            </>
          )}
        </header>
      </div>
    );
  }

  onPositionChanged({ coords }) {
    this.setState((prevState) => {
      const distanceRecentlyTraveled =
        prevState.coords === null
          ? 0
          : getDistanceInMeters(prevState.coords, coords);
      const totalDistanceTraveled =
        prevState.totalDistanceTraveled + distanceRecentlyTraveled;
      const updates = prevState.updates + 1;
      return { coords, totalDistanceTraveled, updates };
    });
  }
}

const POSITION_OPTIONS = { enableHighAccuracy: false, timeout: 5e3 };

function handleError(err) {
  console.log("Miscellaneous error: ", err);
  alert("An improperly handled error has occured: " + err);
}

// https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
function getDistanceInMeters(originalCoords, newCoords) {
  const lon1 = originalCoords.longitude;
  const lat1 = originalCoords.latitude;
  const lon2 = newCoords.longitude;
  const lat2 = newCoords.latitude;

  const deltaLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
  const deltaLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = EARTH_RADIUS_IN_KILOMETERS * c;
  return d * METERS_IN_KILOMETER;
}
const EARTH_RADIUS_IN_KILOMETERS = 6378.137;
const METERS_IN_KILOMETER = 1000;
