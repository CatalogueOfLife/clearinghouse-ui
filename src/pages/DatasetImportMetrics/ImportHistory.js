import React from "react";
import { Timeline, Icon, Tooltip } from "antd";
import moment from "moment";
import { NavLink } from "react-router-dom";
import kibanaQuery from '../Imports/importTabs/kibanaQuery'
 
const tagColors = {
  processing: "purple",
  downloading: "cyan",
  inserting: "blue",
  finished: "green",
  failed: "red",
  "in queue": "orange"
};

const getDot = (h, attempt)=>{
  if(['processing', 'downloading', 'inserting', 'building metrics'].includes(h.state)){
    return <Icon type="loading" />
  } else {
    return attempt && attempt===h.attempt.toString() ? <Icon type="arrow-right" /> : null
  }
  
}

const ImportHistory = ({ importHistory, attempt, catalogueKey }) => (
  <Timeline>
    {importHistory.map(h => (
      <Timeline.Item key={h.attempt} color={tagColors[h.state]} dot={getDot(h, attempt)}>
        {['finished', 'failed', 'unchanged'].indexOf(h.state) === -1 && <strong>{h.state}</strong>}
        {(h.state === "finished" || h.state === "unchanged") && (
          <React.Fragment>
            <NavLink
          to={{
            pathname: `/catalogue/${catalogueKey}/dataset/${h.datasetKey}/metrics/${h.attempt}`
          }}
          exact={true}
        >
          <strong>{`${h.state}`}</strong>
        </NavLink>
            
            <p>{`${moment(h.started).format("lll")}`} {" "} <Tooltip title="Kibana logs" placement="right"><a href={kibanaQuery(h.datasetKey, h.attempt)} target="_blank" ><Icon type="code" /></a></Tooltip></p>
          </React.Fragment>
        )}
        {h.state === "failed" && (
          <React.Fragment>
             <NavLink
          to={{
            pathname: `/catalogue/${catalogueKey}/dataset/${h.datasetKey}/metrics/${h.attempt}`
          }}
          exact={true}
        >
          <strong>{`${h.state}`}</strong>
        </NavLink>
          {" "}  <Tooltip title="Kibana logs" placement="right"><a href={kibanaQuery(h.datasetKey, h.attempt)} target="_blank" ><Icon type="code" /></a></Tooltip>
            <p>{`${moment(h.started).format("lll")}`}</p>
            <p>{h.error}</p>
          </React.Fragment>
        )}
      </Timeline.Item>
    ))}
  </Timeline>
);

export default ImportHistory;
