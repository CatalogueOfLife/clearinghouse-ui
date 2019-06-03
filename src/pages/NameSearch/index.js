import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { Table, Alert, Switch, Row, Col, Button, Icon } from "antd";
import config from "../../config";
import qs from "query-string";
import history from "../../history";
import Classification from "./Classification";
import SearchBox from "../DatasetList/SearchBox";
import MultiValueFilter from "./MultiValueFilter";
import RowDetail from "./RowDetail";
import _ from "lodash";
import ErrorMsg from "../../components/ErrorMsg";
import NameAutocomplete from "../Assembly/NameAutocomplete";
import withContext from "../../components/hoc/withContext";
const columns = [
  {
    title: "Scientific Name",
    dataIndex: "usage.name.formattedName",
    key: "scientificName",
    render: (text, record) => {
      const uri =
        !_.get(record, "usage.id") ||
        record.usage.bareName ||
        !_.get(record, "usage.status")
          ? `/dataset/${_.get(
              record,
              "usage.name.datasetKey"
            )}/name/${encodeURIComponent(_.get(record, "usage.name.id"))}`
          : `/dataset/${_.get(
              record,
              "usage.name.datasetKey"
            )}/taxon/${encodeURIComponent(
              _.get(record, "usage.accepted.id")
                ? _.get(record, "usage.accepted.id")
                : _.get(record, "usage.id")
            )}`;

      return (
        <NavLink
          key={_.get(record, "usage.id")}
          to={{
            pathname: uri
          }}
          exact={true}
        >
          <span dangerouslySetInnerHTML={{ __html: text }} />
        </NavLink>
      );
    },
    width: 200,
    sorter: true
  },
  {
    title: "Status",
    dataIndex: "usage.status",
    key: "status",
    width: 200,
    render: (text, record) => {
      return !["synonym", "ambiguous synonym", "misapplied"].includes(text) ? (
        text
      ) : (
        <React.Fragment key={_.get(record, "usage.id")}>
          {text} {text === "misapplied" ? "to " : "of "}
          <span
            dangerouslySetInnerHTML={{
              __html: _.get(record, "usage.accepted.name.formattedName")
            }}
          />
        </React.Fragment>
      );
    }
  },
  {
    title: "Rank",
    dataIndex: "usage.name.rank",
    key: "rank",
    width: 60,
    sorter: true
  },
  {
    title: "Parents",
    dataIndex: "usage.classification",
    key: "parents",
    width: 180,
    render: (text, record) => {
      return !_.get(record, "classification") ? (
        ""
      ) : (
        <Classification
          key={_.get(record, "usage.id")}
          classification={_.initial(record.classification)}
          maxParents={2}
          datasetKey={_.get(record, "usage.name.datasetKey")}
        />
      );
    }
  }
];

class NameSearchPage extends React.Component {
  constructor(props) {
    super(props);
    this.getData = this.getData.bind(this);

    this.state = {
      data: [],
      advancedFilters: false,
      columns: columns,
      params: {},
      pagination: {
        pageSize: 50,
        current: 1,
        showQuickJumper: true
      },
      loading: false
    };
  }

  componentWillMount() {
    const { datasetKey } = this.props;
    let params = qs.parse(_.get(this.props, "location.search"));
    if (_.isEmpty(params)) {
      params = {
        limit: 50,
        offset: 0,
        facet: ["rank", "issue", "status", "nomstatus", "type", "field"]
      };
      history.push({
        pathname: `/dataset/${datasetKey}/names`,
        search: `?limit=50&offset=0`
      });
    } else if (!params.facet) {
      params.facet = ["rank", "issue", "status", "nomstatus", "type", "field"];
    }

    this.setState({ params }, this.getData);
  }

  getData = () => {
    const { params } = this.state;
    this.setState({ loading: true });
    const { datasetKey } = this.props;
    if (!params.q) {
      delete params.q;
    }
    history.push({
      pathname: `/dataset/${datasetKey}/names`,
      search: `?${qs.stringify(params)}`
    });
    axios(
      `${config.dataApi}dataset/${datasetKey}/name/search?${qs.stringify(
        params
      )}`
    )
      .then(res => {
        const pagination = { ...this.state.pagination };
        pagination.total = res.data.total;

        this.setState({
          loading: false,
          data: res.data,
          err: null,
          pagination
        });
      })
      .catch(err => {
        this.setState({ loading: false, error: err, data: [] });
      });
  };
  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;

    this.setState({
      pagination: pager
    });
    let query = _.merge(this.state.params, {
      limit: pager.pageSize,
      offset: (pager.current - 1) * pager.pageSize,
      ...filters
    });

