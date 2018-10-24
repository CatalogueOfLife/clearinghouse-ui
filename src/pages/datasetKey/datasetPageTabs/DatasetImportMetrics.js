import React from "react";


import PropTypes from "prop-types";
import config from "../../../config";
import _ from "lodash";
import axios from "axios";
import moment from 'moment'
import { Switch, List, Row, Col } from "antd";
import ImportChart from '../../../components/ImportChart'

class DatasetImportMetrics extends React.Component {
  constructor(props) {
    super(props);
    this.getData = this.getData.bind(this);
    this.state = { data: null, editMode: false };
  }

  componentWillMount() {
    this.getData();
  }

  getData = () => {
    const { datasetKey } = this.props;

    this.setState({ loading: true });
    axios(`${config.dataApi}dataset/${datasetKey}/import?limit=3&state=finished`)
      .then(res => {
        this.setState({ loading: false, data: res.data, err: null });
      })
      .catch(err => {
        this.setState({ loading: false, error: err, data: {} });
      });
  };


  render() {
    const { datasetKey } = this.props;

    return (
      <div>
        <Row>
          <Col span={12} style={{ padding: '10px' }}>
            {_.get(this.state, 'data[0].issuesCount') && <ImportChart nameSearchParam="issue" defaultType="column" datasetKey={datasetKey} data={_.get(this.state, 'data[0].issuesCount')} title="Names with issues" subtitle={`Imported ${moment(this.state.data[0].finished).format('MMMM Do YYYY, h:mm a')}`} />}
          </Col>
          <Col span={12} style={{ padding: '10px' }}>
          {_.get(this.state, 'data[0].usagesByStatusCount') && <ImportChart nameSearchParam="usageStatus" defaultType="pie" datasetKey={datasetKey} data={_.get(this.state, 'data[0].usagesByStatusCount')} title="Usages by status" subtitle={`Imported ${moment(this.state.data[0].finished).format('MMMM Do YYYY, h:mm a')}`} />}


          </Col>
        </Row>
        <Row>
          <Col span={12} style={{ padding: '10px' }}>
            {_.get(this.state, 'data[0].namesByRankCount') && <ImportChart nameSearchParam="rank" defaultType="pie" datasetKey={datasetKey} data={_.get(this.state, 'data[0].namesByRankCount')} title="Names by rank" subtitle={`Imported ${moment(this.state.data[0].finished).format('MMMM Do YYYY, h:mm a')}`} />}
          </Col>
          <Col span={12} style={{ padding: '10px' }}>
          {_.get(this.state, 'data[0].namesByTypeCount') && <ImportChart nameSearchParam="type" defaultType="pie" datasetKey={datasetKey} data={_.get(this.state, 'data[0].namesByTypeCount')} title="Names by type" subtitle={`Imported ${moment(this.state.data[0].finished).format('MMMM Do YYYY, h:mm a')}`} />}

          </Col>
          
        </Row>

        <Row>
          <Col span={12} style={{ padding: '10px' }}>
          {_.get(this.state, 'data[0].namesByOriginCount') && <ImportChart nameSearchParam="origin" defaultType="pie" datasetKey={datasetKey} data={_.get(this.state, 'data[0].namesByOriginCount')} title="Names by origin" subtitle={`Imported ${moment(this.state.data[0].finished).format('MMMM Do YYYY, h:mm a')}`} />}
          </Col>
          <Col span={12} style={{ padding: '10px' }}>
          {_.get(this.state, 'data[0].verbatimByTypeCount') && <ImportChart nameSearchParam="verbatimNameType" defaultType="pie" datasetKey={datasetKey} data={_.get(this.state, 'data[0].verbatimByTypeCount')} title="Verbatim names by type" subtitle={`Imported ${moment(this.state.data[0].finished).format('MMMM Do YYYY, h:mm a')}`} />}

          </Col>
          
        </Row>
        <Row>
          <Col span={24} style={{ padding: '10px' }}>
          {_.get(this.state, 'data[0].vernacularsByLanguageCount') && <ImportChart nameSearchParam="vernacularLang" defaultType="column" datasetKey={datasetKey} data={_.get(this.state, 'data[0].vernacularsByLanguageCount')} title="Vernacular names by language" subtitle={`Imported ${moment(this.state.data[0].finished).format('MMMM Do YYYY, h:mm a')}`} />}
          
          </Col>
          
        </Row>

        


      </div>
    );
  }
}

export default DatasetImportMetrics;
