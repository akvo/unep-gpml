import React from "react";
import { Button, Image } from "antd";

import "./styles.scss";
import imageNotFound from "../../images/image-not-found.png";

const issueGraphics = [
  {
    title: "Plastic management",
    image: null,
    description: "Only 9 percent of plastic is recycled",
  },
  {
    title: "What is marine litter",
    image: null,
    description:
      "By 2025, we could be dealing with up to 250 tonnes of mismanaged waste",
  },
  {
    title: "If you can't reuse it, refuse it",
    image: null,
    description: "Every year, the world uses up to 5 trillion plastic bags",
  },
  {
    title: (
      <>
        alternative ways to <b>#BeatPlasticPollution</b>
      </>
    ),
    image: null,
    description:
      "About 10 million tonnes of plastic enters our ocean each year",
  },
];
const summary = [
  {
    name: "GPML Members",
    value: "1412",
    increment: "187",
  },
  {
    name: "Data Layers",
    value: "67",
    increment: "12",
  },
  {
    name: "Resources",
    value: "6587",
    increment: "32",
  },
  {
    name: "Resources",
    value: "6587",
    increment: "32",
  },
];

const AboutUs = () => {
  return (
    <div id="about-us">
      {renderSectionIssue()}
      {renderSectionSummary()}
      {renderSectionMission()}
      {renderSectionInfo()}
      {renderSectionTimelineAndRoadmap()}
      {renderSectionKeyFeaturesAndComponents()}
      {renderSectionCommunity()}
    </div>
  );
};

const renderSectionIssue = () => {
  const renderIssueGraphic = () => {
    return issueGraphics.map((x, i) => {
      const { title, image, description } = x;
      return (
        <div className="item" key={`issue-${i}`}>
          <div className="item-title text-white">{title}</div>
          <div className="item-box">
            <Image preview={false} src={image ? image : imageNotFound} />
            <div className="item-description text-white">{description}</div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="section-container section-issue-container">
      <div className="ui container section-issue-wrapper">
        <div className="section-issue-text">
          <h2 className="text-green">
            The Issue: Marine Litter & Plastic Pollution
          </h2>
          <p className="body-text text-white">
            Marine plastic pollution is one of the biggest environmental
            problems we face. Managing the problem requires urgent cooperation.
            Find out more below.
          </p>
          <div className="btn-wrapper">
            <Button type="ghost">Vital graphics</Button>
            <Button type="ghost left">Clean seas</Button>
          </div>
        </div>
        <div className="section-issue-graphic">{renderIssueGraphic()}</div>
      </div>
    </div>
  );
};

const renderSectionSummary = () => {
  const renderSummary = () => {
    return summary.map((x, i) => {
      const { name, value, increment } = x;
      return (
        <div className="item" key={`summary-${i}`}>
          <div className="item-name text-green">{name}</div>
          <div className="item-value text-white">{value}</div>
          <div className="item-increment text-green">{`+ ${increment}`}</div>
        </div>
      );
    });
  };
  return (
    <div className="section-container section-summary-container">
      <div className="ui container section-summary-wrapper">
        {renderSummary()}
      </div>
    </div>
  );
};

const renderSectionMission = () => {
  return (
    <div className="section-container section-mission-container">
      <div className="ui container section-mission-wrapper">
        <div className="section-mission-text">
          <h2 className="text-green">
            The Global Partnership on Marine Litter: the mission
          </h2>
          <p className="body-text text-white">
            The Global Partnership on Marine litter (GPML) was launched at the
            United Nations Conference on Sustainable Development (Rio+ 20) in
            June 2012, in response to a request set out in the Manila
            Declaration on Furthering the Implementation of the Global Programme
            of Action for the Protection of the Marine Environment from
            Land-based Activities. The partnership is led by a Steering
            Committee and the United Nations Environment Programme (UNEP)
            provides secreteriat services.
            <br />
            <br />
            The GPML is a multi-stakeholder partnerhip that brings together all
            actors working to prevent marine litter and plastic pollution. By
            providing a unique global platform to share knowledge and
            experience, partners are able to work together to create and advance
            solutions to pressing global issues.
          </p>
        </div>
        <div className="section-mission-graphic">
          <Image src={imageNotFound} width="50%" />
        </div>
      </div>
    </div>
  );
};

const renderSectionInfo = () => {
  return (
    <div className="section-container section-info-container">
      <div className="ui container section-info-wrapper">
        <div className="section-info-text">
          <h2 className="text-green">The Digital Platform</h2>
          <p className="body-text text-white">
            The GPML Digital Platform drives transformation and supports the
            work of the GPML Action Tracks. The Digital Platform is
            multi-stakeholder and partly open source, compiling and
            crowdsourcing different resources, integrating data and connecting
            stakeholders to guide action on addressing the global problem of
            marine litter and plastic pollution.
          </p>
        </div>
        <div className="section-info-button-wrapper">
          <Button type="ghost" className="btn-item">
            Download Summary (1 Page)
          </Button>
          <Button type="ghost" className="btn-item">
            Download Full Concept Document
          </Button>
        </div>
      </div>
    </div>
  );
};

const renderSectionTimelineAndRoadmap = () => {
  return (
    <div className="section-container section-timeline-roadmap-container">
      <div className="ui container section-timeline-roadmap-wrapper">
        <div className="section-timeline-roadmap-text">
          <h2 className="text-blue">Timeline & Roadmap</h2>
          <p className="body-text text-blue">
            The release of an initial minimum Viable product (MVP) (“Phase 1”)
            took place in February 2021, where a beta version of Phase 1 of the
            GPML Digital Platform was made available. Following the Phase 1
            release, an interative, user-centered design process is using
            techniques such as interviews, surveys, workshops to collect
            feedback from users to inform new versions of the Platform.
            <br />
            <br />A series of phased releases, informed by user-centered design,
            will culminate in a final version in June 2023. Interim versions
            will enhance existing features and develop new ones in preparation
            for key events, including UNEA-5-b dialogues planned for 2022, the
            7th International Marine Debris Conference (7IMDC) planned for 2022,
            and UNEA-6, expected to be held in early 2023.
          </p>
        </div>
        <div className="section-timeline-roadmap-graphic">
          <Image src={imageNotFound} width="50%" />
        </div>
      </div>
    </div>
  );
};

const renderSectionKeyFeaturesAndComponents = () => {
  return (
    <div className="section-container section-feature-component-container">
      <div className="ui container section-feature-component-wrapper">
        <div className="section-feature-component-text">
          <h2 className="text-green">Key Feature & Components</h2>
          <p className="body-text text-white">
            Features of the GPML Digital Platform are made available via 3
            primary components.
            <br />
            The Platform supports interlinkages between the different components
            to ensure a user-friendly experience and access to all
            functionalities and resources through links to internal and external
            databases and datasets and key partner platforms, such as World
            Environment Situation Room (WESR).
          </p>
        </div>
        <div className="section-feature-component-graphic">
          <p className="body-text text-white">
            GPML Digital Platform: Key Components
          </p>
          <Image src={imageNotFound} />
        </div>
      </div>
    </div>
  );
};

const renderSectionCommunity = () => {
  return (
    <div className="section-container section-community-container">
      <div className="ui container section-community-wrapper">
        <h2 className="text-green">GPML Community</h2>
        <div className="section-community-graphic">
          <Image src={imageNotFound} width="50%" />
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
