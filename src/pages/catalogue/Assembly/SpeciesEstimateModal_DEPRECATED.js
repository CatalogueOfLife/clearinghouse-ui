import React from "react";
import { PlusOutlined } from '@ant-design/icons';
// import { Form } from '@ant-design/compatible';
// import '@ant-design/compatible/assets/index.css';
import { Input, Modal, Button, Select, Alert, List, notification, Form } from "antd";
import ErrorMsg from "../../../components/ErrorMsg";
import withContext from "../../../components/hoc/withContext";
import EditableTable from "./EditableTable";
import ReferenceAutocomplete from "./ReferenceAutocomplete";
import _ from "lodash";
import axios from "axios";
import config from "../../../config";

const FormItem = Form.Item;
const Option = Select.Option;


class SpeciesestimateModal extends React.Component {
  state = {
    visible: true,
    addNewMode: false,
    selectedReference: null,
    submissionError: null,
    estimates: []
  };

  formRef = React.createRef();

  componentDidMount = () => {
    const {
      taxon: { estimates }
    } = this.props;
    if (_.isArray(estimates)) {
      this.setState({ estimates: [...estimates] });
    }
  };
  handleSubmit = e => {
    this.formRef.submit()
  };

  onFinishFailed = ({ errorFields }) => {
    this.formRef.scrollToField(errorFields[0].name);
  };

  submitData = values => {
    const { taxon, catalogueKey } = this.props;
    const newEst = {
      datasetKey: catalogueKey,
      referenceId: _.get(this.state, 'selectedReference.key') ? this.state.selectedReference.key : '',
      estimate: values.estimate,
      type: values.type,
      note: values.note
    };
    axios(
      `${config.dataApi}dataset/${catalogueKey}/taxon/${
        taxon.id
      }`
    )
      .then(tx =>
        axios.post(`${config.dataApi}dataset/${catalogueKey}/estimate`, {
          ...newEst,
          target: {
            id: _.get(tx, "data.name.id"),

            name: _.get(tx, "data.name.scientificName"),
            authorship: _.get(tx, "data.name.authorship"),
            rank: _.get(tx, "data.name.rank")
          }
        })
      )

      .then(res => {
        this.setState({ addNewMode: false,  submissionError: null, selectedReference: null, estimates: [newEst, ...this.state.estimates] }, () => {
          notification.open({
            message: "Estimate created",
            description: `${values.estimate} est. species`
          });
        });
      })
      .catch(err => {
        this.setState({ submissionError: err, selectedReference: null });
      });
  };

  handleConfirmBlur = e => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  toggleEdit = () => {
    const { addNewMode } = this.state;
    this.setState({ addNewMode: !addNewMode });
  };

  selectReference = ref => {
    this.setState({ selectedReference: ref });
  };

  render() {
    const {
      taxon,
      onCancel,
     // form: { getFieldDecorator },
      catalogueKey,
      estimateType
    } = this.props;
    const { estimates } = this.state;
    const { visible, addNewMode, submissionError } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 }
      }
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 4,
          offset: 20
        }
      }
    };
    return (
      <Modal
        width={1000}
        title={
          <span>
            Estimates for{" "}
            <span dangerouslySetInnerHTML={{ __html: taxon.name }} />
          </span>
        }
        visible={visible}
        onOk={() => {
          this.setState({ visible: false }, onCancel);
        }}
        onCancel={() => {
          this.setState({ visible: false }, onCancel);
        }}
        destroyOnClose={true}
      >
        {!addNewMode && (
          <a onClick={this.toggleEdit}>
            <PlusOutlined /> Add new
          </a>
        )}
        {addNewMode && (
          <Form 
            ref={this.formRef} 
            name="EstimateForm"
            onFinish={this.submitData} 
            onFinishFailed={this.onFinishFailed}
            >
            <FormItem {...formItemLayout} label="Estimate" name="estimate" rules={[
                  {
                    required: true,
                    message: "Estimate"
                  }
                ]}>
              <Input  type="number" />
            </FormItem>
            <FormItem {...formItemLayout} label="Type" name="type" rules={[
                  {
                    required: true,
                    message: "Type"
                  }
                ]}>
              <Select showSearch>
                  {estimateType.map(o => (
                    <Option key={o} value={o}>
                      {o}
                    </Option>
                  ))}
                </Select>
            </FormItem>

            <FormItem {...formItemLayout} label="Reference" name="reference">
              {
                <ReferenceAutocomplete
                  datasetKey={catalogueKey}
                  onSelectReference={this.selectReference}
                  onResetSearch={() => this.setState({ selectReference: null })}
                />
              }
            </FormItem>
            <FormItem {...formItemLayout} label="Note" name="note" >
            <Input />
            </FormItem>

            <FormItem {...tailFormItemLayout}>
              <Button style={{ marginRight: "10px" }}>Cancel</Button>
              <Button type="primary" htmlType="submit" onClick={this.handleSubmit}>
                Save
              </Button>
            </FormItem>
            {submissionError && (
              <FormItem>
                <Alert
                closable
                onClose={() => this.setState({ submissionError: null })}
                  message={<ErrorMsg error={submissionError} />}
                  type="error"
                />
              </FormItem>
            )}
          </Form>
        )}

        {estimates && _.isArray(estimates) && (
          <EditableTable catalogueKey={catalogueKey} data={estimates} onDataUpdate={(estimates) => this.setState({estimates}) } />
        )}
      </Modal>
    );
  }
}
/* const WrappedSpeciesestimateModal = Form.create()(
  SpeciesestimateModal
); */

//export default WrappedSpeciesestimateModal;

const mapContextToProps = ({ estimateType }) => ({ estimateType });

export default withContext(mapContextToProps)(SpeciesestimateModal);