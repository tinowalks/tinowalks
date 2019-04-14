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
import catchingFireURL from "./images/catchingFire.png";
import frozenYogurtURL from "./images/frozenYogurt.png";
import frappucinoURL from "./images/frappucino.jpg";

export default class Mock extends React.Component {
  constructor() {
    super();

    this.state = {
      rewards: [
        {
          sponsor: "Cupertino Library",
          name: "Free book",
          imgURL: catchingFireURL,
          metersEarned: 2491,
          metersRequired: 2500,
        },
        {
          sponsor: "Yogurtland",
          name: "50% off your next cup",
          imgURL: frozenYogurtURL,
          metersEarned: 200,
          metersRequired: 500,
        },
        {
          sponsor: "Starbucks",
          name: "Free coffee",
          imgURL: frappucinoURL,
          metersEarned: 672,
          metersRequired: 1250,
        },
      ],
      currentRewardIndex: 1,
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
      "onSelectRewardIndex",
    ].forEach((methodName) => {
      this[methodName] = this[methodName].bind(this);
    });
  }

  componentDidMount() {
    this.incrementMetersWalked();
  }

  render() {
    switch (this.state.page) {
      case Pages.Events:
        return this.renderEventsPage();
      case Pages.Map:
        return this.renderMapPage();
      case Pages.Rewards:
        return this.renderRewardsPage();
      default:
        throw new Error("Illegal page: " + this.state.page);
    }
  }

  renderEventsPage() {
    return (
      <div className="Mock">
        <div className="EventsList">
          <BonusEvent
            isActive
            dayOfWeek="Sunday,"
            dayDate="April 14"
            time="6:00AM to 11:00AM"
            bonus="10%"
          />
          <BonusEvent
            dayOfWeek="Wednesday,"
            dayDate="April 17"
            time="7:00AM to 9:00AM"
            bonus="50%"
          />
          <BonusEvent
            dayOfWeek="Friday,"
            dayDate="April 19"
            time="7:00AM to 8:30AM"
            bonus="25%"
          />
        </div>
        {this.renderNavBar()}
      </div>
    );
  }

  renderMapPage() {
    const currentReward = this.state.rewards[this.state.currentRewardIndex];
    return (
      <div className="Mock">
        {currentReward && (
          <div className="MeterDisplay">
            <div className="MeterBarBackground">
              <div className="MeterNumbers">
                {Math.min(Math.floor(currentReward.metersEarned), currentReward.metersRequired)}/
                {currentReward.metersRequired}m
              </div>

              <div
                className="MeterBarForeground"
                style={{
                  width:
                    (currentReward.metersEarned /
                      currentReward.metersRequired) *
                      100 +
                    "%",
                }}
              />
            </div>
            <img
              className="MeterRewardImage"
              src={currentReward.imgURL}
              alt={currentReward.name}
            />
          </div>
        )}

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

  renderRewardsPage() {
    return (
      <div className="Mock">
        <div className="RewardsList">
          {this.state.rewards.map((reward, i) => (
            <Reward reward={reward} isSelected={this.state.currentRewardIndex===i}onClick={()=>this.onSelectRewardIndex(i)} />
          ))}
        </div>
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
          return {
            now,
            rewards: prevState.rewards.map((reward, i) => {
              if (i !== prevState.currentRewardIndex) {
                return reward;
              } else {
                return {
                  ...reward,
                  metersEarned: reward.metersEarned + deltaMeters,
                };
              }
            }),
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
            rewards: prevState.rewards.map((reward, i) => {
              if (i !== prevState.currentRewardIndex) {
                return reward;
              } else {
                return {
                  ...reward,
                  metersEarned: reward.metersEarned + deltaMeters,
                };
              }
            }),
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

  onSelectRewardIndex(index) {
    this.setState({
      currentRewardIndex: index,
    });
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

function BonusEvent({ isActive, dayOfWeek, dayDate, time, bonus }) {
  return (
    <div className={isActive ? "Event Event--active" : "Event"}>
      <div
        className={
          isActive
            ? "EventBonusContainer EventBonusContainer--active"
            : "EventBonusContainer"
        }
      >
        <div className="EventBonus">
          <span className="EventBonusPlus">+</span>
          {bonus}
        </div>
      </div>

      <div className="EventTimeContainer">
        <div className="EventDayOfWeek">{dayOfWeek}</div>
        <div className="EventDayDate">{dayDate}</div>
        <div className="EventTime">{time}</div>
      </div>
    </div>
  );
}

function Reward({ reward,isSelected, onClick }) {
  const { sponsor, name, imgURL, metersEarned, metersRequired } = reward;
  return (
    <div
      className={isSelected?"Reward Reward--selected":"Reward"}
      onClick={onClick}
    >
      <div className="RewardInfoContainer">
        <div className="RewardName">{name}</div>
        <div className="RewardSponsor">{sponsor}</div>
        <div className="RewardProgressBarBackground">
          <div className="RewardProgressBarNumbers">
            {Math.floor(metersEarned)}/{metersRequired}m
          </div>
          <div
            className="RewardProgressBarForeground"
            style={{
              width: (metersEarned / metersRequired) * 100 + "%",
            }}
          />
        </div>
      </div>
      <div className="RewardImage">
        <img src={imgURL} alt={name} />
      </div>
    </div>
  );
}
