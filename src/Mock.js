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
      page: Pages.Map,
      walkStatus: WalkStatus.Stationary,
      now: Date.now(),
      metersWalked: 0,
      metersRequired: 100,
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
  // You've traveled:{" "}
  // {Math.floor(this.state.metersWalked)
  //   .toString()
  //   .padStart(5, "0")}
  // m
  render() {
    return (
      <div className="Mock">
        <div className="MeterDisplay">
          <div className="MeterBarBackground">
          <div className="MeterNumbers">{Math.floor(this.state.metersWalked)}/{this.state.metersRequired}m</div>
            <div className="MeterBarForeground" style={{width: this.state.metersWalked / this.state.metersRequired * 100 + '%'}} />
          </div>
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
        {this.renderNavBar()}
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

  navigatorFactory(page) {
    return () => {
      this.setState({ page });
    };
  }

  renderNavBar() {
    return (
      <div className="Nav">
        <div
          className={
            this.state.page === Pages.Events
              ? "NavIcon NavIcon--active"
              : "NavIcon"
          }
          onClick={this.navigatorFactory(Pages.Events)}
        >
          <img src={hourglassURL} alt="Hourglass" />
        </div>
        <div
          className={
            this.state.page === Pages.Map
              ? "NavIcon NavIcon--active"
              : "NavIcon"
          }
          onClick={this.navigatorFactory(Pages.Map)}
        >
          <img src={compassURL} alt="Compass" />
        </div>
        <div
          className={
            this.state.page === Pages.Rewards
              ? "NavIcon NavIcon--active"
              : "NavIcon"
          }
          onClick={this.navigatorFactory(Pages.Rewards)}
        >
          <img src={trophyURL} alt="Trophy" />
        </div>
      </div>
    );
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

const Pages = {
  Events: 0,
  Map: 1,
  Rewards: 2,
};
