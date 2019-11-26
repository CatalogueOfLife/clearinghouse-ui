import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { withRouter } from "react-router";
import injectSheet from "react-jss";
import { Menu, Icon, Alert } from "antd";
import Logo from "./Logo";
import _ from "lodash";
import Auth from "../Auth";
import withContext from "../hoc/withContext";
import config from "../../config"
const SubMenu = Menu.SubMenu;
const styles = {};

class BasicMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedKeys: [],
      openKeys: []
    };
  }

  componentDidMount = () => {
    const { selectedKeys, openKeys } = this.props;
    this.setState({ selectedKeys, openKeys });
  };

  componentWillReceiveProps = nextProps => {
    let state = {};

    if (
      JSON.stringify(nextProps.selectedKeys) !==
      JSON.stringify(this.props.selectedKeys)
    ) {
      state.selectedKeys = nextProps.selectedKeys;
    }
    if (nextProps.collapsed) {
      state.openKeys = [];
    } else if (
      JSON.stringify(nextProps.openKeys) !== JSON.stringify(this.props.openKeys)
    ) {
      state.openKeys = nextProps.openKeys;
    }
    if (!_.isEmpty(state)) {
      this.setState(state);
    }
  };
  onOpenChange = openKeys => {
    this.setState({ openKeys });
  };
  onSelect = ({ item, key, selectedKeys }) => {
    this.setState({ selectedKeys });
  };

  render() {
    const {
      location,
      selectedDataset,
      selectedTaxon,
      selectedName,
      selectedSector,
      user,
      recentDatasets,
      taxonOrNameKey
    } = this.props;
    const { selectedKeys, openKeys } = this.state;
    return (
      <React.Fragment>
        {/* <div className="logo">
        <NavLink
                  to={{
                    pathname: `/`
                  }}
                  exact={true}
                >
            <Logo />
            </NavLink>
        </div> */}
        <div className="logo">
        <NavLink
                  to={{
                    pathname: `/`
                  }}
                  exact={true}
                >
                  <Logo style={{marginLeft: '10px'}} /> <h1 style={{color: 'white', display: 'inline'}}>CoL Clearinghouse</h1>
                  </NavLink>
                  </div>
        
        <Menu
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          mode="inline"
          theme="dark"
          inlineCollapsed={this.props.collapsed}
          onOpenChange={this.onOpenChange}
          onSelect={this.onSelect}
        >
{config.env === 'dev' &&  <Alert type="warning" style={{margin: '6px'}} message={<div style={{textAlign: 'center'}}>Test enviroment</div>}/>}       
 {Auth.isAuthorised(user, ["editor", "admin"]) &&  <Menu.Item key="admin">
            <NavLink to={{ pathname: "/admin" }}>
              <Icon type="setting" />
              <span>Admin</span>
            </NavLink>
    </Menu.Item> }

          <SubMenu
            key="imports"
            title={
              <span>
                <Icon type="api" />
                <span>Imports</span>
              </span>
            }
          >
            <Menu.Item key="running">
              <NavLink to={{ pathname: "/imports/running" }}>Running</NavLink>
            </Menu.Item>

            <Menu.Item key="finished">
              <NavLink to={{ pathname: "/imports/finished" }}>Finished</NavLink>
            </Menu.Item>
          </SubMenu>
          {Auth.isAuthorised(user, ["editor"]) && (
            <SubMenu
              key="assembly"
              title={
                <span>
                  <Icon type="copy" /> <span>Catalogue</span>
                </span>
              }
            >
              <Menu.Item key="colAssembly">
                <NavLink to={{ pathname: "/assembly" }}>
                  <span>Assembly</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="assemblyDuplicates">
                <NavLink to={{ pathname: "/assembly/duplicates" }}>
                  <span>Duplicates</span>
                </NavLink>
              </Menu.Item>

              <Menu.Item key="sectorSync">
                <NavLink to={{ pathname: "/sector/sync" }}>
                  <span>Sector sync</span>
                </NavLink>
              </Menu.Item>
              <Menu.Item key="sectorBroken">
                <NavLink to={{ pathname: "/sector/broken" }}>
                  <span>Broken sectors</span>
                </NavLink>
              </Menu.Item>

              {selectedSector && (
                <Menu.Item key="sectorDiff">
                  Sector diff: {selectedSector}
                </Menu.Item>
              )}

<Menu.Item key="assemblyReferences">
                <NavLink to={{ pathname: "/assembly/reference" }}>
                  <span>References</span>
                </NavLink>
              </Menu.Item>

            </SubMenu>
          )}

          <SubMenu
            key="dataset"
            title={
              <span>
                <Icon type="table" />
                <span>Datasets</span>
              </span>
            }
          >
                {/* <Menu.Item key="nameIndex">
    <NavLink to={{ pathname: "/names" }}>
              <span>Name index</span>
            </NavLink> 
    </Menu.Item> */}
            <Menu.Item key="/dataset">
              <NavLink to="/dataset">Search</NavLink>
            </Menu.Item>
            

            {Auth.isAuthorised(user, ["editor", "admin"]) && (
              <Menu.Item key="datasetCreate">
                <NavLink to={{ pathname: "/newdataset" }}>New Dataset</NavLink>
              </Menu.Item>
            )}
<Menu.Item key="/issues">
              <NavLink to="/issues">GSD issues</NavLink>
            </Menu.Item>
            {/* <Menu.Item key="7">Duplicates</Menu.Item>
            <Menu.Item key="8">Constituents</Menu.Item>
            <Menu.Item key="9">Without endpoint</Menu.Item> */}
          </SubMenu>
         {recentDatasets && recentDatasets.length > 1 && <SubMenu
              key="recentDatasets"
              title={
                <span>
                  <Icon type="star" />
                  <span>Recently visited datasets</span>
                </span>
              }
            >
              {recentDatasets.map(d => <Menu.Item key={`recent_${d.key}`}>
                <NavLink
                  to={{
                    pathname: `/dataset/${d.key}`
                  }}
                >
                  {d.alias ? d.alias : d.key}
                </NavLink>
              </Menu.Item>)}

            </SubMenu> }
          {selectedDataset && (
            <SubMenu
              key="datasetKey"
              title={
                <span>
                  <Icon type="bars" />
                  <span>{`Dataset: ${selectedDataset.key}`}</span>
                </span>
              }
            >
              <Menu.Item key="meta">
                <NavLink
                  to={{
                    pathname: `/dataset/${_.get(
                      this.props,
                      "selectedDataset.key"
                    )}/meta`
                  }}
                >
                  Metadata
                </NavLink>
              </Menu.Item>
              {selectedDataset && selectedDataset.hasData &&  (selectedDataset.importState || Number(selectedDataset.key) < 1001) && (
                <Menu.Item key="reference">
                  <NavLink
                    to={{
                      pathname: `/dataset/${_.get(
                        this.props,
                        "selectedDataset.key"
                      )}/reference`
                    }}
                  >
                    References
                  </NavLink>
                </Menu.Item>
              )}

              {selectedDataset && selectedDataset.hasData &&  (selectedDataset.importState || Number(selectedDataset.key) < 1001) && (
                <Menu.Item key="classification">
                  <NavLink
                    to={{
                      pathname: `/dataset/${_.get(
                        this.props,
                        "selectedDataset.key"
                      )}/classification`
                    }}
                  >
                    Classification
                  </NavLink>
                </Menu.Item>
              )}
              {selectedDataset && selectedDataset.hasData &&  (selectedDataset.importState || Number(selectedDataset.key) < 1001) && (
                <Menu.Item key="sectors">
                  <NavLink
                    to={{
                      pathname: `/dataset/${_.get(
                        this.props,
                        "selectedDataset.key"
                      )}/sectors`
                    }}
                  >
                    Sectors
                  </NavLink>
                </Menu.Item>
              )}
              {selectedDataset  && (
                <Menu.Item key="names">
                  <NavLink
                    to={{
                      pathname: `/dataset/${_.get(
                        this.props,
                        "selectedDataset.key"
                      )}/names`
                    }}
                  >
                    Names
                  </NavLink>
                </Menu.Item>
              )}
              {selectedDataset && selectedDataset.hasData &&  (selectedDataset.importState || Number(selectedDataset.key) < 1001) && (
                <Menu.Item key="issues">
                  <NavLink
                    to={{
                      pathname: `/dataset/${_.get(
                        this.props,
                        "selectedDataset.key"
                      )}/issues`
                    }}
                  >
                    Issues
                  </NavLink>
                </Menu.Item>
              )}
              <Menu.Item key="metrics">
                <NavLink
                  to={{
                    pathname: `/dataset/${_.get(
                      this.props,
                      "selectedDataset.key"
                    )}/metrics`
                  }}
                >
                  Import Metrics
                </NavLink>
              </Menu.Item>
              {selectedDataset && selectedDataset.hasData &&  (selectedDataset.importState || Number(selectedDataset.key) < 1001) && (
                <Menu.Item key="tasks">
                  <NavLink
                    to={{
                      pathname: `/dataset/${_.get(
                        this.props,
                        "selectedDataset.key"
                      )}/tasks`
                    }}
                  >
                    Tasks
                  </NavLink>
                </Menu.Item>
              )}

              {selectedDataset && selectedDataset.hasData &&  (selectedDataset.importState || Number(selectedDataset.key) < 1001) && (
                <Menu.Item key="workbench">
                  <NavLink
                    to={{
                      pathname: `/dataset/${_.get(
                        this.props,
                        "selectedDataset.key"
                      )}/workbench`
                    }}
                  >
                    Workbench
                  </NavLink>
                </Menu.Item>
              )}
              {selectedDataset && selectedDataset.hasData &&  (selectedDataset.importState || Number(selectedDataset.key) < 1001) && (
                <Menu.Item key="duplicates">
                  <NavLink
                    to={{
                      pathname: `/dataset/${_.get(
                        this.props,
                        "selectedDataset.key"
                      )}/duplicates`
                    }}
                  >
                    Duplicates
                  </NavLink>
                </Menu.Item>
              )}
              {selectedKeys.includes("taxon") && taxonOrNameKey && (
                <Menu.Item key="taxon">Taxon: {taxonOrNameKey}</Menu.Item>
              )}
              {selectedKeys.includes("name") && taxonOrNameKey && (
                <Menu.Item key="name">Name: {taxonOrNameKey}</Menu.Item>
              )}

              {selectedDataset && selectedDataset.hasData && (
                <Menu.Item key="verbatim"><NavLink
                to={{
                  pathname: `/dataset/${_.get(
                    this.props,
                    "selectedDataset.key"
                  )}/verbatim`
                }}
              >
                Verbatim
              </NavLink></Menu.Item>
              )}
            </SubMenu>
          )}
        </Menu>
      </React.Fragment>
    );
  }
}

const mapContextToProps = ({ user, recentDatasets }) => ({ user, recentDatasets });

export default withRouter(
  injectSheet(styles)(withContext(mapContextToProps)(BasicMenu))
);
