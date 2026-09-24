import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trans } from '@lingui/macro';
import api from '../../utils/api';
import { getStrapiUrl, transformStrapiResponse } from '../../utils/misc';
import styles from './index.module.scss';

const ExploreByTopic = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get('/topics?populate=*&sort=order:asc');
        const data = transformStrapiResponse(res.data);
        setTopics(data || []);
      } catch (err) {
        console.error('Failed to load topics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

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
                {topic.icon?.url && (
                  <Image
                    src={getStrapiUrl(topic.icon.url)}
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