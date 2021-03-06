import IosSettings from "react-ionicons/lib/IosSettings";
import React, { Component } from "react";
import { connect } from "react-redux";
import { css } from "@emotion/core";
import axios from "axios";

import FountainStatisticCard from "./FountainStatisticCard";
import { selectors, actionCreators } from "../ClientStore";
import FountainInfoModal from "./FountainInfoModal";
import ActionButton from "./ActionButton";

const {
  setCode,
  unauthenticate,
  turnOnFlatWater,
  turnOffFlatWater,
  triggerServerDisconnection
} = actionCreators;

const {
  getAuthenticated,
  getFlatWaterStatus,
  getCodeFromScanner,
  getServerSocketConnected
} = selectors;

class Overview extends Component {
  constructor() {
    super();

    this.state = {
      statisticsLoading: true,

      fountainInfo: null,
      plasticBottlesSaved: "0",
      flatWaterDispensed: "0 L",
      sparklingWaterDispensed: "0 L",

      fountainInfoModalOpen: false
    };
  }

  async componentDidMount() {
    if (this.props.codeFromScanner !== "") {
      this.props.setCode("");
    }

    if (this.props.serverSocketConnected) {
      this.props.triggerServerDisconnection();
    }

    if (this.props.authenticated) {
      await localStorage.removeItem(
        process.env.FOUNTAIN_ACCESS_TOKEN_LOCAL_STORAGE_KEY
      );

      this.props.unauthenticate();
    }

    await this.fetchFountainStatistics();
  }

  openFountainInfoModal() {
    this.setState({ fountainInfoModalOpen: true });
  }

  closeFountainInfoModal() {
    this.setState({ fountainInfoModalOpen: false });
  }

  handleFlatWaterDown(e) {
    this.props.turnOnFlatWater();
  }

  handleFlatWaterUp(e) {
    this.props.turnOffFlatWater();
  }

  async fetchFountainStatistics() {
    try {
      const res = await axios.get(
        `${process.env.SERVER_SOCKET_URI}/api/fountains/${
          process.env.FOUNTAIN_UNIQUE_IDENTIFIER
        }`
      );

      const { fountain } = res.data;

      setTimeout(() => {
        this.setState({
          fountainInfo: fountain,
          statisticsLoading: false,
          flatWaterDispensed: fountain.flatWaterDispensed,
          plasticBottlesSaved: fountain.plasticBottlesSaved,
          sparklingWaterDispensed: fountain.sparklingWaterDispensed
        });
      }, 500);
    } catch (err) {
      console.log("Erorr fetching fountain statistics!");
    }
  }

  renderLogoHeader() {
    return (
      <div
        css={css`
          margin-top: 20px;
          width: 100%;
          height: 50px;
        `}
      >
        <div
          css={`
            float: right;
            width: 200px;
            text-align: right;
            height: 50px;
          `}
        >
          <IosSettings
            color="#000"
            fontSize="25px"
            css={`
              margin-top: 10px;
              margin-right: 20px;
            `}
            onClick={this.openFountainInfoModal.bind(this)}
          />
        </div>
        <div
          css={`
            float: left;
            width: 200px;
            height: 50px;
          `}
        />
        <div
          css={`
            margin: 0px auto 0 auto;
            text-align: center;
          `}
        >
          <img
            css={css`
              width: auto;
              height: 50px;
            `}
            src={require("../assets/carbon8WordmarkLogoBlack.png")}
          />
        </div>
      </div>
    );
  }

  renderInstructionText() {
    return (
      <div
        css={css`
          margin: 0 auto;
          width: 520px;
        `}
      >
        <p
          css={css`
            font-size: 18px;
            text-align: center;
          `}
        >
          Enjoy flat water or scan your barcode to access sparkling water and to
          track your consumption in the app.
        </p>
      </div>
    );
  }

  renderButtons() {
    return (
      <div
        css={`
          text-align: center;
          margin-bottom: 30px;
          margin-top: 42px;
        `}
      >
        <ActionButton
          style="margin-right: 90px;"
          onTouchStart={this.handleFlatWaterDown.bind(this)}
          onTouchEnd={this.handleFlatWaterUp.bind(this)}
        >
          Flat Water
        </ActionButton>
        <ActionButton link="/scan-code">Scan Code</ActionButton>
      </div>
    );
  }

  renderFountainStatistics() {
    return (
      <div
        css={css`
          bottom: 0;
          position: absolute;
          width: 780px;
        `}
      >
        <hr
          css={css`
            line-height: 1px;
            position: relative;
            outline: 0;
            border: 0;
            color: #000;
            text-align: center;
            height: 1.5em;
            margin: 25px 50px 25px 50px;
            &:before {
              content: "";
              background: #000;
              position: absolute;
              left: 0;
              top: 50%;
              width: 100%;
              height: 1px;
            }
            &:after {
              content: attr(data-content);
              position: relative;
              font-size: 16px;
              display: inline-block;
              padding: 0 20px;
              line-height: 1.5em;
              color: #000;
              background-color: #fff;
            }
          `}
          data-content="Fountain Statistics"
        />
        <div
          css={css`
            display: flex;
            flex-wrap: nowrap;
            flex-direction: row;
            justify-content: center;
          `}
        >
          <FountainStatisticCard
            title={"Flat Water Dispensed"}
            statNumber={this.state.flatWaterDispensed}
            loading={this.state.statisticsLoading}
          />
          <FountainStatisticCard
            title={"Plastic Bottles Saved"}
            statNumber={this.state.plasticBottlesSaved}
            loading={this.state.statisticsLoading}
          />
          <FountainStatisticCard
            title={"Sparkling Water Dispensed"}
            statNumber={this.state.sparklingWaterDispensed}
            loading={this.state.statisticsLoading}
          />
        </div>
      </div>
    );
  }

  renderFountainInfoModal() {
    const { fountainInfoModalOpen, fountainInfo } = this.state;

    return (
      <FountainInfoModal
        modalOpen={fountainInfoModalOpen}
        fountainInfo={fountainInfo}
        handleModalClose={this.closeFountainInfoModal.bind(this)}
      />
    );
  }

  render() {
    return (
      <div>
        {this.renderLogoHeader()}
        {this.renderInstructionText()}
        {this.renderButtons()}
        {this.renderFountainStatistics()}
        {this.renderFountainInfoModal()}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    ...ownProps,
    authenticated: getAuthenticated(state),
    codeFromScanner: getCodeFromScanner(state),
    flatWaterStatus: getFlatWaterStatus(state),
    serverSocketConnected: getServerSocketConnected(state)
  };
}

export default connect(
  mapStateToProps,
  {
    setCode,
    unauthenticate,
    turnOnFlatWater,
    turnOffFlatWater,
    triggerServerDisconnection
  }
)(Overview);
