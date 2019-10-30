import React from "react";
import PropTypes from "prop-types";
import config from "../../config";

import axios from "axios";
import { Alert, Spin, Tag, Tooltip } from "antd";
import ErrorMsg from "../../components/ErrorMsg";

import Layout from "../../components/LayoutNew";
import _ from "lodash";
import PresentationItem from "../../components/PresentationItem";
import PresentationGroupHeader from "../../components/PresentationGroupHeader";
import VerbatimPresentation from "../../components/VerbatimPresentation";
import BooleanValue from "../../components/BooleanValue";
import withContext from "../../components/hoc/withContext";
const md = 5;

class NamePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataset: null,
      name: null,
      verbatim: null,
      nameLoading: true,
      datasetLoading: true,
      verbatimLoading: true,
      nameError: null,
      datasetError: null,
      verbatimError: null
    };
  }

  componentWillMount() {
    this.getName();
  }

  getReference = referenceKey => {
    const {
      match: {
        params: { key }
      }
    } = this.props;

    axios(
      `${config.dataApi}dataset/${key}/reference/${
        referenceKey
      }`
    )
      .then(res => {
        this.setState({
          referenceLoading: false,
          reference: res.data,
          referenceError: null
        });
      })
      .catch(err => {
        this.setState({
          referenceLoading: false,
          referenceErrorError: err,
          name: null
        });
      });
  };
  getName = () => {
    const {
      match: {
        params: { key, taxonOrNameKey: nameKey }
      }
    } = this.props;

    this.setState({ nameLoading: true });
    axios(`${config.dataApi}dataset/${key}/name/${nameKey}`)
      .then(res => {
        this.setState(
          { nameLoading: false, name: res.data, nameError: null },
          () => {
            if (res.data.publishedInId) {
              this.getReference(res.data.publishedInId);
            }
          }
        );
      })
      .catch(err => {
        this.setState({ nameLoading: false, nameError: err, name: null });
      });
  };

  render() {
    const {
      nameLoading,
      verbatimLoading,
      name,
      reference,
      verbatim,
      nameError,
      verbatimError
        } = this.state;

    const { issueMap, dataset } = this.props;
    return (
     
        <div
          style={{
            background: "#fff",
            padding: 24,
            minHeight: 280,
            margin: "16px 0"
          }}
        >
          {name && (
            <h1>
              Name details: {name.scientificName} {name.authorship}
            </h1>
          )}

          {nameLoading && <Spin />}
          {nameError && (
            <Alert message={<ErrorMsg error={nameError} />} type="error" />
          )}
          {name && (
            <React.Fragment>
              <PresentationItem md={md} label="Scientific Name">
                {name.scientificName}
              </PresentationItem>
              <PresentationItem md={md} label="Rank">
                {name.rank}
              </PresentationItem>
              <PresentationItem md={md} label="Uninomial">
                {name.uninomial}
              </PresentationItem>
              <PresentationItem md={md} label="Genus">
                {name.genus}
              </PresentationItem>
              <PresentationItem md={md} label="Infrageneric Epithet">
                {name.infragenericEpithet}
              </PresentationItem>
              <PresentationItem md={md} label="Specific Epithet">
                {name.specificEpithet}
              </PresentationItem>
              <PresentationItem md={md} label="Infraspecific Epithet">
                {name.infraspecificEpithet}
              </PresentationItem>
              <PresentationItem md={md} label="Cultivar Epithet">
                {name.cultivarEpithet}
              </PresentationItem>
              <PresentationItem md={md} label="Strain">
                {name.strain}
              </PresentationItem>
              <PresentationItem md={md} label="Authorship">
                {name.authorship}
              </PresentationItem>
              {name.combinationAuthorship && (
                <PresentationItem md={md} label="Combination Authorship">
                  {`${name.combinationAuthorship.authors.join(", ")} ${
                    name.combinationAuthorship.exAuthors
                      ? `ex ${name.combinationAuthorship.exAuthors.join(", ")}`
                      : ""
                  } ${
                    name.combinationAuthorship.year
                      ? name.combinationAuthorship.year
                      : ""
                  }`}
                </PresentationItem>
              )}
              {name.basionymAuthorship && (
                <PresentationItem md={md} label="Basionym Authorship">
                  {`${name.basionymAuthorship.authors.join(", ")} ${
                    name.basionymAuthorship.exAuthors
                      ? `ex ${name.basionymAuthorship.exAuthors.join(", ")}`
                      : ""
                  } ${
                    name.basionymAuthorship.year
                      ? name.basionymAuthorship.year
                      : ""
                  }`}
                </PresentationItem>
              )}
              {name.sanctioningAuthor && (
                <PresentationItem md={md} label="Sanctioning Author">
                  {`${name.sanctioningAuthor.authors.join(", ")} ${
                    name.sanctioningAuthor.exAuthors
                      ? `ex ${name.sanctioningAuthor.exAuthors.join(", ")}`
                      : ""
                  } ${
                    name.sanctioningAuthor.year
                      ? name.sanctioningAuthor.year
                      : ""
                  }`}
                </PresentationItem>
              )}
              <PresentationItem md={md} label="ID">
                {name.id}
              </PresentationItem>
              <PresentationItem md={md} label="Homotypic Name Id">
                {name.homotypicNameId}
              </PresentationItem>
              <PresentationItem md={md} label="Name Index Id">
                {name.nameIndexId}
              </PresentationItem>
              <PresentationItem md={md} label="Candidatus">
                <BooleanValue value={name.candidatus} />
              </PresentationItem>
              <PresentationItem md={md} label="Notho">
                {name.notho}
              </PresentationItem>
              <PresentationItem md={md} label="Code">
                {name.code}
              </PresentationItem>
              <PresentationItem md={md} label="Nomenclatural Status">
                {name.nomStatus}
              </PresentationItem>
              <PresentationItem md={md} label="Origin">
                {name.origin}
              </PresentationItem>
              <PresentationItem md={md} label="Type">
                {name.type}
              </PresentationItem>
              <PresentationItem md={md} label="Fossil">
                <BooleanValue value={name.fossil} />
              </PresentationItem>
              <PresentationItem md={md} label="Source Url">
                {name.sourceUrl && (
                  <a href={name.sourceUrl} target="_blank">
                    {name.sourceUrl}
                  </a>
                )}
              </PresentationItem>
              <PresentationItem md={md} label="Remarks">
                {name.remarks}
              </PresentationItem>
              {reference && (
                <PresentationItem md={md} label="Reference">
                  {reference.citation}
                </PresentationItem>
              )}
              <PresentationItem md={md} label="Published In">
                {name.publishedInId}
              </PresentationItem>
              <PresentationItem md={md} label="Published In Page">
                {name.publishedInPage}
              </PresentationItem>
            </React.Fragment>
          )}

          {_.get(name, "verbatimKey") && (
            <VerbatimPresentation
              verbatimKey={name.verbatimKey}
              datasetKey={name.datasetKey}
            />
          )}
        </div>
    );
  }
}
const mapContextToProps = ({ issueMap, dataset }) => ({ issueMap, dataset });

export default withContext(mapContextToProps)(NamePage);
