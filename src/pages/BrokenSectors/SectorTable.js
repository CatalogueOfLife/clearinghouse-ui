import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { Table, Alert, Icon, Tooltip, Input, Button, Row, Col, notification } from "antd";
import config from "../../config";
import moment from "moment";

import withContext from "../../components/hoc/withContext";
import kibanaQuery from "../SectorSync/kibanaQuery";
import Highlighter from "react-highlight-words";
import _ from "lodash";
const { MANAGEMENT_CLASSIFICATION } = config;

class SyncTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDataSourceLength: 0,
      searchText: ""
    };
  }

  componentWillReceiveProps = (nextProps) => {
    if(nextProps.data && nextProps.data.length > 0 && nextProps.data.length !== this.props.data.length){
        this.setState({currentDataSourceLength: nextProps.data.length})
    }
  }
  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex.split(".")[0]}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      _.get(record, dataIndex)
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    }
  });
  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: "" });
  };
  onChange = (pagination, filters, sorter, extra) =>{
    
    this.setState({currentDataSourceLength: extra.currentDataSource.length})
  }
  render() {
    const {data, loading} = this.props;  
    const { currentDataSourceLength, error } = this.state;
    const columns = [
      {
        title: "Dataset",
        dataIndex: "dataset.title",
        key: "title",
        render: (text, record) => {
          return (
            <NavLink
              to={{ pathname: `/dataset/${record.datasetKey}/metrics` }}
              exact={true}
            >
              <Highlighter
                highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                searchWords={[this.state.searchText]}
                autoEscape
                textToHighlight={text.toString()}
              />
            </NavLink>
          );
        },
        sorter: (a, b) => a.dataset.title < b.dataset.title,
        width: 250,
        ...this.getColumnSearchProps("dataset.title")
      },
      {
        title: "Mode",
        dataIndex: "mode",
        key: "mode",
        width: 50,  
        filters : [{
            text: 'Attach',
            value: 'attach',
          }, {
            text: 'Merge',
            value: 'merge',
          }],
          onFilter: (value, record) => record.mode === value,

      },
      {
        title: "Subject",
        dataIndex: "subject.name",
        key: "subject",
        width: 150,
        sorter: (a, b) => a.subject.name < b.subject.name,
        ...this.getColumnSearchProps("subject.name"),
        render: (text, record) => {
          return (
            <React.Fragment>
              <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>
                {record.subject.rank}:{" "}
              </span>
              <NavLink
                to={{
                  pathname: `/dataset/${record.datasetKey}/names`,
                  search: `?q=${record.subject.name}`
                }}
                exact={true}
              >
                <Highlighter
                  highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                  searchWords={[this.state.searchText]}
                  autoEscape
                  textToHighlight={record.subject.name.toString()}
                />
              </NavLink>
              {!record.subject.id && (
                <Icon
                  type="warning"
                  style={{ color: "red", marginLeft: "10px" }}
                />
              )}
            </React.Fragment>
          );
        }
      },
      {
        title: "Target",
        dataIndex: "target.name",
        key: "target",
        width: 150,
        ...this.getColumnSearchProps("target.name"),

        sorter: (a, b) => a.target.name < b.target.name,

        render: (text, record) => {
          return (
            <React.Fragment>
              <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>
                {record.target.rank}:{" "}
              </span>
              <NavLink
                to={{
                  pathname: `/dataset/${MANAGEMENT_CLASSIFICATION.key}/names`,
                  search: `?q=${record.subject.name}`
                }}
                exact={true}
              >
                <Highlighter
                  highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                  searchWords={[this.state.searchText]}
                  autoEscape
                  textToHighlight={_.get(record, "target.name") ? record.target.name.toString() : ""}
                />{" "}
                {!record.target.id && (
                  <Icon
                    type="warning"
                    style={{ color: "red", marginLeft: "10px" }}
                  />
                )}
              </NavLink>
            </React.Fragment>
          );
        }
      },

      {
        title: "Created",
        dataIndex: "created",
        key: "created",
        width: 50,
        sorter: (a, b) => a.created < b.created,
        render: date => {
          return date ? moment(date).format("lll") : "";
        }
      },
      {
        title: "Modified",
        dataIndex: "modified",
        key: "modified",
        width: 50,
        sorter: (a, b) => a.modified < b.modified,
        render: date => {
          return date ? moment(date).format("lll") : "";
        }
      },
      {
        title: "Logs",
        key: "logs",
        render: (text, record) => (
          <Tooltip title="Kibana logs">
            <a href={kibanaQuery(record.key)}>
              <Icon type="code" style={{ fontSize: "20px" }} />
            </a>
          </Tooltip>
        ),
        width: 50
      },
      {
        title: "Action",
        key: "action",
        width: 50,
        render: (text, record) => (
          <Button
            type={"primary"}
            onClick={() => {
                axios.post(`${config.dataApi}sector/${record.key}/rematch`)
                .then(sector => {
                    const success = _.get(sector, 'data.target.id') && _.get(sector, 'data.subject.id');

                   if(success){
                    notification.success({
                        message: "Rematch done with success"
                      })
                      if(this.props.onSectorRematch && typeof this.props.onSectorRematch === 'function'){
                        this.props.onSectorRematch(sector)

                      }
                   } else {
                    notification.error({
                        message: "Rematch failed",
                        description: `Missing ID: ${['target', 'subject'].filter(t => !_.get(sector, `data.${t}.id`)).join(' and ')}`
                      })
                   }
                })
                .catch(err => {
                    notification.error({
                        message: `Server error ${_.get(err, 'response.status')}`,
                        description: _.get(err, 'response.data.message')
                      })
                })
            }}
          >
            Rematch
          </Button>
        )
      }
    ];

    return (
      <React.Fragment>
         
        <Row><Col style={{textAlign: "right"}}>Results: {currentDataSourceLength}</Col></Row>
          
            <Table
              size="small"
              onChange={this.onChange}
              columns={columns}
              dataSource={data}
              loading={loading}
              pagination={{ pageSize: 100 }}
              rowKey="key"
            />
          
      </React.Fragment>
    );
  }
}

const mapContextToProps = ({ user }) => ({ user });

export default withContext(mapContextToProps)(SyncTable);