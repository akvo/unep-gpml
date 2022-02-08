import React from "react";
import { Link } from "react-router-dom";

const plans = [
  {
    id: 1,
    title: "Create",
    content: (
      <>
        <h3>Purpose</h3>
        <p className="paragraph">
          This phase concerns the development of the action plan with engagement
          of stakeholders, starting from data collection and setting targets to
          defining a strategic approach and designing the monitoring and review
          programme.
        </p>
        <h3>How the Digital Platform can support</h3>
        <p className="paragraph">
          The Digital Platform contains various guidance documents that can be
          used when creating an action plan, including the{" "}
          <a href="https://digital.gpmarinelitter.org/technical_resource/253">
            Marine Litter: Guidelines for designing action plans.
          </a>{" "}
          In addition, the following functionalities of the Digital Platform can
          be considered for this phase:
        </p>
        <ul>
          <li>
            The repository of{" "}
            <Link to="/knowledge-library?country=&transnational=&topic=action_plan&tag=&q=&offset=0">
              Action Plans
            </Link>{" "}
            and{" "}
            <Link to="/knowledge-library?country=&transnational=&topic=policy&tag=&q=&offset=0">
              Policies
            </Link>{" "}
            can be used to identify relevant examples of action plans and
            policies at the transnational and national level. Some of those are
            described in more detail as{" "}
            <Link to="/case-studies">Case Studies</Link>.
          </li>
          <li>
            The Digital Platform also contains various resources that can
            support the collection of baseline data, in the absence of national
            data. For instance, the waste data layer in the{" "}
            <a href="https://datahub.gpmarinelitter.org/">Data Hub</a> provides
            statistics of urban waste generated and mismanaged plastic waste at
            the country level. The repository of Monitoring & Analysis{" "}
            <Link to="/knowledge-library?country=&transnational=&topic=project&tag=&q=&offset=0">
              Initiatives
            </Link>{" "}
            can be helpful in identifying relevant data.
          </li>
          <li>
            Calculation tools for providing national estimates, such as the{" "}
            <a href="https://digital.gpmarinelitter.org/technical_resource/10084">
              WFD Tool
            </a>{" "}
            and{" "}
            <a href="https://digital.gpmarinelitter.org/technical_resource/138">
              ISWA plastic pollution calculator
            </a>{" "}
            , can be found under{" "}
            <Link to="/capacity-building">Tools & Toolkits</Link>.
          </li>
          <li>
            The <Link to="/stakeholder-overview">Connect Stakeholders</Link>{" "}
            component can be used to identify and map stakeholders, as well as
            to identify organizations and experts that can provide specific
            services and expertise.
          </li>
          <li>
            The <Link to="/capacity-building">Capacity Building section</Link>{" "}
            contains <Link to="/capacity-building">Courses & Trainings</Link>{" "}
            and{" "}
            <Link to="/knowledge-library?country=&transnational=&topic=event&tag=&q=&offset=0">
              Events
            </Link>
            , such as the{" "}
            <a href="https://digital.gpmarinelitter.org/technical_resource/149">
              MOOC on Marine Litter
            </a>{" "}
            , webinars, and conferences, that provide training opportunities in
            different areas.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 2,
    title: "Implement",
    content: (
      <>
        <h3>Purpose</h3>
        <p className="paragraph">
          The Action Plan is implemented through selected implementation
          actions. Implementation is supported by cooperation and engagement of
          stakeholders, sharing of information, reporting of progress on
          actions, education, outreach, and awareness raising as well as
          training and capacity building.
        </p>

        <h3>How the Digital Platform can support</h3>
        <ul>
          <li>
            Guidance on implementation actions can be found in various{" "}
            <Link to="/capacity-building">Guidance Documents</Link>. The{" "}
            <Link to="/case-studies">Belize and PAME case study</Link> provide
            examples of different types of implementation actions that are being
            applied as part of a national and Regional Action Plan respectively.
            Other examples include:
          </li>
          <i>Regional action plans</i>
          <ul>
            <li>
              <a href="https://digital.gpmarinelitter.org/action_plan/201">
                OSPAR Commission, Regional Action Plan for Prevention and
                Management of Marine Litter in the North-East Atlantic
              </a>
            </li>
            <li>
              <a href="https://digital.gpmarinelitter.org/action_plan/205">
                SPREP , Pacific Regional Action Plan MARINE LITTER (2018?2025)
              </a>
            </li>
            <li>
              <a href="https://digital.gpmarinelitter.org/action_plan/10327">
                Strategic Action Plan for the Environmental Protection and
                Rehabilitation of the Black Sea
              </a>
            </li>
            <li>
              <a href="https://digital.gpmarinelitter.org/action_plan/199">
                Western Indian Ocean, Regional Action Plan on Marine Litter
              </a>
            </li>
            <li>
              <a href="https://digital.gpmarinelitter.org/action_plan/200">
                NOWPAP Regional Action Plan on Marine Litter
              </a>
            </li>
            <i>National Action Plans</i>
            <li>
              <a href="https://digital.gpmarinelitter.org/action_plan/207">
                Canada: Strategy on Zero Plastic Waste, Phase 2
              </a>
            </li>
            <i>Sub national Action Plans</i>
            <li>
              <a href="https://digital.gpmarinelitter.org/action_plan/10328">
                North Carolina Marine Debris Action Plan January 2020
              </a>
            </li>
          </ul>
          <li>
            The <Link to="/learning">Capacity Building section</Link> contains
            an extensive repository of
            <Link to="/learning">
              {" "}
              Education & Awareness Raising Resources
            </Link>{" "}
            as well as <Link to="/learning">Courses & Trainings</Link> that may
            be helpful in implementing education, awareness raising and capacity
            building actions. An example is the{" "}
            <a href="https://digital.gpmarinelitter.org/technical_resource/149">
              MOOC on Marine litter
            </a>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 3,
    title: "Report",
    content: (
      <>
        <h3>Purpose</h3>
        <p className="paragraph">
          At regular intervals, progress is reported on the implementation
          measures as well as the overall performance of the Action Plan with
          the purpose of tracking progress on implementation and effectiveness.
        </p>
        <h3>How the Digital Platform can support</h3>
        <ul>
          <li>
            Guidance documents for monitoring and assessment, including the{" "}
            <a hreef="https://digital.gpmarinelitter.org/technical_resource/10024">
              GESAMP Guidelines for the Monitoring and Assessment of Plastic
              Litter in the Ocean
            </a>{" "}
            can be found under Technical Resources.
          </li>
          <li>
            The <a href="https://datahub.gpmarinelitter.org/">Data Hub</a>{" "}
            component of the GPML Digital Platform offers a coordinated,
            authoritative point of access for information on marine litter and
            plastic pollution, from source to fate. It includes a data map,
            layers and dashboard, data catalogue (or metadata repository), an
            API platform, and education material including story maps. Tools and
            data made available in the Data Hub will support measurement of
            progress and reporting.
          </li>
          <li>
            Analysis and comparison with other data layers such as hotspot data
            from the University of Leeds and UN Habitat Spatio-temporal
            quantification of Plastic pollution Origins and Transportation
            (SPOT) model, can help in assessing the effectiveness of action
            plans.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 4,
    title: "Update",
    content: (
      <>
        <h3>Purpose</h3>
        <p className="paragraph">
          Based on an agreed methodology for measuring the effectiveness of the
          implementation measures as well as the overall plan, the Action Plan
          is reviewed at regular intervals, thus ensuring that it is relevant
          and effective.
        </p>
      </>
    ),
  },
];

export default plans;
