import React from "react";
import _ from "lodash";
import { NavLink } from "react-router-dom";
import PresentationItem from "../../components/PresentationItem";

const typeMap = {
    "spelling correction" : "of",
    "based on" : "",
    "replacement name": "for",
    "later homonym": "of",
    "superfluous": "name for"
}

const NameRelations = ({ data, style, catalogueKey }) => {
  return (
    <div style={style}>
      {data
        .map(r => (
          <PresentationItem key={r.key} label={`${_.capitalize(r.type)} ${typeMap[r.type] ? typeMap[r.type]: ""}` } helpText={r.note}>
           <NavLink
              to={{
                pathname: `/catalogue/${catalogueKey}/dataset/${r.datasetKey}/name/${encodeURIComponent(
                  r.relatedName.id
                )}`
              }}
              exact={true}
            >
            <span dangerouslySetInnerHTML={{__html: r.relatedName.formattedName}}></span>
            </NavLink>
          </PresentationItem>
        ))}
    </div>
  );
};

export default NameRelations;