    if (sorter && sorter.field) {
      let split = sorter.field.split(".");

      if (split[split.length - 1] === "formattedName") {
        query.sortBy = "name";
      } else if (split[split.length - 1] === "rank") {
        query.sortBy = "taxonomic";
      } else {
        query.sortBy = split[split.length - 1];
      }
    }
    if (sorter && sorter.order === "descend") {
      query.reverse = true;
    } else {
      query.reverse = false;
    }
    this.setState({ params: query }, this.getData);
  };

  updateSearch = params => {
    _.forEach(params, (v, k) => {
      this.state.params[k] = v;
    });
    this.setState({ ...this.state.params }, this.getData);
  };

  resetSearch = () => {
    this.setState(
      {
        params: {
          limit: 50,
          offset: 0,
          facet: ["rank", "issue", "status", "nomstatus", "type", "field"]
        }
      },
      this.getData
    );
  };

  toggleAdvancedFilters = () => {
    this.setState({ advancedFilters: !this.state.advancedFilters });
  };

  render() {
    const {
      data: { result, facets },
      loading,
      error,
      params,
      pagination,
      advancedFilters
    } = this.state;
    const {
      rank,
      taxonomicstatus,
      issue,
      nomstatus,
      nametype,
      namefield,
      datasetKey
    } = this.props;
    const facetRanks = _.get(facets, "rank")
      ? facets.rank.map(r => ({
          value: r.value,
          label: `${_.startCase(r.value)} (${r.count})`
        }))
      : null;
    const facetIssues = _.get(facets, "issue")
      ? facets.issue.map(i => ({
          value: i.value,
          label: `${_.startCase(i.value)} (${i.count})`
        }))
      : null;
    const facetTaxonomicStatus = _.get(facets, "status")
      ? facets.status.map(s => ({
          value: s.value,
          label: `${_.startCase(s.value)} (${s.count})`
        }))
      : null;
    const facetNomStatus = _.get(facets, "nomstatus")
      ? facets.nomstatus.map(s => ({
          value: s.value,
          label: `${_.startCase(s.value)} (${s.count})`
        }))
      : null;
    const facetNomType = _.get(facets, "type")
      ? facets.type.map(s => ({
          value: s.value,
          label: `${_.startCase(s.value)} (${s.count})`
        }))
      : null;
    const facetNomField = _.get(facets, "field")
      ? facets.field.map(s => ({
          value: s.value,
          label: `${_.startCase(s.value)} (${s.count})`
        }))
      : null;

    return (
      <div
        style={{
          background: "#fff",
          padding: 24,
          minHeight: 280,
          margin: "16px 0"
        }}
      >
        <Row>
          {error && (
            <Alert
              style={{ marginBottom: "10px" }}
              message={<ErrorMsg error={error} />}
              type="error"
            />
          )}
        </Row>
        <Row>
          <Col
            span={12}
            style={{ display: "flex", flexFlow: "column", height: "165px" }}
          >
            <SearchBox
              defaultValue={_.get(params, "q")}
              onSearch={value => this.updateSearch({ q: value })}
              style={{ marginBottom: "10px", width: "100%" }}
            />
            <div style={{ marginTop: "10px" }}>
              {" "}
              <NameAutocomplete
                datasetKey={datasetKey}
                onSelectName={value => {
                  this.updateSearch({ TAXON_ID: value.key });
                }}
                onResetSearch={this.resetSearch}
                placeHolder="Search by higher taxon"
                sortBy="TAXONOMIC"
              />{" "}
            </div>
          </Col>
          <Col span={12}>
            <MultiValueFilter
              defaultValue={_.get(params, "issue")}
              onChange={value => this.updateSearch({ issue: value })}
              vocab={facetIssues || issue.map(i => i.name)}
              label="Issues"
            />

            <MultiValueFilter
              defaultValue={_.get(params, "rank")}
              onChange={value => this.updateSearch({ rank: value })}
              vocab={facetRanks || rank}
              label="Ranks"
            />
            <MultiValueFilter
              defaultValue={_.get(params, "status")}
              onChange={value => this.updateSearch({ status: value })}
              vocab={facetTaxonomicStatus || taxonomicstatus}
              label="Status"
            />
            {advancedFilters && (
              <React.Fragment>
                <MultiValueFilter
                  defaultValue={_.get(params, "nomstatus")}
                  onChange={value => this.updateSearch({ nomstatus: value })}
                  vocab={facetNomStatus || nomstatus}
                  label="Nomenclatural status"
                />
                <MultiValueFilter
                  defaultValue={_.get(params, "type")}
                  onChange={value => this.updateSearch({ type: value })}
                  vocab={facetNomType || nametype}
                  label="Name type"
                />
                <MultiValueFilter
                  defaultValue={_.get(params, "field")}
                  onChange={value => this.updateSearch({ field: value })}
                  vocab={facetNomField || namefield}
                  label="Name field"
                />
              </React.Fragment>
            )}
            <div style={{ textAlign: "right", marginBottom: "8px" }}>
              <a
                style={{ marginLeft: 8, fontSize: 12 }}
                onClick={this.toggleAdvancedFilters}
              >
                Advanced{" "}
                <Icon type={this.state.advancedFilters ? "up" : "down"} />
              </a>

              {/* <Switch checkedChildren="Advanced" unCheckedChildren="Advanced" onChange={this.toggleAdvancedFilters} /> */}
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={12} style={{ textAlign: "left", marginBottom: "8px" }}>
            <Button type="danger" onClick={this.resetSearch}>
              Reset all
            </Button>
          </Col>
          <Col span={12} style={{ textAlign: "right", marginBottom: "8px" }}>
            {pagination &&
              !isNaN(pagination.total) &&
              `results: ${pagination.total}`}
          </Col>
        </Row>
        {!error && (
          <Table
            size="small"
            columns={this.state.columns}
            dataSource={result}
            loading={loading}
            pagination={this.state.pagination}
            onChange={this.handleTableChange}
            rowKey={record => record.usage.id}
            expandedRowRender={record => <RowDetail {...record} />}
          />
        )}
      </div>
    );
  }
}

const mapContextToProps = ({
  rank,
  taxonomicstatus,
  issue,
  nomstatus,
  nametype,
  namefield
}) => ({ rank, taxonomicstatus, issue, nomstatus, nametype, namefield });

export default withContext(mapContextToProps)(NameSearchPage);
