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
import frappuccinoURL from "./images/frappuccino.png";

export default class Mock extends React.Component {
  constructor() {
    super();

    this.state = {
      rewards: [
        {
          sponsor: "Cupertino Library",
          name: "Free book of choice",
          imgURL: catchingFireURL,
          metersEarned: 1369,
          metersRequired: 2500,
        },
        {
          sponsor: "Yogurtland",
          name: "50% off your next cup",
          imgURL: frozenYogurtURL,
          metersEarned: 496,
          metersRequired: 500,
        },
        {
          sponsor: "Starbucks",
          name: "Free coffee",
          imgURL: frappuccinoURL,
          metersEarned: 672,
          metersRequired: 1250,
        },
      ],
      currentRewardIndex: 0,
      hasSetTimeout: false,
      isCelebratingCompletion: false,
      page: Pages.Map,
      walkStatus: WalkStatus.Stationary,
      now: Date.now(),
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
            sponsor="Sports Basement"
            dayOfWeek="Sunday,"
            dayDate="April 14"
            time="6:00AM to 11:00AM"
            bonus="10%"
          />
          <BonusEvent
            sponsor="Cupertino High School"
            dayOfWeek="Wednesday,"
            dayDate="April 17"
            time="7:00AM to 9:00AM"
            bonus="50%"
          />
          <BonusEvent
            sponsor="AMC"
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
    if (this.state.isCelebratingCompletion) {
      return this.renderCelebration();
    } else {
      return this.renderNormalMap();
    }
  }

  renderCelebration() {
    const currentReward = this.state.rewards[this.state.currentRewardIndex];
    return (
      <div className="Mock">
        {currentReward && (
          <div className="MeterDisplay">
            <div className="MeterBarBackground MeterBarBackground--celebration">
              <div className="MeterNumbers">Challenge complete!</div>

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
              className="MeterRewardImage--celebration"
              src={currentReward.imgURL}
              alt={currentReward.name}
            />
          </div>
        )}

        <div className="Body Body--celebration">
          <div className="CelebrationBodyOverlay" />
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
        
        {this.renderNavBar()}
      </div>
    );
  }

  renderNormalMap() {
    const currentReward = this.state.rewards[this.state.currentRewardIndex];
    return (
      <div className="Mock">
        {currentReward && (
          <div className="MeterDisplay">
            <div className="MeterBarBackground">
              <div className="MeterNumbers">
                {Math.min(
                  Math.floor(currentReward.metersEarned),
                  currentReward.metersRequired
                )}
                /{currentReward.metersRequired}m
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
          <div className="MapContainer">
            <Map
              googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDNBvuTeyVOsMmyT1Y3PHtNccpLiiUNuxw"
              loadingElement={<div style={{ height: `100%` }} />}
              containerElement={<div style={{ height: `400px` }} />}
              mapElement={<div style={{ height: `100%` }} />}
              markerPosition={this.state.markerPosition}
            />
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
        </div>
        
        {this.renderNavBar()}
      </div>
    );
  }

  renderRewardsPage() {
    return (
      <div className="Mock">
        <div className="RewardsList">
          {this.state.rewards.map((reward, i) => (
            <Reward
              reward={reward}
              isSelected={this.state.currentRewardIndex === i}
              onClick={() => this.onSelectRewardIndex(i)}
            />
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
        

        if (
          prevState.walkStatus === WalkStatus.Out ||
          prevState.walkStatus === WalkStatus.In
        ) {
          const dtInSeconds = (now - prevState.now) / 1e3;
          const deltaMeters = METERS_PER_SEC * dtInSeconds;
          const rewards = prevState.rewards.map((reward, i) => {
            if (i !== prevState.currentRewardIndex) {
              return reward;
            } else {
              const metersEarned = reward.metersEarned + deltaMeters;
              if (metersEarned < reward.metersRequired) {
                return { ...reward, metersEarned };
              } else {
                return {
                  ...reward,
                  metersEarned,
                  alreadyEarned: reward.alreadyEarned || true,
                  FLAG_rewardJustEarned: !reward.alreadyEarned,
                };
              }
            }
          });
          const isCelebratingCompletion = rewards.some(
            (reward) => reward.FLAG_rewardJustEarned
          );
          const shouldSetTimeout = isCelebratingCompletion && !prevState.hasSetTimeout;
          if (shouldSetTimeout) {
            
            setTimeout(() => {
              this.setState((prevState) => ({
                hasSetTimeout: false,
                isCelebratingCompletion: false,
                walkStatus: WalkStatus.Stationary,
                page: Pages.Rewards,
                currentRewardIndex: prevState.rewards.findIndex(
                  (reward) => reward.metersEarned <= reward.metersRequired
                ),
              }));
            }, 15e3);
          }
          return {
            hasSetTimeout: shouldSetTimeout || isCelebratingCompletion,
            now,
            rewards,
            isCelebratingCompletion: isCelebratingCompletion||prevState.isCelebratingCompletion,
            markerPosition: {
              lat:
                prevState.markerPosition.lat +
                (prevState.walkStatus === WalkStatus.Out
                  ? toOutLatitude(deltaMeters)
                  : -toOutLatitude(deltaMeters)),
              lng:
                prevState.markerPosition.lng +
                (prevState.walkStatus === WalkStatus.Out
                  ? toOutLongitude(deltaMeters)
                  : -toOutLongitude(deltaMeters)),
            },
          };
        } else {
          if (prevState.currentRewardIndex !== this.state.currentRewardIndex) {
            console.log('bang')
          }
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
    if (this.state.isCelebratingCompletion) {
      return NOOP;
    } else {
      return () => {
        this.setState({ page });
      };
    }
    
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
      defaultCenter={INITIAL_MARKER_POSITION}
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

const INITIAL_MARKER_POSITION = { lat: 37.325606, lng: -122.042773 };

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

function BonusEvent({ isActive, sponsor, dayOfWeek, dayDate, time, bonus }) {
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
        <div className="EventSponsor">{sponsor}</div>
        <div className="EventDayOfWeek">{dayOfWeek}</div>
        <div className="EventDayDate">{dayDate}</div>
        <div className="EventTime">{time}</div>
      </div>
    </div>
  );
}

function Reward({ reward, isSelected, onClick }) {
  const { sponsor, name, imgURL, metersEarned, metersRequired } = reward;
  const isComplete = metersEarned >= metersRequired;
  return (
    <div
      className={isSelected ? "Reward Reward--selected" : "Reward"}
      onClick={isComplete ? NOOP : onClick}
    >
      <div className="RewardInfoContainer">
        <div className="RewardName">
          {isComplete ? (
            <React.Fragment>
              {name}
              <Checkmark />
            </React.Fragment>
          ) : (
            name
          )}
        </div>
        <div className="RewardSponsor">{sponsor}</div>
        <div
          className={
            isComplete
              ? "RewardProgressBarBackground RewardProgressBarBackground--complete"
              : "RewardProgressBarBackground"
          }
        >
          <div className="RewardProgressBarNumbers">
            {Math.min(Math.floor(metersEarned), metersRequired)}/
            {metersRequired}m
          </div>
          <div
            className={
              isComplete
                ? "RewardProgressBarForeground RewardProgressBarForeground--complete"
                : "RewardProgressBarForeground"
            }
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

function NOOP() {}

function Checkmark() {
  return <span className="Checkmark">✓</span>;
}

