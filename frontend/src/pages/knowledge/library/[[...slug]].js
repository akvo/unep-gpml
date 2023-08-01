import React, { useEffect } from "react";
import KnowledgeLib from "../../../modules/knowledge-lib/view";
import { UIStore } from "../../../store";
import api from "../../../utils/api";

function KnowledgeLibrary({}) {
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

  useEffect(() => {
    if (Object.keys(landing).length === 0) {
      fetchMapData();
    }
  }, []);

  return <KnowledgeLib />;
}

export default KnowledgeLibrary;
