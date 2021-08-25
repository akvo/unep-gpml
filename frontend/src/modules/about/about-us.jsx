import React from "react";
import { Button, Image } from "antd";

import "./styles.scss";
import imageNotFound from "../../images/image-not-found.png";

import issueGraphics from "./issue-section-content";
import missionGraphic from "./mission-section-graphic";
import timelineAndRoadmapGraphic from "../../images/timeline-roadmap-graphic.png";
import featureComponentGraphic from "./feature-component-graphic";
import ourCommunity from "../../images/about-our-community.png";

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
            {image && <div className="item-svg">{image}</div>}
            {!image && <Image preview={false} src={imageNotFound} />}

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
            In 2019, the United Nations Environment Assembly (UNEA) decided in
            resolution UNEP/EA.4/Res.6 operative paragraph 3: “to strengthen
            coordination and cooperation by establishing, subject to the
            availability of resources and building on existing initiatives, a
            multi-stakeholder platform within the United Nations Environment
            Programme to take immediate action towards the long-term
            elimination, through a lifecycle approach, of discharges of litter
            and microplastics into the oceans”. The GPML Digital Platform was
            developed in 2021 in response to this and seeks to support
            transformative, multi-stakeholder actions that target the causes of
            pollution towards a pollution-free planet, where pollution is
            prevented and controlled and good environmental quality and improved
            health and well-being are ensured for all. Overall, the work of the
            GPML will support UNEP’s Medium Term Strategy by supporting
            countries to deliver on their environmental commitments under
            international agreements.
          </p>
        </div>
      </div>
      <div className="section-mission-graphic">{missionGraphic}</div>
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
          <Image src={timelineAndRoadmapGraphic} width="80%" preview={false} />
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
          {featureComponentGraphic}
        </div>
      </div>
    </div>
  );
};

const renderSectionCommunity = () => {
  return (
    <div className="section-container section-community-container">
      <div className="ui container section-community-wrapper">
        <div className="section-community-text">
          <h2 className="text-green">GPML Community</h2>
          <p className="body-text text-white">
            The GPML Digital Platforms seeks to connect, inform and inspire all
            actors working to address marine litter and plastic pollution. Join
            our community of stakeholders, which includes: Governments;
            Scientific and Technological Community and Academia; Business,
            Industry and Private Sector; Non-Governmental Organizations (NGOs)
            and Foundations; Intergovernmental Organizations (IGOs); All Actors
            Participating in Global/Regional Multilateral Processes, including
            at a global and regional level; Other Major Groups and Stakeholders;
            and Private Citizens.
          </p>
        </div>
        <div className="section-community-graphic">
          <Image src={ourCommunity} width="90%" preview={false} />
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
