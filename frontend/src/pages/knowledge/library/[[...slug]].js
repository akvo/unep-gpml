import React, { useEffect } from "react";
import KnowledgeLib from "../../../modules/knowledge-lib/view";
import { UIStore } from "../../../store";
import api from "../../../utils/api";

function KnowledgeLibrary({ isAuthenticated, setLoginVisible }) {
  const { landing } = UIStore.useState((s) => ({
    landing: s.landing,
  }));

  const fetchMapData = () => {
    api
      .get(`https://digital.gpmarinelitter.org/api/landing?entityGroup=topic`)
      .then((resp) => {
        UIStore.update((e) => {
          e.landing = resp.data;
        });
      });
  };

  // useEffect(() => {
  //   if (typeof window !== "undefined" && Object.keys(landing).length === 0) {
  //     console.log(Object.keys(landing).length);
  //     // fetchMapData();
  //   }
  // }, []);

  return (
    <KnowledgeLib
      isAuthenticated={isAuthenticated}
      setLoginVisible={setLoginVisible}
    />
  );
}

export default KnowledgeLibrary;
