import moment from "moment";
import capitalize from "lodash/capitalize";
import values from "lodash/values";
import { UIStore } from "../../store";
import imageNotFound from "../../images/image-not-found.png";
import { languages } from "countries-list";

const findCountries = (countries, item, isCountry = false) => {
  const {
    country,
    geoCoverageType,
    geoCoverageValue,
    geoCoverageValues,
  } = item;
  if (isCountry) {
    return country ? find(countries, (x) => x.isoCode === country).name : "-";
  }

  if (
    (geoCoverageType === "regional" ||
      geoCoverageType === "global with elements in specific areas") &&
    (geoCoverageValue !== null || geoCoverageValues !== null)
  ) {
    const values = geoCoverageValues || geoCoverageValue;
    if (values === null) {
      return "-";
    }
    return values.join(", ");
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
    (geoCoverageType === "transnational" ||
      geoCoverageType === "national" ||
      geoCoverageType === "sub-national") &&
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
            return find(countries, (x) => x.isoCode === v).name;
          })
          .join(", ")}
      </div>
    );
  }
  return "-";
};

export const GeneralPreview = ({ item }) => {
  const { countries } = UIStore.currentState;
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
          <p className="section-title">{item.type} detail</p>
        </li>
        <li>
          <div className="detail-title">Title</div>:
          <div className="detail-content">
            <b>{item.title}</b>
          </div>
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
            <b>{item?.createdBy && item.createdBy}</b>
          </div>
        </li>
        <li>
          {item.type === "event" && (
            <div className="detail-title">Description</div>
          )}
          {["Financing Resource", "Technical Resource"].includes(item.type) && (
            <div className="detail-title">Summary</div>
          )}
          :
          <div className="detail-content">
            {item.description || item.summary || "-"}
          </div>
        </li>
        <li>
          <div className="detail-title">Remarks</div>:
          <div className="detail-content">{item.remarks || "-"}</div>
        </li>
        {item?.publishYear && (
          <li>
            <div className="detail-title">Publish year</div>:
            <div className="detail-content">{item.publishYear}</div>
          </li>
        )}
        {item.type === "Financing Resource" &&
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
        {["Financing Resource", "Technical Resource"].includes(item.type) && (
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
              {moment(item.startDate).format("DD MMM YYYY")} to{" "}
              {moment(item.endDate).format("DD MMM YYYY")}
            </div>
          </li>
        )}
        <li>
          <div className="detail-title">Country</div>:
          <div className="detail-content">{country}</div>
        </li>
        {item.type === "event" && (
          <li>
            <div className="detail-title">City</div>:
            <div className="detail-content">{item.city || "-"}</div>
          </li>
        )}
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
              {findCountries(countries, item)}
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
                    {languages[x.isoCode].name} : {x.url}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
        <li>
          <div className="detail-title">Tags</div>:
          <div className="detail-content">
            {(item.tags && item.tags.join(", ")) || "-"}
          </div>
        </li>
      </ul>
    </div>
  );
};

export const ProfilePreview = ({ item }) => {
  const { countries } = UIStore.currentState;
  const country =
    countries.find((x) => x.isoCode === item.country)?.name || "-";
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
            <div className="detail-content">{item.createdBy}</div>
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
                {findCountries(countries, item)}
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
            <div className="detail-content">
              {(item.seeking && item.seeking.join(", ")) || "-"}
            </div>
          </li>
          <li>
            <div className="detail-title">Offering</div>:
            <div className="detail-content">
              {(item.offering && item.offering.join(", ")) || "-"}
            </div>
          </li>
          <li>
            <div className="detail-title">About yourself</div>:
            <div className="detail-content">{item.about || "-"}</div>
          </li>
          <li>
            <div className="detail-title">Tags</div>:
            <div className="detail-content">
              {(item.tags && item.tags.join(", ")) || "-"}
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};
