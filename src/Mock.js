import React from "react";
import "./Mock.css";
import {
  GoogleMap,
  Marker,
  withGoogleMap,
  withScriptjs,
} from "react-google-maps";
import hourglassURL from "./images/hourglass.svg";
import compassURL from "./images/compass.png";
import trophyURL from "./images/trophy.png";

export default class Mock extends React.Component {
  constructor() {
    super();

    this.state = {
      walkStatus: WalkStatus.Stationary,
      now: Date.now(),
      metersWalked: 0,
      markerPosition: INITIAL_MARKER_POSITION,
    };

    [
      "onWalkingOutDetectorActivated",
      "onWalkingOutDetectorDeactivated",
      "onWalkingInDetectorActivated",
      "onWalkingInDetectorDeactivated",
    ].forEach((methodName) => {
      this[methodName] = this[methodName].bind(this);
    });
  }

  componentDidMount() {
    this.incrementMetersWalked();
  }

  render() {
    return (
      <div className="Mock">
        <div className="MeterDisplay">
          You've traveled:{" "}
          {Math.floor(this.state.metersWalked)
            .toString()
            .padStart(5, "0")}
          m
        </div>
        <div className="Body">
          {" "}
          <div className="MapContainer">
            <Map
              googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDNBvuTeyVOsMmyT1Y3PHtNccpLiiUNuxw"
              loadingElement={<div style={{ height: `100%` }} />}
              containerElement={<div style={{ height: `400px` }} />}
              mapElement={<div style={{ height: `100%` }} />}
              markerPosition={this.state.markerPosition}
            />
          </div>
        </div>
        <div
          className="WalkingOutDetector"
          onTouchStart={this.onWalkingOutDetectorActivated}
          onTouchEnd={this.onWalkingOutDetectorDeactivated}
          onMouseDown={this.onWalkingOutDetectorActivated}
          onMouseUp={this.onWalkingOutDetectorDeactivated}
        />
        <div
          className="WalkingInDetector"
          onTouchStart={this.onWalkingInDetectorActivated}
          onTouchEnd={this.onWalkingInDetectorDeactivated}
          onMouseDown={this.onWalkingInDetectorActivated}
          onMouseUp={this.onWalkingInDetectorDeactivated}
        />
        <div className="Nav">
          <div className="NavIcon">
            <img src={hourglassURL} alt="Hourglass" />
          </div>
          <div className="NavIcon NavIcon--active">
            <img src={compassURL} alt="Compass" />
          </div>
          <div className="NavIcon">
            <img src={trophyURL} alt="Trophy" />
          </div>
        </div>
      </div>
    );
  }

  incrementMetersWalked() {
    requestAnimationFrame(() => {
      this.incrementMetersWalked();
      const now = Date.now();
      this.setState((prevState) => {
        if (prevState.walkStatus === WalkStatus.Out) {
          const dtInSeconds = (now - prevState.now) / 1e3;
          const deltaMeters = METERS_PER_SEC * dtInSeconds;
          const metersWalked = prevState.metersWalked + deltaMeters;
          return {
            now,
            metersWalked,
            markerPosition: {
              lat: prevState.markerPosition.lat + toOutLatitude(deltaMeters),
              lng: prevState.markerPosition.lng + toOutLongitude(deltaMeters),
            },
          };
        } else if (prevState.walkStatus === WalkStatus.In) {
          const dtInSeconds = (now - prevState.now) / 1e3;
          const deltaMeters = METERS_PER_SEC * dtInSeconds;
          const metersWalked = prevState.metersWalked + deltaMeters;
          return {
            now,
            metersWalked,
            markerPosition: {
              lat: prevState.markerPosition.lat - toOutLatitude(deltaMeters),
              lng: prevState.markerPosition.lng - toOutLongitude(deltaMeters),
            },
          };
        } else {
          return { ...prevState, now };
        }
      });
    });
  }

  onWalkingOutDetectorActivated() {
    this.setState({ walkStatus: WalkStatus.Out });
  }

  onWalkingOutDetectorDeactivated() {
    this.setState({ walkStatus: WalkStatus.Stationary });
  }

  onWalkingInDetectorActivated() {
    this.setState({ walkStatus: WalkStatus.In });
  }

  onWalkingInDetectorDeactivated() {
    this.setState({ walkStatus: WalkStatus.Stationary });
  }
}

const METERS_PER_SEC = 1.4;

const Map = withScriptjs(
  withGoogleMap(({ markerPosition }) => (
    <GoogleMap
      defaultZoom={18}
      defaultCenter={{ lat: 37.3260116, lng: -122.0428078 }}
    >
      {<Marker position={markerPosition} />}
    </GoogleMap>
  ))
);

function toOutLongitude(meters) {
  return Math.cos(OUT_DIR) * meters * DEG_METER_CONVERSION;
}

function toOutLatitude(meters) {
  return Math.sin(OUT_DIR) * meters * DEG_METER_CONVERSION;
}

const DEG_METER_CONVERSION = 1 / 221200;

const INITIAL_MARKER_POSITION = { lat: 37.3260116, lng: -122.0428078 };

const WalkStatus = {
  Stationary: 0,
  Out: 1,
  In: 2,
};

const OUT_DIR = 0.8 * Math.PI;
