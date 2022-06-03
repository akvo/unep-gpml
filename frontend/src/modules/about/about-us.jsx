import React, { useEffect, useState } from "react";
import { Button, Image } from "antd";
import { Link } from "react-router-dom";

import "./styles.scss";
import imageNotFound from "../../images/image-not-found.png";

import issueGraphics from "./issue-section-content";
import timelineAndRoadmapGraphic from "../../images/timeline-roadmap-graphic.png";
import ourCommunity from "../../images/about-our-community.png";
import DPIcons from "../../images/GPML-dp-icons.png";
import featureComponent from "../../images/feature-component-graphic.png";
import GpmlHistory from "../../images/GPML-history.png";
import fullConceptDocImage from "../../images/full-concept-doc.png";
import summaryDocImage from "../../images/summary-doc.png";

import { UIStore } from "../../store";
import sumBy from "lodash/sumBy";
import isEmpty from "lodash/isEmpty";
import api from "../../utils/api";

const summary = [
  {
    name: "Data Layers",
    value: [],
    startValue: "247",
    increment: "12",
  },
];

const AboutUs = () => {
  const { nav, stakeholders } = UIStore.useState((s) => {
    return { nav: s.nav, stakeholders: s?.stakeholders };
  });

  const [resourcesCount, setResourcesCount] = useState([]);
  const [entityCount, setEntityCount] = useState(0);
  const [stakeholdersCount, setStakeholdersCount] = useState([]);
  const [summary, setSummary] = useState([]);
  const totalResources = resourcesCount.reduce(
    (acc, val) => acc + Number(val?.count),
    0
  );

  const getEntityCount = () => {
    api
      .get(`/community`)
      .then((resp) => {
        const entity = resp?.data?.counts.filter(
          (item) => item?.networkType === "organisation"
        );

        setEntityCount(entity[0].count || 0);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getResourceCount = () => {
    const topic = [
      "action_plan",
      "project",
      "policy",
      "technical_resource",
      "technology",
      "event",
      "financing_resource",
    ];
    api
      .get(`/browse?topic=${topic}`)
      .then((resp) => {
        const data = resp?.data?.counts.filter(
          (item) =>
            item?.topic !== "gpml_member_entities" &&
            item?.topic !== "plastics" &&
            item?.topic !== "waste management" &&
            item?.topic !== "marine litter" &&
            item?.topic !== "capacity building" &&
            item?.topic !== "product by design" &&
            item?.topic !== "source to sea"
        );
        setResourcesCount(data);
        // setEntityCount(GPMLMember[0].count || 0);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    getEntityCount();
    getResourceCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setStakeholdersCount(
      (stakeholders?.stakeholders?.length || 0) + entityCount
    );
  }, [stakeholders, entityCount]);

  return (
    <div id="about-us">
      {renderSectionIssue()}
      {renderSectionSummary(nav, totalResources, stakeholdersCount)}
      {renderSectionMission()}
      {renderSectionInfo()}
      {renderSectionTimelineAndRoadmap()}
      {renderSectionKeyFeaturesAndComponents()}
      {renderSectionCommunity()}
      {renderSectionHistory()}
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
          <p className="txt-emphasis text-white">
            Marine liter and plastic pollution is one of the biggest
            environmental problems we face. Managing the problem requires urgent
            cooperation. Find out more below.
          </p>
          <div className="btn-wrapper">
            {/* Removed for now
            <Button type="ghost">Vital graphics</Button> */}
            <Button
              type="ghost"
              onClick={(e) => {
                window.location.href = "https://www.cleanseas.org/";
              }}
            >
              Clean Seas
            </Button>
          </div>
        </div>
        <div className="section-issue-graphic">
          <Image src={DPIcons} preview={false} />
        </div>
      </div>
    </div>
  );
};

const renderSectionSummary = (nav, totalResources, stakeholderCount) => {
  const renderSummary = (nav) => {
    const isLoaded = () => Boolean(!isEmpty(nav));

    return summary.map((x, i) => {
      const { name, value, startValue } = x;
      const navData =
        isLoaded() &&
        nav?.resourceCounts
          ?.filter((x) => value.includes(Object.keys(x)[0]))
          .map((x) => {
            return {
              name: Object.keys(x)[0],
              count: x[Object.keys(x)[0]],
            };
          });

      const total = sumBy(navData, "count");

      return (
        <div className="item" key={`summary-${i}`}>
          <div className="item-name text-green">{name}</div>
          <div className="item-value text-white">
            {isLoaded() ? total || startValue : 0}
          </div>
        </div>
      );
    });
  };
  return (
    <div className="section-container section-summary-container">
      <div className="ui container section-summary-wrapper">
        <div className="item">
          <div className="item-name text-green">GPML Community</div>
          <div className="item-value text-white">{stakeholderCount}</div>
        </div>
        {renderSummary(nav)}
        <div className="item">
          <div className="item-name text-green">Resources</div>
          <div className="item-value text-white">{totalResources}</div>
        </div>
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
            The Global Partnership on Marine Litter (GPML)
          </h2>
          <p className="txt-emphasis text-white">
            The Global Partnership on Marine Litter (GPML) was launched at the
            United Nations Conference on Sustainable Development (Rio+20) in
            June 2012, in response to a request set out in the Manila
            Declaration on ‘Furthering the Implementation of the Global
            Programme of Action for the Protection of the Marine Environment
            from Land-based Activities’. The partnership is led by a Steering
            Committee and the United Nations Environment Programme (UNEP)
            provides secretariat services.
          </p>
          <p className="txt-emphasis text-white">
            The GPML is a multi-stakeholder partnership that brings together all
            actors working to address marine litter and plastic pollution. By
            providing a unique global platform to share knowledge and
            experience, partners can work together to create and advance
            solutions to this pressing global issue.
          </p>
          <Button
            type="ghost"
            onClick={(e) => {
              window.location.href = "https://www.gpmarinelitter.org/";
            }}
          >
            Go to the partnership
          </Button>
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
          <p className="txt-emphasis text-white">
            The GPML Digital Platform drives transformation and supports the
            work of the GPML Action Tracks. The Digital Platform is
            multi-stakeholder and partly open source, compiling and
            crowdsourcing different resources, integrating data and connecting
            stakeholders to guide action on addressing the global problem of
            marine litter and plastic pollution.
          </p>
        </div>
        <div className="section-info-button-wrapper">
          <a
            target="_blank"
            href="/GPML-One-pager-19.08i.pdf"
            className="doc-wrapper"
          >
            <img src={summaryDocImage} alt="summary-document" />
            <Button type="ghost" className="btn-item">
              Download Summary (1 Page)
            </Button>
          </a>
          <a
            target="_blank"
            href="https://wedocs.unep.org/bitstream/handle/20.500.11822/34453/UNEP%20GPML%20Digital%20Platform%20Concept%20for%20User%20and%20Partner%20Consultations%20May%202021.pdf"
            className="doc-wrapper"
          >
            <img src={fullConceptDocImage} alt="full-concept-document" />
            <Button type="ghost" className="btn-item">
              Download Full Concept Document
            </Button>
          </a>
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
          <p className="txt-emphasis text-blue">
            The release of an initial minimum viable product (MVP), or “Phase
            1”, took place in February 2021, where a beta version of the GPML
            Digital Platform was made available. Following this, an iterative,
            user-centered design process is using techniques such as interviews,
            surveys and workshops to collect feedback from users to inform new
            versions of the Digital Platform. <br />
          </p>
          <p className="txt-emphasis text-blue">
            A series of phased releases, informed by user-centered design, will
            culminate in a final version in June 2023. Interim versions will
            enhance existing features and develop new ones in preparation for
            key events, including UNEA-5.2 dialogues and the 7th International
            Marine Debris Conference (7IMDC) planned for 2022, as well as
            UNEA-6, expected to be held in early 2023.
          </p>
          <Button
            type="primary"
            onClick={(e) => {
              window.location.href =
                "https://wedocs.unep.org/bitstream/handle/20.500.11822/34453/UNEP%20GPML%20Digital%20Platform%20Concept%20for%20User%20and%20Partner%20Consultations%20May%202021.pdf";
            }}
          >
            Learn More
          </Button>
        </div>
      </div>
      <div className="section-timeline-roadmap-graphic">
        <Image src={timelineAndRoadmapGraphic} preview={false} />
      </div>
    </div>
  );
};

const renderSectionKeyFeaturesAndComponents = () => {
  return (
    <div className="section-container section-feature-component-container">
      <div className="ui container section-feature-component-wrapper">
        <div className="section-feature-component-text">
          <h2 className="text-green">Key Features & Components</h2>
          <p className="txt-emphasis text-white">
            Features of the GPML Digital Platform are made available via 3
            primary components.
          </p>
          <p className="txt-emphasis text-white">
            The Platform supports interlinkages between the different components
            to ensure a user-friendly experience and access to all
            functionalities and resources through links to internal and external
            databases, datasets and key partner platforms, such as the World
            Environment Situation Room (WESR).
          </p>
          <Button
            type="ghost"
            onClick={(e) => {
              window.location.href =
                "https://wedocs.unep.org/bitstream/handle/20.500.11822/34453/UNEP%20GPML%20Digital%20Platform%20Concept%20for%20User%20and%20Partner%20Consultations%20May%202021.pdf";
            }}
          >
            Learn More
          </Button>
        </div>
        <div className="section-feature-component-graphic">
          <Image src={featureComponent} width="90%" preview={false} />
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
          <h2 className="text-green">Our community</h2>
          <p className="txt-emphasis text-white">
            The GPML Digital Platforms seeks to connect, inform and inspire all
            actors working to address marine litter and plastic pollution. Join
            our community of stakeholders, which includes: governments;
            scientific and technological community and academia; business,
            industry and private sector; non-governmental organizations (NGOs)
            and foundations; intergovernmental organizations (IGOs); all actors
            participating in global/regional multilateral processes; other major
            groups and stakeholders; and private citizens.
          </p>
          <Link to="/signup">
            <Button type="ghost">Sign up to find out more</Button>
          </Link>
        </div>
      </div>
      <div className="section-community-graphic">
        <Image src={ourCommunity} preview={false} />
      </div>
    </div>
  );
};

const renderSectionHistory = () => {
  return (
    <div className="section-container section-history-container">
      <div className="ui container section-history-wrapper">
        <div className="section-history-text">
          <h2 className="text-green">The History of the GPML</h2>
          <p className="txt-emphasis text-blue">
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
            GPML will support UNEP’s Medium-Term Strategy by supporting
            countries to deliver on their environmental commitments under
            international agreements.
          </p>
        </div>
      </div>
      <div className="section-history-graphic">
        <Image src={GpmlHistory} preview={false} />
      </div>
    </div>
  );
};

export default AboutUs;
