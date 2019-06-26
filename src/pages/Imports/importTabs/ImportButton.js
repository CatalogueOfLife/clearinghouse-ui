import React from "react";
import { Button, Icon, Popover, notification } from "antd";
import axios from "axios";
import config from "../../../config";
import ErrorMsg from "../../../components/ErrorMsg";
import withContext from '../../../components/hoc/withContext'

class ImportButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      importTriggered: false,
      error: null
    };
  }

  startImport = () => {
    const {record} = this.props;  
    this.setState({ importTriggered: true });
    axios
      .post(
        `${config.dataApi}importer`,
        {
          'datasetKey': record.datasetKey,
          'priority': true,
          'force': true,
        }
      )
      .then(res => {
        this.setState({ importTriggered: false });
        if(this.props.onStartImportSuccess && typeof this.props.onStartImportSuccess === 'function'){
          this.props.onStartImportSuccess();
        }
      })
      .catch(err => {
        this.setState({ importTriggered: false, error: err });
      });
  };

  stopImport = () => {
    const {record} = this.props;  
    this.setState({ importTriggered: true });
    axios
      .delete(`${config.dataApi}importer/${record.datasetKey}`)
      .then(res => {
        this.setState({ importTriggered: false });
        if(record.state !== 'in queue'){
          notification.open({
            title: 'Import stopped',
            description: `Import of ${record.dataset.title} was stopped`
          })
        } else {
          notification.open({
            title: 'Import canceled',
            description: `${record.dataset.title} was removed from the queue`
          })
        }
        
        if(this.props.onDeleteSuccess && typeof this.props.onDeleteSuccess === 'function'){
          this.props.onDeleteSuccess();
        }
        
      })
      .catch(err => {
        this.setState({ importTriggered: false, error: err });
      });
  };

  render = () => {
    const { error } = this.state;
    const { record, style, importState } = this.props;
    const isStopButton = ['in queue', ...importState.filter(i => i.running === "true").map(i => i.name)].indexOf(record.state) > -1;
    
    return (
      <React.Fragment>
        <Button
          style={style}
          type={isStopButton ? 'danger' : 'primary'}
          loading={this.state.importTriggered}
          onClick={isStopButton ? this.stopImport : this.startImport}
        >
          {!isStopButton && 'Import'}
          {isStopButton && record.state !== 'in queue' &&  'Stop import'}
          {isStopButton && record.state === 'in queue' &&  'Remove'}
        </Button>
        {error && (
          <Popover
            placement="bottom"
            title="Error"
            content={<ErrorMsg error={error} />}
            trigger="click"
          >
            <Icon
              type="warning"
              style={{ color: "red", marginLeft: "10px", cursor: "pointer" }}
            />
          </Popover>
        )}
      </React.Fragment>
    );
  };
}

const mapContextToProps = ({ importState }) => ({ importState });
export default withContext(mapContextToProps)(ImportButton);

