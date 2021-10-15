import moment from "moment";
import capitalize from "lodash/capitalize";
import values from "lodash/values";
import { UIStore } from "../../store";
import imageNotFound from "../../images/image-not-found.png";
import { languages } from "countries-list";
import { topicNames, resourceSubTypes } from "../../utils/misc";

const currencyFormat = (cur) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur });

const findCountries = (
  { countries, regionOptions, meaOptions, transnationalOptions },
  item
) => {
  const {
    country,
    geoCoverageType,
    geoCoverageValue,
    geoCoverageValues,
  } = item;

  if (
    (geoCoverageType === "regional" ||
      geoCoverageType === "global with elements in specific areas") &&
    (geoCoverageValue !== null || geoCoverageValues !== null)
  ) {
    const values = geoCoverageValues || geoCoverageValue;
    const data =
      geoCoverageType === "regional"
        ? regionOptions
        : geoCoverageType === "global with elements in specific areas"
        ? meaOptions
        : null;
    if (values === null || data === null) {
      return "-";
    }
    return values
      .map((v) => {
        return data.find((x) => x.id === v).name;
      })
      .join(", ");
  }

  if (
    geoCoverageType === "global" &&
    (geoCoverageValue === null || geoCoverageValues === null)
  ) {
    return (
      <div className="scrollable">
        {values(countries)
          .map((c) => c.name)
          .join(", ")}
      </div>
    );
  }

  if (
    (geoCoverageType === "national" || geoCoverageType === "sub-national") &&
    (geoCoverageValue !== null || geoCoverageValues !== null)
  ) {
    const values = geoCoverageValues || geoCoverageValue;
    if (values === null || typeof values === "undefined") {
      return "-";
    }
    return (
      <div className="scrollable">
        {values
          .map((v) => {
            return transnationalOptions.find((x) => x.id === v)?.name;
          })
          .join(", ")}
      </div>
    );
  }

  if (
    geoCoverageType === "transnational" &&
    (geoCoverageValue !== null || geoCoverageValues !== null)
  ) {
    const values = geoCoverageValues || geoCoverageValue;
    if (values === null || typeof values === "undefined") {
      return "-";
    }
    return (
      <div className="scrollable">
        {values
          .map((v) => {
            return transnationalOptions.find((x) => x.id === v)?.name;
          })
          .join(", ")}
      </div>
    );
  }
  return "-";
};

