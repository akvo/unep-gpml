import { Col, Row, Tabs } from "antd";
import React, { Fragment, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import "./styles.scss";
const { TabPane } = Tabs;

function HelpCenter() {
  const history = useHistory();
  return (
    <div id="helpCenter">
      <div className="section-container">
        <div className="ui container">
          <Tabs
            size="large"
            tabPosition={"top"}
            onTabClick={(key, e) => {
              if (key === "forums") {
                window.open(
                  "https://communities.gpmarinelitter.org/",
                  "_blank"
                );
              }
              if (key === "glossary") {
                history.push("/glossary");
              }
            }}
          >
            <TabPane
              tab="Get Started"
              key="getStarted"
              className="help-center-tab-pane"
            >
              Get Started
            </TabPane>
            <TabPane
              tab="How to Guides"
              key="howTo"
              className="help-center-tab-pane"
            >
              <Tabs size="large" tabPosition={"left"}>
                <TabPane
                  tab="Guidance on how to add resources on the GPML Digital Platform"
                  key="addResources"
                  className="help-center-tab-pane"
                >
                  <iframe
                    frameBorder="0"
                    height="500px"
                    width="100%"
                    src={
                      "https://dev-digital-platform-help-center.pantheonsite.io/sites/default/files/2022-08/Add%20Content%20Guideline.pdf"
                    }
                  />
                </TabPane>
                <TabPane
                  tab="Guidance on how to sign up on the GPML Digital Platform"
                  key="signUp"
                  className="help-center-tab-pane"
                >
                  <iframe
                    frameBorder="0"
                    height="500px"
                    width="100%"
                    src={
                      "https://dev-digital-platform-help-center.pantheonsite.io/sites/default/files/2022-08/Sign%20In%20Document.pdf"
                    }
                  />
                </TabPane>
              </Tabs>
            </TabPane>
            <TabPane
              tab="Video Tutorials"
              key="video"
              className="help-center-tab-pane"
            >
              <Row gutter={16}>
                <Col span={8}>
                  <iframe
                    width="100%"
                    height="480"
                    src={`https://www.youtube.com/embed/xSYkLgoHqVQ`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded youtube"
                  />
                </Col>
                <Col span={8}>
                  <iframe
                    width="100%"
                    height="480"
                    src={`https://www.youtube.com/embed/AOOpIn9-zIw`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded youtube"
                  />
                </Col>
                <Col span={8}>
                  <iframe
                    width="100%"
                    height="480"
                    src={`https://www.youtube.com/embed/ka0lbripFJU`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded youtube"
                  />
                </Col>
                <Col span={8}>
                  <iframe
                    width="100%"
                    height="480"
                    src={`https://www.youtube.com/embed/oET7Ham4KV8`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded youtube"
                  />
                </Col>
                <Col span={8}>
                  <iframe
                    width="100%"
                    height="480"
                    src={`https://www.youtube.com/embed/NNGiHD5X3Qo`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded youtube"
                  />
                </Col>
              </Row>
            </TabPane>
            <TabPane
              tab="GPML Tools"
              key="tools"
              className="help-center-tab-pane"
            >
              Tools
            </TabPane>
            <TabPane
              tab="Frequently Asked Questions"
              key="faq"
              className="help-center-tab-pane faq"
            >
              <FAQ />
            </TabPane>
            <TabPane
              tab="Validation Mechanism"
              key="validation"
              className="help-center-tab-pane"
            >
              <iframe
                frameBorder="0"
                height="500px"
                width="100%"
                src={
                  "https://dev-digital-platform-help-center.pantheonsite.io/sites/default/files/2022-09/Updated%20Validation%20Process%20August%202022.pdf"
                }
              />
            </TabPane>
            <TabPane
              tab="Glossary"
              key="glossary"
              className="help-center-tab-pane"
            />
            <TabPane
              tab="Forums"
              key="forums"
              className="help-center-tab-pane"
            />
          </Tabs>
        </div>
      </div>
    </div>
  );
}

const FAQ = () => {
  return (
    <>
      <div>
        <h4>
          <strong>WHAT IS THE GPML DIGITAL PLATFORM?</strong>
        </h4>
        <p>
          The GPML Digital Platform is multi-stakeholder and partly open source,
          compiling and crowdsourcing different resources, integrating data and
          connecting stakeholders to guide action.
        </p>
      </div>
      <div>
        <h4>
          <strong>WHAT DOES THE DIGITAL PLATFORM OFFER?</strong>
        </h4>
        <p>
          The Digital Platform offers a single point of access for current,
          accurate data and information on plastic pollution, marine litter and
          related topics. It provides a wide range of materials to support
          stakeholders’ needs, ranging from scientific research to technological
          innovation and public outreach, in order to inform decision-making,
          educate and raise awareness, facilitate target setting, and advance
          cooperation. An additional feature is a virtual networking forum for
          stakeholders.
        </p>
      </div>
      <div>
        <h4>
          <strong>
            WHAT IS MEANT WITH THE FOLLOWING TERMS USED FOR DIFFERENTIATING
            BETWEEN DIFFERENT TYPES OF CONTENT?
          </strong>
        </h4>
        <h5>
          <strong>Initiative</strong>
        </h5>
        <ul>
          <li>
            These include a wide range of actions from legislation, behaviour
            change initiatives, education, training, events, new technologies,
            monitoring and analysis initiatives and science Initiatives.
            Existing actions and initiatives have been collected via an online
            survey for voluntary inputs and narrative submissions. Initiatives
            are linked to a Dashboard.
          </li>
        </ul>
      </div>
      <div>
        <h5>
          <strong>Action Plan</strong>
        </h5>
        <ul>
          <li>
            An action plan is a detailed plan outlining actions needed to reach
            one or more goals. Alternatively, it can be defined as a sequence of
            steps that must be taken, or activities that must be performed well,
            for a strategy to succeed. Development of action plans is required
            under many multilateral environmental agreements to facilitate
            implementation.
          </li>
        </ul>
      </div>
      <div>
        <h5>
          <strong>Policy</strong>
        </h5>
        <ul>
          <li>
            Policy documents defined here as official (and occasionally
            unofficial translations of) documents that include public-facing
            laws and amendments, statutes, ordinances, management plans,
            executive orders, agreements, treaties, and memorandums of
            understanding, among others written and adopted by government
            entities, demonstrating an intent to reduce plastic pollution at
            varying stages of the plastics lifecycle.
          </li>
        </ul>
      </div>
      <div>
        <h5>
          <strong>Technical Resources</strong>
        </h5>
        <ul>
          <li>
            Resources and mechanisms collected through research based on
            publicly available information. Examples of technical resources
            range from pilot projects, policy recommendations, assessments,
            calculation model and tools, operational and technical guidelines,
            toolkits for decision-makers, best practices, manuals and more.
          </li>
        </ul>
      </div>
      <div>
        <h5>
          <strong>Financing Resources</strong>
        </h5>
        <ul>
          <li>
            Organizations or programmes providing financial support to entities
            tackling marine plastic litter. Such support includes grants,
            investment, and loans, among others.
          </li>
        </ul>
      </div>
      <div>
        <h5>
          <strong>Event</strong>
        </h5>
        <ul>
          <li>
            Upcoming capacity building activities and events on marine litter,
            plastic pollution and related topics.
          </li>
        </ul>
      </div>
      <div>
        <h5>
          <strong>Technology</strong>
        </h5>
        <ul>
          <li>
            A collection of technology solutions and of environmentally sound
            technologies, which identifies commercial solutions for the
            prevention of marine litter following a lifecycle approach, from
            source to sea, with a focus on both land-based and near-shore
            (litter capturing) technologies. Environmentally sound technologies,
            sections explaining alternative materials, chemical recycling,
            additives etc.
          </li>
        </ul>
      </div>
      <div>
        <h5>
          <strong>Capacity Building</strong>
        </h5>
        <ul>
          <li>
            The definition of capacity building is broad. It is a holistic
            enterprise, encompassing a multitude of activities. It means
            building abilities, relationships and values that will enable
            organisations, groups and individuals to improve their performance
            and achieve their development objectives. It includes strengthening
            the processes, systems and rules that influence collective and
            individual behaviour and performance in all development endeavours.
            And it means enhancing people’s technical ability and willingness to
            play new developmental roles and adapt to new demands and
            situations.
          </li>
        </ul>
      </div>
      <div>
        <h4>
          <strong>WHO ARE THE PARTNERS OF THE DIGITAL PLATFORM?</strong>
        </h4>
        <p>
          A variety of partners specialised in different areas is involved to
          collect and develop resources for the Digital Platform. These include:
        </p>
      </div>
      <div>
        <h5>
          <strong>Strategic Partners</strong>
        </h5>
        <ul>
          <li>
            These include partners working on independent projects which might
            be featured on the Digital Platform, as well as partners who wish to
            co-develop various components of the Digital Platform, and/or
            provide funding to support the initiative.
          </li>
        </ul>
      </div>
      <div>
        <h5>
          <strong>Technology Partners</strong>
        </h5>
        <ul>
          <li>
            These include partners who can offer advanced or innovative
            technologies to support the development of the Digital Platform.
          </li>
        </ul>
      </div>
      <div>
        <h5>
          <strong>Data Partners</strong>
        </h5>
        <ul>
          <li>
            These include partners who wish to collaborate by sharing open data
            and other resources on marine litter and plastic pollution, or other
            complementary information for analysis and access.
          </li>
        </ul>
      </div>
      <div>
        <h5>
          <strong>Knowledge Partners</strong>
        </h5>
        <ul>
          <li>
            These include partners willing to share knowledge products that are
            currently hosted on external platforms.
          </li>
        </ul>
      </div>
      <div>
        <h4>
          <strong>
            WHEN WILL THE FINAL VERSION OF THE DIGITAL PLATFORM GO LIVE?
          </strong>
        </h4>
        <p>
          A series of phased releases will culminate in a full-fledged final
          version, to be launched in June 2023.
        </p>
      </div>
      <div>
        <h4>
          <strong>HOW DO I SIGN UP?</strong>
        </h4>
        <p>
          <Link>How to guides</Link>
        </p>
      </div>
      <div>
        <h4>
          <strong>HOW DO I CREATE AN ENTITY?</strong>
        </h4>
        <p>[To be covered as part of the tutorials and how to guides?]</p>
      </div>
      <div>
        <h4>
          <strong>HOW IS CONTENT VALIDATED?</strong>
        </h4>
        <p>
          Visit our <Link>validation mechanism page</Link> for information on
          how content in the digital platform is validated.
        </p>
      </div>
      <div>
        <h4>
          <strong>HOW DO I GET INVOLVED?</strong>
        </h4>
        <ul>
          <li>
            Take part in our User Consultations, which are designed to capture
            your inputs and guide the development of the platform
          </li>
          <li>Become a strategic, data, knowledge or technology partner</li>
          <li>
            Contact us for more information:{" "}
            <Link
              to="#"
              onClick={(e) => {
                window.location.href = "mailto:unep-gpmarinelitter@un.org";
                e.preventDefault();
              }}
            >
              unep-gpmarinelitter@un.org
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default HelpCenter;
