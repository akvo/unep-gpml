import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { Trans } from '@lingui/macro';
import { getStrapiUrl, transformStrapiResponse } from '../../utils/misc';
import styles from './index.module.scss';

const getIconUrl = (icon) => {
  const url = icon?.data?.attributes?.url;
  if (!url) return null;
  return url.startsWith('http') ? url : `${getStrapiUrl()}${url}`;
};

const ExploreByTopic = () => {
  const router = useRouter();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(
          `${getStrapiUrl()}/api/topics?locale=${router.locale}&populate=*&sort=order:asc`
        );
        const json = await res.json();
        setTopics(transformStrapiResponse(json?.data || []));
      } catch (err) {
        console.error('Failed to load topics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [router.locale]);

  if (loading || !topics.length) {
    return null;
  }

  return (
    <section
      className="feature-cards"
      aria-labelledby="explore-by-topic-heading"
    >
      <h3 id="explore-by-topic-heading">
        <Trans>Explore by Topic</Trans>
      </h3>

      <ul className="container" role="list">
        {topics.map((topic) => (
          <li role="listitem" key={topic.id}>
            <Link
              href={`/topics/${topic.topicId}`}
              aria-label={`Explore the ${topic.name} section`}
              className="feature-card"
            >
              <div className="img">
                {getIconUrl(topic.icon) && (
                  <Image
                    src={getIconUrl(topic.icon)}
                    width={265}
                    height={136}
                    alt={`${topic.name} icon`}
                  />
                )}
              </div>
              <div className="cnt">
                <h5>{topic.name}</h5>
                <p>{topic.cardSummary}</p>
                <span aria-hidden="true">
                  <Trans>{topic.ctaLabel || 'Explore the resources'}</Trans>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ExploreByTopic;