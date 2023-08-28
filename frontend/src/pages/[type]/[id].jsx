import { useRouter } from "next/router";
import NewDetailsView from "../../modules/details-page/view";

const Details = ({ setLoginVisible, isAuthenticated }) => {
  const router = useRouter();
  const { type, id } = router.query;
  console.log(type, id);
  if (
    ![
      "initiative",
      "action-plan",
      "policy",
      "technical-resource",
      "financing-resource",
      "technology",
      "event",
      "case-study",
    ].includes(type)
  ) {
    return <p>Invalid type!</p>;
  }

  return (
    <NewDetailsView
      type={type}
      id={id}
      setLoginVisible={setLoginVisible}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default Details;
