import { Button } from "antd";
import Image from "next/image";
import styles from "./index.module.scss";
import { CirclePointer, ArrowRight } from "../../components/icons";
import { useState } from "react";
import classNames from "classnames";
import { Swiper, SwiperSlide } from "swiper/react";
import { useDeviceSize } from "../../modules/landing/landing";

const Landing = () => (
  <div id="landing" className={styles.landing}>
    <Hero />
    <ActNow />
  </div>
);

const Hero = () => {
  const [selected, setSelected] = useState("Governments");
  const items = [
    {
      group: "Governments",
      text:
        "The plastic action platform empowers all countries to create and implement successful plastic strategies to end plastic pollution.",
    },
    {
      group: "Private Sector",
      text:
        "The GPML digital platform fosters public-private partnerships, offers clarity on circular economy practices, and provides guidance on Extended Producer Responsibilities (EPRs) and sustainable business models.",
    },
    {
      group: "Scientific Community",
      text:
        "The GPML digital platform helps academia and the scientific community to ensure their research becomes actionable by offering the opportunity to share resources and collaborate with policy makers.",
    },
    {
      group: "NGOs",
      text:
        "The GPML digital platform helps academia and the scientific community to ensure their research becomes actionable by offering the opportunity to share resources and collaborate with policy makers.",
    },
    {
      group: "IGOs",
      text:
        "The GPML digital platform offers the opportunity to forge collaborative partnerships with diverse stakeholders, share and find resources on plastic pollution, and amplify advocacy.",
    },
    {
      group: "Civil Society",
      text:
        "The GPML digital platform allows NGOS and civil society to connect with likeminded organizations, discover financing resources and funding opportunities, and showcase their work in the fight against plastic pollution and marine litter.",
    },
  ];
  return (
    <div className="hero">
      <div className="container">
        <div className="text">
          <h1>
            Empowering
            <br />
            <b>{selected}</b>
            <br />
            to end plastic pollution
          </h1>
          <p className="p-l">
            {items.find((item) => item.group === selected)?.text}
          </p>
          <Button type="primary" size="large">
            Join Now <CirclePointer />
          </Button>
        </div>
        <div className="globe">
          <Image src="/globe.jpg" width={1022} height={770} />
          <div className="labels">
            {items.map((item) => (
              <div
                onClick={() => setSelected(item.group)}
                key={item.group}
                className={classNames(
                  `label l-${item.group.toLowerCase().replace(" ", "-")}`,
                  { selected: selected === item.group }
                )}
              >
                <span>{item.group}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActNow = () => {
  const [width] = useDeviceSize();
  const items = [
    {
      linkText: "Track progress",
      content:
        "Join others in coordinating efforts towards shared plastic solutions. From data to capacity development communities",
      bgColor: "purple",
      singleLink: true,
      title: "Communities of practise",
    },
    {
      bgColor: "green",
      content:
        "Reduce your country’s footprint. Create and advance your plastic startegy.",
      linkText: "Track progress",
      title: "Plastic Strategies",
      linkTextTwo: "Track action",
    },
    {
      bgColor: "violet",
      content:
        "Join others in coordinating efforts towards shared plastic solutions. From data to capacity development communities",
      singleLink: true,
      title: "Communities of practise",
      linkText: "Track progress",
      badge: true,
    },
    {
      bgColor: "blue",
      content:
        "Start your own initiative. get inspired by others who are making progress to end plastic pollution.",
      linkText: "Track progress",
      title: "Country Progress",
      linkTextTwo: "Track action",
    },
  ];
  return (
    <section className="act-now">
      <div className="container act-now-container">
        <div className="wrapper">
          <PageHeading title="Why should I care?" />
          <h3>
            Act Now: <br /> <span>Co-solution with the plastic network</span>
          </h3>
          <p>
            Avoid duplication of efforts. By using the platform you can match
            with other organisations and governments to create shared solutions
            to end plastic pollution.
          </p>
        </div>
      </div>
      <div className="container slider-container">
        <div className="slider-wrapper">
          <Swiper
            spaceBetween={20}
            slidesPerView={width <= 1024 ? "auto" : 4}
            pagination={{
              clickable: true,
            }}
          >
            {items.map((item) => (
              <SwiperSlide>
                <ActNowCard
                  bgColor={item.bgColor}
                  singleLink={item.singleLink}
                  title={item.title}
                  linkText={item.linkText}
                  linkTextTwo={item.linkTextTwo}
                  content={item.content}
                  badge={item.badge}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

const PageHeading = ({ title }) => <h2 className="page-heading">{title}</h2>;

const ActNowCard = ({
  bgColor,
  singleLink = false,
  linkText,
  linkTextTwo,
  content,
  title,
  badge = false,
}) => (
  <div className={`card card--${bgColor}`}>
    {badge && <span className="card-badge">Coming soon</span>}
    <h2>{title}</h2>
    <p>{content}</p>
    {singleLink ? (
      <div className="single-link">
        <Button type="link">
          {linkText} <ArrowRight />
        </Button>
      </div>
    ) : (
      <div className="multiple-link">
        <Button type="text">
          {linkText} <ArrowRight />
        </Button>
        <Button type="text">
          {linkTextTwo} <ArrowRight />
        </Button>
      </div>
    )}
  </div>
);

export default Landing;
