import { useRouter } from "next/router";
import FlexibleForms from "../../modules/flexible-forms/view";
import EntityFormView from "../../modules/entity-edit-signup/view";

const EditPage = ({ setLoginVisible, isAuthenticated, loadingProfile }) => {
  const router = useRouter();
  const { slug, type } = router.query;

  if (!slug) return null;

  const slugType = slug[0];
  const id = slug[1];

  if (
    [
      "technology",
      "policy",
      "action-plan",
      "financing-resource",
      "technical-resource",
      "initiative",
      "case-study",
      "event",
    ].includes(slugType)
  ) {
    return (
      <FlexibleForms
        {...{ setLoginVisible, isAuthenticated, loadingProfile, type, id }}
      />
    );
  }

  if (["stakeholder", "entity"].includes(slugType)) {
    return <EntityFormView match={{ params: { id: id } }} />;
  }

  return <div>Not Found</div>;
};

export default EditPage;