export const GeneralPreview = ({ item }) => {
  const {
    countries,
    regionOptions,
    meaOptions,
    transnationalOptions,
  } = UIStore.useState((s) => ({
    countries: s.countries,
    regionOptions: s.regionOptions,
    meaOptions: s.meaOptions,
    transnationalOptions: s.transnationalOptions,
  }));
  const country = countries.find((x) => x.id === item.country)?.name || "-";
  return (
    <div className="general-info">
      <div className="info-img">
        <img
          src={item.image || imageNotFound}
          alt={item.image || imageNotFound}
        />
      </div>
      <ul>
        <li className="has-border">
          <p className="section-title">{topicNames(item.type)} detail</p>
        </li>
        <li>
          <div className="detail-title">Title</div>:
          <div className="detail-content">
            <b>{item.title}</b>
          </div>
        </li>
        {item.type === "policy" && (
          <>
            <li>
              <div className="detail-title">Original Title</div>:
              <div className="detail-content">{item.originalTitle || "-"}</div>
            </li>
            <li>
              <div className="detail-title">Status</div>:
              <div className="detail-content">{item.status || "-"}</div>
            </li>
            <li>
              <div className="detail-title">First Publication</div>:
              <div className="detail-content">
                {moment(item.firstPublicationDate).format("DD MMM YYYY") || "-"}
              </div>
            </li>
            <li>
              <div className="detail-title">Lastest Amandment</div>:
              <div className="detail-content">
                {moment(item.latestAmendmentDate).format("DD MMM YYYY") || "-"}
              </div>
            </li>
            <li>
              <div className="detail-title">Implementing MEA</div>:
              <div className="detail-content">
                {meaOptions.find((x) => x.id === item.implementingMea)?.name ||
                  "-"}
              </div>
            </li>
          </>
        )}
        <li>
          <div className="detail-title">Country</div>:
          <div className="detail-content">{country}</div>
        </li>
        <li>
          {["event", "technology"].includes(item.type) && (
            <div className="detail-title">Description</div>
          )}
          {item.type === "policy" && (
            <div className="detail-title">Abstract</div>
          )}
          {resourceSubTypes.has(item.type) && (
            <div className="detail-title">Summary</div>
          )}
          :
          <div className="detail-content">
            {item.description || item.summary || item.abstract || "-"}
          </div>
        </li>
        {item?.publishYear && (
          <li>
            <div className="detail-title">Publish year</div>:
            <div className="detail-content">{item.publishYear}</div>
          </li>
        )}
        {item.type === "technology" && (
          <>
            <li>
              <div className="detail-title">Development Stage</div>:
              <div className="detail-content">
                {item?.developmentStage || "-"}
              </div>
            </li>
          </>
        )}
        {item.type === "financing_resource" && (
          <>
            <li>
              <div className="detail-title">Value</div>:
              <div className="detail-content">
                {(item.value &&
                  currencyFormat(item.valueCurrency).format(item.value)) ||
                  "-"}
              </div>
            </li>
            <li>
              <div className="detail-title">Value Remarks</div>:
              <div className="detail-content">{item?.valueRemarks || "-"}</div>
            </li>
          </>
        )}
        {["financing_resource", "action_plan"].includes(item.type) &&
          [item.validFrom, item.validTo].map((x, i) => (
            <li key={"valid" + i}>
              <div className="detail-title">
                Valid {i === 0 ? "from" : "to"}
              </div>
              :
              <div className="detail-content">
                {moment(x, "YYYY-MM-DD", true).isValid()
                  ? moment(x).format("DD MMM YYYY")
                  : x}
              </div>
            </li>
          ))}
        {resourceSubTypes.has(item.type) && (
          <li>
            <div className="detail-title">Organisation</div>:
            <div className="detail-content">
              {item?.organisations?.map((x) => x.name).join(",")}
            </div>
          </li>
        )}
        {item.type === "event" && (
          <li>
            <div className="detail-title">Event Date</div>:
            <div className="detail-content">
              {moment(item.startDate).format("DD MMM YYYY")} {"- "}
              {moment(item.endDate).format("DD MMM YYYY")}
            </div>
          </li>
        )}
        {item.type === "event" && (
          <li>
            <div className="detail-title">City</div>:
            <div className="detail-content">{item.city || "-"}</div>
          </li>
        )}
        <li>
          <div className="detail-title">Remarks</div>:
          <div className="detail-content">{item.remarks || "-"}</div>
        </li>
        <li>
          <div className="detail-title">Submitted at</div>:
          <div className="detail-content">
            {moment(item.createdAt).format("DD MMM YYYY")}
          </div>
        </li>
        <li>
          <div className="detail-title">Submitted by</div>:
          <div className="detail-content">
            <b>{item?.createdByEmail && item.createdByEmail}</b>
          </div>
        </li>
        <li className="has-border">
          <p className="section-title">Geo Coverage</p>
        </li>
        <li>
          <div className="detail-title">Geo coverage type</div>:
          <div className="detail-content">
            {capitalize(item.geoCoverageType) || "-"}
          </div>
        </li>
        {item.geoCoverageType !== "global" && (
          <li>
            <div className="detail-title">Geo coverage</div>:
            <div className="detail-content">
              {findCountries(
                { countries, regionOptions, meaOptions, transnationalOptions },
                item
              )}
            </div>
          </li>
        )}
        <li className="has-border">
          <p className="section-title">Links</p>
        </li>
        <li>
          <div className="detail-title">Urls</div>:
          <div className="detail-content">
            {item?.languages && (
              <ul className={"ul-children"}>
                {item.languages.map((x, i) => (
                  <li key={`url-${i}`}>
                    <a
                      href={`https://${x.url.replace(/^.*:\/\//i, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {`https://${x.url.replace(/^.*:\/\//i, "")}`}
                    </a>{" "}
                    <span className="lang">{languages[x.isoCode].name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
        <li>
          <div className="detail-title">Tags</div>:
          <div className="detail-content">
            {(item.tags &&
              item.tags.map((x) => Object.values(x)[0]).join(", ")) ||
              "-"}
          </div>
        </li>
      </ul>
    </div>
  );
};

export const ProfilePreview = ({ item }) => {
  const {
    countries,
    regionOptions,
    meaOptions,
    transnationalOptions,
  } = UIStore.useState((s) => ({
    countries: s.countries,
    regionOptions: s.regionOptions,
    meaOptions: s.meaOptions,
    transnationalOptions: s.transnationalOptions,
  }));
  const country = countries.find((x) => x.id === item.country)?.name || "-";
  return (
    <div className="stakeholder-info">
      <div className="left">
        <div className="info-img">
          {item.picture && (
            <div className="info-img">
              <img src={item.picture} alt="profile" />
            </div>
          )}
        </div>

        <ul>
          <li className="has-border">
            <p className="section-title">Personal Details</p>
          </li>
          <li>
            <div className="detail-title">First name</div>:
            <div className="detail-content">{item.firstName}</div>
          </li>
          <li>
            <div className="detail-title">Last name</div>:
            <div className="detail-content">{item.lastName}</div>
          </li>
          <li>
            <div className="detail-title">Email</div>:
            <div className="detail-content">{item.email}</div>
          </li>
          <li>
            <div className="detail-title">Linkedin</div>:
            <div className="detail-content">{item.linkedIn || "-"}</div>
          </li>
          <li>
            <div className="detail-title">Twitter</div>:
            <div className="detail-content">{item.twitter || "-"}</div>
          </li>
          <li>
            <div className="detail-title">Representative sector</div>:
            <div className="detail-content">{item.representation || "-"}</div>
          </li>
          <li>
            <div className="detail-title">Country</div>:
            <div className="detail-content">{country}</div>
          </li>
          <li>
            <div className="detail-title">Geo coverage type</div>:
            <div className="detail-content">
              {capitalize(item.geoCoverageType) || "-"}
            </div>
          </li>
          {item.geoCoverageType !== "global" && (
            <li>
              <div className="detail-title">Geo coverage</div>:
              <div className="detail-content">
                {item?.geoCoverageValue}
                {findCountries(
                  {
                    countries,
                    regionOptions,
                    meaOptions,
                    transnationalOptions,
                  },
                  item
                )}
              </div>
            </li>
          )}
          <li>
            <div className="detail-title">Organisation</div>:
            <div className="detail-content">
              <a href={item?.affiliation?.url} target="_blank" rel="noreferrer">
                {item?.affiliation?.name}
              </a>
            </div>
          </li>
          <li>
            <div className="detail-title">Organisation Role</div>:
            <div className="detail-content">{item.organisationRole || "-"}</div>
          </li>
          <li className="has-border">
            <p className="section-title">Expertise and Activities</p>
          </li>
          <li>
            <div className="detail-title">Seeking</div>:
            <div className="detail-content">{item.seeking || "-"}</div>
          </li>
          <li>
            <div className="detail-title">Offering</div>:
            <div className="detail-content">{item.offering || "-"}</div>
          </li>
          <li>
            <div className="detail-title">About yourself</div>:
            <div className="detail-content">{item.about || "-"}</div>
          </li>
          <li>
            <div className="detail-title">Tags</div>:
            <div className="detail-content">{item.general || "-"}</div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export const InitiativePreview = ({ item }) => {
  return (
    <div className="general-info">
      <div className="info-img">
        <img
          src={item.image || imageNotFound}
          alt={item.image || imageNotFound}
        />
      </div>
      <ul>
        <li className="has-border">
          <p className="section-title">Initiative Details</p>
        </li>
        <li>
          <div className="detail-title">Title</div>:
          <div className="detail-content">{item.title}</div>
        </li>
        <li>
          <div className="detail-title">Duration</div>:
          <div className="detail-content">{item?.duration}</div>
        </li>
        <li>
          <div className="detail-title">Country</div>:
          <div className="detail-content">{item?.country || "-"}</div>
        </li>
        <li>
          <div className="detail-title">Submitted at</div>:
          <div className="detail-content">
            {moment(item.createdAt).format("DD MMM YYYY")}
          </div>
        </li>
        <li>
          <div className="detail-title">Submitted by</div>:
          <div className="detail-content">
            <b>{item?.createdByEmail && item.createdByEmail}</b>
          </div>
        </li>
        <li>
          <div className="detail-title">Submitted</div>:
          <div className="detail-content">{item?.submitted || "-"}</div>
        </li>
        {item?.submitted === "On behalf of an entity" && (
          <li>
            <div className="detail-title">Organisation</div>:
            <div className="detail-content">
              {item?.organisation ? (
                <a href={item?.organisation?.url}>{item?.organisation?.name}</a>
              ) : (
                "-"
              )}
            </div>
          </li>
        )}
        <li className="has-border">
          <p className="section-title">Geo Coverage</p>
        </li>
        <li>
          <div className="detail-title">Geo coverage type</div>:
          <div className="detail-content">{item?.geoCoverageType || "-"}</div>
        </li>
        {item?.geoCoverageType && item?.geoCoverageType !== "Global" && (
          <li>
            <div className="detail-title">Geo coverage</div>:
            <div className="detail-content">
              {item?.geoCoverageValues?.join(", ") || "-"}
            </div>
          </li>
        )}
        <li className="has-border">
          <p className="section-title">Links</p>
        </li>
        <li>
          <div className="detail-title">URL</div>:
          <div className="detail-content">
            <ul className={"ul-children"}>
              {item?.links?.map((x, i) => (
                <li key={`url-${i}`}>
                  <a
                    href={`https://${x.replace(/^.*:\/\//i, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {`https://${x.replace(/^.*:\/\//i, "")}`}
                  </a>{" "}
                </li>
              )) || "-"}
            </ul>
          </div>
        </li>
        <li className="has-border">
          <p className="section-title">Entities Involved</p>
        </li>
        <li>
          <div className="detail-title">Entities</div>:
          <ul className={"ul-children"}>
            {item?.entities?.map((x, i) => <li key={`url-${i}`}>{x}</li>) ||
              "-"}
          </ul>
        </li>
        <li>
          <div className="detail-title">Partner</div>:
          <div className="detail-content">
            <ul className={"ul-children"}>
              {item?.partners?.map((x, i) => <li key={`url-${i}`}>{x}</li>) ||
                "-"}
            </ul>
          </div>
        </li>
        <li>
          <div className="detail-title">Donor</div>:
          <div className="detail-content">
            <ul className={"ul-children"}>
              {item?.donors?.map((x, i) => <li key={`url-${i}`}>{x}</li>) ||
                "-"}
            </ul>
          </div>
        </li>
      </ul>
    </div>
  );
};

export const DetailCollapse = ({ data, item }) => {
  switch (item.type) {
    case "stakeholder":
      return <ProfilePreview item={{ ...data, ...item }} />;
    case "project":
      return <InitiativePreview item={{ ...data, ...item }} />;
    default:
      return <GeneralPreview item={{ ...data, ...item }} />;
  }
};
