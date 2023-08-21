// import './index.module.scss';
import { Button } from "antd";
import styles from "./index.module.scss";
import { CirclePointer, ArrowRight } from "../../components/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { useDeviceSize } from "../../modules/landing/landing";

const Landing = () => {
  const [width] = useDeviceSize();
  return (
    <div id="landing" className={styles.landing}>
      <div className="hero">
        <div className="container">
          <div className="text">
            <h1>
              Empowering <b>governments</b>
              <br />
              to end plastic pollution
            </h1>
            <p className="p-l">
              The plastic action platform empowers all countries to create and
              implement successful plastic strategies to end plastic pollution.
            </p>
            <Button type="primary" size="large">
              Join Now <CirclePointer />
            </Button>
          </div>
        </div>
      </div>
      <section className="act-now">
        <div className="container act-now-container">
          <div className="wrapper">
            <PageHeading title="Why should I care?" />
            <h3>
              Act Now: <br /> <span>Co-solution with the plastic network</span>
            </h3>
            <p>
              Avoid duplication of efforts. By using the platform you can match
              with other organisations and governments to create shared
              solutions to end plastic pollution.
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
              <SwiperSlide>
                <ActNowCard
                  bgColor="purple"
                  singleLink={true}
                  linkText="Track progress"
                  content="Join others in coordinating efforts towards shared plastic solutions. From data to capacity development communities"
                />
              </SwiperSlide>
              <SwiperSlide>
                <ActNowCard
                  bgColor="green"
                  content="Reduce your country’s footprint. Create and advance your plastic startegy."
                  linkText="Track progress"
                  linkTextTwo="Track action"
                />
              </SwiperSlide>
              <SwiperSlide>
                <ActNowCard
                  bgColor="violet"
                  content="Join others in coordinating efforts towards shared plastic solutions. From data to capacity development communities"
                  singleLink={true}
                  linkText="Track progress"
                />
              </SwiperSlide>
              <SwiperSlide>
                <ActNowCard
                  bgColor="blue"
                  content="Start your own initiative. get inspired by others who are making progress to end plastic pollution."
                  linkText="Track progress"
                  linkTextTwo="Track action"
                />
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </section>
    </div>
  );
};

const PageHeading = ({ title }) => <h2 className="page-heading">{title}</h2>;

const ActNowCard = ({
  bgColor,
  singleLink = false,
  linkText,
  linkTextTwo,
  content,
}) => (
  <div className={`card card--${bgColor}`}>
    <h2>Communities of practise</h2>
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
